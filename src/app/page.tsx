'use client';

import { useState } from 'react';
import { schools } from '@/data/schools';
import SchoolCard from '@/components/SchoolCard';
import SchoolFilter from '@/components/SchoolFilter';
import { filterSchools, getDefaultFilterOptions, FilterOptions } from '@/lib/filters';
import { useCompare } from '@/lib/useCompare';

export default function Home() {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>(getDefaultFilterOptions());
  const { compareState, addToCompare } = useCompare();
  
  // 应用筛选
  const filteredSchools = filterSchools(schools, filterOptions);
  
  // 重置筛选
  const handleReset = () => {
    setFilterOptions(getDefaultFilterOptions());
  };

  // 检查是否达到对比上限
  const isCompareFull = compareState.schoolIds.length >= 3;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            校感 Compass
          </h1>
          <h2 className="text-xl text-gray-600 mb-4">
            基于真实校园生活体验的高校选择工具
          </h2>
          <p className="text-gray-500 max-w-3xl mb-4">
            这不是传统就业率导向的选校工具。我们开始把高校信息重构为
            <span className="font-medium">学生评论证据驱动</span>
            的模块化档案，用评论摘要、结构化事实和证据片段来帮助你判断真实校园体验。
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
            <span className="font-semibold">温馨提示：</span>
            不同学院、年级、校区可能存在差异，本工具仅提供参考，建议结合自身情况综合判断。
          </div>
        </div>
      </div>

      {/* 学校列表 */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 筛选组件 */}
        <SchoolFilter
          options={filterOptions}
          onOptionsChange={setFilterOptions}
          onReset={handleReset}
        />

        {/* 结果统计 */}
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            高校列表
          </h3>
          <p className="text-gray-600">
            共 {filteredSchools.length} 所高校，点击卡片查看详细信息
          </p>
        </div>
        
        {/* 无结果状态 */}
        {filteredSchools.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              没有找到匹配的学校
            </h4>
            <p className="text-gray-500 mb-4">
              请尝试调整筛选条件
            </p>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              清空筛选
            </button>
          </div>
        ) : (
          /* 栅格布局 */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchools.map((school) => (
              <SchoolCard 
                key={school.basic.id} 
                school={school} 
                onAddToCompare={addToCompare}
                isAddedToCompare={compareState.schoolIds.includes(school.basic.id)}
                isCompareFull={isCompareFull}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
