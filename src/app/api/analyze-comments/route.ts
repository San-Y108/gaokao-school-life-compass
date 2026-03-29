import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { schools } from '@/data/schools';
import { AnalyzeCommentsRequest, AnalyzeCommentsResponse } from '@/types/analyze-comments';
import { ExperienceModuleType, ExperienceSentiment, School } from '@/types/school';

// Default SCNet gateway keeps /v1 in baseURL.
// If provider-side routing already appends /v1, set SCNET_BASE_URL to a non-/v1 path
// such as https://api.scnet.cn/api/llm to avoid duplicated /v1 in final request path.
const DEFAULT_SCNET_BASE_URL = 'https://api.scnet.cn/api/llm/v1';
const MAX_COMMENTS = 40;
const MAX_COMMENT_LENGTH = 500;
const MAX_SELECTED_EVIDENCE = 4;
const MIN_EVIDENCE_QUOTE_LENGTH = 6;

const POSITIVE_SIGNALS = ['支持', '友好', '自由', '清晰', '提升', '机会', '有序', '满意', '成长'];
const NEGATIVE_SIGNALS = ['严格', '焦虑', '崩溃', '压', '困难', '吃力', '混乱', '无语', '疲惫', '卷'];

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

const normalizeForMatch = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[\s"'“”‘’`]/g, '')
    .replace(/[，。！？、,.!?;:：；()（）【】\[\]{}<>《》]/g, '');
};

const isQuoteFromInputComments = (quote: string, comments: string[]): boolean => {
  const normalizedQuote = normalizeForMatch(quote);
  if (normalizedQuote.length < MIN_EVIDENCE_QUOTE_LENGTH) {
    return false;
  }

  return comments.some((comment) => {
    const normalizedComment = normalizeForMatch(comment);
    return (
      normalizedComment.includes(normalizedQuote) ||
      normalizedQuote.includes(normalizedComment)
    );
  });
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

const countSignals = (text: string, signalWords: string[]): number => {
  return signalWords.reduce((count, word) => (text.includes(word) ? count + 1 : count), 0);
};

const inferSentimentFromComments = (comments: string[]): ExperienceSentiment => {
  if (comments.length === 0) {
    return 'mixed';
  }

  const normalized = comments.map((item) => item.toLowerCase());
  let positiveCount = 0;
  let negativeCount = 0;

  normalized.forEach((comment) => {
    const positiveHits = countSignals(comment, POSITIVE_SIGNALS);
    const negativeHits = countSignals(comment, NEGATIVE_SIGNALS);
    if (positiveHits > negativeHits) {
      positiveCount += 1;
    } else if (negativeHits > positiveHits) {
      negativeCount += 1;
    }
  });

  if (positiveCount === 0 && negativeCount === 0) {
    return 'mixed';
  }
  if (positiveCount > 0 && negativeCount > 0) {
    return 'mixed';
  }
  return positiveCount > negativeCount ? 'positive' : 'negative';
};

const buildCommentConsistencyMetrics = (comments: string[]) => {
  const normalized = comments.map((item) => item.toLowerCase());
  let positiveCount = 0;
  let negativeCount = 0;

  normalized.forEach((comment) => {
    const positiveHits = countSignals(comment, POSITIVE_SIGNALS);
    const negativeHits = countSignals(comment, NEGATIVE_SIGNALS);
    if (positiveHits > negativeHits) {
      positiveCount += 1;
    } else if (negativeHits > positiveHits) {
      negativeCount += 1;
    }
  });

  const polarizedTotal = positiveCount + negativeCount;
  const conflictRatio =
    polarizedTotal > 0 && positiveCount > 0 && negativeCount > 0
      ? Math.min(positiveCount, negativeCount) / polarizedTotal
      : 0;

  return {
    positiveCount,
    negativeCount,
    conflictRatio,
  };
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

const sanitizeStringList = (
  value: unknown,
  fallback: string[],
  maxItems: number
): string[] => {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const cleaned = value
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .slice(0, maxItems);

  return cleaned.length > 0 ? cleaned : fallback;
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
    'academic-rhythm': ['自驱型且能管理学习节奏的学生', '可接受阶段性压力波动的学生'],
    'campus-governance': ['能适应规则边界并重视秩序感的学生', '希望生活管理预期稳定的学生'],
    'development-opportunity': ['愿意主动争取资源机会的学生', '目标明确并愿意持续投入的学生'],
  };

  const notSuitableMap: Record<ExperienceModuleType, string[]> = {
    'academic-rhythm': ['依赖外部强监督才能学习的学生', '低压偏好且抗压较弱的学生'],
    'campus-governance': ['追求完全自由且不希望规则存在感的学生', '对制度变化高度敏感的学生'],
    'development-opportunity': ['方向长期不清晰且不愿主动探索的学生', '不希望参与额外实践活动的学生'],
  };

  return {
    suitableFor: suitableMap[moduleType],
    notSuitableFor: notSuitableMap[moduleType],
  };
};

const buildDefaultEvidence = (comments: string[]): AnalyzeCommentsResponse['selectedEvidence'] => {
  return comments.slice(0, MAX_SELECTED_EVIDENCE).map((quote) => ({
    quote,
    reason: '来自输入评论（服务端兜底）',
  }));
};

const calibrateConfidence = ({
  commentsCount,
  conflictRatio,
  modelScore,
  evidenceCoverage,
}: {
  commentsCount: number;
  conflictRatio: number;
  modelScore: number;
  evidenceCoverage: number;
}): AnalyzeCommentsResponse['confidence'] => {
  const base = 0.15;
  const countScore =
    commentsCount >= 8
      ? 0.28
      : commentsCount >= 5
        ? 0.22
        : commentsCount >= 3
          ? 0.15
          : commentsCount >= 2
            ? 0.08
            : 0.02;

  const consistencyScore = Math.max(0.04, 0.24 - conflictRatio * 0.22);
  const evidenceScore =
    evidenceCoverage >= 0.9
      ? 0.2
      : evidenceCoverage >= 0.7
        ? 0.14
        : evidenceCoverage >= 0.5
          ? 0.09
          : 0.03;

  const modelContribution = Math.max(0, Math.min(1, modelScore)) * 0.18;

  let score = base + countScore + consistencyScore + evidenceScore + modelContribution;
  score = Math.min(0.95, Math.max(0.15, score));

  if (commentsCount < 2) {
    score = Math.min(score, 0.46);
  }
  if (conflictRatio > 0.42) {
    score = Math.min(score, 0.62);
  }
  if (evidenceCoverage < 0.5) {
    score = Math.min(score, 0.58);
  }

  const rounded = Number(score.toFixed(2));
  const level = scoreToLevel(rounded);

  return {
    score: rounded,
    level,
    reason: `基于评论数量(${commentsCount})、分歧度(${conflictRatio.toFixed(2)})与证据覆盖(${evidenceCoverage.toFixed(2)})综合估计`,
  };
};

const sanitizeModelOutput = ({
  parsed,
  school,
  moduleType,
  comments,
}: {
  parsed: unknown;
  school: School;
  moduleType: ExperienceModuleType;
  comments: string[];
}): Omit<AnalyzeCommentsResponse, 'schoolId' | 'moduleType' | 'mock'> => {
  const targetExperienceModule = school.experienceModules.find((item) => item.moduleType === moduleType);
  const fallbackAudience = buildFallbackAudience(moduleType);
  const fallbackInsights = buildFallbackInsights(school, moduleType);
  const fallbackEvidence = buildDefaultEvidence(comments);
  const fallbackSentiment = inferSentimentFromComments(comments);

  const fallback: Omit<AnalyzeCommentsResponse, 'schoolId' | 'moduleType' | 'mock'> = {
    moduleSummary:
      targetExperienceModule?.summary ?? '未找到匹配模块，返回了默认分析摘要。',
    sentiment: fallbackSentiment,
    keyInsights: fallbackInsights,
    suitableFor: fallbackAudience.suitableFor,
    notSuitableFor: fallbackAudience.notSuitableFor,
    selectedEvidence: fallbackEvidence,
    confidence: {
      score: 0.45,
      level: 'low',
      reason: '模型输出不完整，已使用服务端保守兜底',
    },
  };

  if (!parsed || typeof parsed !== 'object') {
    return fallback;
  }

  const candidate = parsed as Partial<Omit<AnalyzeCommentsResponse, 'schoolId' | 'moduleType' | 'mock'>>;
  const metrics = buildCommentConsistencyMetrics(comments);
  const isSparse = comments.length < 2;
  const highConflict = metrics.conflictRatio > 0.42;

  const sentiment =
    candidate.sentiment === 'positive' ||
    candidate.sentiment === 'mixed' ||
    candidate.sentiment === 'negative'
      ? candidate.sentiment
      : fallback.sentiment;

  const keyInsights = sanitizeStringList(candidate.keyInsights, fallback.keyInsights, 6);
  const safeKeyInsights =
    isSparse && keyInsights.length > 2 ? keyInsights.slice(0, 2) : keyInsights;

  const suitableFor = sanitizeStringList(candidate.suitableFor, fallback.suitableFor, 6);
  const notSuitableFor = sanitizeStringList(candidate.notSuitableFor, fallback.notSuitableFor, 6);

  const conservativeSuitableFor =
    isSparse || highConflict
      ? [...suitableFor.slice(0, 1), '样本有限或分歧较大，建议结合更多评论再判断']
      : suitableFor;

  const conservativeNotSuitableFor =
    isSparse || highConflict
      ? [...notSuitableFor.slice(0, 1), '当前判断保守，仍需结合更多证据验证']
      : notSuitableFor;

  const candidateEvidence =
    Array.isArray(candidate.selectedEvidence) &&
    candidate.selectedEvidence.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as { quote?: unknown }).quote === 'string' &&
        typeof (item as { reason?: unknown }).reason === 'string'
    )
      ? candidate.selectedEvidence.slice(0, MAX_SELECTED_EVIDENCE).map((item) => ({
          quote: item.quote.trim(),
          reason: item.reason.trim(),
        }))
      : [];

  const verifiedEvidence = candidateEvidence.filter((item) =>
    isQuoteFromInputComments(item.quote, comments)
  );

  const selectedEvidence = verifiedEvidence.length > 0 ? verifiedEvidence : fallbackEvidence;
  const evidenceCoverage =
    selectedEvidence.length === 0
      ? 0
      : selectedEvidence.filter((item) => isQuoteFromInputComments(item.quote, comments)).length /
        selectedEvidence.length;

  const modelScoreRaw =
    candidate.confidence &&
    typeof candidate.confidence === 'object' &&
    typeof candidate.confidence.score === 'number'
      ? candidate.confidence.score
      : 0.5;
  const modelScore = modelScoreRaw > 1 ? Math.min(1, modelScoreRaw / 100) : Math.max(0, modelScoreRaw);

  const confidence = calibrateConfidence({
    commentsCount: comments.length,
    conflictRatio: metrics.conflictRatio,
    modelScore,
    evidenceCoverage,
  });

  if (
    candidate.confidence &&
    typeof candidate.confidence === 'object' &&
    typeof candidate.confidence.reason === 'string' &&
    candidate.confidence.reason.trim() !== ''
  ) {
    confidence.reason = `${confidence.reason}；模型说明：${candidate.confidence.reason.trim()}`;
  }

  const candidateSummary =
    typeof candidate.moduleSummary === 'string' ? candidate.moduleSummary.trim() : '';
  const moduleSummary =
    candidateSummary.length >= 18
      ? candidateSummary
      : `${fallback.moduleSummary}（模型总结信息不足，已回退到基线摘要）`;

  return {
    moduleSummary,
    sentiment: highConflict ? 'mixed' : sentiment,
    keyInsights: safeKeyInsights,
    suitableFor: conservativeSuitableFor,
    notSuitableFor: conservativeNotSuitableFor,
    selectedEvidence,
    confidence,
  };
};

const buildSystemPrompt = (): string => {
  return [
    '你是“高校生活体验评论分析引擎”，只做结构化评论分析，不做闲聊。',
    '输出必须服务于“学生评论证据驱动”产品，禁止把重点转向保研率、学科排名、就业率。',
    '必须围绕：制度体验、学生体感、适合/不适合人群、可追溯证据。',
    '严禁空话、套话、泛泛建议；所有结论要可被输入评论支持。',
    '输出必须是严格 JSON，禁止 Markdown 和额外解释。',
  ].join('\n');
};

const buildUserPrompt = (
  school: School,
  moduleType: ExperienceModuleType,
  comments: string[]
): string => {
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
        quote: 'string（必须直接摘自输入 comments 原句）',
        reason: 'string（指出它支持何种判断）',
      },
    ],
    confidence: {
      score: 'number(0~1)',
      level: 'low | medium | high',
      reason: 'string',
    },
  };

  return [
    '请基于输入评论完成模块化分析，只返回 JSON。',
    '硬约束：',
    '1) `selectedEvidence.quote` 必须逐字摘自输入 comments，不得编造。',
    '2) 若评论不足（<2条）或证据弱，需保守输出，避免过度推断。',
    '3) 若评论正负冲突明显，`sentiment` 必须输出 `mixed`。',
    '4) `suitableFor/notSuitableFor` 仅在有证据时给出；证据不足时要明确保守。',
    '5) `keyInsights` 要体现“结构化事实 + 评论证据”的关系，不要空话。',
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
      temperature: 0.15,
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
          hint: '请检查 SCNET_MODEL 与 baseURL、额度或网关状态',
        },
        { status: 502 }
      );
    }

    const parsed = safeJsonParse(content);
    if (!parsed) {
      return NextResponse.json(
        {
          error: '模型输出 JSON 解析失败',
          details: '模型未返回可解析的 JSON，请检查模型遵循度',
          rawPreview: content.slice(0, 320),
        },
        { status: 502 }
      );
    }

    const sanitized = sanitizeModelOutput({
      parsed,
      school,
      moduleType: validated.value.moduleType,
      comments,
    });

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
          '若出现路径问题，请确认 SCNET_BASE_URL。默认建议 https://api.scnet.cn/api/llm/v1；若 404/405 可尝试不带 /v1。',
      },
      { status: 502 }
    );
  }
}
