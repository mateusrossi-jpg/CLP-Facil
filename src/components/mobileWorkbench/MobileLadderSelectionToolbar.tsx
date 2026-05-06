import { ComponentProps, memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EditorBlock } from '../../engine/editorTypes';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { MobilePlcExperience } from '../MobilePlcExperience';

type MobileLadderSelectionToolbarProps = Pick<
  ComponentProps<typeof MobilePlcExperience>,
  'editorProject' | 'selectedBlockId' | 'mode' | 'onRemoveBlock'
> & {
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onDuplicateBlock?: () => void;
};

function collectBlocks(project: MobileLadderSelectionToolbarProps['editorProject']): EditorBlock[] {
  return project.rungs.flatMap((rung) => [
    ...rung.seriesBlocks,
    ...rung.parallelBlocks,
    ...(rung.parallelBranches ?? []).flatMap((branch) => branch.blocks),
    ...(rung.coilBlock ? [rung.coilBlock] : []),
  ]);
}

function blockAddress(block: EditorBlock): string {
  return (block.variable || block.destination || block.sourceA || 'TAG').trim().toUpperCase();
}

function blockKind(block: EditorBlock): string {
  if (block.role === 'timer') return `Timer ${block.timerMode ?? 'TON'}`;
  if (block.role === 'counter') return `Counter ${block.counterMode ?? 'CTU'}`;
  if (block.role === 'coil') return `Bobina ${block.coilMode ?? 'NORMAL'}`;
  return `Contato ${block.contactMode ?? 'NO'}`;
}

function ToolAction({ label, icon, danger, disabled, onPress }: { label: string; icon: string; danger?: boolean; disabled?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        danger && styles.actionDanger,
        (disabled || !onPress) && styles.actionDisabled,
        pressed && !(disabled || !onPress) && styles.pressed,
      ]}
    >
      <Text style={[styles.actionIcon, danger && styles.actionDangerText]}>{icon}</Text>
      <Text style={[styles.actionLabel, danger && styles.actionDangerText]}>{label}</Text>
    </Pressable>
  );
}

export const MobileLadderSelectionToolbar = memo(function MobileLadderSelectionToolbar({
  editorProject,
  selectedBlockId,
  mode = 'simulate',
  onMoveLeft,
  onMoveRight,
  onDuplicateBlock,
  onRemoveBlock,
}: MobileLadderSelectionToolbarProps) {
  const selectedBlock = useMemo(() => collectBlocks(editorProject).find((block) => block.id === selectedBlockId) ?? null, [editorProject, selectedBlockId]);
  const editMode = mode === 'edit';

  if (!selectedBlock) {
    return (
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Seleção Ladder</Text>
        <Text style={styles.emptyText}>Toque em um contato, bobina, timer ou counter para liberar ações rápidas.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, editMode && styles.cardEdit]}>
      <View style={styles.headerRow}>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>Bloco selecionado</Text>
          <Text style={styles.title}>{blockAddress(selectedBlock)} • {blockKind(selectedBlock)}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{selectedBlock.name}</Text>
        </View>
        <View style={[styles.modePill, editMode && styles.modePillEdit]}>
          <Text style={[styles.modeText, editMode && styles.modeTextEdit]}>{editMode ? 'EDITÁVEL' : 'TESTE'}</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <ToolAction label="Mover" icon="←" disabled={!editMode} onPress={onMoveLeft} />
        <ToolAction label="Mover" icon="→" disabled={!editMode} onPress={onMoveRight} />
        <ToolAction label="Duplicar" icon="⧉" disabled={!editMode} onPress={onDuplicateBlock} />
        <ToolAction label="Remover" icon="×" danger disabled={!editMode} onPress={onRemoveBlock} />
      </View>

      <Text style={styles.hint}>Base pronta para drag-and-drop: as ações já ficam posicionadas junto ao bloco selecionado.</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardEdit: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
    marginTop: 2,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  modePill: {
    borderWidth: 1,
    borderColor: colors.green,
    borderRadius: 999,
    backgroundColor: colors.greenSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  modePillEdit: {
    borderColor: colors.amber,
    backgroundColor: colors.surface,
  },
  modeText: {
    color: colors.green,
    fontSize: 10,
    fontWeight: '900',
  },
  modeTextEdit: {
    color: colors.amber,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  actionButton: {
    flexGrow: 1,
    minWidth: 74,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: spacing.xs,
    gap: 2,
  },
  actionDanger: {
    borderColor: colors.red,
  },
  actionDisabled: {
    opacity: 0.42,
  },
  actionIcon: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  actionLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  actionDangerText: {
    color: colors.red,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 16,
  },
  emptyText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.72,
  },
});
