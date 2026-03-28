import Link from 'next/link';
import { School } from '@/types/school';

interface SchoolCardProps {
  school: School;
  onAddToCompare?: (schoolId: string) => void;
  isAddedToCompare?: boolean;
  isCompareFull?: boolean;
}

const SchoolCard: React.FC<SchoolCardProps> = ({ school, onAddToCompare, isAddedToCompare, isCompareFull }) => {
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
    <Link 
      href={`/school/${school.id}`}
      className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 h-full flex flex-col"
    >
      <div className="p-6 flex-1 flex flex-col">
        {/* 学校基本信息 */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-semibold text-gray-900">{school.name}</h3>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {school.tierTag}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <span className="mr-4">{school.city}</span>
            <span>排名区间：{school.rankingBand}</span>
          </div>
        </div>

        {/* 关键指标 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 flex-1">
          <div>
            <div className="text-xs text-gray-500 mb-1">早自习</div>
            <div className="text-sm font-medium">{getBooleanText(school.hasMorningStudy)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">晚自习</div>
            <div className="text-sm font-medium">{getBooleanText(school.hasEveningStudy)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">学习压力</div>
            <div className="text-sm font-medium">{getLevelText(school.studyPressureLevel)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">管理严格度</div>
            <div className="text-sm font-medium">{getLevelText(school.adminStrictnessLevel)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">校园自由度</div>
            <div className="text-sm font-medium">{getLevelText(school.freedomLevel)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">保研率</div>
            <div className="text-sm font-medium">{school.recommendationRateText}</div>
          </div>
        </div>

        {/* 学生情绪标签 */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {school.studentSentimentTags.slice(0, 4).map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 摘要 */}
        <div className="mb-4 flex-1">
          <p className="text-sm text-gray-600 line-clamp-3">{school.summary}</p>
        </div>

        {/* 加入对比按钮 */}
        <div>
          {isAddedToCompare ? (
            <span className="inline-flex items-center px-3 py-1.5 w-full rounded-md text-sm font-medium bg-green-100 text-green-800 text-center">
              已加入对比
            </span>
          ) : isCompareFull ? (
            <button
              disabled
              className="w-full px-3 py-1.5 rounded-md text-sm font-medium text-gray-400 bg-gray-100 cursor-not-allowed text-center"
            >
              对比已满（最多3所）
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.preventDefault();
                if (onAddToCompare) {
                  onAddToCompare(school.id);
                }
              }}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              加入对比
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default SchoolCard;