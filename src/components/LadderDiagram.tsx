import { StyleSheet, Text, View, Animated } from 'react-native';
import { useEffect, useMemo, useRef } from 'react';
import { LadderProject, PlcState } from '../engine/projectTypes';
import { PremiumColorTokens } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { useAppTheme } from '../theme/theme';

type LadderDiagramProps = {
  project: LadderProject;
  state: PlcState;
  energizedRungs: Record<string, boolean>;
};

function stateLabel(value: boolean): string {
  return value ? '1' : '0';
}

function LadderContact({ label, isOn, colors }: { label: string; isOn: boolean; colors: PremiumColorTokens }) {
  const activeAnim = useRef(new Animated.Value(isOn ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(activeAnim, {
      toValue: isOn ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [activeAnim, isOn]);

  const animatedStyle = {
    borderColor: activeAnim.interpolate({ inputRange: [0, 1], outputRange: [colors.border, colors.primary] }),
    backgroundColor: activeAnim.interpolate({ inputRange: [0, 1], outputRange: [colors.background, colors.primarySoft] }),
  };

  return (
    <Animated.View style={[contactStyles.contact, animatedStyle]}>
      <Text style={[contactStyles.contactText, { color: colors.text }]}>{label}</Text>
      <Text style={[contactStyles.contactState, { color: colors.textMuted }]}>{stateLabel(isOn)}</Text>
    </Animated.View>
  );
}

export function LadderDiagram({ project, state, energizedRungs }: LadderDiagramProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  function getValue(variableId: string): boolean {
    return Boolean(state[variableId]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Diagrama Ladder didático</Text>

      {project.rungs.map((rung) => {
        const active = Boolean(energizedRungs[rung.id]);

        return (
          <View key={rung.id} style={[styles.railBox, active && styles.railBoxActive]}>
            <View style={styles.rail} />

            <View style={styles.rungContent}>
              <Text style={styles.rungLabel}>{rung.label}</Text>

              <View style={styles.seriesRow}>
                {rung.seriesContacts.map((contact) => {
                  const isOn = getValue(contact.variableId);

                  return (
                    <LadderContact key={contact.id} label={contact.label ?? contact.variableId} isOn={isOn} colors={colors} />
                  );
                })}
              </View>

              <Text style={styles.branchTitle}>Ramo paralelo de partida/selo</Text>

              <View style={styles.parallelBox}>
                {rung.parallelBranches.map((branch) => (
                  <View key={branch.id} style={styles.branchRow}>
                    {branch.contacts.map((contact) => {
                      const isOn = getValue(contact.variableId);

                      return (
                        <LadderContact key={contact.id} label={contact.label ?? contact.variableId} isOn={isOn} colors={colors} />
                      );
                    })}
                  </View>
                ))}
              </View>

              <Animated.View
                style={[
                  styles.coil,
                  getValue(rung.coilVariableId) && styles.coilActive
                ]}
              >
                <Text style={styles.coilText}>
                  ( {rung.coilVariableId} / K1 )
                </Text>
              </Animated.View>
            </View>

            <View style={styles.rail} />
          </View>
        );
      })}
    </View>
  );
}

const contactStyles = StyleSheet.create({
  contact: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 96,
    marginRight: spacing.sm,
  },
  contactText: {
    fontSize: 12,
    fontWeight: '800',
  },
  contactState: {
    fontSize: 11,
    marginTop: spacing.xs,
  },
});

const createStyles = (colors: PremiumColorTokens) => StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: spacing.md,
  },
  railBox: {
    flexDirection: 'row',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  railBoxActive: {
    borderColor: colors.primary,
  },
  rail: {
    width: 4,
    borderRadius: 2,
    backgroundColor: colors.cyanLine,
  },
  rungContent: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  rungLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  seriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  branchTitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  parallelBox: {
    borderLeftColor: colors.border,
    borderLeftWidth: 2,
    paddingLeft: spacing.sm,
    gap: spacing.sm,
  },
  branchRow: {
    flexDirection: 'row',
  },
  coil: {
    alignSelf: 'flex-start',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  coilActive: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  coilText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
});
