import { FilterOptions } from '@/lib/filters';

interface SchoolFilterProps {
  options: FilterOptions;
  onOptionsChange: (options: FilterOptions) => void;
  onReset: () => void;
}

const SchoolFilter: React.FC<SchoolFilterProps> = ({ options, onOptionsChange, onReset }) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      searchQuery: e.target.value
    });
  };

  const handleMorningStudyChange = (value: boolean | null) => {
    onOptionsChange({
      ...options,
      hasMorningStudy: value
    });
  };

  const handleEveningStudyChange = (value: boolean | null) => {
    onOptionsChange({
      ...options,
      hasEveningStudy: value
    });
  };

  const handlePressureLevelChange = (value: string, checked: boolean) => {
    let newLevels: string[];
    if (checked) {
      newLevels = [...options.studyPressureLevel, value];
    } else {
      newLevels = options.studyPressureLevel.filter(level => level !== value);
    }
    onOptionsChange({
      ...options,
      studyPressureLevel: newLevels
    });
  };

  const handleStrictnessLevelChange = (value: string, checked: boolean) => {
    let newLevels: string[];
    if (checked) {
      newLevels = [...options.adminStrictnessLevel, value];
    } else {
      newLevels = options.adminStrictnessLevel.filter(level => level !== value);
    }
    onOptionsChange({
      ...options,
      adminStrictnessLevel: newLevels
    });
  };

  const handleFreedomLevelChange = (value: string, checked: boolean) => {
    let newLevels: string[];
    if (checked) {
      newLevels = [...options.freedomLevel, value];
    } else {
      newLevels = options.freedomLevel.filter(level => level !== value);
    }
    onOptionsChange({
      ...options,
      freedomLevel: newLevels
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {/* 搜索框 */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="搜索学校名称或城市..."
          value={options.searchQuery}
          onChange={handleSearchChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 筛选选项 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 早自习/晚自习 */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3 text-sm">学习制度</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">早自习</label>
              <div className="flex space-x-3">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="morningStudy"
                    checked={options.hasMorningStudy === true}
                    onChange={() => handleMorningStudyChange(true)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm">有</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="morningStudy"
                    checked={options.hasMorningStudy === false}
                    onChange={() => handleMorningStudyChange(false)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm">无</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="morningStudy"
                    checked={options.hasMorningStudy === null}
                    onChange={() => handleMorningStudyChange(null)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm">不限</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">晚自习</label>
              <div className="flex space-x-3">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="eveningStudy"
                    checked={options.hasEveningStudy === true}
                    onChange={() => handleEveningStudyChange(true)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm">有</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="eveningStudy"
                    checked={options.hasEveningStudy === false}
                    onChange={() => handleEveningStudyChange(false)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm">无</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="eveningStudy"
                    checked={options.hasEveningStudy === null}
                    onChange={() => handleEveningStudyChange(null)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm">不限</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 学习压力 */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3 text-sm">学习压力</h4>
          <div className="space-y-2">
            {['low', 'medium', 'high', 'very-high'].map((level) => (
              <label key={level} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={options.studyPressureLevel.includes(level)}
                  onChange={(e) => handlePressureLevelChange(level, e.target.checked)}
                  className="text-blue-600 focus:ring-blue-500 rounded"
                />
                <span className="ml-2 text-sm">
                  {level === 'low' && '低'}
                  {level === 'medium' && '中'}
                  {level === 'high' && '高'}
                  {level === 'very-high' && '很高'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 管理严格度 */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3 text-sm">管理严格度</h4>
          <div className="space-y-2">
            {['low', 'medium', 'high', 'very-high'].map((level) => (
              <label key={level} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={options.adminStrictnessLevel.includes(level)}
                  onChange={(e) => handleStrictnessLevelChange(level, e.target.checked)}
                  className="text-blue-600 focus:ring-blue-500 rounded"
                />
                <span className="ml-2 text-sm">
                  {level === 'low' && '低'}
                  {level === 'medium' && '中'}
                  {level === 'high' && '高'}
                  {level === 'very-high' && '很高'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 校园自由度 */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3 text-sm">校园自由度</h4>
          <div className="space-y-2">
            {['low', 'medium', 'high', 'very-high'].map((level) => (
              <label key={level} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={options.freedomLevel.includes(level)}
                  onChange={(e) => handleFreedomLevelChange(level, e.target.checked)}
                  className="text-blue-600 focus:ring-blue-500 rounded"
                />
                <span className="ml-2 text-sm">
                  {level === 'low' && '低'}
                  {level === 'medium' && '中'}
                  {level === 'high' && '高'}
                  {level === 'very-high' && '很高'}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={onReset}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          清空筛选
        </button>
      </div>
    </div>
  );
};

export default SchoolFilter;