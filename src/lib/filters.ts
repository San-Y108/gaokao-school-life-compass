import { ExperienceModuleType, School, StructuredFactValue } from '@/types/school';
import { MODULE_TYPE_META, MODULE_TYPE_ORDER } from '@/lib/school-helpers';

export type FactFilterPresetId =
  | 'morning-study-required'
  | 'no-evening-study'
  | 'high-study-pressure'
  | 'high-freedom'
  | 'strict-dorm-check'
  | 'rich-opportunity-density'
  | 'hard-transfer-major';

interface FactFilterPreset {
  id: FactFilterPresetId;
  label: string;
  moduleType: ExperienceModuleType;
  factKey: string;
  expectedValues: StructuredFactValue[];
}

export const FACT_FILTER_PRESETS: FactFilterPreset[] = [
  {
    id: 'morning-study-required',
    label: '有明显早起学习节奏',
    moduleType: 'academic-rhythm',
    factKey: 'morning-study',
    expectedValues: [true],
  },
  {
    id: 'no-evening-study',
    label: '无统一晚自习',
    moduleType: 'academic-rhythm',
    factKey: 'evening-study',
    expectedValues: [false],
  },
  {
    id: 'high-study-pressure',
    label: '学习压力高',
    moduleType: 'academic-rhythm',
    factKey: 'study-pressure-level',
    expectedValues: ['high', 'very-high'],
  },
  {
    id: 'high-freedom',
    label: '校园自由度高',
    moduleType: 'campus-governance',
    factKey: 'freedom-level',
    expectedValues: ['high', 'very-high'],
  },
  {
    id: 'strict-dorm-check',
    label: '查寝规则存在感强',
    moduleType: 'campus-governance',
    factKey: 'dorm-check-level',
    expectedValues: ['high', 'very-high'],
  },
  {
    id: 'rich-opportunity-density',
    label: '资源机会密度高',
    moduleType: 'development-opportunity',
    factKey: 'resource-density',
    expectedValues: ['high', 'very-high'],
  },
  {
    id: 'hard-transfer-major',
    label: '转专业门槛高',
    moduleType: 'development-opportunity',
    factKey: 'transfer-major-difficulty',
    expectedValues: ['hard', 'very-hard'],
  },
];

const FACT_FILTER_PRESET_MAP: Record<FactFilterPresetId, FactFilterPreset> = FACT_FILTER_PRESETS.reduce(
  (map, preset) => {
    map[preset.id] = preset;
    return map;
  },
  {} as Record<FactFilterPresetId, FactFilterPreset>
);

export interface FilterOptions {
  searchQuery: string;
  moduleTypes: ExperienceModuleType[];
  factFilterPresetIds: FactFilterPresetId[];
}

const containsSearchTerm = (school: School, searchLower: string): boolean => {
  if (!searchLower) {
    return true;
  }

  const matchesBasic =
    school.basic.name.toLowerCase().includes(searchLower) ||
    school.basic.city.toLowerCase().includes(searchLower);
  if (matchesBasic) {
    return true;
  }

  const matchesOverview = school.overview.summary.toLowerCase().includes(searchLower);
  if (matchesOverview) {
    return true;
  }

  return school.experienceModules.some((module) => {
    const moduleMeta = MODULE_TYPE_META[module.moduleType];

    const matchesModuleText =
      module.title.toLowerCase().includes(searchLower) ||
      module.summary.toLowerCase().includes(searchLower) ||
      module.tags.some((tag) => tag.toLowerCase().includes(searchLower)) ||
      moduleMeta.label.toLowerCase().includes(searchLower) ||
      module.taxonomyKey.toLowerCase().includes(searchLower);

    if (matchesModuleText) {
      return true;
    }

    const matchesFacts = module.structuredFacts.some(
      (fact) =>
        fact.key.toLowerCase().includes(searchLower) ||
        fact.label.toLowerCase().includes(searchLower) ||
        fact.displayValue.toLowerCase().includes(searchLower)
    );
    if (matchesFacts) {
      return true;
    }

    return module.evidences.some(
      (evidence) =>
        evidence.quote.toLowerCase().includes(searchLower) ||
        evidence.sourceLabel.toLowerCase().includes(searchLower)
    );
  });
};

const matchesModuleTypes = (school: School, moduleTypes: ExperienceModuleType[]): boolean => {
  if (moduleTypes.length === 0) {
    return true;
  }

  return moduleTypes.every((moduleType) =>
    school.experienceModules.some((module) => module.moduleType === moduleType)
  );
};

const matchesFactFilterPreset = (school: School, presetId: FactFilterPresetId): boolean => {
  const preset = FACT_FILTER_PRESET_MAP[presetId];
  const targetExperienceModule = school.experienceModules.find(
    (item) => item.moduleType === preset.moduleType
  );
  if (!targetExperienceModule) {
    return false;
  }

  const fact = targetExperienceModule.structuredFacts.find((item) => item.key === preset.factKey);
  if (!fact) {
    return false;
  }

  return preset.expectedValues.some((value) => value === fact.value);
};

export const filterSchools = (schools: School[], options: FilterOptions): School[] => {
  const searchLower = options.searchQuery.trim().toLowerCase();

  return schools.filter((school) => {
    if (!containsSearchTerm(school, searchLower)) {
      return false;
    }

    if (!matchesModuleTypes(school, options.moduleTypes)) {
      return false;
    }

    return options.factFilterPresetIds.every((presetId) => matchesFactFilterPreset(school, presetId));
  });
};

export const getDefaultFilterOptions = (): FilterOptions => {
  return {
    searchQuery: '',
    moduleTypes: [...MODULE_TYPE_ORDER],
    factFilterPresetIds: [],
  };
};
