import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  getSmartphoneViewScale,
  nextSmartphoneViewScale,
  smartphoneViewGuidance,
  SmartphoneViewScaleId,
  smartphoneViewScaleOptions,
} from '../simulation/smartphoneViewScale';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type SmartphoneViewScaleControlProps = {
  value: SmartphoneViewScaleId;
  conditionCount?: number;
  parallelBranchCount?: number;
  onChange: (value: SmartphoneViewScaleId) => void;
};

export const SmartphoneViewScaleControl = memo(function SmartphoneViewScaleControl({
  value,
  conditionCount = 0,
  parallelBranchCount = 0,
  onChange,
}: SmartphoneViewScaleControlProps) {
  const selected = getSmartphoneViewScale(value);
  const guidance = smartphoneViewGuidance(conditionCount, parallelBranchCount);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Visual mobile</Text>
          <Text style={styles.title}>Zoom e enquadramento</Text>
          <Text style={styles.subtitle}>{guidance}</Text>
        </View>
        <Pressable onPress={() => onChange(nextSmartphoneViewScale(value))} style={styles.nextButton}>
          <Text style={styles.nextButtonText}>{selected.label}</Text>
        </Pressable>
      </View>

      <View style={styles.optionRow}>
        {smartphoneViewScaleOptions.map((option) => {
          const active = option.id === value;
          return (
            <Pressable key={option.id} onPress={() => onChange(option.id)} style={[styles.optionButton, active && styles.optionButtonActive]}>
              <Text style={[styles.optionTitle, active && styles.optionTitleActive]}>{option.label}</Text>
              <Text style={styles.optionMeta}>{option.blockWidth}px</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.outputBox}>
        <Text style={styles.outputTitle}>Saída/carga fixa</Text>
        <Text style={styles.outputText}>Mesmo com arraste lateral, a saída da linha deve aparecer no resumo do rung para não ficar perdida no final do Ladder.</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  nextButton: {
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: colors.cyanSoft,
  },
  nextButtonText: {
    color: colors.cyan,
    fontSize: 11,
    fontWeight: '900',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionButton: {
    flex: 1,
    minWidth: 94,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  optionButtonActive: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  optionTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
  },
  optionTitleActive: {
    color: colors.green,
  },
  optionMeta: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  outputBox: {
    borderColor: colors.amber,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.goldSoft,
  },
  outputTitle: {
    color: colors.amber,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  outputText: {
    color: colors.text,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    marginTop: 2,
  },
});
