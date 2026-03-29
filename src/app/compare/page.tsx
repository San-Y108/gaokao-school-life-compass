'use client';

import React from 'react';
import Link from 'next/link';
import CompareBadge from '@/components/CompareBadge';
import { schools } from '@/data/schools';
import {
  getEvidenceCount,
  getModuleByType,
  getModuleTopFacts,
  getModuleTypeText,
  getSentimentText,
  MODULE_TYPE_META,
  MODULE_TYPE_ORDER,
} from '@/lib/school-helpers';
import { useCompare } from '@/lib/useCompare';

const ComparePage: React.FC = () => {
  const { compareState, removeFromCompare, clearCompare } = useCompare();
  const compareSchools = schools.filter((school) => compareState.schoolIds.includes(school.basic.id));

  if (compareSchools.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">对比列表为空</h1>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              请从学校列表或详情页添加学校到对比列表。最多可对比 3 所学校。
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              去添加学校
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">同主题模块对比</h1>
              <p className="text-gray-600">
                已选择 {compareState.schoolIds.length}/3 所学校，按统一 taxonomyKey 横向比较模块证据
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={clearCompare}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                清空全部
              </button>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                返回首页
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            {compareSchools.map((school) => (
              <CompareBadge key={school.basic.id} school={school} onRemove={removeFromCompare} />
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {compareSchools.map((school) => (
              <div
                key={school.basic.id}
                className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
              >
                <p className="text-xs text-gray-500">{school.basic.name}</p>
                <p className="text-sm font-medium text-gray-900">
                  {school.experienceModules.length} 个模块 · {getEvidenceCount(school)} 条证据
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        {MODULE_TYPE_ORDER.map((moduleType) => {
          const moduleMeta = MODULE_TYPE_META[moduleType];

          return (
            <section key={moduleType} className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {getModuleTypeText(moduleType)}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {moduleMeta.description} · taxonomyKey: {moduleMeta.taxonomyKey}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {compareSchools.map((school) => {
                  const targetExperienceModule = getModuleByType(school, moduleType);

                  return (
                    <article
                      key={`${moduleType}-${school.basic.id}`}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
                    >
                      <div className="flex items-center justify-between mb-3 gap-3">
                        <h3 className="text-base font-semibold text-gray-900">{school.basic.name}</h3>
                        {targetExperienceModule ? (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                            {getSentimentText(targetExperienceModule.sentiment)}
                          </span>
                        ) : null}
                      </div>

                      {!targetExperienceModule ? (
                        <p className="text-sm text-gray-500">该学校暂无此模块数据。</p>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">模块摘要</p>
                            <p className="text-sm text-gray-700 leading-6">
                              {targetExperienceModule.summary}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 mb-2">关键结构化事实</p>
                            <div className="space-y-2">
                              {getModuleTopFacts(targetExperienceModule, 2).map((fact) => (
                                <div
                                  key={fact.key}
                                  className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
                                >
                                  <p className="text-xs text-gray-500">{fact.label}</p>
                                  <p className="text-sm font-medium text-gray-900">{fact.displayValue}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 mb-2">评论证据</p>
                            <div className="space-y-2">
                              {targetExperienceModule.evidences.slice(0, 2).map((evidence) => (
                                <blockquote
                                  key={evidence.id}
                                  className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
                                >
                                  <p className="text-sm text-gray-700 leading-6 line-clamp-3">
                                    “{evidence.quote}”
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {evidence.authorLabel} · {evidence.sourceLabel}
                                  </p>
                                </blockquote>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-sm text-yellow-800">
          <span className="font-semibold">温馨提示：</span>
          当前对比页已迁移为同主题模块对比，展示重点是模块摘要、结构化事实与评论证据。后续可继续扩展为“证据冲突提示”和“模块可信度排序”。
        </div>
      </div>
    </div>
  );
};

export default ComparePage;
