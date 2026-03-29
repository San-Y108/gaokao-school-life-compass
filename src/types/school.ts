export type ExperienceSentiment = 'positive' | 'mixed' | 'negative';
export type CredibilityLevel = 'low' | 'medium' | 'high';
export type ExperienceScale = 'low' | 'medium' | 'high' | 'very-high';
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'very-hard';
export type ExperienceModuleType =
  | 'academic-rhythm'
  | 'campus-governance'
  | 'development-opportunity';
export type ExperienceTaxonomyKey =
  | 'campus_experience.academic-rhythm'
  | 'campus_experience.campus-governance'
  | 'campus_experience.development-opportunity';
export type StructuredFactValue =
  | boolean
  | number
  | string
  | ExperienceScale
  | DifficultyLevel
  | null;

export interface SchoolBasic {
  id: string;
  name: string;
  city: string;
  tierTag: string;
  rankingBand: string;
}

export interface StudentCommentEvidence {
  id: string;
  quote: string;
  sourceLabel: string;
  sourceType: 'forum' | 'social' | 'interview' | 'survey' | 'community';
  authorLabel: string;
  sentiment: ExperienceSentiment;
  context?: string;
  relatedFactKeys?: string[];
}

export interface StructuredFact {
  key: string;
  label: string;
  value: StructuredFactValue;
  displayValue: string;
}

export interface ExperienceModule {
  id: string;
  moduleType: ExperienceModuleType;
  taxonomyKey: ExperienceTaxonomyKey;
  title: string;
  summary: string;
  sentiment: ExperienceSentiment;
  tags: string[];
  structuredFacts: StructuredFact[];
  evidences: StudentCommentEvidence[];
  credibility: CredibilityLevel;
}

export interface School {
  basic: SchoolBasic;
  overview: {
    summary: string;
    tags: string[];
    disclaimer: string;
  };
  experienceModules: ExperienceModule[];
}
