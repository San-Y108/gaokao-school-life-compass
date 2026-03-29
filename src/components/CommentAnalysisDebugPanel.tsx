'use client';

import { FormEvent, useMemo, useState } from 'react';
import { getModuleTypeText } from '@/lib/school-helpers';
import { AnalyzeCommentsResponse } from '@/types/analyze-comments';
import { ExperienceModuleType, School } from '@/types/school';

interface CommentAnalysisDebugPanelProps {
  school: School;
}

const CommentAnalysisDebugPanel: React.FC<CommentAnalysisDebugPanelProps> = ({ school }) => {
  const moduleTypeOptions = useMemo(() => {
    const unique = Array.from(new Set(school.experienceModules.map((item) => item.moduleType)));
    return unique;
  }, [school.experienceModules]);

  const getDefaultCommentText = (moduleType: ExperienceModuleType) => {
    const targetExperienceModule = school.experienceModules.find((item) => item.moduleType === moduleType);
    if (!targetExperienceModule) {
      return '';
    }

    return targetExperienceModule.evidences
      .slice(0, 2)
      .map((item) => item.quote)
      .join('\n');
  };

  const [moduleType, setModuleType] = useState<ExperienceModuleType>(moduleTypeOptions[0]);
  const [commentsText, setCommentsText] = useState<string>(getDefaultCommentText(moduleTypeOptions[0]));
  const [result, setResult] = useState<AnalyzeCommentsResponse | null>(null);
  const [errorText, setErrorText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleModuleTypeChange = (nextModuleType: ExperienceModuleType) => {
    setModuleType(nextModuleType);
    setCommentsText(getDefaultCommentText(nextModuleType));
    setResult(null);
    setErrorText('');
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const comments = commentsText
      .split('\n')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (comments.length === 0) {
      setErrorText('请至少输入 1 条评论');
      setResult(null);
      return;
    }

    setIsSubmitting(true);
    setErrorText('');

    try {
      const response = await fetch('/api/analyze-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schoolId: school.basic.id,
          moduleType,
          comments,
        }),
      });

      const json = (await response.json()) as AnalyzeCommentsResponse | { error?: string };
      if (!response.ok) {
        const apiError = 'error' in json && typeof json.error === 'string' ? json.error : '请求失败';
        throw new Error(apiError);
      }

      setResult(json as AnalyzeCommentsResponse);
    } catch (error) {
      const message = error instanceof Error ? error.message : '调用失败';
      setErrorText(message);
      setResult(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mt-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">评论分析调试（最小闭环）</h2>
      <p className="text-sm text-gray-600 mb-4">
        用于验证 `POST /api/analyze-comments` 链路。当前返回为 mock 分析结果，后续可替换成真实模型调用。
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">选择模块</label>
          <select
            value={moduleType}
            onChange={(event) => handleModuleTypeChange(event.target.value as ExperienceModuleType)}
            className="w-full md:w-80 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {moduleTypeOptions.map((item) => (
              <option key={item} value={item}>
                {getModuleTypeText(item)} ({item})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            测试评论（每行一条）
          </label>
          <textarea
            value={commentsText}
            onChange={(event) => setCommentsText(event.target.value)}
            rows={6}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="输入评论，每行一条..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {isSubmitting ? '分析中...' : '调用 analyze-comments'}
        </button>
      </form>

      {errorText ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorText}
        </div>
      ) : null}

      {result ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-900 mb-1">moduleSummary</p>
            <p className="text-sm text-gray-700 leading-6">{result.moduleSummary}</p>
            <p className="text-xs text-gray-500 mt-2">
              sentiment: {result.sentiment} · confidence: {result.confidence.level} (
              {result.confidence.score})
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-md border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-900 mb-2">keyInsights</p>
              <ul className="text-sm text-gray-700 space-y-1 list-disc pl-4">
                {result.keyInsights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-md border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-900 mb-2">suitableFor / notSuitableFor</p>
              <p className="text-xs text-gray-500 mb-1">suitableFor</p>
              <ul className="text-sm text-gray-700 space-y-1 list-disc pl-4 mb-3">
                {result.suitableFor.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 mb-1">notSuitableFor</p>
              <ul className="text-sm text-gray-700 space-y-1 list-disc pl-4">
                {result.notSuitableFor.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-md border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-900 mb-2">selectedEvidence</p>
            <div className="space-y-2">
              {result.selectedEvidence.map((item) => (
                <div key={`${item.quote}-${item.reason}`} className="rounded-md bg-gray-50 border border-gray-200 p-3">
                  <p className="text-sm text-gray-700 leading-6">“{item.quote}”</p>
                  <p className="text-xs text-gray-500 mt-1">{item.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default CommentAnalysisDebugPanel;
