import {
  CredibilityLevel,
  DifficultyLevel,
  ExperienceModule,
  ExperienceModuleType,
  ExperienceScale,
  ExperienceSentiment,
  ExperienceTaxonomyKey,
  School,
  StructuredFact,
  StructuredFactValue,
} from '@/types/school';

type NullableScale = ExperienceScale | null;
type NullableDifficulty = DifficultyLevel | null;

const experienceSentimentTextMap: Record<ExperienceSentiment, string> = {
  positive: '偏正面',
  mixed: '评价分化',
  negative: '偏负面',
};

const credibilityTextMap: Record<CredibilityLevel, string> = {
  low: '低',
  medium: '中',
  high: '高',
};

const levelTextMap: Record<ExperienceScale | DifficultyLevel, string> = {
  low: '低',
  medium: '中',
  high: '高',
  'very-high': '很高',
  easy: '容易',
  hard: '困难',
  'very-hard': '很困难',
};

export const MODULE_TYPE_META: Record<
  ExperienceModuleType,
  { label: string; taxonomyKey: ExperienceTaxonomyKey; description: string }
> = {
  'academic-rhythm': {
    label: '学业节奏',
    taxonomyKey: 'campus_experience.academic-rhythm',
    description: '课程负荷、学习压力、考勤与日常学习节奏',
  },
  'campus-governance': {
    label: '管理与规则',
    taxonomyKey: 'campus_experience.campus-governance',
    description: '宿舍管理、校园自由度、纪律规则与体育要求',
  },
  'development-opportunity': {
    label: '发展机会',
    taxonomyKey: 'campus_experience.development-opportunity',
    description: '资源密度、活动机会、路径切换与成长空间',
  },
};

export const MODULE_TYPE_ORDER: ExperienceModuleType[] = [
  'academic-rhythm',
  'campus-governance',
  'development-opportunity',
];

export const getSentimentText = (sentiment: ExperienceSentiment): string => {
  return experienceSentimentTextMap[sentiment];
};

export const getCredibilityText = (credibility: CredibilityLevel): string => {
  return credibilityTextMap[credibility];
};

export const getLevelText = (level: ExperienceScale | DifficultyLevel | null): string => {
  if (!level) {
    return '待补充';
  }

  return levelTextMap[level];
};

export const getBooleanText = (value: boolean | null): string => {
  if (value === null) {
    return '待补充';
  }

  return value ? '有' : '无';
};

export const getEvidenceCount = (school: School): number => {
  return school.experienceModules.reduce((count, module) => count + module.evidences.length, 0);
};

export const getSchoolKeyTags = (school: School): string[] => {
  if (school.overview.tags.length > 0) {
    return school.overview.tags;
  }

  return school.experienceModules.flatMap((module) => module.tags).slice(0, 6);
};

export const getFeaturedModules = (school: School, limit = 2): ExperienceModule[] => {
  return school.experienceModules.slice(0, limit);
};

export const getModuleTypeText = (moduleType: ExperienceModuleType): string => {
  return MODULE_TYPE_META[moduleType].label;
};

export const getModuleByType = (
  school: School,
  moduleType: ExperienceModuleType
): ExperienceModule | undefined => {
  return school.experienceModules.find((module) => module.moduleType === moduleType);
};

export const getPrimaryModule = (school: School): ExperienceModule | undefined => {
  for (const moduleType of MODULE_TYPE_ORDER) {
    const candidate = getModuleByType(school, moduleType);
    if (candidate) {
      return candidate;
    }
  }

  return school.experienceModules[0];
};

export const getModuleTopFacts = (module: ExperienceModule, limit = 2): StructuredFact[] => {
  return module.structuredFacts.slice(0, limit);
};

export const findStructuredFact = (school: School, key: string): StructuredFact | undefined => {
  return school.experienceModules
    .flatMap((module) => module.structuredFacts)
    .find((fact) => fact.key === key);
};

export const getFactValue = (school: School, key: string): StructuredFactValue | undefined => {
  return findStructuredFact(school, key)?.value;
};

export const getFactDisplayValue = (school: School, key: string): string => {
  return findStructuredFact(school, key)?.displayValue ?? '待补充';
};

export const getBooleanFactValue = (school: School, key: string): boolean | null => {
  const factValue = getFactValue(school, key);
  return typeof factValue === 'boolean' ? factValue : null;
};

export const getScaleFactValue = (school: School, key: string): NullableScale => {
  const factValue = getFactValue(school, key);

  if (
    factValue === 'low' ||
    factValue === 'medium' ||
    factValue === 'high' ||
    factValue === 'very-high'
  ) {
    return factValue;
  }

  return null;
};

export const getDifficultyFactValue = (school: School, key: string): NullableDifficulty => {
  const factValue = getFactValue(school, key);

  if (
    factValue === 'easy' ||
    factValue === 'medium' ||
    factValue === 'hard' ||
    factValue === 'very-hard'
  ) {
    return factValue;
  }

  return null;
};
