import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { schools } from '@/data/schools';
import { AnalyzeCommentsRequest, AnalyzeCommentsResponse } from '@/types/analyze-comments';
import { ExperienceModuleType, School } from '@/types/school';

// Default SCNet gateway keeps /v1 in baseURL.
// If provider-side routing already appends /v1, set SCNET_BASE_URL to a non-/v1 path
// such as https://api.scnet.cn/api/llm to avoid duplicated /v1 in final request path.
const DEFAULT_SCNET_BASE_URL = 'https://api.scnet.cn/api/llm/v1';
const MAX_COMMENTS = 40;
const MAX_COMMENT_LENGTH = 500;

const isExperienceModuleType = (value: string): value is ExperienceModuleType => {
  return (
    value === 'academic-rhythm' ||
    value === 'campus-governance' ||
    value === 'development-opportunity'
  );
};

const normalizeComments = (rawComments: string[]): string[] => {
  return rawComments
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .slice(0, MAX_COMMENTS)
    .map((item) => (item.length > MAX_COMMENT_LENGTH ? item.slice(0, MAX_COMMENT_LENGTH) : item));
};

const normalizeBaseUrl = (baseUrl: string): string => {
  return baseUrl.replace(/\/+$/, '');
};

const validatePayload = (
  payload: unknown
): { ok: true; value: AnalyzeCommentsRequest } | { ok: false; message: string } => {
  if (!payload || typeof payload !== 'object') {
    return { ok: false, message: '请求体必须是 JSON 对象' };
  }

  const candidate = payload as Partial<AnalyzeCommentsRequest>;

  if (typeof candidate.schoolId !== 'string' || candidate.schoolId.trim() === '') {
    return { ok: false, message: '`schoolId` 必填且必须是字符串' };
  }

  if (typeof candidate.moduleType !== 'string' || !isExperienceModuleType(candidate.moduleType)) {
    return { ok: false, message: '`moduleType` 非法或缺失' };
  }

  if (!Array.isArray(candidate.comments) || candidate.comments.some((item) => typeof item !== 'string')) {
    return { ok: false, message: '`comments` 必须是字符串数组' };
  }

  return {
    ok: true,
    value: {
      schoolId: candidate.schoolId.trim(),
      moduleType: candidate.moduleType,
      comments: candidate.comments,
    },
  };
};

const stripCodeFence = (text: string): string => {
  const trimmed = text.trim();
  if (trimmed.startsWith('```')) {
    return trimmed.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  }
  return trimmed;
};

const safeJsonParse = (content: string): unknown => {
  const stripped = stripCodeFence(content);

  try {
    return JSON.parse(stripped);
  } catch {
    const match = stripped.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
};

const scoreToLevel = (
  score: number
): AnalyzeCommentsResponse['confidence']['level'] => {
  if (score < 0.5) {
    return 'low';
  }
  if (score < 0.75) {
    return 'medium';
  }
  return 'high';
};

const buildFallbackInsights = (school: School, moduleType: ExperienceModuleType): string[] => {
  const targetExperienceModule = school.experienceModules.find((item) => item.moduleType === moduleType);
  if (!targetExperienceModule) {
    return ['模块信息缺失，建议先补齐模块化数据。'];
  }

  return targetExperienceModule.structuredFacts
    .slice(0, 3)
    .map((fact) => `${fact.label}：${fact.displayValue}`);
};

const buildFallbackAudience = (
  moduleType: ExperienceModuleType
): Pick<AnalyzeCommentsResponse, 'suitableFor' | 'notSuitableFor'> => {
  const suitableMap: Record<ExperienceModuleType, string[]> = {
    'academic-rhythm': ['自驱型且能管理学习节奏的学生', '可以接受阶段性压力波动的学生'],
    'campus-governance': ['可适应规则边界且重视秩序感的学生', '希望生活管理预期稳定的学生'],
    'development-opportunity': ['愿意主动争取资源机会的学生', '目标相对明确并愿意持续投入的学生'],
  };

  const notSuitableMap: Record<ExperienceModuleType, string[]> = {
    'academic-rhythm': ['依赖外部强监督才能学习的学生', '低压偏好且抗压弱的学生'],
    'campus-governance': ['追求完全自由且不希望规则存在感的学生', '对制度变化高度敏感的学生'],
    'development-opportunity': ['方向长期不清晰且不愿探索的学生', '不愿参与额外实践活动的学生'],
  };

  return {
    suitableFor: suitableMap[moduleType],
    notSuitableFor: notSuitableMap[moduleType],
  };
};

const sanitizeModelOutput = (
  parsed: unknown,
  school: School,
  moduleType: ExperienceModuleType,
  comments: string[]
): Omit<AnalyzeCommentsResponse, 'schoolId' | 'moduleType' | 'mock'> => {
  const targetExperienceModule = school.experienceModules.find((item) => item.moduleType === moduleType);
  const fallbackAudience = buildFallbackAudience(moduleType);
  const fallbackInsights = buildFallbackInsights(school, moduleType);

  const fallback: Omit<AnalyzeCommentsResponse, 'schoolId' | 'moduleType' | 'mock'> = {
    moduleSummary:
      targetExperienceModule?.summary ?? '未找到匹配模块，返回了默认分析摘要。',
    sentiment: targetExperienceModule?.sentiment ?? 'mixed',
    keyInsights: fallbackInsights,
    suitableFor: fallbackAudience.suitableFor,
    notSuitableFor: fallbackAudience.notSuitableFor,
    selectedEvidence: comments.slice(0, 3).map((quote) => ({
      quote,
      reason: '来自本次输入评论',
    })),
    confidence: {
      score: 0.55,
      level: 'medium',
      reason: '模型输出字段不完整，使用服务端默认值兜底',
    },
  };

  if (!parsed || typeof parsed !== 'object') {
    return fallback;
  }

  const candidate = parsed as Partial<Omit<AnalyzeCommentsResponse, 'schoolId' | 'moduleType' | 'mock'>>;
  const sentiment =
    candidate.sentiment === 'positive' ||
    candidate.sentiment === 'mixed' ||
    candidate.sentiment === 'negative'
      ? candidate.sentiment
      : fallback.sentiment;

  const keyInsights =
    Array.isArray(candidate.keyInsights) &&
    candidate.keyInsights.every((item) => typeof item === 'string')
      ? candidate.keyInsights.slice(0, 6)
      : fallback.keyInsights;

  const suitableFor =
    Array.isArray(candidate.suitableFor) &&
    candidate.suitableFor.every((item) => typeof item === 'string')
      ? candidate.suitableFor.slice(0, 6)
      : fallback.suitableFor;

  const notSuitableFor =
    Array.isArray(candidate.notSuitableFor) &&
    candidate.notSuitableFor.every((item) => typeof item === 'string')
      ? candidate.notSuitableFor.slice(0, 6)
      : fallback.notSuitableFor;

  const selectedEvidence =
    Array.isArray(candidate.selectedEvidence) &&
    candidate.selectedEvidence.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as { quote?: unknown }).quote === 'string' &&
        typeof (item as { reason?: unknown }).reason === 'string'
    )
      ? candidate.selectedEvidence
          .slice(0, 4)
          .map((item) => ({ quote: item.quote, reason: item.reason }))
      : fallback.selectedEvidence;

  let confidenceScore = fallback.confidence.score;
  if (
    candidate.confidence &&
    typeof candidate.confidence === 'object' &&
    typeof candidate.confidence.score === 'number'
  ) {
    const rawScore = candidate.confidence.score;
    confidenceScore = rawScore > 1 ? Math.min(1, rawScore / 100) : Math.max(0, rawScore);
  }
  confidenceScore = Number(confidenceScore.toFixed(2));

  const confidenceLevel =
    candidate.confidence &&
    typeof candidate.confidence === 'object' &&
    (candidate.confidence.level === 'low' ||
      candidate.confidence.level === 'medium' ||
      candidate.confidence.level === 'high')
      ? candidate.confidence.level
      : scoreToLevel(confidenceScore);

  const confidenceReason =
    candidate.confidence &&
    typeof candidate.confidence === 'object' &&
    typeof candidate.confidence.reason === 'string' &&
    candidate.confidence.reason.trim() !== ''
      ? candidate.confidence.reason
      : fallback.confidence.reason;

  return {
    moduleSummary:
      typeof candidate.moduleSummary === 'string' && candidate.moduleSummary.trim() !== ''
        ? candidate.moduleSummary.trim()
        : fallback.moduleSummary,
    sentiment,
    keyInsights,
    suitableFor,
    notSuitableFor,
    selectedEvidence,
    confidence: {
      score: confidenceScore,
      level: confidenceLevel,
      reason: confidenceReason,
    },
  };
};

const buildSystemPrompt = (): string => {
  return [
    '你是“高校生活体验评论分析引擎”，只负责结构化分析，不做闲聊。',
    '你的输出必须服务于“学生评论证据驱动”的产品，不得把重点转向保研率、就业率、学科排名。',
    '你必须围绕模块体验总结：制度体验、学生体感、适合/不适合人群、代表性证据。',
    '输出必须是严格 JSON，不要输出 Markdown，不要输出解释文本。',
  ].join('\n');
};

const buildUserPrompt = (school: School, moduleType: ExperienceModuleType, comments: string[]): string => {
  const targetExperienceModule = school.experienceModules.find((item) => item.moduleType === moduleType);
  const moduleFacts =
    targetExperienceModule?.structuredFacts.map((fact) => ({
      key: fact.key,
      label: fact.label,
      displayValue: fact.displayValue,
    })) ?? [];

  const inputPayload = {
    schoolId: school.basic.id,
    schoolName: school.basic.name,
    moduleType,
    taxonomyKey: targetExperienceModule?.taxonomyKey,
    moduleTitle: targetExperienceModule?.title,
    baselineModuleSummary: targetExperienceModule?.summary,
    structuredFacts: moduleFacts,
    comments,
  };

  const outputContract = {
    moduleSummary: 'string',
    sentiment: 'positive | mixed | negative',
    keyInsights: ['string'],
    suitableFor: ['string'],
    notSuitableFor: ['string'],
    selectedEvidence: [
      {
        quote: 'string（必须来自输入 comments）',
        reason: 'string',
      },
    ],
    confidence: {
      score: 'number(0~1)',
      level: 'low | medium | high',
      reason: 'string',
    },
  };

  return [
    '请基于以下输入完成评论分析，只返回 JSON。',
    '要求：',
    '1) 保持中文表达。',
    '2) `selectedEvidence.quote` 必须直接摘自输入 comments，不得编造。',
    '3) `keyInsights` 优先连接结构化事实与评论共识/分歧。',
    '4) `suitableFor` 与 `notSuitableFor` 必须是面向学生群体的判断。',
    `输入数据：${JSON.stringify(inputPayload)}`,
    `输出 JSON 结构：${JSON.stringify(outputContract)}`,
  ].join('\n');
};

const getScnetConfig = () => {
  const apiKey = process.env.SCNET_API_KEY?.trim();
  const model = process.env.SCNET_MODEL?.trim();
  const baseURL = normalizeBaseUrl(process.env.SCNET_BASE_URL?.trim() || DEFAULT_SCNET_BASE_URL);

  if (!apiKey) {
    return { ok: false as const, message: '缺少环境变量 SCNET_API_KEY' };
  }
  if (!model) {
    return { ok: false as const, message: '缺少环境变量 SCNET_MODEL' };
  }

  return {
    ok: true as const,
    apiKey,
    model,
    baseURL,
  };
};

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  const validated = validatePayload(payload);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.message }, { status: 400 });
  }

  const comments = normalizeComments(validated.value.comments);
  if (comments.length === 0) {
    return NextResponse.json({ error: '至少提供 1 条非空评论' }, { status: 400 });
  }

  const school = schools.find((item) => item.basic.id === validated.value.schoolId);
  if (!school) {
    return NextResponse.json({ error: '未找到 schoolId 对应学校' }, { status: 404 });
  }

  const targetExperienceModule = school.experienceModules.find(
    (item) => item.moduleType === validated.value.moduleType
  );
  if (!targetExperienceModule) {
    return NextResponse.json({ error: '当前学校缺少对应 moduleType 模块' }, { status: 404 });
  }

  const scnet = getScnetConfig();
  if (!scnet.ok) {
    return NextResponse.json(
      {
        error: scnet.message,
        hint: '请在本地或 Vercel 配置 SCNET_API_KEY / SCNET_MODEL / SCNET_BASE_URL',
      },
      { status: 500 }
    );
  }

  try {
    const client = new OpenAI({
      apiKey: scnet.apiKey,
      baseURL: scnet.baseURL,
    });

    const completion = await client.chat.completions.create({
      model: scnet.model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: buildSystemPrompt(),
        },
        {
          role: 'user',
          content: buildUserPrompt(school, validated.value.moduleType, comments),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? '';
    if (!content) {
      return NextResponse.json(
        {
          error: '模型未返回有效内容',
          hint: '请检查 SCNET_MODEL 与 baseURL 是否正确，以及账号额度是否可用',
        },
        { status: 502 }
      );
    }

    const parsed = safeJsonParse(content);
    if (!parsed) {
      return NextResponse.json(
        {
          error: '模型输出 JSON 解析失败',
          details: '请检查模型是否严格输出 JSON',
          rawPreview: content.slice(0, 300),
        },
        { status: 502 }
      );
    }

    const sanitized = sanitizeModelOutput(parsed, school, validated.value.moduleType, comments);
    const response: AnalyzeCommentsResponse = {
      schoolId: validated.value.schoolId,
      moduleType: validated.value.moduleType,
      ...sanitized,
      mock: false,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知错误';

    return NextResponse.json(
      {
        error: 'SCNet 模型调用失败',
        details: message,
        hint:
          '若出现路径问题，请先确认 SCNET_BASE_URL。默认应为 https://api.scnet.cn/api/llm/v1；若返回 404/405，可尝试去掉或补齐 /v1。',
      },
      { status: 502 }
    );
  }
}
