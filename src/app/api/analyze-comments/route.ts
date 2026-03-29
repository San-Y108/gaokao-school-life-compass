import { NextRequest, NextResponse } from 'next/server';
import { schools } from '@/data/schools';
import { AnalyzeCommentsRequest, AnalyzeCommentsResponse } from '@/types/analyze-comments';
import { ExperienceModuleType, ExperienceSentiment, School } from '@/types/school';

const POSITIVE_SIGNALS = ['友好', '好', '自由', '支持', '帮助', '清晰', '有序', '提升', '成长'];
const NEGATIVE_SIGNALS = ['累', '压', '焦虑', '严格', '困难', '崩溃', '卷', '紧张', '吃力'];

const isExperienceModuleType = (value: string): value is ExperienceModuleType => {
  return (
    value === 'academic-rhythm' ||
    value === 'campus-governance' ||
    value === 'development-opportunity'
  );
};

const normalizeComments = (rawComments: string[]): string[] => {
  return rawComments.map((item) => item.trim()).filter((item) => item.length > 0);
};

const countSignals = (text: string, signalWords: string[]): number => {
  return signalWords.reduce((count, word) => (text.includes(word) ? count + 1 : count), 0);
};

const inferSentiment = (comments: string[]): ExperienceSentiment => {
  const joinedText = comments.join(' ').toLowerCase();
  const positiveScore = countSignals(joinedText, POSITIVE_SIGNALS);
  const negativeScore = countSignals(joinedText, NEGATIVE_SIGNALS);
  const diff = positiveScore - negativeScore;

  if (diff >= 2) {
    return 'positive';
  }
  if (diff <= -2) {
    return 'negative';
  }
  return 'mixed';
};

const buildKeyInsights = (
  school: School,
  moduleType: ExperienceModuleType,
  comments: string[]
): string[] => {
  const targetExperienceModule = school.experienceModules.find(
    (item) => item.moduleType === moduleType
  );
  if (!targetExperienceModule) {
    return ['暂无该模块结构化事实，建议先补全学校模块数据。'];
  }

  const factInsights = targetExperienceModule.structuredFacts
    .slice(0, 2)
    .map((fact) => `${fact.label}：${fact.displayValue}`);

  const joinedText = comments.join(' ');
  const commentInsights: string[] = [];

  if (joinedText.includes('时间') || joinedText.includes('作业') || joinedText.includes('考试')) {
    commentInsights.push('评论反复提到时间分配与节点压力，是主要体感来源。');
  }
  if (joinedText.includes('规则') || joinedText.includes('管理') || joinedText.includes('查寝')) {
    commentInsights.push('评论聚焦规则执行与管理边界，制度存在感较强。');
  }
  if (joinedText.includes('机会') || joinedText.includes('资源') || joinedText.includes('项目')) {
    commentInsights.push('评论对资源机会密度反馈明显，主动性会放大体验差异。');
  }

  const merged = [...factInsights, ...commentInsights];
  return merged.length > 0 ? merged.slice(0, 4) : ['评论样本有效，但暂未识别出高频洞察关键词。'];
};

const buildAudienceSuggestion = (
  moduleType: ExperienceModuleType,
  sentiment: ExperienceSentiment
): { suitableFor: string[]; notSuitableFor: string[] } => {
  const suitableByModule: Record<ExperienceModuleType, string[]> = {
    'academic-rhythm': ['自我驱动强且能做时间规划的学生', '可接受阶段性学业压力的学生'],
    'campus-governance': ['能适应明确制度边界的学生', '希望获得稳定秩序感的学生'],
    'development-opportunity': ['愿意主动抓资源与机会的学生', '目标相对明确并能持续投入的学生'],
  };

  const notSuitableByModule: Record<ExperienceModuleType, string[]> = {
    'academic-rhythm': ['需要持续外部监督才能保持学习节奏的学生', '短期抗压能力较弱的学生'],
    'campus-governance': ['追求完全自由、低规则存在感的学生', '对管理变化高度敏感的学生'],
    'development-opportunity': ['方向长期不明确且不愿主动探索的学生', '不希望参与额外项目或活动的学生'],
  };

  if (sentiment === 'positive') {
    return {
      suitableFor: suitableByModule[moduleType],
      notSuitableFor: notSuitableByModule[moduleType].slice(0, 1),
    };
  }

  if (sentiment === 'negative') {
    return {
      suitableFor: suitableByModule[moduleType].slice(0, 1),
      notSuitableFor: notSuitableByModule[moduleType],
    };
  }

  return {
    suitableFor: suitableByModule[moduleType].slice(0, 2),
    notSuitableFor: notSuitableByModule[moduleType].slice(0, 2),
  };
};

const buildSelectedEvidence = (comments: string[]) => {
  return comments.slice(0, 3).map((comment) => {
    const signalReason =
      comment.includes('严格') || comment.includes('压力') || comment.includes('累')
        ? '包含明显负向体感信号'
        : comment.includes('自由') || comment.includes('支持') || comment.includes('机会')
          ? '包含明显正向体感信号'
          : '包含可用于模块总结的中性描述';

    return {
      quote: comment,
      reason: signalReason,
    };
  });
};

const confidenceScoreByCredibility: Record<'low' | 'medium' | 'high', number> = {
  low: 0.05,
  medium: 0.1,
  high: 0.15,
};

const buildConfidence = (
  sentiment: ExperienceSentiment,
  commentsCount: number,
  moduleCredibility: 'low' | 'medium' | 'high'
): AnalyzeCommentsResponse['confidence'] => {
  const base = 0.35;
  const countBoost = Math.min(0.35, commentsCount * 0.08);
  const sentimentBoost = sentiment === 'mixed' ? 0.1 : 0.2;
  const score = Math.min(0.95, base + countBoost + sentimentBoost + confidenceScoreByCredibility[moduleCredibility]);

  const level: AnalyzeCommentsResponse['confidence']['level'] =
    score < 0.5 ? 'low' : score < 0.75 ? 'medium' : 'high';
  const roundedScore = Number(score.toFixed(2));

  return {
    score: roundedScore,
    level,
    reason: `基于${commentsCount}条评论样本与模块原始可信度(${moduleCredibility})得出`,
  };
};

const validatePayload = (payload: unknown): { ok: true; value: AnalyzeCommentsRequest } | { ok: false; message: string } => {
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

const analyzeCommentsMock = (request: AnalyzeCommentsRequest): AnalyzeCommentsResponse | null => {
  const school = schools.find((item) => item.basic.id === request.schoolId);
  if (!school) {
    return null;
  }

  const targetExperienceModule = school.experienceModules.find(
    (item) => item.moduleType === request.moduleType
  );
  if (!targetExperienceModule) {
    return null;
  }

  const comments = normalizeComments(request.comments);
  const sentiment = inferSentiment(comments);
  const keyInsights = buildKeyInsights(school, request.moduleType, comments);
  const { suitableFor, notSuitableFor } = buildAudienceSuggestion(request.moduleType, sentiment);
  const selectedEvidence = buildSelectedEvidence(comments);
  const confidence = buildConfidence(sentiment, comments.length, targetExperienceModule.credibility);

  return {
    schoolId: request.schoolId,
    moduleType: request.moduleType,
    moduleSummary: `${targetExperienceModule.summary}（基于本次${comments.length}条评论样本的 mock 分析结果）`,
    sentiment,
    keyInsights,
    suitableFor,
    notSuitableFor,
    selectedEvidence,
    confidence,
    mock: true,
  };
};

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  const validated = validatePayload(payload);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.message }, { status: 400 });
  }

  const normalizedComments = normalizeComments(validated.value.comments);
  if (normalizedComments.length === 0) {
    return NextResponse.json({ error: '至少提供 1 条非空评论' }, { status: 400 });
  }

  const response = analyzeCommentsMock({
    ...validated.value,
    comments: normalizedComments,
  });

  if (!response) {
    return NextResponse.json({ error: 'schoolId 或 moduleType 未匹配到现有模块数据' }, { status: 404 });
  }

  return NextResponse.json(response, { status: 200 });
}
