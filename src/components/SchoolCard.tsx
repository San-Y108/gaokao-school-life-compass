import Link from 'next/link';
import { School } from '@/types/school';
import {
  getEvidenceCount,
  getModuleTopFacts,
  getModuleTypeText,
  getPrimaryModule,
} from '@/lib/school-helpers';

interface SchoolCardProps {
  school: School;
  onAddToCompare?: (schoolId: string) => void;
  isAddedToCompare?: boolean;
  isCompareFull?: boolean;
}

const SchoolCard: React.FC<SchoolCardProps> = ({
  school,
  onAddToCompare,
  isAddedToCompare,
  isCompareFull,
}) => {
  const primaryModule = getPrimaryModule(school);
  const evidenceCount = getEvidenceCount(school);
  const previewFacts = primaryModule ? getModuleTopFacts(primaryModule, 2) : [];
  const previewTags = primaryModule ? primaryModule.tags.slice(0, 2) : school.overview.tags.slice(0, 2);

  return (
    <Link
      href={`/school/${school.basic.id}`}
      className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 h-full flex flex-col"
    >
      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2 gap-3">
            <h3 className="text-xl font-semibold text-gray-900">{school.basic.name}</h3>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {school.basic.tierTag}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600 mb-2 gap-4 flex-wrap">
            <span>{school.basic.city}</span>
            <span>排名区间：{school.basic.rankingBand}</span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 leading-6 line-clamp-3">{school.overview.summary}</p>
        </div>

        {primaryModule ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 mb-4">
            <p className="text-xs text-gray-500 mb-1">主模块 · {getModuleTypeText(primaryModule.moduleType)}</p>
            <p className="text-sm font-medium text-gray-900 mb-2">{primaryModule.title}</p>
            <p className="text-sm text-gray-600 leading-6 line-clamp-2">{primaryModule.summary}</p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-2 mb-4">
          {previewFacts.map((fact) => (
            <div key={fact.key} className="rounded-md border border-gray-200 px-3 py-2">
              <p className="text-xs text-gray-500">{fact.label}</p>
              <p className="text-sm font-medium text-gray-900">{fact.displayValue}</p>
            </div>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {previewTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-md bg-blue-50 px-3 py-2 border border-blue-100">
            <p className="text-xs text-blue-700">体验模块</p>
            <p className="font-semibold text-blue-900">{school.experienceModules.length} 个</p>
          </div>
          <div className="rounded-md bg-emerald-50 px-3 py-2 border border-emerald-100">
            <p className="text-xs text-emerald-700">评论证据</p>
            <p className="font-semibold text-emerald-900">{evidenceCount} 条</p>
          </div>
        </div>

        <div className="mt-auto">
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
                onAddToCompare?.(school.basic.id);
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
