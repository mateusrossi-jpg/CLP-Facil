import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EditorRung } from '../engine/editorTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type RungNavigatorProps = {
  rungs: EditorRung[];
  selectedRungId: string;
  locked?: boolean;
  onSelectRung: (rungId: string) => void;
  onAddRung: () => void;
  onRemoveRung: () => void;
};

export function RungNavigator({ rungs, selectedRungId, locked, onSelectRung, onAddRung, onRemoveRung }: RungNavigatorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Linhas do projeto</Text>
          <Text style={styles.subtitle}>Selecione a linha Ladder que deseja editar.</Text>
        </View>
        {locked ? <Text style={styles.locked}>Travado</Text> : null}
      </View>

      <View style={styles.rungList}>
        {rungs.map((rung, index) => {
          const selected = rung.id === selectedRungId;
          const blockCount = rung.seriesBlocks.length + rung.parallelBlocks.length + (rung.coilBlock ? 1 : 0);
          return (
            <Pressable
              key={rung.id}
              onPress={() => !locked && onSelectRung(rung.id)}
              style={({ pressed }) => [styles.rungCard, selected && styles.rungSelected, locked && styles.disabled, pressed && !locked && styles.pressed]}
            >
              <Text style={styles.rungTitle}>Linha {index + 1}</Text>
              <Text style={styles.rungMeta}>{blockCount} bloco(s)</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.actions}>
        <Pressable onPress={onAddRung} disabled={locked} style={({ pressed }) => [styles.actionButton, locked && styles.disabled, pressed && !locked && styles.pressed]}>
          <Text style={styles.actionText}>Adicionar linha</Text>
        </Pressable>
        <Pressable onPress={onRemoveRung} disabled={locked || rungs.length <= 1} style={({ pressed }) => [styles.removeButton, (locked || rungs.length <= 1) && styles.disabled, pressed && !locked && rungs.length > 1 && styles.pressed]}>
          <Text style={styles.removeText}>Remover linha</Text>
        </Pressable>
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
    marginTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  locked: {
    color: colors.amber,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  rungList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  rungCard: {
    minWidth: 104,
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
  },
  rungSelected: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  rungTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  rungMeta: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  actionButton: {
    flex: 1,
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    alignItems: 'center',
  },
  removeButton: {
    flex: 1,
    borderColor: colors.red,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    alignItems: 'center',
  },
  actionText: {
    color: colors.cyan,
    fontSize: 13,
    fontWeight: '900',
  },
  removeText: {
    color: colors.red,
    fontSize: 13,
    fontWeight: '900',
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.75,
  },
});
