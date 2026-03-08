export type WardrobeOccasion = 'casual' | 'professional' | 'date' | 'formal' | 'athletic';
export type WardrobeSeason = 'spring' | 'summer' | 'autumn' | 'winter';

export interface OutfitPiece {
  item: string;
  color: string;
  fabric?: string;
}

export interface Outfit {
  id: string;
  occasion: WardrobeOccasion;
  seasons: WardrobeSeason[];
  title: string;
  subtitle: string;
  pieces: OutfitPiece[];
  palette: string[];
  stylingNote: string;
  accentColor: string;
}

export interface CapsuleItem {
  id: string;
  item: string;
  why: string;
  category: 'top' | 'bottom' | 'layer' | 'footwear' | 'accessory';
}

export const OCCASION_LABELS: Record<WardrobeOccasion, string> = {
  casual: 'Casual',
  professional: 'Professional',
  date: 'Date Night',
  formal: 'Black Tie',
  athletic: 'Athletic',
};

export const OCCASION_COLORS: Record<WardrobeOccasion, string> = {
  casual: '#4A7C59',
  professional: '#2B4A8B',
  date: '#8B1A4A',
  formal: '#0A0A0A',
  athletic: '#5B4A2B',
};

export const SEASON_LABELS: Record<WardrobeSeason, string> = {
  spring: 'Spring',
  summer: 'Summer',
  autumn: 'Autumn',
  winter: 'Winter',
};
