'use client';

import React from 'react';
import Link from 'next/link';
import { schools } from '@/data/schools';
import { useCompare } from '@/lib/useCompare';
import CompareBadge from '@/components/CompareBadge';
import CompareRow from '@/components/CompareRow';

const ComparePage: React.FC = () => {
  const { compareState, removeFromCompare, clearCompare } = useCompare();
  
  const compareSchools = schools.filter(s => compareState.schoolIds.includes(s.id));

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

  // 处理空状态
  if (compareSchools.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">
              对比列表为空
            </h1>
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
      {/* 页面头部 */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                学校对比
              </h1>
              <p className="text-gray-600">
                最多可对比 {compareState.schoolIds.length}/3 所学校
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {compareSchools.length > 0 && (
                <button
                  onClick={clearCompare}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  清空全部
                </button>
              )}
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                返回首页
              </Link>
            </div>
          </div>

          {/* 对比列表徽章 */}
          <div className="flex flex-wrap gap-2">
            {compareSchools.map((school) => (
              <CompareBadge
                key={school.id}
                school={school}
                onRemove={removeFromCompare}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 对比表格 */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-sm font-semibold text-gray-700 text-left w-32 md:w-48">
                  指标
                </th>
                {compareSchools.map((school) => (
                  <th key={school.id} className="px-4 py-3 text-sm font-semibold text-gray-700 text-left min-w-[200px]">
                    <div className="flex items-center">
                      <span className="mr-2">{school.name}</span>
                      <button
                        onClick={() => removeFromCompare(school.id)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                        title="移除"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* 基本信息 */}
              <tr className="bg-gray-50">
                <td colSpan={compareSchools.length + 1} className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  基本信息
                </td>
              </tr>
              <CompareRow
                label="城市"
                schools={compareSchools}
                getValue={(school) => school.city}
              />
              <CompareRow
                label="层次标签"
                schools={compareSchools}
                getValue={(school) => (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {school.tierTag}
                  </span>
                )}
              />
              <CompareRow
                label="排名区间"
                schools={compareSchools}
                getValue={(school) => school.rankingBand}
              />
              
              {/* 学习制度 */}
              <tr className="bg-gray-50">
                <td colSpan={compareSchools.length + 1} className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  学习制度
                </td>
              </tr>
              <CompareRow
                label="早自习"
                schools={compareSchools}
                getValue={(school) => getBooleanText(school.hasMorningStudy)}
              />
              <CompareRow
                label="晚自习"
                schools={compareSchools}
                getValue={(school) => getBooleanText(school.hasEveningStudy)}
              />
              <CompareRow
                label="自习时长"
                schools={compareSchools}
                getValue={(school) => school.selfStudyHours || '待补充'}
              />
              
              {/* 压力与管理 */}
              <tr className="bg-gray-50">
                <td colSpan={compareSchools.length + 1} className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  压力与管理
                </td>
              </tr>
              <CompareRow
                label="学习压力"
                schools={compareSchools}
                getValue={(school) => getLevelText(school.studyPressureLevel)}
              />
              <CompareRow
                label="管理严格度"
                schools={compareSchools}
                getValue={(school) => getLevelText(school.adminStrictnessLevel)}
              />
              <CompareRow
                label="校园自由度"
                schools={compareSchools}
                getValue={(school) => getLevelText(school.freedomLevel)}
              />
              <CompareRow
                label="查寝严格度"
                schools={compareSchools}
                getValue={(school) => getLevelText(school.dormCheckLevel)}
              />
              <CompareRow
                label="考勤严格度"
                schools={compareSchools}
                getValue={(school) => getLevelText(school.attendanceStrictnessLevel)}
              />
              <CompareRow
                label="体育要求"
                schools={compareSchools}
                getValue={(school) => getLevelText(school.peRequirementLevel)}
              />
              <CompareRow
                label="转专业难度"
                schools={compareSchools}
                getValue={(school) => getLevelText(school.transferMajorDifficulty)}
              />
              <CompareRow
                label="保研率"
                schools={compareSchools}
                getValue={(school) => school.recommendationRateText}
              />
              
              {/* 学生体感 */}
              <tr className="bg-gray-50">
                <td colSpan={compareSchools.length + 1} className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  学生体感
                </td>
              </tr>
              <CompareRow
                label="学生体感标签"
                schools={compareSchools}
                getValue={(school) => (
                  <div className="flex flex-wrap gap-1">
                    {school.studentSentimentTags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                    {school.studentSentimentTags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{school.studentSentimentTags.length - 3}个
                      </span>
                    )}
                  </div>
                )}
              />
            </tbody>
          </table>
        </div>
        
        {/* 提示信息 */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4 text-sm text-yellow-800">
          <span className="font-semibold">温馨提示：</span>
          本工具仅提供参考信息，不同学院、年级、校区可能存在差异。建议结合自身情况综合判断。
        </div>
      </div>
    </div>
  );
};

export default ComparePage;