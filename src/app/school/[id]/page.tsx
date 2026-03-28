'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { schools } from '@/data/schools';
import { useCompare } from '@/lib/useCompare';

const SchoolDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { addToCompare, compareState } = useCompare();
  
  // 查找学校
  const school = schools.find(s => s.id === id);
  const isAddedToCompare = compareState.schoolIds.includes(id);
  const isCompareFull = compareState.schoolIds.length >= 3;

  // 处理未找到学校的情况
  if (!school) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">
              未找到学校
            </h1>
            <p className="text-gray-600 mb-6">
              抱歉，无法找到该学校的信息
            </p>
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

  const getLevelText = (level: string) => {
    const levelMap: Record<string, string> = {
      'low': '低',
      'medium': '中',
      'high': '高',
      'very-high': '很高',
      'easy': '容易',
      'hard': '困难',
      'very-hard': '很困难'
    };
    return levelMap[level] || level;
  };

  const getBooleanText = (value: boolean | null) => {
    if (value === null) return '待补充';
    return value ? '有' : '无';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {school.name}
              </h1>
              <div className="flex items-center flex-wrap gap-4">
                <span className="text-gray-600">{school.city}</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {school.tierTag}
                </span>
                <span className="text-gray-600">排名区间：{school.rankingBand}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
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
                  onClick={() => addToCompare(school.id)}
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
        </div>
      </div>

      {/* 详情内容 */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 关键制度与生活体验指标 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            关键制度与生活体验
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-3">学习制度</h3>
              <ul className="space-y-2">
                <li className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">早自习：</span>
                  <span className="font-medium">{getBooleanText(school.hasMorningStudy)}</span>
                </li>
                <li className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">晚自习：</span>
                  <span className="font-medium">{getBooleanText(school.hasEveningStudy)}</span>
                </li>
                <li className="flex justify-between py-2">
                  <span className="text-gray-600">自习时长：</span>
                  <span className="font-medium">{school.selfStudyHours || '待补充'}</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-3">压力与管理</h3>
              <ul className="space-y-2">
                <li className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">学习压力：</span>
                  <span className="font-medium">{getLevelText(school.studyPressureLevel)}</span>
                </li>
                <li className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">管理严格度：</span>
                  <span className="font-medium">{getLevelText(school.adminStrictnessLevel)}</span>
                </li>
                <li className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">校园自由度：</span>
                  <span className="font-medium">{getLevelText(school.freedomLevel)}</span>
                </li>
                <li className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">查寝严格度：</span>
                  <span className="font-medium">{getLevelText(school.dormCheckLevel)}</span>
                </li>
                <li className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">考勤严格度：</span>
                  <span className="font-medium">{getLevelText(school.attendanceStrictnessLevel)}</span>
                </li>
                <li className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">体育要求：</span>
                  <span className="font-medium">{getLevelText(school.peRequirementLevel)}</span>
                </li>
                <li className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">转专业难度：</span>
                  <span className="font-medium">{getLevelText(school.transferMajorDifficulty)}</span>
                </li>
                <li className="flex justify-between py-2">
                  <span className="text-gray-600">保研率：</span>
                  <span className="font-medium">{school.recommendationRateText}</span>
                </li>
              </ul>
            </div>
            <div className="lg:col-span-2">
              <h3 className="font-medium text-gray-700 mb-3">学生体感标签</h3>
              <div className="flex flex-wrap gap-2">
                {school.studentSentimentTags.map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 学校摘要 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            学校摘要
          </h2>
          <p className="text-gray-600 leading-relaxed">{school.summary}</p>
        </div>

        {/* 优点 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            优点
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            {school.pros.map((pro, index) => (
              <li key={index}>{pro}</li>
            ))}
          </ul>
        </div>

        {/* 缺点 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            缺点
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            {school.cons.map((con, index) => (
              <li key={index}>{con}</li>
            ))}
          </ul>
        </div>

        {/* 适合人群 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            适合人群
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            {school.suitableFor.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        {/* 不适合人群 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            不适合人群
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            {school.notSuitableFor.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        {/* 学生原话 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            学生原话
          </h2>
          <div className="space-y-4">
            {school.quotes.map((quote, index) => (
              <div key={index} className="border-l-4 border-gray-200 pl-4 py-2 bg-gray-50 rounded-r">
                <p className="text-gray-600 italic mb-2">"{quote.text}"</p>
                <p className="text-sm text-gray-500">— {quote.source}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 免责声明 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            免责声明
          </h2>
          <p className="text-gray-600 text-sm">{school.disclaimer}</p>
        </div>
      </div>
    </div>
  );
};

export default SchoolDetailPage;