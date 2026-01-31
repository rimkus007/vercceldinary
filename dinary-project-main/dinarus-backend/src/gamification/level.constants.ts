// src/gamification/level.constants.ts

export const BASE_XP = 100;
export const GROWTH_RATE = 1.5;

export const getXpForLevel = (level: number): number => {
  if (level <= 1) return BASE_XP;
  return Math.floor(BASE_XP * Math.pow(level, GROWTH_RATE));
};
