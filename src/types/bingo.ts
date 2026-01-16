export type DifficultyPrefix = 'BSC' | 'ADV' | 'EXT' | 'MAS';
export type Instrument = 'D' | 'G' | 'B';
export type Difficulty = `${DifficultyPrefix}-${Instrument}` | 'NONE';

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

// 相対URLで参照
export const getImageUrl = (id: number) => `images/${("00000" + id).slice(-5)}.png`;
export const DEFAULT_IMAGE_URL = `images/select_music.png`;

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
