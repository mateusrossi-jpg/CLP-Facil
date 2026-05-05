import { StyleSheet, Text, View, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { LadderProject, PlcState } from '../engine/projectTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type LadderDiagramProps = {
  project: LadderProject;
  state: PlcState;
  energizedRungs: Record<string, boolean>;
};

function stateLabel(value: boolean): string {
  return value ? '1' : '0';
}

export function LadderDiagram({ project, state, energizedRungs }: LadderDiagramProps) {

  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 600, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 600, useNativeDriver: false })
      ])
    ).start();
  }, []);

  function getValue(variableId: string): boolean {
    return Boolean(state[variableId]);
  }

  const glowStyle = {
    shadowOpacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.9] })
  };

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
                    <Animated.View
                      key={contact.id}
                      style={[
                        styles.contact,
                        isOn && styles.contactActive,
                        isOn && glowStyle
                      ]}
                    >
                      <Text style={styles.contactText}>{contact.label}</Text>
                      <Text style={styles.contactState}>
                        {stateLabel(isOn)}
                      </Text>
                    </Animated.View>
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
                        <Animated.View
                          key={contact.id}
                          style={[
                            styles.contact,
                            isOn && styles.contactActive,
                            isOn && glowStyle
                          ]}
                        >
                          <Text style={styles.contactText}>{contact.label}</Text>
                          <Text style={styles.contactState}>
                            {stateLabel(isOn)}
                          </Text>
                        </Animated.View>
                      );
                    })}
                  </View>
                ))}
              </View>

              <Animated.View
                style={[
                  styles.coil,
                  getValue(rung.coilVariableId) && styles.coilActive,
                  getValue(rung.coilVariableId) && glowStyle
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

const styles = StyleSheet.create({
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
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  railBoxActive: {
    borderColor: colors.cyan,
  },
  rail: {
    width: 4,
    borderRadius: 2,
    backgroundColor: colors.inactive,
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
  contact: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 96,
    marginRight: spacing.sm,
    backgroundColor: colors.background,
  },
  contactActive: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  contactText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  contactState: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: spacing.xs,
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
