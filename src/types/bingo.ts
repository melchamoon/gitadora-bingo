export type DifficultyPrefix = 'BSC' | 'ADV' | 'EXT' | 'MAS';
export type Instrument = 'D' | 'G' | 'B';
export type Difficulty = `${DifficultyPrefix}-${Instrument}` | 'NONE';
export type MusicLevels = Partial<Record<Exclude<Difficulty, 'NONE'>, string>>;

export interface MusicBase {
  id: number;
  title: string;
  artist: string;
  version: string;
  levels?: MusicLevels;
  imageUrl?: string;
}

export interface Music {
  id: number;
  title: string;
  artist: string;
  version: string;
  difficulty: Difficulty;
  level: string;
  imageUrl?: string;
}

export type BingoSize = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

// BASE_URLを考慮したURLを取得
const BASE_URL = import.meta.env.BASE_URL;
export const getImageUrl = (id: number) => `${BASE_URL}images/${("00000" + id).slice(-5)}.png`;
export const DEFAULT_IMAGE_URL = `${BASE_URL}images/select_music.png`;

export function getDifficultyColor(difficulty: string): string {
  if (difficulty === "NONE") return "transparent";
  if (difficulty.includes("BSC")) return "#38bdf8"; // sky-400
  if (difficulty.includes("ADV")) return "#facc15"; // yellow-400
  if (difficulty.includes("EXT")) return "#ef4444"; // red-500
  if (difficulty.includes("MAS")) return "#a855f7"; // purple-500
  return "#000000";
}

export function getDifficultyTextColor(difficulty: string): string {
  return "#ffffff";
}
