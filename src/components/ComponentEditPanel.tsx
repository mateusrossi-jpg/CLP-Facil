import { StyleSheet, Text, View } from 'react-native';
import { SimulatorComponent } from '../data/componentLibrary';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type ComponentEditPanelProps = {
  component: SimulatorComponent | null;
  proLocked?: boolean;
};

export function ComponentEditPanel({ component, proLocked }: ComponentEditPanelProps) {
  if (!component) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Painel de edição</Text>
        <Text style={styles.text}>Toque em um componente da biblioteca para visualizar os parâmetros que poderão ser editados.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, component.isPro && styles.proContainer]}>
      <View style={styles.header}>
        <Text style={styles.title}>{component.name}</Text>
        <Text style={[styles.badge, component.isPro ? styles.proBadge : styles.freeBadge]}>{component.isPro ? 'Pro' : 'Livre'}</Text>
      </View>
      <Text style={styles.text}>{component.description}</Text>
      {proLocked ? (
        <Text style={styles.locked}>Este componente pode ser estudado gratuitamente; projetos próprios e exportação entram na área avançada do Easy-CLP.</Text>
      ) : null}
      <Text style={styles.sectionTitle}>Campos de edição</Text>
      {component.editFields.map((field) => (
        <View key={field.id} style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>{field.label}</Text>
          <Text style={styles.fieldType}>{field.type === 'select' ? field.options?.join(' / ') : field.type}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  proContainer: {
    borderColor: colors.amber,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  badge: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  freeBadge: {
    color: colors.green,
  },
  proBadge: {
    color: colors.amber,
  },
  text: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.sm,
  },
  locked: {
    color: colors.amber,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.md,
  },
  sectionTitle: {
    color: colors.cyan,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  fieldRow: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  fieldType: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.xs,
  },
});
