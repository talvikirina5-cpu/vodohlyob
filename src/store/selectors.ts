import { bottleCatalog } from '@/domain/catalog';
import {
  completionDates,
  currentStreak,
  getDayKey,
  totalForDay,
  weekProgress,
} from '@/domain/hydration';
import type { WaterEntry } from '@/domain/types';

export function getHydrationSnapshot(entries: readonly WaterEntry[], goal: number) {
  const today = getDayKey();
  const amount = totalForDay(entries, today);
  const completed = completionDates(entries, goal);
  const streak = currentStreak(completed, today);
  return {
    today,
    amount,
    progress: goal > 0 ? Math.min(amount / goal, 1) : 0,
    streak,
    weekProgress: weekProgress(streak),
    completed,
  };
}

export function getBottle(id: string) {
  return bottleCatalog.find((bottle) => bottle.id === id) ?? bottleCatalog[0]!;
}
