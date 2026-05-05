import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { GuidedPractice } from '../../education/clpGuidedPractice';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { PremiumBadge, PremiumSection } from './index';

type PremiumGuidedPracticeCardProps = {
  practice: GuidedPractice;
};

export const PremiumGuidedPracticeCard = memo(function PremiumGuidedPracticeCard({ practice }: PremiumGuidedPracticeCardProps) {
  return (
    <PremiumSection title="Prática guiada" subtitle="Aplique a lição em uma simulação real" tone="purple">
      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>Objetivo</Text>
          <Text style={styles.title}>{practice.title}</Text>
          <Text style={styles.description}>{practice.objective}</Text>
        </View>
        {practice.projectId ? <PremiumBadge label={practice.projectId} tone="purple" /> : null}
      </View>

      <View style={styles.stepList}>
        {practice.steps.map((step, index) => (
          <View key={step.id} style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.stepCopy}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepInstruction}>{step.instruction}</Text>
              <View style={styles.observationBox}>
                <Text style={styles.observationLabel}>O que observar</Text>
                <Text style={styles.observationText}>{step.expectedObservation}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </PremiumSection>
  );
});

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderColor: colors.purple,
    borderWidth: 1,
    borderRadius: 20,
    padding: spacing.md,
    backgroundColor: colors.purpleSoft,
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: colors.purple,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '900',
    marginTop: 3,
  },
  description: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  stepList: {
    gap: spacing.sm,
  },
  stepCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 999,
    borderColor: colors.purple,
    borderWidth: 1,
    backgroundColor: colors.purpleSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: colors.purple,
    fontSize: 12,
    fontWeight: '900',
  },
  stepCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  stepTitle: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
  },
  stepInstruction: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  observationBox: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  observationLabel: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  observationText: {
    color: colors.text,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
});
