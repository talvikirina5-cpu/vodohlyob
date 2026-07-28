import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '@/theme/colors';
import { useHydrationStore } from '@/store/useHydrationStore';

export default function Index() {
  const hasHydrated = useHydrationStore((state) => state.hasHydrated);
  const profile = useHydrationStore((state) => state.profile);

  if (!hasHydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <Redirect href={profile ? '/(tabs)/home' : '/welcome'} />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
