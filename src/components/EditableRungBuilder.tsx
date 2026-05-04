import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EditorBlock, EditorInsertionZone, EditorProjectState } from '../engine/editorTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type EditableRungBuilderProps = {
  editor: EditorProjectState;
  onSelectZone: (zone: EditorInsertionZone) => void;
  onSelectBlock: (blockId: string) => void;
  onRemoveSelected: () => void;
};

function Block({ block, selected, onPress }: { block: EditorBlock; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.block, block.isPro && styles.proBlock, selected && styles.selectedBlock, pressed && styles.pressed]}>
      <Text style={styles.blockName}>{block.name}</Text>
      <Text style={styles.blockVariable}>{block.variable}</Text>
      {block.isPro ? <Text style={styles.proText}>Pro</Text> : null}
    </Pressable>
  );
}

function EmptyZone({ label }: { label: string }) {
  return (
    <View style={styles.emptyZone}>
      <Text style={styles.emptyText}>{label}</Text>
    </View>
  );
}

export function EditableRungBuilder({ editor, onSelectZone, onSelectBlock, onRemoveSelected }: EditableRungBuilderProps) {
  const rung = editor.rungs.find((item) => item.id === editor.selectedRungId) ?? editor.rungs[0];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Editor visual</Text>
          <Text style={styles.subtitle}>Selecione a zona e toque em um componente da biblioteca para inserir.</Text>
        </View>
        <Text style={styles.modeBadge}>Editar</Text>
      </View>

      <Text style={styles.rungLabel}>{rung.label}</Text>

      <Pressable onPress={() => onSelectZone('series')} style={[styles.zone, editor.selectedZone === 'series' && styles.selectedZone]}>
        <Text style={styles.zoneTitle}>Série</Text>
        <View style={styles.blockRow}>
          {rung.seriesBlocks.length === 0 ? <EmptyZone label="Toque aqui e escolha contatos" /> : null}
          {rung.seriesBlocks.map((block) => (
            <Block key={block.id} block={block} selected={editor.selectedBlockId === block.id} onPress={() => onSelectBlock(block.id)} />
          ))}
        </View>
      </Pressable>

      <Pressable onPress={() => onSelectZone('parallel')} style={[styles.zone, editor.selectedZone === 'parallel' && styles.selectedZone]}>
        <Text style={styles.zoneTitle}>Paralelo / ramo</Text>
        <View style={styles.blockRow}>
          {rung.parallelBlocks.length === 0 ? <EmptyZone label="Toque aqui para ramo paralelo" /> : null}
          {rung.parallelBlocks.map((block) => (
            <Block key={block.id} block={block} selected={editor.selectedBlockId === block.id} onPress={() => onSelectBlock(block.id)} />
          ))}
        </View>
      </Pressable>

      <Pressable onPress={() => onSelectZone('coil')} style={[styles.zone, editor.selectedZone === 'coil' && styles.selectedZone]}>
        <Text style={styles.zoneTitle}>Saída / função</Text>
        <View style={styles.blockRow}>
          {rung.coilBlock ? (
            <Block block={rung.coilBlock} selected={editor.selectedBlockId === rung.coilBlock.id} onPress={() => onSelectBlock(rung.coilBlock?.id ?? '')} />
          ) : (
            <EmptyZone label="Toque aqui e escolha saída/função" />
          )}
        </View>
      </Pressable>

      <View style={styles.actionRow}>
        <Pressable onPress={onRemoveSelected} style={({ pressed }) => [styles.removeButton, !editor.selectedBlockId && styles.disabled, pressed && Boolean(editor.selectedBlockId) && styles.pressed]}>
          <Text style={styles.removeText}>Remover selecionado</Text>
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
    borderRadius: 22,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
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
  },
  modeBadge: {
    color: colors.cyan,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  rungLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: spacing.md,
  },
  zone: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.background,
  },
  selectedZone: {
    borderColor: colors.cyan,
  },
  zoneTitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  blockRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  block: {
    minWidth: 96,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.sm,
    backgroundColor: colors.surfaceElevated,
  },
  proBlock: {
    borderColor: colors.amber,
  },
  selectedBlock: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  blockName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  blockVariable: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  proText: {
    color: colors.amber,
    fontSize: 10,
    fontWeight: '900',
    marginTop: spacing.xs,
  },
  emptyZone: {
    borderColor: colors.border,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: spacing.md,
    minWidth: 180,
  },
  emptyText: {
    color: colors.inactive,
    fontSize: 12,
    fontWeight: '800',
  },
  actionRow: {
    marginTop: spacing.sm,
  },
  removeButton: {
    borderColor: colors.red,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
  removeText: {
    color: colors.red,
    fontSize: 13,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.75,
  },
});
