import type { GameCategory } from './game';

export type ContributionKind =
  | 'new-game'
  | 'rule-correction'
  | 'alternative-rules'
  | 'childhood-memory'
  | 'alternative-name'
  | 'archival-photograph';

export type ModerationStatus =
  | 'submitted'
  | 'under-review'
  | 'awaiting-confirmation'
  | 'published'
  | 'archived';

export interface ContributionDraft {
  kind: ContributionKind;
  gameTitle: string;
  alternativeNames?: string[];
  category?: GameCategory;
  neighbourhoodOrRegion?: string;
  playerCount?: string;
  equipment?: string;
  rulesSummary: string;
  uncertainDetails?: string;
  personalMemory?: string;
  contributorName?: string;
  isPublicAttributionApproved: boolean;
}

export interface ContributionRecord extends ContributionDraft {
  id: string;
  targetGameSlug?: string;
  moderationStatus: ModerationStatus;
  submittedAt: string;
  reviewerNotes?: string;
}
