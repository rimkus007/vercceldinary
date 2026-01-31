// dinarus/src/utils/levelUtils.ts

export const BASE_XP = 100;
export const GROWTH_RATE = 1.5;

export const getXpForLevel = (level: number): number => {
  if (level <= 1) return BASE_XP;
  return Math.floor(BASE_XP * Math.pow(level, GROWTH_RATE));
};

export const getLevelTitle = (level: number): string => {
  if (level >= 100) return "Maître Dinarus";
  if (level >= 50) return "Millionnaire Virtuel";
  if (level >= 25) return "Investisseur Agile";
  if (level >= 10) return "Épargnant Avisé";
  if (level >= 5) return "Apprenti Financier";
  return "Novice du Portefeuille";
};

export const getLevelEmoji = (level: number): string => {
  if (level >= 100) return "👑";
  if (level >= 50) return "💎";
  if (level >= 25) return "🚀";
  if (level >= 10) return "📈";
  if (level >= 5) return "🌱";
  return "🔰";
};
