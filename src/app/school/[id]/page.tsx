'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ExperienceModuleCard from '@/components/ExperienceModuleCard';
import { schools } from '@/data/schools';
import { useCompare } from '@/lib/useCompare';
import { getEvidenceCount, getSchoolKeyTags } from '@/lib/school-helpers';

const SchoolDetailPage: React.FC = () => {
  const params = useParams();
  const id = params.id as string;
  const { addToCompare, compareState } = useCompare();

  const school = schools.find((item) => item.basic.id === id);
  const isAddedToCompare = compareState.schoolIds.includes(id);
  const isCompareFull = compareState.schoolIds.length >= 3;

  if (!school) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">未找到学校</h1>
            <p className="text-gray-600 mb-6">抱歉，无法找到该学校的信息</p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              返回首页
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const schoolTags = getSchoolKeyTags(school);
  const evidenceCount = getEvidenceCount(school);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{school.basic.name}</h1>
              <div className="flex items-center flex-wrap gap-4 text-sm text-gray-600 mb-4">
                <span>{school.basic.city}</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {school.basic.tierTag}
                </span>
                <span>排名区间：{school.basic.rankingBand}</span>
                <span>{school.experienceModules.length} 个体验模块</span>
                <span>{evidenceCount} 条评论证据</span>
              </div>
              <p className="text-gray-600 max-w-3xl leading-7">{school.overview.summary}</p>
            </div>

            <div className="flex items-center gap-3">
              {isAddedToCompare ? (
                <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-green-100 text-green-800">
                  已加入对比
                </span>
              ) : isCompareFull ? (
                <button
                  disabled
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-400 bg-gray-100 cursor-not-allowed"
                >
                  对比已满（最多3所）
                </button>
              ) : (
                <button
                  onClick={() => addToCompare(school.basic.id)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  加入对比
                </button>
              )}
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                返回首页
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-5">
            {schoolTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <section className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">阅读方式</h2>
          <p className="text-sm text-gray-700 leading-7">
            当前详情页不再把学校拆成传统指标清单，而是按生活体验模块展示：
            每个模块包含摘要、关键标签、结构化事实与学生评论证据，方便后续接入评论分析 API。
          </p>
        </section>

        <div className="space-y-6">
          {school.experienceModules.map((module) => (
            <ExperienceModuleCard key={module.id} module={module} />
          ))}
        </div>

        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">样本说明</h2>
          <p className="text-sm text-gray-600 leading-7">{school.overview.disclaimer}</p>
        </section>
      </div>
    </div>
  );
};

export default SchoolDetailPage;
