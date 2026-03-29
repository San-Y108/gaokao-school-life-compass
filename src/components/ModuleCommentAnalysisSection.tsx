'use client';

import { useEffect, useMemo, useState } from 'react';
import { getSentimentText } from '@/lib/school-helpers';
import { AnalyzeCommentsResponse } from '@/types/analyze-comments';
import { ExperienceModule, ExperienceModuleType } from '@/types/school';

type ModuleAnalysisStatus = 'empty' | 'loading' | 'success' | 'error';

interface ModuleCommentAnalysisSectionProps {
  schoolId: string;
  module: ExperienceModule;
}

interface CachedModuleAnalysis {
  version: 1;
  schoolId: string;
  moduleType: ExperienceModuleType;
  commentsSignature: string;
  updatedAt: string;
  result: AnalyzeCommentsResponse;
}

const CACHE_VERSION = 1;
const CACHE_KEY_PREFIX = 'school-comment-analysis:v1';
const LOW_CONFIDENCE_SCORE_THRESHOLD = 0.6;
const MIN_MATCHABLE_QUOTE_LENGTH = 6;

const normalizeTextForMatch = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[\s"'“”‘’`]/g, '')
    .replace(/[，。！？、,.!?;:：；()（）【】\[\]{}<>《》]/g, '');
};

const isQuoteFromComments = (quote: string, comments: string[]): boolean => {
  const normalizedQuote = normalizeTextForMatch(quote);
  if (normalizedQuote.length < MIN_MATCHABLE_QUOTE_LENGTH) {
    return false;
  }

  return comments.some((comment) => {
    const normalizedComment = normalizeTextForMatch(comment);
    return normalizedComment.includes(normalizedQuote) || normalizedQuote.includes(normalizedComment);
  });
};

const getCacheKey = (schoolId: string, moduleType: ExperienceModuleType): string => {
  return `${CACHE_KEY_PREFIX}:${schoolId}:${moduleType}`;
};

const readCachedResult = ({
  schoolId,
  moduleType,
  commentsSignature,
}: {
  schoolId: string;
  moduleType: ExperienceModuleType;
  commentsSignature: string;
}): CachedModuleAnalysis | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(getCacheKey(schoolId, moduleType));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<CachedModuleAnalysis>;
    if (
      parsed.version !== CACHE_VERSION ||
      parsed.schoolId !== schoolId ||
      parsed.moduleType !== moduleType ||
      parsed.commentsSignature !== commentsSignature ||
      typeof parsed.updatedAt !== 'string' ||
      !parsed.result
    ) {
      return null;
    }

    return parsed as CachedModuleAnalysis;
  } catch {
    return null;
  }
};

const writeCachedResult = (value: CachedModuleAnalysis): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(
      getCacheKey(value.schoolId, value.moduleType),
      JSON.stringify(value)
    );
  } catch {
    // ignore cache write failures (private mode / storage quota)
  }
};

const ModuleCommentAnalysisSection: React.FC<ModuleCommentAnalysisSectionProps> = ({
  schoolId,
  module,
}) => {
  const inputComments = useMemo(() => {
    const seen = new Set<string>();

    return module.evidences
      .map((item) => item.quote.trim())
      .filter((item) => {
        if (item.length === 0 || seen.has(item)) {
          return false;
        }
        seen.add(item);
        return true;
      });
  }, [module.evidences]);

  const commentsSignature = useMemo(() => {
    return inputComments.join('||');
  }, [inputComments]);

  const [status, setStatus] = useState<ModuleAnalysisStatus>('empty');
  const [result, setResult] = useState<AnalyzeCommentsResponse | null>(null);
  const [errorText, setErrorText] = useState<string>('');
  const [refreshErrorText, setRefreshErrorText] = useState<string>('');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [isCachedResult, setIsCachedResult] = useState<boolean>(false);

  useEffect(() => {
    setErrorText('');
    setRefreshErrorText('');
    setResult(null);
    setUpdatedAt(null);
    setIsCachedResult(false);

    const cached = readCachedResult({
      schoolId,
      moduleType: module.moduleType,
      commentsSignature,
    });

    if (cached) {
      setResult(cached.result);
      setUpdatedAt(cached.updatedAt);
      setIsCachedResult(true);
      setStatus('success');
      return;
    }

    setStatus('empty');
  }, [commentsSignature, module.moduleType, schoolId]);

  const analyzeComments = async () => {
    if (inputComments.length === 0) {
      setErrorText('当前模块暂无可用于分析的评论证据。');
      setStatus('error');
      return;
    }

    const hasPreviousResult = result !== null;
    setErrorText('');
    setRefreshErrorText('');
    setStatus('loading');

    try {
      const response = await fetch('/api/analyze-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schoolId,
          moduleType: module.moduleType,
          comments: inputComments,
        }),
      });

      const payload = (await response.json()) as AnalyzeCommentsResponse | { error?: string };
      if (!response.ok) {
        const apiError =
          'error' in payload && typeof payload.error === 'string' ? payload.error : '分析请求失败';
        throw new Error(apiError);
      }

      const successPayload = payload as AnalyzeCommentsResponse;
      const now = new Date().toISOString();

      setResult(successPayload);
      setStatus('success');
      setIsCachedResult(false);
      setUpdatedAt(now);
      writeCachedResult({
        version: CACHE_VERSION,
        schoolId,
        moduleType: module.moduleType,
        commentsSignature,
        updatedAt: now,
        result: successPayload,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '评论分析失败，请稍后重试';
      if (hasPreviousResult) {
        setStatus('success');
        setRefreshErrorText(`重新分析失败，当前展示的是上一次可用结果：${message}`);
        return;
      }

      setStatus('error');
      setErrorText(message);
    }
  };

  const evidenceMatchSummary = useMemo(() => {
    if (!result) {
      return { matched: 0, total: 0, allMatched: false };
    }

    const total = result.selectedEvidence.length;
    const matched = result.selectedEvidence.filter((item) =>
      isQuoteFromComments(item.quote, inputComments)
    ).length;

    return {
      matched,
      total,
      allMatched: total > 0 && matched === total,
    };
  }, [inputComments, result]);

  const isLowConfidence = useMemo(() => {
    if (!result) {
      return false;
    }

    return (
      result.confidence.level === 'low' ||
      result.confidence.score < LOW_CONFIDENCE_SCORE_THRESHOLD
    );
  }, [result]);

  const updatedAtText = useMemo(() => {
    if (!updatedAt) {
      return '';
    }
    return new Date(updatedAt).toLocaleString('zh-CN', { hour12: false });
  }, [updatedAt]);

  return (
    <section className="mt-6 rounded-2xl border border-gray-200 bg-gray-50/70 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">评论分析结果</h3>
          <p className="mt-1 text-xs leading-6 text-gray-500">
            基于本模块 {inputComments.length} 条评论证据按需生成，不会首屏自动批量请求。
          </p>
        </div>
        <button
          type="button"
          onClick={analyzeComments}
          disabled={status === 'loading' || inputComments.length === 0}
          className="inline-flex items-center rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {status === 'loading'
            ? '分析中...'
            : status === 'success'
              ? '重新分析'
              : status === 'error'
                ? '重试分析'
                : '生成分析'}
        </button>
      </div>

      {status === 'empty' ? (
        <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white p-4">
          {inputComments.length === 0 ? (
            <p className="text-sm text-gray-600">
              当前模块暂无评论证据，暂时无法生成分析结果。建议补充该模块的学生评论后再分析。
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              还未生成该模块的评论分析。点击“生成分析”即可查看模块总结、适合人群和证据引用。
            </p>
          )}
        </div>
      ) : null}

      {status === 'loading' ? (
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm text-blue-700">正在分析评论证据，请稍候...</p>
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{errorText || '分析失败，请重试。'}</p>
          <button
            type="button"
            onClick={analyzeComments}
            className="mt-3 inline-flex items-center rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
          >
            重试
          </button>
        </div>
      ) : null}

      {status === 'success' && result ? (
        <div className="mt-4 space-y-4">
          {refreshErrorText ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {refreshErrorText}
            </div>
          ) : null}

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
                情绪倾向：{getSentimentText(result.sentiment)}
              </span>
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
                置信度：{result.confidence.level} ({result.confidence.score})
              </span>
              {isCachedResult ? (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                  来自会话缓存
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-sm leading-7 text-gray-700">{result.moduleSummary}</p>
            <p className="mt-2 text-xs text-gray-500">{result.confidence.reason}</p>
            {updatedAtText ? (
              <p className="mt-1 text-xs text-gray-400">最后更新时间：{updatedAtText}</p>
            ) : null}
          </div>

          {isLowConfidence ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              当前结果为低置信度，通常意味着评论样本有限或分歧较大，请结合更多评论证据阅读。
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h4 className="text-sm font-semibold text-gray-900">关键洞察</h4>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm leading-6 text-gray-700">
                {result.keyInsights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h4 className="text-sm font-semibold text-gray-900">适配人群提示</h4>
              <p className="mt-2 text-xs text-gray-500">更适合</p>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-sm leading-6 text-gray-700">
                {result.suitableFor.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-gray-500">不太适合</p>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-sm leading-6 text-gray-700">
                {result.notSuitableFor.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-gray-900">代表性评论证据</h4>
              <span className="text-xs text-gray-500">
                输入匹配：{evidenceMatchSummary.matched}/{evidenceMatchSummary.total}
              </span>
            </div>
            {result.selectedEvidence.length === 0 ? (
              <p className="mt-2 text-sm text-gray-600">暂无可展示证据。</p>
            ) : (
              <div className="mt-3 space-y-3">
                {result.selectedEvidence.map((item) => (
                  <article
                    key={`${item.quote}-${item.reason}`}
                    className="rounded-lg border border-gray-100 bg-gray-50 p-3"
                  >
                    <p className="text-sm leading-6 text-gray-700">“{item.quote}”</p>
                    <p className="mt-1 text-xs text-gray-500">{item.reason}</p>
                  </article>
                ))}
              </div>
            )}
            {!evidenceMatchSummary.allMatched && evidenceMatchSummary.total > 0 ? (
              <p className="mt-3 text-xs text-amber-700">
                检测到部分证据未完全匹配输入评论原文，请将该结果视为参考并建议重新分析。
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default ModuleCommentAnalysisSection;
