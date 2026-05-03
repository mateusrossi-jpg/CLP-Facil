import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EditorBlock, EditorInsertionZone, EditorProjectState } from '../engine/editorTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type EditableLadderCanvasProps = {
  editor: EditorProjectState;
  locked?: boolean;
  rungResults?: Record<string, boolean>;
  onSelectZone: (zone: EditorInsertionZone) => void;
  onSelectBlock: (blockId: string) => void;
};

function blockLabel(block: EditorBlock): string {
  if (block.role === 'contact') {
    const symbol = block.contactMode === 'NC' ? ']/[' : '] [';
    return `${symbol} ${block.variable}`;
  }

  if (block.role === 'coil') {
    const mode = block.coilMode && block.coilMode !== 'NORMAL' ? `${block.coilMode} ` : '';
    return `(${mode}${block.variable})`;
  }

  return block.variable;
}

function LadderBlock({ block, selected, locked, onPress }: { block: EditorBlock; selected: boolean; locked?: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={() => !locked && onPress()}
      style={({ pressed }) => [
        styles.block,
        block.role === 'coil' && styles.coilBlock,
        block.isPro && styles.proBlock,
        selected && styles.selectedBlock,
        locked && styles.lockedBlock,
        pressed && !locked && styles.pressed,
      ]}
    >
      <Text style={styles.blockSymbol}>{blockLabel(block)}</Text>
      <Text style={styles.blockName}>{block.name}</Text>
      {block.isPro ? <Text style={styles.proLabel}>PRO</Text> : null}
    </Pressable>
  );
}

function InsertSlot({ label, selected, locked, onPress }: { label: string; selected: boolean; locked?: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={() => !locked && onPress()}
      style={({ pressed }) => [styles.insertSlot, selected && styles.selectedSlot, locked && styles.lockedBlock, pressed && !locked && styles.pressed]}
    >
      <Text style={styles.insertText}>{label}</Text>
    </Pressable>
  );
}

export function EditableLadderCanvas({ editor, locked, rungResults, onSelectZone, onSelectBlock }: EditableLadderCanvasProps) {
  const rung = editor.rungs.find((item) => item.id === editor.selectedRungId) ?? editor.rungs[0];
  const energized = Boolean(rungResults?.[rung.id]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Canvas Ladder</Text>
          <Text style={styles.subtitle}>Visual didático da linha selecionada com trilhos, contatos, ramo paralelo e bobina.</Text>
        </View>
        <Text style={[styles.statusBadge, energized && styles.statusBadgeOn]}>{energized ? 'Energizada' : 'Aberta'}</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.ladderFrame, energized && styles.ladderFrameOn]}>
          <View style={styles.rail} />

          <View style={styles.rungArea}>
            <Text style={styles.rungTitle}>{rung.label}</Text>

            <View style={styles.mainLine}>
              <View style={[styles.powerLine, energized && styles.powerLineOn]} />
              <View style={styles.blocksRow}>
                {rung.seriesBlocks.length === 0 ? (
                  <InsertSlot label="+ Série" selected={editor.selectedZone === 'series'} locked={locked} onPress={() => onSelectZone('series')} />
                ) : (
                  rung.seriesBlocks.map((block) => (
                    <LadderBlock key={block.id} block={block} selected={editor.selectedBlockId === block.id} locked={locked} onPress={() => onSelectBlock(block.id)} />
                  ))
                )}
                <InsertSlot label="+" selected={editor.selectedZone === 'series'} locked={locked} onPress={() => onSelectZone('series')} />
              </View>
            </View>

            <View style={styles.parallelLine}>
              <View style={styles.parallelRail} />
              <View style={styles.parallelContent}>
                <Text style={styles.parallelTitle}>Ramo paralelo</Text>
                <View style={styles.blocksRow}>
                  {rung.parallelBlocks.length === 0 ? (
                    <InsertSlot label="+ Paralelo" selected={editor.selectedZone === 'parallel'} locked={locked} onPress={() => onSelectZone('parallel')} />
                  ) : (
                    rung.parallelBlocks.map((block) => (
                      <LadderBlock key={block.id} block={block} selected={editor.selectedBlockId === block.id} locked={locked} onPress={() => onSelectBlock(block.id)} />
                    ))
                  )}
                  <InsertSlot label="+" selected={editor.selectedZone === 'parallel'} locked={locked} onPress={() => onSelectZone('parallel')} />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.coilArea}>
            {rung.coilBlock ? (
              <LadderBlock block={rung.coilBlock} selected={editor.selectedBlockId === rung.coilBlock.id} locked={locked} onPress={() => onSelectBlock(rung.coilBlock?.id ?? '')} />
            ) : (
              <InsertSlot label="+ Bobina" selected={editor.selectedZone === 'coil'} locked={locked} onPress={() => onSelectZone('coil')} />
            )}
          </View>

          <View style={styles.rail} />
        </View>
      </ScrollView>

      <Text style={styles.hint}>{locked ? 'Modo Simular: toque nas entradas no painel de simulação.' : 'Modo Editar: toque em + Série, + Paralelo ou + Bobina e depois escolha um componente.'}</Text>
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
  headerText: {
    flex: 1,
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
  statusBadge: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  statusBadgeOn: {
    color: colors.green,
  },
  scrollContent: {
    paddingVertical: spacing.sm,
  },
  ladderFrame: {
    minWidth: 720,
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: spacing.md,
  },
  ladderFrameOn: {
    borderColor: colors.green,
  },
  rail: {
    width: 5,
    borderRadius: 3,
    backgroundColor: colors.inactive,
  },
  rungArea: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  rungTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: spacing.sm,
  },
  mainLine: {
    minHeight: 76,
    justifyContent: 'center',
  },
  powerLine: {
    height: 2,
    backgroundColor: colors.border,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 38,
  },
  powerLineOn: {
    backgroundColor: colors.green,
  },
  blocksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  block: {
    minWidth: 108,
    minHeight: 58,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.sm,
    backgroundColor: colors.surfaceElevated,
  },
  coilBlock: {
    borderRadius: 999,
  },
  proBlock: {
    borderColor: colors.amber,
  },
  selectedBlock: {
    borderColor: colors.green,
    backgroundColor: '#143822',
  },
  lockedBlock: {
    opacity: 0.72,
  },
  blockSymbol: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  blockName: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: spacing.xs,
  },
  proLabel: {
    color: colors.amber,
    fontSize: 9,
    fontWeight: '900',
    marginTop: spacing.xs,
  },
  insertSlot: {
    minWidth: 92,
    minHeight: 54,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: colors.border,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 14,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
  },
  selectedSlot: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  insertText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
  },
  parallelLine: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    paddingLeft: spacing.lg,
  },
  parallelRail: {
    width: 2,
    borderRadius: 1,
    backgroundColor: colors.border,
    marginRight: spacing.md,
  },
  parallelContent: {
    flex: 1,
  },
  parallelTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  coilArea: {
    width: 160,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  hint: {
    color: colors.amber,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.md,
  },
  pressed: {
    opacity: 0.75,
  },
});
