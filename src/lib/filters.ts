import { School } from '@/types/school';

export interface FilterOptions {
  searchQuery: string;
  hasMorningStudy: boolean | null;
  hasEveningStudy: boolean | null;
  studyPressureLevel: string[];
  adminStrictnessLevel: string[];
  freedomLevel: string[];
}

export const filterSchools = (schools: School[], options: FilterOptions): School[] => {
  return schools.filter((school) => {
    // 搜索过滤
    const searchLower = options.searchQuery.toLowerCase();
    if (searchLower) {
      const matchesName = school.name.toLowerCase().includes(searchLower);
      const matchesCity = school.city.toLowerCase().includes(searchLower);
      if (!matchesName && !matchesCity) {
        return false;
      }
    }

    // 早自习过滤
    if (options.hasMorningStudy !== null && school.hasMorningStudy !== options.hasMorningStudy) {
      return false;
    }

    // 晚自习过滤
    if (options.hasEveningStudy !== null && school.hasEveningStudy !== options.hasEveningStudy) {
      return false;
    }

    // 学习压力过滤
    if (options.studyPressureLevel.length > 0 && !options.studyPressureLevel.includes(school.studyPressureLevel)) {
      return false;
    }

    // 管理严格度过滤
    if (options.adminStrictnessLevel.length > 0 && !options.adminStrictnessLevel.includes(school.adminStrictnessLevel)) {
      return false;
    }

    // 校园自由度过滤
    if (options.freedomLevel.length > 0 && !options.freedomLevel.includes(school.freedomLevel)) {
      return false;
    }

    return true;
  });
};

export const getDefaultFilterOptions = (): FilterOptions => {
  return {
    searchQuery: '',
    hasMorningStudy: null,
    hasEveningStudy: null,
    studyPressureLevel: [],
    adminStrictnessLevel: [],
    freedomLevel: []
  };
};