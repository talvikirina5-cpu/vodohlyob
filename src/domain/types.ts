export type Gender = 'female' | 'male' | 'other';

export type Profile = {
  name: string;
  gender: Gender;
  age: number;
  weightKg: number;
  heightCm: number;
  dailyGoalMl: number;
};

export type WaterEntry = {
  id: string;
  amountMl: number;
  createdAt: string;
  dayKey: string;
};

export type BottleId = 'aqua' | 'violet' | 'sunset' | 'forest';

export type BottleDesign = {
  id: BottleId;
  name: string;
  description: string;
  price: number;
  colors: readonly [string, string, ...string[]];
};
