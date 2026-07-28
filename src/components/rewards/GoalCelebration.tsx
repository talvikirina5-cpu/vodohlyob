import { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';

import { colors } from '@/theme/colors';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

type Props = {
  visible: boolean;
  rewardEarned: boolean;
  onClose: () => void;
};

const particles = [
  { x: -102, y: -95, color: '#7CDBEC' },
  { x: 103, y: -72, color: '#B69CFF' },
  { x: -80, y: 74, color: '#73D7B3' },
  { x: 96, y: 86, color: '#FFAE9E' },
  { x: -122, y: 8, color: '#FFD373' },
  { x: 125, y: 16, color: '#7EDFEA' },
];

export function GoalCelebration({ visible, rewardEarned, onClose }: Props) {
  const scale = useSharedValue(0.7);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = 0.7;
      opacity.value = 0;
      scale.value = withDelay(80, withSpring(1, { damping: 12, stiffness: 160 }));
      opacity.value = withDelay(40, withSpring(1));
    }
  }, [opacity, scale, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[styles.card, animatedStyle]}>
          <View style={styles.burst}>
            {particles.map((particle, index) => (
              <View
                key={index}
                style={[
                  styles.particle,
                  {
                    backgroundColor: particle.color,
                    transform: [{ translateX: particle.x }, { translateY: particle.y }, { rotate: `${index * 24}deg` }],
                  },
                ]}
              />
            ))}
            <View style={styles.iconCircle}>
              <Ionicons name={rewardEarned ? 'diamond' : 'sparkles'} size={50} color={colors.white} />
            </View>
          </View>
          <Text style={styles.title}>{rewardEarned ? 'Неделя вдохновения!' : 'Дневная цель!'}</Text>
          <Text style={styles.description}>
            {rewardEarned
              ? 'Семь дней подряд — великолепно. Новый кристалл уже в вашем профиле.'
              : 'Вы выполнили норму воды на сегодня. Тело точно скажет спасибо.'}
          </Text>
          <PrimaryButton onPress={onClose}>Продолжить</PrimaryButton>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17,46,61,0.46)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 26,
  },
  card: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: '#F8FEFF',
    borderRadius: 34,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#17394B',
    shadowOpacity: 0.24,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 18 },
  },
  burst: {
    width: 230,
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: colors.lilac,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.crystal,
    shadowOpacity: 0.38,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 12 },
  },
  particle: {
    width: 12,
    height: 24,
    borderRadius: 6,
    position: 'absolute',
  },
  title: {
    fontSize: 29,
    lineHeight: 35,
    color: colors.ink,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    color: colors.inkMuted,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 25,
  },
});
