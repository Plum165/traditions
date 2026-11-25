export type GameCategory =
  | 'Card Games'
  | 'Street Games'
  | 'Playground Games'
  | 'Board Games'
  | 'Group Games'
  | 'Indoor Games'
  | 'Outdoor Games'
  | 'Traditional Activities';

export type PublicationStatus = 'published' | 'draft' | 'needs-confirmation';

export type VerificationLevel =
  | 'documented-version'
  | 'community-recollection'
  | 'needs-confirmation';

export type CardSuit = 'spades' | 'hearts' | 'diamonds' | 'clubs' | 'joker';

export interface CardExampleItem {
  rank: string;
  suit: CardSuit;
  label?: string;
  highlight?: boolean;
}

export interface OrderedStep {
  title?: string;
  text: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export type ContentBlock =
  | {
      type: 'paragraph';
      text: string;
    }
  | {
      type: 'ordered-list';
      items: OrderedStep[];
    }
  | {
      type: 'unordered-list';
      items: string[];
    }
  | {
      type: 'table';
      caption?: string;
      headers: string[];
      rows: string[][];
    }
  | {
      type: 'card-example';
      title: string;
      description?: string;
      cards: CardExampleItem[];
      caption?: string;
    }
  | {
      type: 'callout';
      variant: 'note' | 'warning' | 'unconfirmed';
      title: string;
      text?: string;
      items?: string[];
    }
  | {
      type: 'image';
      src: string;
      alt: string;
      caption: string;
      isIllustrative: boolean;
    }
  | {
      type: 'faq';
      items: FaqItem[];
    };

export interface GameSection {
  id: string;
  title: string;
  verification?: VerificationLevel;
  blocks: ContentBlock[];
}

export interface GameVariation {
  id: string;
  name: string;
  summary: string;
  verification: VerificationLevel;
  details: string[];
}

export interface CulturalNote {
  title: string;
  text: string;
  attribution?: string;
  verification: VerificationLevel;
}

export interface GameCoverImage {
  src: string;
  alt: string;
  caption: string;
  isIllustrative: boolean;
}

export interface GameSeoMetadata {
  title: string;
  description: string;
}

export interface Game {
  id: string;
  slug: string;
  accessionCode: string;
  name: string;
  alternativeNames?: string[];
  category: GameCategory;
  secondaryCategories?: GameCategory[];
  description: string;
  shortSummary: string;
  coverImage: GameCoverImage;
  status: PublicationStatus;
  featured?: boolean;
  playerCount?: string;
  equipment?: string[];
  difficulty?: 'Easy to learn' | 'Moderate' | 'Strategic';
  duration?: string;
  spaceRequired?: string;
  objective: string;
  setup?: ContentBlock[];
  sections: GameSection[];
  rules?: string[];
  variations?: GameVariation[];
  unconfirmedQuestions?: string[];
  culturalNotes?: CulturalNote[];
  relatedGames?: string[];
  lastUpdated: string;
  seo?: GameSeoMetadata;
}

export interface GameRepository {
  getAllPublished: () => Promise<Game[]>;
  getBySlug: (slug: string) => Promise<Game | undefined>;
}
