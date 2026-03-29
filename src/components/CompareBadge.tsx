import { School } from '@/types/school';

interface CompareBadgeProps {
  school: School;
  onRemove: (id: string) => void;
}

const CompareBadge: React.FC<CompareBadgeProps> = ({ school, onRemove }) => {
  return (
    <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200">
      <div className="flex flex-col mr-3">
        <span className="font-medium text-gray-900">{school.basic.name}</span>
        <span className="text-xs text-gray-500">{school.basic.city}</span>
      </div>
      <button
        onClick={() => onRemove(school.basic.id)}
        className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none"
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
  );
};

export default CompareBadge;
