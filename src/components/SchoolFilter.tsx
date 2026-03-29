import { MODULE_TYPE_META, MODULE_TYPE_ORDER } from '@/lib/school-helpers';
import { FACT_FILTER_PRESETS, FactFilterPresetId, FilterOptions } from '@/lib/filters';
import { ExperienceModuleType } from '@/types/school';

interface SchoolFilterProps {
  options: FilterOptions;
  onOptionsChange: (options: FilterOptions) => void;
  onReset: () => void;
}

const SchoolFilter: React.FC<SchoolFilterProps> = ({ options, onOptionsChange, onReset }) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      searchQuery: e.target.value,
    });
  };

  const handleModuleTypeToggle = (moduleType: ExperienceModuleType) => {
    const exists = options.moduleTypes.includes(moduleType);

    if (exists && options.moduleTypes.length === 1) {
      return;
    }

    const moduleTypes = exists
      ? options.moduleTypes.filter((item) => item !== moduleType)
      : [...options.moduleTypes, moduleType];

    onOptionsChange({
      ...options,
      moduleTypes,
    });
  };

  const handleFactPresetToggle = (presetId: FactFilterPresetId) => {
    const exists = options.factFilterPresetIds.includes(presetId);
    const factFilterPresetIds = exists
      ? options.factFilterPresetIds.filter((item) => item !== presetId)
      : [...options.factFilterPresetIds, presetId];

    onOptionsChange({
      ...options,
      factFilterPresetIds,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="mb-6">
        <input
          type="text"
          placeholder="搜索学校、模块关键词、事实键或评论片段..."
          value={options.searchQuery}
          onChange={handleSearchChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-700 mb-3 text-sm">主题模块筛选（moduleType）</h4>
          <p className="text-xs text-gray-500 mb-3">
            当前默认全开，后续可直接映射到评论分析 API 的模块分类。
          </p>
          <div className="space-y-2">
            {MODULE_TYPE_ORDER.map((moduleType) => {
              const isChecked = options.moduleTypes.includes(moduleType);
              const moduleMeta = MODULE_TYPE_META[moduleType];
              return (
                <label
                  key={moduleType}
                  className="flex items-start gap-2 rounded-md border border-gray-200 px-3 py-2"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleModuleTypeToggle(moduleType)}
                    className="mt-1 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span>
                    <span className="block text-sm font-medium text-gray-800">{moduleMeta.label}</span>
                    <span className="block text-xs text-gray-500">
                      {moduleMeta.description} · <code>{moduleMeta.taxonomyKey}</code>
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-700 mb-3 text-sm">事实条件筛选（structuredFacts.key）</h4>
          <p className="text-xs text-gray-500 mb-3">
            先提供高价值预设，后续可扩展成可配置规则引擎。
          </p>
          <div className="space-y-2">
            {FACT_FILTER_PRESETS.map((preset) => (
              <label
                key={preset.id}
                className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2"
              >
                <input
                  type="checkbox"
                  checked={options.factFilterPresetIds.includes(preset.id)}
                  onChange={() => handleFactPresetToggle(preset.id)}
                  className="text-blue-600 focus:ring-blue-500 rounded"
                />
                <span className="text-sm text-gray-700">
                  {preset.label}
                  <span className="text-xs text-gray-500 ml-2">
                    ({MODULE_TYPE_META[preset.moduleType].label} · {preset.factKey})
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <p className="text-xs text-gray-500">
          已选择 {options.moduleTypes.length} 个模块主题 / {options.factFilterPresetIds.length}{' '}
          条事实条件
        </p>
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
