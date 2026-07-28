import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function ScreenBackground({ children }: PropsWithChildren) {
  return (
    <LinearGradient
      colors={['#F8FEFF', '#EBFAFC', '#F7F4FF']}
      locations={[0, 0.56, 1]}
      style={styles.root}
    >
      <View style={[styles.orb, styles.orbOne]} />
      <View style={[styles.orb, styles.orbTwo]} />
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.35,
  },
  orbOne: {
    width: 260,
    height: 260,
    backgroundColor: '#B8F1F7',
    top: -110,
    right: -90,
  },
  orbTwo: {
    width: 220,
    height: 220,
    backgroundColor: '#DED4FF',
    bottom: 80,
    left: -140,
  },
});
