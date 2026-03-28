export type StudyPressureLevel = 'low' | 'medium' | 'high' | 'very-high';
export type StrictnessLevel = 'low' | 'medium' | 'high' | 'very-high';
export type FreedomLevel = 'low' | 'medium' | 'high' | 'very-high';
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'very-hard';

export interface School {
  id: string;
  name: string;
  city: string;
  tierTag: string;
  rankingBand: string;
  hasMorningStudy: boolean | null;
  hasEveningStudy: boolean | null;
  selfStudyHours: string | null;
  studyPressureLevel: StudyPressureLevel;
  adminStrictnessLevel: StrictnessLevel;
  freedomLevel: FreedomLevel;
  dormCheckLevel: StrictnessLevel;
  attendanceStrictnessLevel: StrictnessLevel;
  peRequirementLevel: StrictnessLevel;
  transferMajorDifficulty: DifficultyLevel;
  recommendationRateText: string;
  studentSentimentTags: string[];
  summary: string;
  pros: string[];
  cons: string[];
  suitableFor: string[];
  notSuitableFor: string[];
  quotes: {
    text: string;
    source: string;
  }[];
  disclaimer: string;
}