import type { Gender, WaterEntry } from './types';

export const QUICK_AMOUNTS = [100, 150, 200, 250, 300, 500] as const;

export function getDayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function shiftDay(dayKey: string, amount: number): string {
  const [year, month, day] = dayKey.split('-').map(Number);
  const date = new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);
  date.setDate(date.getDate() + amount);
  return getDayKey(date);
}

export function calculateDailyGoal(
  weightKg: number,
  gender: Gender,
  age: number,
): number {
  const genderCoefficient = gender === 'male' ? 35 : gender === 'female' ? 31 : 33;
  const ageAdjustment = age >= 55 ? -2 : age <= 17 ? -1 : 0;
  const raw = weightKg * (genderCoefficient + ageAdjustment);
  return Math.round(Math.min(4500, Math.max(1200, raw)) / 50) * 50;
}

export function totalForDay(entries: readonly WaterEntry[], dayKey: string): number {
  return entries.reduce(
    (total, entry) => total + (entry.dayKey === dayKey ? entry.amountMl : 0),
    0,
  );
}

export function completionDates(
  entries: readonly WaterEntry[],
  dailyGoalMl: number,
): string[] {
  const totals = new Map<string, number>();
  for (const entry of entries) {
    totals.set(entry.dayKey, (totals.get(entry.dayKey) ?? 0) + entry.amountMl);
  }
  return [...totals.entries()]
    .filter(([, total]) => total >= dailyGoalMl)
    .map(([day]) => day)
    .sort();
}

export function currentStreak(completedDays: readonly string[], today: string): number {
  const completed = new Set(completedDays);
  let cursor = completed.has(today) ? today : shiftDay(today, -1);
  let streak = 0;
  while (completed.has(cursor)) {
    streak += 1;
    cursor = shiftDay(cursor, -1);
  }
  return streak;
}

export function weekProgress(streak: number): number {
  if (streak === 0) return 0;
  return ((streak - 1) % 7) + 1;
}

export function formatLiters(amountMl: number): string {
  if (amountMl < 1000) return `${amountMl} мл`;
  return `${(amountMl / 1000).toFixed(amountMl % 1000 === 0 ? 0 : 1)} л`;
}
