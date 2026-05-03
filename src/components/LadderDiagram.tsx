import { StyleSheet, Text, View } from 'react-native';
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
  const rung = project.rungs[0];
  const active = Boolean(energizedRungs[rung.id]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Diagrama Ladder didático</Text>
      <View style={[styles.railBox, active && styles.railBoxActive]}>
        <View style={styles.rail} />
        <View style={styles.rungContent}>
          <Text style={styles.rungLabel}>{rung.label}</Text>
          <View style={styles.seriesRow}>
            {rung.seriesContacts.map((contact) => (
              <View key={contact.id} style={[styles.contact, state[contact.variableId] && styles.contactActive]}>
                <Text style={styles.contactText}>{contact.label}</Text>
                <Text style={styles.contactState}>{stateLabel(Boolean(state[contact.variableId]))}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.branchTitle}>Ramo paralelo de partida/selo</Text>
          <View style={styles.parallelBox}>
            {rung.parallelBranches.map((branch) => (
              <View key={branch.id} style={styles.branchRow}>
                {branch.contacts.map((contact) => (
                  <View key={contact.id} style={[styles.contact, state[contact.variableId] && styles.contactActive]}>
                    <Text style={styles.contactText}>{contact.label}</Text>
                    <Text style={styles.contactState}>{stateLabel(Boolean(state[contact.variableId]))}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
          <View style={[styles.coil, state[rung.coilVariableId] && styles.coilActive]}>
            <Text style={styles.coilText}>( {rung.coilVariableId} / K1 )</Text>
          </View>
        </View>
        <View style={styles.rail} />
      </View>
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
    backgroundColor: '#143822',
  },
  coilText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
});
