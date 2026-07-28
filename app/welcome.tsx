import { useEffect } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';

import { WaterBottle } from '@/components/bottle/WaterBottle';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function WelcomeScreen() {
  const { height } = useWindowDimensions();
  const opacity = useSharedValue(0);
  const translate = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(180, withSpring(1));
    translate.value = withDelay(180, withSpring(0));
  }, [opacity, translate]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translate.value }],
  }));

  return (
    <ScreenBackground>
      <View style={styles.root}>
        <View style={styles.brand}>
          <View style={styles.drop}>
            <Ionicons name="water" size={20} color={colors.white} />
          </View>
          <Text style={styles.brandText}>Водохлёб</Text>
        </View>

        <View style={[styles.visual, { height: Math.min(430, height * 0.49) }]}>
          <WaterBottle progress={0.68} palette={['#83E8F3', '#1199C2', '#DDFCFF']} size={230} />
        </View>

        <Animated.View style={[styles.content, contentStyle]}>
          <Text style={styles.title}>Вода в вашем{'\n'}ритме</Text>
          <Text style={styles.subtitle}>
            Мягко напоминаем, красиво показываем прогресс и превращаем полезную привычку в удовольствие.
          </Text>
          <PrimaryButton
            onPress={() => router.push('/onboarding')}
            icon={<Ionicons name="sparkles" size={19} color={colors.white} />}
          >
            Начать
          </PrimaryButton>
          <Text style={styles.note}>Без регистрации · Все данные на устройстве</Text>
        </Animated.View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 64,
    paddingBottom: 26,
    paddingHorizontal: spacing.lg,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  drop: {
    width: 36,
    height: 36,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: '900',
  },
  visual: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -5,
    marginBottom: -24,
  },
  content: {
    marginTop: 'auto',
  },
  title: {
    color: colors.ink,
    fontSize: 42,
    lineHeight: 46,
    letterSpacing: -1.5,
    fontWeight: '900',
    marginBottom: 15,
  },
  subtitle: {
    color: colors.inkMuted,
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 24,
    maxWidth: 430,
  },
  note: {
    color: colors.inkMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
});
