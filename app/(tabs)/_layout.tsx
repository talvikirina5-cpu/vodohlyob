import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet } from 'react-native';

import { colors } from '@/theme/colors';

const tabIcons = {
  home: ['water', 'water-outline'],
  challenge: ['flame', 'flame-outline'],
  shop: ['bag-handle', 'bag-handle-outline'],
  profile: ['person', 'person-outline'],
} as const;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: '#8BA0AA',
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.bar,
        tabBarIcon: ({ focused, color }) => {
          const icon = tabIcons[route.name as keyof typeof tabIcons] ?? tabIcons.home;
          return <Ionicons name={focused ? icon[0] : icon[1]} size={23} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="home" options={{ title: 'Сегодня' }} />
      <Tabs.Screen name="challenge" options={{ title: 'Челлендж' }} />
      <Tabs.Screen name="shop" options={{ title: 'Бутылки' }} />
      <Tabs.Screen name="profile" options={{ title: 'Профиль' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    backgroundColor: 'rgba(250,254,255,0.97)',
    borderTopColor: 'rgba(22,54,74,0.08)',
  },
  label: { fontSize: 11, fontWeight: '700' },
});
