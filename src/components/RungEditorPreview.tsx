import { StyleSheet, Text, View } from 'react-native';
import { LadderProject } from '../engine/projectTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type RungEditorPreviewProps = {
  project: LadderProject;
};

export function RungEditorPreview({ project }: RungEditorPreviewProps) {
  const rung = project.rungs[0];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editor por blocos</Text>
      <Text style={styles.subtitle}>Prévia da estrutura editável que será usada para montar lógicas no celular.</Text>
      <View style={styles.block}>
        <Text style={styles.blockTitle}>Linha: {rung.label}</Text>
        <Text style={styles.label}>Série</Text>
        {rung.seriesContacts.map((contact) => (
          <View key={contact.id} style={styles.item}>
            <Text style={styles.itemText}>{contact.label}</Text>
            <Text style={styles.itemType}>{contact.type}</Text>
          </View>
        ))}
        <Text style={styles.label}>Paralelo</Text>
        {rung.parallelBranches.map((branch) => (
          <View key={branch.id} style={styles.branch}>
            {branch.contacts.map((contact) => (
              <Text key={contact.id} style={styles.branchText}>{contact.label}</Text>
            ))}
          </View>
        ))}
        <Text style={styles.coil}>Bobina: {rung.coilVariableId}</Text>
      </View>
      <Text style={styles.note}>Na próxima etapa, estes blocos deixarão de ser apenas prévia e poderão ser adicionados, removidos e reorganizados pelo usuário.</Text>
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
    marginTop: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  block: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.md,
  },
  blockTitle: {
    color: colors.cyan,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  itemText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  itemType: {
    color: colors.green,
    fontSize: 12,
    fontWeight: '900',
  },
  branch: {
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    backgroundColor: colors.cyanSoft,
  },
  branchText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  coil: {
    color: colors.green,
    fontSize: 14,
    fontWeight: '900',
    marginTop: spacing.md,
  },
  note: {
    color: colors.amber,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.md,
  },
});
