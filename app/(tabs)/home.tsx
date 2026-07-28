import { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { AddWaterSheet } from '@/components/hydration/AddWaterSheet';
import { GoalCelebration } from '@/components/rewards/GoalCelebration';
import { WaterBottle } from '@/components/bottle/WaterBottle';
import { GlassCard } from '@/components/ui/GlassCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { formatLiters } from '@/domain/hydration';
import { getBottle, getHydrationSnapshot } from '@/store/selectors';
import { useHydrationStore } from '@/store/useHydrationStore';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';

const greetings = ['Доброе утро', 'Добрый день', 'Добрый вечер'];

function getGreeting() {
  const hour = new Date().getHours();
  return greetings[hour < 12 ? 0 : hour < 18 ? 1 : 2];
}

export default function HomeScreen() {
  const { height } = useWindowDimensions();
  const profile = useHydrationStore((state) => state.profile);
  const entries = useHydrationStore((state) => state.entries);
  const activeBottleId = useHydrationStore((state) => state.activeBottleId);
  const crystals = useHydrationStore((state) => state.crystals);
  const addWater = useHydrationStore((state) => state.addWater);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [celebration, setCelebration] = useState<{ visible: boolean; reward: boolean }>({
    visible: false,
    reward: false,
  });

  const goal = profile?.dailyGoalMl ?? 2000;
  const snapshot = useMemo(() => getHydrationSnapshot(entries, goal), [entries, goal]);
  const bottle = getBottle(activeBottleId);
  const compact = height < 760;

  function handleAdd(amount: number) {
    const result = addWater(amount);
    setSheetVisible(false);
    if (result.goalJustReached) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCelebration({ visible: true, reward: result.rewardEarned });
    }
  }

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={[styles.content, compact && styles.contentCompact]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.name}>{profile?.name ?? 'Друг'}!</Text>
          </View>
          <View style={styles.crystals}>
            <Ionicons name="diamond" size={18} color={colors.crystal} />
            <Text style={styles.crystalText}>{crystals}</Text>
          </View>
        </View>

        <View style={styles.progressHeader}>
          <View>
            <Text style={styles.amount}>{formatLiters(snapshot.amount)}</Text>
            <Text style={styles.goal}>из {formatLiters(goal)}</Text>
          </View>
          <View style={[styles.percent, snapshot.progress >= 1 && styles.percentDone]}>
            <Text style={[styles.percentText, snapshot.progress >= 1 && styles.percentTextDone]}>
              {Math.round(snapshot.progress * 100)}%
            </Text>
          </View>
        </View>

        <View style={[styles.bottleArea, compact && styles.bottleAreaCompact]}>
          <WaterBottle
            progress={snapshot.progress}
            palette={bottle.colors}
            completed={snapshot.progress >= 1}
            size={compact ? 208 : 238}
          />
          <View style={styles.motivation}>
            <Ionicons
              name={snapshot.progress >= 1 ? 'checkmark-circle' : 'sparkles'}
              size={17}
              color={snapshot.progress >= 1 ? colors.success : colors.lilac}
            />
            <Text style={styles.motivationText}>
              {snapshot.progress >= 1
                ? 'Цель выполнена — превосходно!'
                : snapshot.progress >= 0.7
                  ? 'Финиш уже совсем близко'
                  : snapshot.progress >= 0.35
                    ? 'Отличный ритм, продолжайте'
                    : 'Начнём день со стакана воды?'}
            </Text>
          </View>
        </View>

        <GlassCard style={styles.summary}>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.sky }]}>
              <Ionicons name="water-outline" size={19} color={colors.primaryDark} />
            </View>
            <View>
              <Text style={styles.summaryValue}>{Math.max(0, goal - snapshot.amount)} мл</Text>
              <Text style={styles.summaryLabel}>осталось</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: '#F0EBFF' }]}>
              <Ionicons name="flame-outline" size={19} color={colors.lilac} />
            </View>
            <View>
              <Text style={styles.summaryValue}>{snapshot.streak} дней</Text>
              <Text style={styles.summaryLabel}>серия</Text>
            </View>
          </View>
        </GlassCard>

        <PrimaryButton
          onPress={() => {
            void Haptics.selectionAsync();
            setSheetVisible(true);
          }}
          icon={<Ionicons name="add" size={24} color={colors.white} />}
          style={styles.addButton}
        >
          Выпил воду
        </PrimaryButton>

        <Pressable onPress={() => setSheetVisible(true)} style={styles.quickLink}>
          <Text style={styles.quickLinkText}>Быстро добавить 250 мл</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primaryDark} />
        </Pressable>
      </ScrollView>

      <AddWaterSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} onAdd={handleAdd} />
      <GoalCelebration
        visible={celebration.visible}
        rewardEarned={celebration.reward}
        onClose={() => setCelebration({ visible: false, reward: false })}
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: Platform.OS === 'ios' ? 62 : 42,
    paddingHorizontal: spacing.lg,
    paddingBottom: 28,
  },
  contentCompact: { paddingTop: Platform.OS === 'ios' ? 52 : 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greeting: { color: colors.inkMuted, fontSize: 14, fontWeight: '600' },
  name: { color: colors.ink, fontSize: 25, fontWeight: '900', marginTop: 2 },
  crystals: {
    minWidth: 64,
    height: 40,
    borderRadius: radius.pill,
    paddingHorizontal: 13,
    backgroundColor: 'rgba(255,255,255,0.88)',
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E1FF',
  },
  crystalText: { color: colors.ink, fontWeight: '900', fontSize: 15 },
  progressHeader: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  amount: { color: colors.ink, fontSize: 33, fontWeight: '900', letterSpacing: -1 },
  goal: { color: colors.inkMuted, fontSize: 14, textAlign: 'center', marginTop: 1 },
  percent: {
    minWidth: 58,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.sky,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentDone: { backgroundColor: '#DFF8EE' },
  percentText: { color: colors.primaryDark, fontSize: 14, fontWeight: '900' },
  percentTextDone: { color: '#229C79' },
  bottleArea: { height: 388, alignItems: 'center', justifyContent: 'center', marginVertical: -8 },
  bottleAreaCompact: { height: 330 },
  motivation: {
    position: 'absolute',
    bottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 15,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.84)',
  },
  motivationText: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  summary: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginTop: 4,
  },
  summaryItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryValue: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  summaryLabel: { color: colors.inkMuted, fontSize: 11, marginTop: 2 },
  divider: { width: 1, height: 36, backgroundColor: colors.line, marginHorizontal: 8 },
  addButton: { marginTop: 18 },
  quickLink: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    padding: 13,
  },
  quickLinkText: { color: colors.primaryDark, fontSize: 12, fontWeight: '700' },
});
