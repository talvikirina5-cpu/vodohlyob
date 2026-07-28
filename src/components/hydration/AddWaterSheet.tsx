import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { QUICK_AMOUNTS } from '@/domain/hydration';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

type Props = {
  visible: boolean;
  onClose: () => void;
  onAdd: (amount: number) => void;
};

export function AddWaterSheet({ visible, onClose, onAdd }: Props) {
  const [selected, setSelected] = useState<number>(250);
  const [custom, setCustom] = useState('');

  useEffect(() => {
    if (visible) {
      setSelected(250);
      setCustom('');
    }
  }, [visible]);

  const customAmount = Number(custom.replace(',', '.'));
  const amount = custom.length ? customAmount : selected;
  const isValid = Number.isFinite(amount) && amount >= 20 && amount <= 3000;

  function submit() {
    if (!isValid) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAdd(Math.round(amount));
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>НОВАЯ ЗАПИСЬ</Text>
              <Text style={styles.title}>Сколько выпили?</Text>
            </View>
            <Pressable accessibilityLabel="Закрыть" onPress={onClose} style={styles.close}>
              <Ionicons name="close" size={23} color={colors.ink} />
            </Pressable>
          </View>

          <View style={styles.options}>
            {QUICK_AMOUNTS.map((value) => {
              const active = !custom.length && selected === value;
              return (
                <Pressable
                  key={value}
                  onPress={() => {
                    setCustom('');
                    setSelected(value);
                  }}
                  style={[styles.option, active && styles.optionActive]}
                >
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>
                    {value} мл
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.inputWrap}>
            <TextInput
              accessibilityLabel="Свой объём воды"
              value={custom}
              onChangeText={(value) => setCustom(value.replace(/[^0-9.,]/g, ''))}
              placeholder="Свой объём"
              placeholderTextColor={colors.inkMuted}
              keyboardType="decimal-pad"
              maxLength={4}
              style={styles.input}
            />
            <Text style={styles.unit}>мл</Text>
          </View>
          {custom.length > 0 && !isValid ? (
            <Text style={styles.error}>Введите объём от 20 до 3000 мл</Text>
          ) : null}

          <PrimaryButton onPress={submit} disabled={!isValid} icon={<Ionicons name="water" size={20} color="#fff" />}>
            Добавить {isValid ? `${Math.round(amount)} мл` : ''}
          </PrimaryButton>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15,43,57,0.32)',
  },
  sheet: {
    backgroundColor: '#F8FEFF',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: spacing.lg,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 38 : 24,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D4E4E8',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 1.8,
    color: colors.primaryDark,
    fontWeight: '800',
    marginBottom: 5,
  },
  title: {
    fontSize: 27,
    color: colors.ink,
    fontWeight: '800',
  },
  close: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: spacing.md,
  },
  option: {
    width: '31%',
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionActive: {
    backgroundColor: colors.sky,
    borderColor: colors.primary,
  },
  optionText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  optionTextActive: {
    color: colors.primaryDark,
  },
  inputWrap: {
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 18,
    color: colors.ink,
    fontSize: 17,
    fontWeight: '700',
  },
  unit: {
    color: colors.inkMuted,
    fontSize: 15,
    fontWeight: '700',
    paddingRight: 18,
  },
  error: {
    color: '#D75D68',
    fontSize: 13,
    marginTop: -8,
    marginBottom: 12,
  },
});
