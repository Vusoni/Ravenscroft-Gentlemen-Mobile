export type FaceShape = 'oval' | 'square' | 'round' | 'heart' | 'oblong';
export type HairType = 'straight' | 'wavy' | 'curly' | 'coily';
export type HairLength = 'short' | 'medium' | 'long';
export type BeardStyle = 'clean' | 'stubble' | 'short' | 'full';
export type SkinTone = 1 | 2 | 3 | 4 | 5 | 6;

export interface AppearanceProfile {
  faceShape?: FaceShape;
  hairType?: HairType;
  hairLength?: HairLength;
  beardStyle?: BeardStyle;
  skinTone?: SkinTone;
}

export const FACE_SHAPE_LABELS: Record<FaceShape, string> = {
  oval: 'Oval',
  square: 'Square',
  round: 'Round',
  heart: 'Heart',
  oblong: 'Oblong',
};

export const FACE_SHAPE_DESCRIPTIONS: Record<FaceShape, string> = {
  oval: 'Longer than wide, curved chin',
  square: 'Equal width & length, strong jaw',
  round: 'Equal width & length, soft curves',
  heart: 'Wide forehead, narrow chin',
  oblong: 'Long & narrow, prominent chin',
};

export const HAIR_TYPE_LABELS: Record<HairType, string> = {
  straight: 'Straight',
  wavy: 'Wavy',
  curly: 'Curly',
  coily: 'Coily',
};

export const HAIR_LENGTH_LABELS: Record<HairLength, string> = {
  short: 'Short',
  medium: 'Medium',
  long: 'Long',
};

export const BEARD_STYLE_LABELS: Record<BeardStyle, string> = {
  clean: 'Clean Shave',
  stubble: 'Stubble',
  short: 'Short Beard',
  full: 'Full Beard',
};

// Monk scale-inspired skin tones (6 levels)
export const SKIN_TONE_COLORS: Record<SkinTone, string> = {
  1: '#F6D6B0',
  2: '#E8B888',
  3: '#D49B6A',
  4: '#B07848',
  5: '#7A4E2D',
  6: '#3D2010',
};

export const SKIN_TONES: SkinTone[] = [1, 2, 3, 4, 5, 6];
export const FACE_SHAPES: FaceShape[] = ['oval', 'square', 'round', 'heart', 'oblong'];
export const HAIR_TYPES: HairType[] = ['straight', 'wavy', 'curly', 'coily'];
export const HAIR_LENGTHS: HairLength[] = ['short', 'medium', 'long'];
export const BEARD_STYLES: BeardStyle[] = ['clean', 'stubble', 'short', 'full'];
