import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calculateDailyGoal,
  completionDates,
  currentStreak,
  getDayKey,
  shiftDay,
  totalForDay,
  weekProgress,
} from '../src/domain/hydration';
import type { WaterEntry } from '../src/domain/types';

function entry(dayKey: string, amountMl: number, index: number): WaterEntry {
  return {
    id: String(index),
    amountMl,
    dayKey,
    createdAt: `${dayKey}T10:00:00.000Z`,
  };
}

test('daily goal is rounded to 50 ml and kept inside safe product bounds', () => {
  assert.equal(calculateDailyGoal(65, 'female', 30), 2000);
  assert.equal(calculateDailyGoal(80, 'male', 30), 2800);
  assert.equal(calculateDailyGoal(20, 'other', 30), 1200);
  assert.equal(calculateDailyGoal(200, 'male', 30), 4500);
});

test('daily total contains only entries from requested local day', () => {
  const entries = [entry('2026-07-27', 250, 1), entry('2026-07-28', 300, 2)];
  assert.equal(totalForDay(entries, '2026-07-28'), 300);
});

test('completion dates aggregate several drinks from the same day', () => {
  const entries = [
    entry('2026-07-27', 1000, 1),
    entry('2026-07-27', 1000, 2),
    entry('2026-07-28', 1900, 3),
  ];
  assert.deepEqual(completionDates(entries, 2000), ['2026-07-27']);
});

test('streak can end today or yesterday without disappearing overnight', () => {
  const completed = ['2026-07-25', '2026-07-26', '2026-07-27'];
  assert.equal(currentStreak(completed, '2026-07-28'), 3);
  assert.equal(currentStreak([...completed, '2026-07-28'], '2026-07-28'), 4);
});

test('week progress loops after every seventh completed day', () => {
  assert.equal(weekProgress(0), 0);
  assert.equal(weekProgress(1), 1);
  assert.equal(weekProgress(7), 7);
  assert.equal(weekProgress(8), 1);
});

test('day utilities respect calendar boundaries', () => {
  assert.equal(shiftDay('2026-01-01', -1), '2025-12-31');
  assert.match(getDayKey(new Date(2026, 6, 28)), /^2026-07-28$/);
});
