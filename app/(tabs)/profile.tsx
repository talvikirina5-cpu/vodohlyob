import { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { GlassCard } from '@/components/ui/GlassCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { formatLiters } from '@/domain/hydration';
import { getHydrationSnapshot } from '@/store/selectors';
import { useHydrationStore } from '@/store/useHydrationStore';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';

export default function ProfileScreen() {
  const profile = useHydrationStore((state) => state.profile);
  const entries = useHydrationStore((state) => state.entries);
  const crystals = useHydrationStore((state) => state.crystals);
  const owned = useHydrationStore((state) => state.ownedBottleIds);
  const updateProfile = useHydrationStore((state) => state.updateProfile);
  const clearAllData = useHydrationStore((state) => state.clearAllData);
  const [editing, setEditing] = useState(false);
  const [goal, setGoal] = useState(String(profile?.dailyGoalMl ?? 2000));
  const snapshot = useMemo(
    () => getHydrationSnapshot(entries, profile?.dailyGoalMl ?? 2000),
    [entries, profile?.dailyGoalMl],
  );

  function saveGoal() {
    const value = Number(goal);
    if (value >= 1000 && value <= 5000) {
      updateProfile({ dailyGoalMl: Math.round(value / 50) * 50 });
      setEditing(false);
    }
  }

  function confirmReset() {
    Alert.alert(
      'Удалить все данные?',
      'Профиль, история воды, кристаллы и покупки будут удалены с устройства.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            clearAllData();
            router.replace('/welcome');
          },
        },
      ],
    );
  }

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>ЛИЧНОЕ ПРОСТРАНСТВО</Text>
          <Text style={styles.title}>Профиль</Text>
        </View>

        <GlassCard style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile?.name.charAt(0).toUpperCase() ?? 'В'}</Text>
          </View>
          <View style={styles.profileText}>
            <Text style={styles.profileName}>{profile?.name ?? 'Пользователь'}</Text>
            <Text style={styles.profileMeta}>
              {profile?.age ?? 0} лет · {profile?.weightKg ?? 0} кг · {profile?.heightCm ?? 0} см
            </Text>
          </View>
          <Ionicons name="sparkles" size={22} color={colors.lilac} />
        </GlassCard>

        <View style={styles.stats}>
          <GlassCard style={styles.stat}>
            <View style={[styles.statIcon, { backgroundColor: '#F0EBFF' }]}>
              <Ionicons name="diamond" size={21} color={colors.crystal} />
            </View>
            <Text style={styles.statValue}>{crystals}</Text>
            <Text style={styles.statLabel}>кристаллов</Text>
          </GlassCard>
          <GlassCard style={styles.stat}>
            <View style={[styles.statIcon, { backgroundColor: colors.sky }]}>
              <Ionicons name="flame" size={21} color={colors.primaryDark} />
            </View>
            <Text style={styles.statValue}>{snapshot.streak}</Text>
            <Text style={styles.statLabel}>дней подряд</Text>
          </GlassCard>
          <GlassCard style={styles.stat}>
            <View style={[styles.statIcon, { backgroundColor: '#E6FAF2' }]}>
              <Ionicons name="flask" size={21} color="#39A888" />
            </View>
            <Text style={styles.statValue}>{owned.length}</Text>
            <Text style={styles.statLabel}>бутылки</Text>
          </GlassCard>
        </View>

        <Text style={styles.sectionTitle}>Настройки воды</Text>
        <Pressable style={styles.setting} onPress={() => setEditing(true)}>
          <View style={[styles.settingIcon, { backgroundColor: colors.sky }]}>
            <Ionicons name="water" size={21} color={colors.primaryDark} />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Дневная норма</Text>
            <Text style={styles.settingCaption}>Можно изменить в любой момент</Text>
          </View>
          <Text style={styles.settingValue}>{formatLiters(profile?.dailyGoalMl ?? 0)}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.disabled} />
        </Pressable>

        <View style={styles.setting}>
          <View style={[styles.settingIcon, { backgroundColor: '#F0EBFF' }]}>
            <Ionicons name="shield-checkmark" size={21} color={colors.crystal} />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Локальное хранение</Text>
            <Text style={styles.settingCaption}>Данные остаются на устройстве</Text>
          </View>
          <Ionicons name="checkmark-circle" size={22} color={colors.success} />
        </View>

        <Text style={styles.sectionTitle}>О приложении</Text>
        <View style={styles.about}>
          <View style={styles.logo}>
            <Ionicons name="water" size={24} color={colors.white} />
          </View>
          <View>
            <Text style={styles.aboutName}>Водохлёб</Text>
            <Text style={styles.aboutVersion}>MVP · версия 1.0.0</Text>
          </View>
        </View>

        <Pressable onPress={confirmReset} style={styles.reset}>
          <Ionicons name="trash-outline" size={18} color="#C35460" />
          <Text style={styles.resetText}>Удалить мои данные</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={editing} transparent animationType="fade" onRequestClose={() => setEditing(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setEditing(false)} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Дневная норма</Text>
            <Text style={styles.modalDescription}>Укажите значение от 1000 до 5000 мл.</Text>
            <View style={styles.goalInputWrap}>
              <TextInput
                autoFocus
                value={goal}
                onChangeText={(value) => setGoal(value.replace(/\D/g, ''))}
                keyboardType="number-pad"
                maxLength={4}
                style={styles.goalInput}
              />
              <Text style={styles.goalUnit}>мл</Text>
            </View>
            <PrimaryButton onPress={saveGoal} disabled={Number(goal) < 1000 || Number(goal) > 5000}>
              Сохранить
            </PrimaryButton>
          </View>
        </View>
      </Modal>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: Platform.OS === 'ios' ? 62 : 42,
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
  },
  header: { marginBottom: 23 },
  eyebrow: { color: colors.primaryDark, fontSize: 11, fontWeight: '900', letterSpacing: 1.7 },
  title: { color: colors.ink, fontSize: 34, fontWeight: '900', letterSpacing: -1, marginTop: 8 },
  profileCard: { minHeight: 88, padding: 15, flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontSize: 25, fontWeight: '900' },
  profileText: { flex: 1, marginLeft: 13 },
  profileName: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  profileMeta: { color: colors.inkMuted, fontSize: 12, marginTop: 4 },
  stats: { flexDirection: 'row', gap: 9, marginTop: 14 },
  stat: { flex: 1, minHeight: 132, alignItems: 'center', justifyContent: 'center', padding: 9 },
  statIcon: { width: 40, height: 40, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { color: colors.ink, fontSize: 22, fontWeight: '900' },
  statLabel: { color: colors.inkMuted, fontSize: 9, textAlign: 'center', marginTop: 3 },
  sectionTitle: { color: colors.ink, fontSize: 19, fontWeight: '900', marginTop: 29, marginBottom: 12 },
  setting: {
    minHeight: 72,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: radius.md,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  settingIcon: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  settingText: { flex: 1, marginLeft: 12 },
  settingTitle: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  settingCaption: { color: colors.inkMuted, fontSize: 10, marginTop: 3 },
  settingValue: { color: colors.primaryDark, fontSize: 13, fontWeight: '900', marginRight: 3 },
  about: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderRadius: radius.md,
    padding: 14,
  },
  logo: { width: 46, height: 46, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  aboutName: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  aboutVersion: { color: colors.inkMuted, fontSize: 11, marginTop: 3 },
  reset: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, padding: 18, marginTop: 20 },
  resetText: { color: '#C35460', fontSize: 13, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,43,57,0.4)', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: '#F8FEFF', borderRadius: 30, padding: 24 },
  modalTitle: { color: colors.ink, fontSize: 25, fontWeight: '900' },
  modalDescription: { color: colors.inkMuted, fontSize: 14, marginTop: 7 },
  goalInputWrap: {
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.sky,
    marginVertical: 22,
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalInput: { flex: 1, height: '100%', paddingHorizontal: 20, color: colors.ink, fontSize: 28, fontWeight: '900' },
  goalUnit: { color: colors.inkMuted, fontSize: 16, fontWeight: '700', paddingRight: 20 },
});
