import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { WaterBottle } from '@/components/bottle/WaterBottle';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { bottleCatalog } from '@/domain/catalog';
import { useHydrationStore } from '@/store/useHydrationStore';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';

export default function ShopScreen() {
  const crystals = useHydrationStore((state) => state.crystals);
  const owned = useHydrationStore((state) => state.ownedBottleIds);
  const active = useHydrationStore((state) => state.activeBottleId);
  const buyBottle = useHydrationStore((state) => state.buyBottle);
  const selectBottle = useHydrationStore((state) => state.selectBottle);

  function handleBottle(id: (typeof bottleCatalog)[number]['id']) {
    void Haptics.selectionAsync();
    if (owned.includes(id)) {
      selectBottle(id);
    } else {
      const bought = buyBottle(id);
      if (bought) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>КОЛЛЕКЦИЯ</Text>
            <Text style={styles.title}>Бутылки</Text>
          </View>
          <View style={styles.balance}>
            <Ionicons name="diamond" size={19} color={colors.crystal} />
            <Text style={styles.balanceText}>{crystals}</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>
          Собирайте кристаллы за серии и создавайте настроение на каждый день.
        </Text>

        <View style={styles.grid}>
          {bottleCatalog.map((bottle) => {
            const isOwned = owned.includes(bottle.id);
            const isActive = active === bottle.id;
            const canBuy = crystals >= bottle.price;
            return (
              <View key={bottle.id} style={[styles.card, isActive && styles.cardActive]}>
                {isActive ? (
                  <View style={styles.activeBadge}>
                    <Ionicons name="checkmark" size={13} color={colors.white} />
                    <Text style={styles.activeText}>Активна</Text>
                  </View>
                ) : null}
                <View style={styles.bottleVisual}>
                  <WaterBottle progress={0.62} palette={bottle.colors} size={104} />
                </View>
                <Text style={styles.bottleName}>{bottle.name}</Text>
                <Text style={styles.bottleDescription}>{bottle.description}</Text>
                <Pressable
                  disabled={!isOwned && !canBuy}
                  onPress={() => handleBottle(bottle.id)}
                  style={({ pressed }) => [
                    styles.action,
                    isActive && styles.actionActive,
                    !isOwned && canBuy && styles.actionBuy,
                    !isOwned && !canBuy && styles.actionDisabled,
                    pressed && styles.actionPressed,
                  ]}
                >
                  {!isOwned ? <Ionicons name="diamond" size={14} color={canBuy ? colors.crystal : colors.disabled} /> : null}
                  <Text
                    style={[
                      styles.actionText,
                      isActive && styles.actionTextActive,
                      !isOwned && canBuy && styles.actionTextBuy,
                    ]}
                  >
                    {isActive ? 'Выбрана' : isOwned ? 'Выбрать' : bottle.price}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>

        <View style={styles.tip}>
          <View style={styles.tipIcon}>
            <Ionicons name="sparkles" size={20} color={colors.lilac} />
          </View>
          <Text style={styles.tipText}>
            Новый кристалл начисляется за каждые семь выполненных дней подряд.
          </Text>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: Platform.OS === 'ios' ? 62 : 42,
    paddingHorizontal: spacing.lg,
    paddingBottom: 38,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: colors.primaryDark, fontSize: 11, fontWeight: '900', letterSpacing: 1.7 },
  title: { color: colors.ink, fontSize: 34, fontWeight: '900', letterSpacing: -1, marginTop: 8 },
  balance: {
    height: 44,
    minWidth: 70,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#EAE3FF',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceText: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  subtitle: { color: colors.inkMuted, fontSize: 15, lineHeight: 22, marginTop: 9, marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '48%',
    minHeight: 330,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.95)',
    padding: 14,
    overflow: 'hidden',
  },
  cardActive: { borderColor: colors.primary },
  activeBadge: {
    position: 'absolute',
    top: 12,
    right: 10,
    zIndex: 2,
    height: 25,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  activeText: { color: colors.white, fontSize: 9, fontWeight: '900' },
  bottleVisual: { height: 190, alignItems: 'center', justifyContent: 'center', marginTop: -6 },
  bottleName: { color: colors.ink, fontSize: 14, lineHeight: 18, fontWeight: '900' },
  bottleDescription: { color: colors.inkMuted, fontSize: 11, lineHeight: 15, marginTop: 4, minHeight: 31 },
  action: {
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.sky,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  actionActive: { backgroundColor: colors.primary },
  actionBuy: { backgroundColor: '#F0EBFF' },
  actionDisabled: { backgroundColor: '#F1F5F6' },
  actionText: { color: colors.primaryDark, fontSize: 12, fontWeight: '900' },
  actionTextActive: { color: colors.white },
  actionTextBuy: { color: colors.crystal },
  actionPressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.68)',
    borderRadius: radius.md,
    padding: 14,
    marginTop: 20,
  },
  tipIcon: { width: 42, height: 42, borderRadius: 15, backgroundColor: '#F0EBFF', alignItems: 'center', justifyContent: 'center' },
  tipText: { flex: 1, color: colors.inkMuted, fontSize: 12, lineHeight: 17 },
});
