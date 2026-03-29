import { ExperienceModuleType, ExperienceSentiment } from '@/types/school';

export interface AnalyzeCommentsRequest {
  schoolId: string;
  moduleType: ExperienceModuleType;
  comments: string[];
}

export interface AnalyzeCommentsSelectedEvidence {
  quote: string;
  reason: string;
}

export interface AnalyzeCommentsConfidence {
  score: number;
  level: 'low' | 'medium' | 'high';
  reason: string;
}

export interface AnalyzeCommentsResponse {
  schoolId: string;
  moduleType: ExperienceModuleType;
  moduleSummary: string;
  sentiment: ExperienceSentiment;
  keyInsights: string[];
  suitableFor: string[];
  notSuitableFor: string[];
  selectedEvidence: AnalyzeCommentsSelectedEvidence[];
  confidence: AnalyzeCommentsConfidence;
  mock: boolean;
}
