import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { bottleCatalog } from '@/domain/catalog';
import {
  completionDates,
  currentStreak,
  getDayKey,
  totalForDay,
} from '@/domain/hydration';
import type { BottleId, Profile, WaterEntry } from '@/domain/types';

type HydrationState = {
  profile: Profile | null;
  entries: WaterEntry[];
  crystals: number;
  ownedBottleIds: BottleId[];
  activeBottleId: BottleId;
  rewardedWeeks: string[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  completeOnboarding: (profile: Profile) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  addWater: (amountMl: number, now?: Date) => { goalJustReached: boolean; rewardEarned: boolean };
  buyBottle: (id: BottleId) => boolean;
  selectBottle: (id: BottleId) => void;
  clearAllData: () => void;
};

const initialData = {
  profile: null,
  entries: [],
  crystals: 0,
  ownedBottleIds: ['aqua'] as BottleId[],
  activeBottleId: 'aqua' as BottleId,
  rewardedWeeks: [] as string[],
};

const STORAGE_KEY = 'vodohlyob-storage-v1';
const LEGACY_STORAGE_KEY = 'vdohlyob-storage-v1';

type PersistedState = Pick<
  HydrationState,
  | 'profile'
  | 'entries'
  | 'crystals'
  | 'ownedBottleIds'
  | 'activeBottleId'
  | 'rewardedWeeks'
>;

function persistState(state: HydrationState) {
  const data: PersistedState = {
    profile: state.profile,
    entries: state.entries,
    crystals: state.crystals,
    ownedBottleIds: state.ownedBottleIds,
    activeBottleId: state.activeBottleId,
    rewardedWeeks: state.rewardedWeeks,
  };
  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, state: data }));
}

function createEntry(amountMl: number, now: Date): WaterEntry {
  return {
    id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    amountMl,
    createdAt: now.toISOString(),
    dayKey: getDayKey(now),
  };
}

export const useHydrationStore = create<HydrationState>()((set, get) => ({
      ...initialData,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      completeOnboarding: (profile) => {
        set({ profile });
        persistState(get());
      },
      updateProfile: (patch) => {
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...patch } : null,
        }));
        persistState(get());
      },
      addWater: (amountMl, now = new Date()) => {
        const state = get();
        if (!state.profile || !Number.isFinite(amountMl) || amountMl <= 0) {
          return { goalJustReached: false, rewardEarned: false };
        }

        const dayKey = getDayKey(now);
        const before = totalForDay(state.entries, dayKey);
        const nextEntries = [...state.entries, createEntry(Math.round(amountMl), now)];
        const after = totalForDay(nextEntries, dayKey);
        const goalJustReached =
          before < state.profile.dailyGoalMl && after >= state.profile.dailyGoalMl;

        const completed = completionDates(nextEntries, state.profile.dailyGoalMl);
        const streak = currentStreak(completed, dayKey);
        const rewardKey = `${dayKey}:week-${Math.floor(streak / 7)}`;
        const rewardEarned =
          goalJustReached &&
          streak > 0 &&
          streak % 7 === 0 &&
          !state.rewardedWeeks.includes(rewardKey);

        set({
          entries: nextEntries,
          crystals: state.crystals + (rewardEarned ? 1 : 0),
          rewardedWeeks: rewardEarned
            ? [...state.rewardedWeeks, rewardKey]
            : state.rewardedWeeks,
        });
        persistState(get());

        return { goalJustReached, rewardEarned };
      },
      buyBottle: (id) => {
        const state = get();
        const bottle = bottleCatalog.find((item) => item.id === id);
        if (!bottle || state.ownedBottleIds.includes(id) || state.crystals < bottle.price) {
          return false;
        }
        set({
          crystals: state.crystals - bottle.price,
          ownedBottleIds: [...state.ownedBottleIds, id],
          activeBottleId: id,
        });
        persistState(get());
        return true;
      },
      selectBottle: (id) => {
        if (get().ownedBottleIds.includes(id)) {
          set({ activeBottleId: id });
          persistState(get());
        }
      },
      clearAllData: () => {
        set({ ...initialData });
        void AsyncStorage.multiRemove([STORAGE_KEY, LEGACY_STORAGE_KEY]);
      },
    }));

void Promise.all([AsyncStorage.getItem(STORAGE_KEY), AsyncStorage.getItem(LEGACY_STORAGE_KEY)])
  .then((raw) => {
    const savedData = raw[0] ?? raw[1];
    if (!savedData) {
      useHydrationStore.setState({ hasHydrated: true });
      return;
    }
    const parsed = JSON.parse(savedData) as { version?: number; state?: Partial<PersistedState> };
    useHydrationStore.setState({
      ...initialData,
      ...parsed.state,
      hasHydrated: true,
    });
    if (!raw[0] && raw[1]) {
      void AsyncStorage.setItem(STORAGE_KEY, raw[1]);
    }
  })
  .catch(() => useHydrationStore.setState({ hasHydrated: true }));
