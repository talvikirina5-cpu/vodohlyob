import { useMemo } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { GlassCard } from '@/components/ui/GlassCard';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { getHydrationSnapshot } from '@/store/selectors';
import { useHydrationStore } from '@/store/useHydrationStore';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export default function ChallengeScreen() {
  const profile = useHydrationStore((state) => state.profile);
  const entries = useHydrationStore((state) => state.entries);
  const crystals = useHydrationStore((state) => state.crystals);
  const snapshot = useMemo(
    () => getHydrationSnapshot(entries, profile?.dailyGoalMl ?? 2000),
    [entries, profile?.dailyGoalMl],
  );
  const progress = snapshot.weekProgress;

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>ВАША СЕРИЯ</Text>
        <Text style={styles.title}>7 дней с Водохлёбом</Text>
        <Text style={styles.subtitle}>
          Выполняйте дневную норму семь дней подряд и получайте кристаллы.
        </Text>

        <LinearGradient colors={['#38C4DB', '#1596C0', '#8874E8']} style={styles.hero}>
          <View style={styles.heroGlow} />
          <View style={styles.heroTop}>
            <View style={styles.flame}>
              <Ionicons name="flame" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.reward}>
              <Ionicons name="diamond" size={17} color="#FFFFFF" />
              <Text style={styles.rewardText}>+1</Text>
            </View>
          </View>
          <Text style={styles.heroValue}>{snapshot.streak}</Text>
          <Text style={styles.heroLabel}>дней подряд</Text>
          <Text style={styles.heroHint}>
            {progress === 0 ? 'Выполните норму сегодня, чтобы начать' : `До награды осталось ${7 - progress} дн.`}
          </Text>
        </LinearGradient>

        <GlassCard style={styles.weekCard}>
          <View style={styles.weekHeader}>
            <Text style={styles.weekTitle}>Текущая неделя</Text>
            <Text style={styles.weekCounter}>{progress}/7</Text>
          </View>
          <View style={styles.days}>
            {weekDays.map((day, index) => {
              const completed = index < progress;
              const current = index === progress && progress < 7;
              return (
                <View key={day} style={styles.day}>
                  <View
                    style={[
                      styles.dayCircle,
                      completed && styles.dayCompleted,
                      current && styles.dayCurrent,
                    ]}
                  >
                    <Ionicons
                      name={completed ? 'checkmark' : 'water-outline'}
                      size={completed ? 18 : 15}
                      color={completed ? colors.white : current ? colors.primaryDark : colors.disabled}
                    />
                  </View>
                  <Text style={[styles.dayLabel, completed && styles.dayLabelCompleted]}>{day}</Text>
                </View>
              );
            })}
          </View>
        </GlassCard>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Как это работает</Text>
        </View>
        {[
          ['water', 'Выполняйте норму', 'Каждый день заполняйте бутылку до 100%.', colors.sky, colors.primaryDark],
          ['flame', 'Не прерывайте серию', 'Пропущенный день начинает отсчёт заново.', '#FFF0E9', '#E8855B'],
          ['diamond', 'Получайте кристалл', 'Тратьте награду на новые дизайны бутылок.', '#F0EBFF', colors.crystal],
        ].map(([icon, title, text, background, color]) => (
          <GlassCard key={title} style={styles.rule}>
            <View style={[styles.ruleIcon, { backgroundColor: background }]}>
              <Ionicons name={icon as 'water'} size={22} color={color} />
            </View>
            <View style={styles.ruleText}>
              <Text style={styles.ruleTitle}>{title}</Text>
              <Text style={styles.ruleDescription}>{text}</Text>
            </View>
          </GlassCard>
        ))}

        <View style={styles.balance}>
          <Ionicons name="diamond" size={20} color={colors.crystal} />
          <Text style={styles.balanceText}>Сейчас у вас {crystals} кристаллов</Text>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: Platform.OS === 'ios' ? 62 : 42,
    paddingHorizontal: spacing.lg,
    paddingBottom: 36,
  },
  eyebrow: { color: colors.primaryDark, fontSize: 11, fontWeight: '900', letterSpacing: 1.7 },
  title: { color: colors.ink, fontSize: 34, fontWeight: '900', letterSpacing: -1, marginTop: 8 },
  subtitle: { color: colors.inkMuted, fontSize: 15, lineHeight: 22, marginTop: 8, marginBottom: 24 },
  hero: {
    height: 252,
    borderRadius: 32,
    padding: 24,
    overflow: 'hidden',
    shadowColor: '#477BC0',
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 13 },
  },
  heroGlow: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(255,255,255,0.13)',
    right: -40,
    top: -55,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between' },
  flame: {
    width: 58,
    height: 58,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reward: {
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 14,
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
  },
  rewardText: { color: colors.white, fontSize: 14, fontWeight: '900' },
  heroValue: { color: colors.white, fontSize: 68, fontWeight: '900', lineHeight: 72, marginTop: 12 },
  heroLabel: { color: colors.white, fontSize: 18, fontWeight: '800' },
  heroHint: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 8 },
  weekCard: { padding: 20, marginTop: 18 },
  weekHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  weekTitle: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  weekCounter: { color: colors.primaryDark, fontSize: 14, fontWeight: '900' },
  days: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  day: { alignItems: 'center', gap: 7 },
  dayCircle: {
    width: 37,
    height: 37,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F7F8',
    borderWidth: 1,
    borderColor: colors.line,
  },
  dayCompleted: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayCurrent: { backgroundColor: colors.sky, borderColor: colors.primary },
  dayLabel: { color: colors.inkMuted, fontSize: 10, fontWeight: '700' },
  dayLabelCompleted: { color: colors.primaryDark },
  sectionHeader: { marginTop: 29, marginBottom: 13 },
  sectionTitle: { color: colors.ink, fontSize: 20, fontWeight: '900' },
  rule: { padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  ruleIcon: { width: 48, height: 48, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  ruleText: { flex: 1, marginLeft: 13 },
  ruleTitle: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  ruleDescription: { color: colors.inkMuted, fontSize: 12, lineHeight: 17, marginTop: 3 },
  balance: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  balanceText: { color: colors.inkMuted, fontSize: 13, fontWeight: '700' },
});
