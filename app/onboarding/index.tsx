import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

import { calculateDailyGoal, formatLiters } from '@/domain/hydration';
import type { Gender, Profile } from '@/domain/types';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { useHydrationStore } from '@/store/useHydrationStore';

type FormData = {
  name: string;
  gender: Gender | null;
  age: string;
  weight: string;
  height: string;
};

const steps = [
  { key: 'name', title: 'Как вас зовут?', subtitle: 'Будем обращаться по имени' },
  { key: 'gender', title: 'Расскажите о себе', subtitle: 'Это поможет точнее рассчитать норму' },
  { key: 'age', title: 'Сколько вам лет?', subtitle: 'Возраст влияет на потребность в воде' },
  { key: 'body', title: 'Параметры тела', subtitle: 'Остался всего один шаг' },
  { key: 'result', title: 'Ваша дневная норма', subtitle: 'Персональный ориентир на каждый день' },
] as const;

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({
    name: '',
    gender: null,
    age: '',
    weight: '',
    height: '',
  });
  const completeOnboarding = useHydrationStore((state) => state.completeOnboarding);
  const current = steps[step]!;

  const age = Number(form.age);
  const weight = Number(form.weight.replace(',', '.'));
  const height = Number(form.height);
  const goal = useMemo(
    () => (form.gender && weight > 0 && age > 0 ? calculateDailyGoal(weight, form.gender, age) : 0),
    [age, form.gender, weight],
  );

  const valid =
    current.key === 'name'
      ? form.name.trim().length >= 2
      : current.key === 'gender'
        ? form.gender !== null
        : current.key === 'age'
          ? age >= 12 && age <= 100
          : current.key === 'body'
            ? weight >= 30 && weight <= 300 && height >= 120 && height <= 230
            : true;

  function next() {
    if (!valid) return;
    void Haptics.selectionAsync();
    if (step < steps.length - 1) {
      setStep((value) => value + 1);
      return;
    }

    const profile: Profile = {
      name: form.name.trim(),
      gender: form.gender!,
      age,
      weightKg: weight,
      heightCm: height,
      dailyGoalMl: goal,
    };
    completeOnboarding(profile);
    router.replace('/(tabs)/home');
  }

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.root}
      >
        <View style={styles.top}>
          <Pressable
            accessibilityLabel="Назад"
            onPress={() => (step === 0 ? router.back() : setStep((value) => value - 1))}
            style={styles.back}
          >
            <Ionicons name="chevron-back" size={24} color={colors.ink} />
          </Pressable>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${((step + 1) / steps.length) * 100}%` }]} />
          </View>
          <Text style={styles.counter}>{step + 1}/{steps.length}</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.eyebrow}>НАСТРОЙКА ПРОФИЛЯ</Text>
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.subtitle}>{current.subtitle}</Text>

          <View style={styles.formArea}>
            {current.key === 'name' ? (
              <TextInput
                autoFocus
                value={form.name}
                onChangeText={(name) => setForm((value) => ({ ...value, name }))}
                placeholder="Ваше имя"
                placeholderTextColor={colors.inkMuted}
                maxLength={30}
                returnKeyType="next"
                onSubmitEditing={next}
                style={styles.largeInput}
              />
            ) : null}

            {current.key === 'gender' ? (
              <View style={styles.genderList}>
                {([
                  ['female', 'Женский', 'female'],
                  ['male', 'Мужской', 'male'],
                  ['other', 'Не указывать', 'person'],
                ] as const).map(([value, label, icon]) => {
                  const active = form.gender === value;
                  return (
                    <Pressable
                      key={value}
                      onPress={() => setForm((data) => ({ ...data, gender: value }))}
                      style={[styles.genderCard, active && styles.genderCardActive]}
                    >
                      <View style={[styles.genderIcon, active && styles.genderIconActive]}>
                        <Ionicons name={icon} size={25} color={active ? colors.white : colors.primaryDark} />
                      </View>
                      <Text style={[styles.genderLabel, active && styles.genderLabelActive]}>{label}</Text>
                      <Ionicons
                        name={active ? 'checkmark-circle' : 'ellipse-outline'}
                        size={24}
                        color={active ? colors.primary : colors.disabled}
                      />
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            {current.key === 'age' ? (
              <View>
                <View style={styles.metricInput}>
                  <TextInput
                    autoFocus
                    value={form.age}
                    onChangeText={(value) =>
                      setForm((data) => ({ ...data, age: value.replace(/\D/g, '') }))
                    }
                    placeholder="28"
                    placeholderTextColor="#B5C8CE"
                    keyboardType="number-pad"
                    maxLength={3}
                    style={styles.metricValue}
                  />
                  <Text style={styles.metricUnit}>лет</Text>
                </View>
                {form.age.length > 0 && !valid ? (
                  <Text style={styles.error}>Укажите возраст от 12 до 100 лет</Text>
                ) : null}
              </View>
            ) : null}

            {current.key === 'body' ? (
              <View style={styles.bodyRow}>
                <View style={styles.bodyField}>
                  <Ionicons name="scale-outline" size={23} color={colors.primaryDark} />
                  <Text style={styles.bodyLabel}>Вес</Text>
                  <View style={styles.bodyInputRow}>
                    <TextInput
                      autoFocus
                      value={form.weight}
                      onChangeText={(value) =>
                        setForm((data) => ({ ...data, weight: value.replace(/[^0-9.,]/g, '') }))
                      }
                      placeholder="65"
                      placeholderTextColor="#B5C8CE"
                      keyboardType="decimal-pad"
                      maxLength={5}
                      style={styles.bodyInput}
                    />
                    <Text style={styles.bodyUnit}>кг</Text>
                  </View>
                </View>
                <View style={styles.bodyField}>
                  <Ionicons name="resize-outline" size={23} color={colors.lilac} />
                  <Text style={styles.bodyLabel}>Рост</Text>
                  <View style={styles.bodyInputRow}>
                    <TextInput
                      value={form.height}
                      onChangeText={(value) =>
                        setForm((data) => ({ ...data, height: value.replace(/\D/g, '') }))
                      }
                      placeholder="170"
                      placeholderTextColor="#B5C8CE"
                      keyboardType="number-pad"
                      maxLength={3}
                      style={styles.bodyInput}
                    />
                    <Text style={styles.bodyUnit}>см</Text>
                  </View>
                </View>
              </View>
            ) : null}

            {current.key === 'result' ? (
              <View style={styles.resultCard}>
                <View style={styles.resultDrop}>
                  <Ionicons name="water" size={38} color={colors.white} />
                </View>
                <Text style={styles.resultValue}>{formatLiters(goal)}</Text>
                <Text style={styles.resultCaption}>воды в день</Text>
                <View style={styles.resultLine} />
                <Text style={styles.resultDetails}>
                  Рассчитано по весу, возрасту и выбранному профилю. Норму можно изменить позже.
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton onPress={next} disabled={!valid}>
            {current.key === 'result' ? 'Перейти в приложение' : 'Продолжить'}
          </PrimaryButton>
        </View>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: Platform.OS === 'ios' ? 58 : 38 },
  top: {
    height: 48,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  back: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DDECEF',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  counter: { color: colors.inkMuted, fontSize: 12, fontWeight: '800', width: 28 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: 48,
    paddingBottom: 20,
  },
  eyebrow: {
    color: colors.primaryDark,
    fontWeight: '900',
    letterSpacing: 1.7,
    fontSize: 11,
    marginBottom: 11,
  },
  title: {
    color: colors.ink,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
    letterSpacing: -0.8,
    marginBottom: 9,
  },
  subtitle: { color: colors.inkMuted, fontSize: 16, lineHeight: 23 },
  formArea: { flex: 1, justifyContent: 'center', minHeight: 350, paddingVertical: 36 },
  largeInput: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    height: 76,
    borderWidth: 2,
    borderColor: colors.sky,
    paddingHorizontal: 24,
    fontSize: 24,
    color: colors.ink,
    fontWeight: '800',
    shadowColor: '#478B9A',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  genderList: { gap: 12 },
  genderCard: {
    minHeight: 76,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  genderCardActive: { borderColor: colors.primary, backgroundColor: '#EDFCFE' },
  genderIcon: {
    width: 48,
    height: 48,
    borderRadius: 17,
    backgroundColor: colors.sky,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderIconActive: { backgroundColor: colors.primary },
  genderLabel: { flex: 1, color: colors.ink, fontWeight: '800', fontSize: 17 },
  genderLabelActive: { color: colors.primaryDark },
  metricInput: {
    height: 130,
    borderRadius: 32,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.sky,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  metricValue: {
    minWidth: 100,
    textAlign: 'center',
    color: colors.ink,
    fontSize: 58,
    fontWeight: '900',
  },
  metricUnit: { color: colors.inkMuted, fontSize: 22, fontWeight: '700' },
  error: { color: '#CF5965', fontSize: 13, textAlign: 'center', marginTop: 12 },
  bodyRow: { flexDirection: 'row', gap: 12 },
  bodyField: {
    flex: 1,
    minHeight: 190,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.line,
    padding: 18,
  },
  bodyLabel: { color: colors.inkMuted, fontSize: 14, fontWeight: '700', marginTop: 20 },
  bodyInputRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 8 },
  bodyInput: { flex: 1, color: colors.ink, fontSize: 33, fontWeight: '900', padding: 0 },
  bodyUnit: { color: colors.inkMuted, fontSize: 15, fontWeight: '700' },
  resultCard: {
    borderRadius: 34,
    backgroundColor: colors.white,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.sky,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.12,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 14 },
  },
  resultDrop: {
    width: 76,
    height: 76,
    borderRadius: 27,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  resultValue: { color: colors.ink, fontSize: 48, fontWeight: '900', letterSpacing: -1.5 },
  resultCaption: { color: colors.primaryDark, fontSize: 17, fontWeight: '800', marginTop: 2 },
  resultLine: { height: 1, width: '100%', backgroundColor: colors.line, marginVertical: 22 },
  resultDetails: { color: colors.inkMuted, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: Platform.OS === 'ios' ? 34 : 20 },
});
