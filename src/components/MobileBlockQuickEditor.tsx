import { memo, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  EditorBlock,
  EditorCoilMode,
  EditorContactMode,
  EditorCounterMode,
  EditorProjectState,
  EditorTimerMode,
} from '../engine/editorTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type MobileBlockQuickEditorProps = {
  project: EditorProjectState;
  onUpdateName?: (value: string) => void;
  onUpdateDescription?: (value: string) => void;
  onUpdateVariable?: (value: string) => void;
  onUpdateContactMode?: (value: EditorContactMode) => void;
  onUpdateCoilMode?: (value: EditorCoilMode) => void;
  onUpdateTimerMode?: (value: EditorTimerMode) => void;
  onUpdateCounterMode?: (value: EditorCounterMode) => void;
  onUpdatePresetMs?: (value: number) => void;
  onUpdatePreset?: (value: number) => void;
};

function collectBlocks(project: EditorProjectState): EditorBlock[] {
  return project.rungs.flatMap((rung) => [
    ...rung.seriesBlocks,
    ...rung.parallelBlocks,
    ...(rung.parallelBranches ?? []).flatMap((branch) => branch.blocks),
    ...(rung.coilBlock ? [rung.coilBlock] : []),
  ]);
}

function selectedBlock(project: EditorProjectState): EditorBlock | null {
  if (!project.selectedBlockId) return null;
  return collectBlocks(project).find((block) => block.id === project.selectedBlockId) ?? null;
}

function normalizeAddress(value: string): string {
  return value.trim().toUpperCase();
}

function parseNumber(value: string): number {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function blockKind(block: EditorBlock): string {
  if (block.role === 'timer') return `Timer ${block.timerMode ?? 'TON'}`;
  if (block.role === 'counter') return `Contador ${block.counterMode ?? 'CTU'}`;
  if (block.role === 'coil') return 'Bobina';
  return 'Contato';
}

function blockModeLabel(block: EditorBlock): string {
  return block.contactMode ?? block.coilMode ?? block.timerMode ?? block.counterMode ?? block.role.toUpperCase();
}

function blockActionLabel(block: EditorBlock): string {
  if (block.role === 'contact') return 'Lê entrada/memória';
  if (block.role === 'coil') return 'Escreve saída/memória';
  if (block.role === 'timer') return 'Temporiza o rung';
  if (block.role === 'counter') return 'Conta eventos';
  return 'Processa lógica';
}

function currentAddress(block: EditorBlock): string {
  return (block.variable || block.destination || block.sourceA || 'TAG').trim().toUpperCase();
}

function SmallModeButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.modeButton, active && styles.modeButtonActive]}>
      <Text style={[styles.modeButtonText, active && styles.modeButtonTextActive]}>{label}</Text>
    </Pressable>
  );
}

export const MobileBlockQuickEditor = memo(function MobileBlockQuickEditor({
  project,
  onUpdateName,
  onUpdateDescription,
  onUpdateVariable,
  onUpdateContactMode,
  onUpdateCoilMode,
  onUpdateTimerMode,
  onUpdateCounterMode,
  onUpdatePresetMs,
  onUpdatePreset,
}: MobileBlockQuickEditorProps) {
  const block = useMemo(() => selectedBlock(project), [project]);
  const [name, setName] = useState(block?.name ?? '');
  const [description, setDescription] = useState(block?.description ?? '');
  const [variable, setVariable] = useState(block ? currentAddress(block) : '');
  const [presetMs, setPresetMs] = useState(String(block?.presetMs ?? 1000));
  const [preset, setPreset] = useState(String(block?.preset ?? 1));

  useEffect(() => {
    setName(block?.name ?? '');
    setDescription(block?.description ?? '');
    setVariable(block ? currentAddress(block) : '');
    setPresetMs(String(block?.presetMs ?? 1000));
    setPreset(String(block?.preset ?? 1));
  }, [block?.id]);

  if (!block) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.eyebrow}>Bloco</Text>
        <Text style={styles.emptyTitle}>Toque em um contato, bobina, timer ou contador.</Text>
        <Text style={styles.emptyText}>A edição da tag e dos modos aparece aqui, sem sair da bancada.</Text>
      </View>
    );
  }

  const save = () => {
    onUpdateVariable?.(normalizeAddress(variable));
    onUpdateName?.(name.trim() || block.name);
    onUpdateDescription?.(description.trim());
    if (block.role === 'timer') onUpdatePresetMs?.(parseNumber(presetMs));
    if (block.role === 'counter') onUpdatePreset?.(parseNumber(preset));
  };

  return (
    <View style={styles.card}>
      <View style={styles.selectedStrip}>
        <Text style={styles.selectedStripText}>TOQUE NO BLOCO → EDITE A TAG AQUI</Text>
      </View>

      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Bloco selecionado</Text>
          <Text style={styles.title}>{blockKind(block)} • {currentAddress(block)}</Text>
          <Text style={styles.subtitle}>Altere variável, modo e preset sem trocar de tela.</Text>
        </View>
        <Pressable onPress={save} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}>
          <Text style={styles.saveText}>Aplicar</Text>
        </Pressable>
      </View>

      <View style={styles.inspectorRow}>
        <View style={styles.inspectorCell}>
          <Text style={styles.inspectorLabel}>Tipo</Text>
          <Text style={styles.inspectorValue}>{blockKind(block)}</Text>
        </View>
        <View style={styles.inspectorCell}>
          <Text style={styles.inspectorLabel}>Modo</Text>
          <Text style={styles.inspectorValue}>{blockModeLabel(block)}</Text>
        </View>
        <View style={styles.inspectorCellWide}>
          <Text style={styles.inspectorLabel}>Função</Text>
          <Text style={styles.inspectorValue}>{blockActionLabel(block)}</Text>
        </View>
      </View>

      <View style={styles.primaryField}>
        <Text style={styles.label}>Variável / Tag</Text>
        <TextInput value={variable} onChangeText={setVariable} onSubmitEditing={save} autoCapitalize="characters" autoCorrect={false} style={styles.tagInput} />
      </View>

      <View style={styles.fieldRow}>
        <View style={styles.fieldBox}>
          <Text style={styles.label}>Nome</Text>
          <TextInput value={name} onChangeText={setName} onSubmitEditing={save} style={styles.input} />
        </View>
        <View style={styles.fieldBox}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput value={description} onChangeText={setDescription} onSubmitEditing={save} style={styles.input} />
        </View>
      </View>

      {block.role === 'contact' ? (
        <View style={styles.modeGrid}>
          <SmallModeButton label="NA" active={(block.contactMode ?? 'NO') === 'NO'} onPress={() => onUpdateContactMode?.('NO')} />
          <SmallModeButton label="NF" active={block.contactMode === 'NC'} onPress={() => onUpdateContactMode?.('NC')} />
          <SmallModeButton label="Borda ↑" active={block.contactMode === 'RISING'} onPress={() => onUpdateContactMode?.('RISING')} />
          <SmallModeButton label="Borda ↓" active={block.contactMode === 'FALLING'} onPress={() => onUpdateContactMode?.('FALLING')} />
        </View>
      ) : null}

      {block.role === 'coil' ? (
        <View style={styles.modeGrid}>
          <SmallModeButton label="Normal" active={(block.coilMode ?? 'NORMAL') === 'NORMAL'} onPress={() => onUpdateCoilMode?.('NORMAL')} />
          <SmallModeButton label="Set" active={block.coilMode === 'SET'} onPress={() => onUpdateCoilMode?.('SET')} />
          <SmallModeButton label="Reset" active={block.coilMode === 'RESET'} onPress={() => onUpdateCoilMode?.('RESET')} />
          <SmallModeButton label="Pulso" active={block.coilMode === 'PULSE'} onPress={() => onUpdateCoilMode?.('PULSE')} />
        </View>
      ) : null}

      {block.role === 'timer' ? (
        <View style={styles.inlineConfig}>
          <View style={styles.modeGrid}>
            <SmallModeButton label="TON" active={(block.timerMode ?? 'TON') === 'TON'} onPress={() => onUpdateTimerMode?.('TON')} />
            <SmallModeButton label="TOF" active={block.timerMode === 'TOF'} onPress={() => onUpdateTimerMode?.('TOF')} />
            <SmallModeButton label="TP" active={block.timerMode === 'TP'} onPress={() => onUpdateTimerMode?.('TP')} />
          </View>
          <View style={styles.fieldBox}>
            <Text style={styles.label}>Preset ms</Text>
            <TextInput value={presetMs} onChangeText={setPresetMs} onSubmitEditing={save} keyboardType="numeric" style={styles.input} />
          </View>
        </View>
      ) : null}

      {block.role === 'counter' ? (
        <View style={styles.inlineConfig}>
          <View style={styles.modeGrid}>
            <SmallModeButton label="CTU" active={(block.counterMode ?? 'CTU') === 'CTU'} onPress={() => onUpdateCounterMode?.('CTU')} />
            <SmallModeButton label="CTD" active={block.counterMode === 'CTD'} onPress={() => onUpdateCounterMode?.('CTD')} />
            <SmallModeButton label="CTUD" active={block.counterMode === 'CTUD'} onPress={() => onUpdateCounterMode?.('CTUD')} />
          </View>
          <View style={styles.fieldBox}>
            <Text style={styles.label}>Preset</Text>
            <TextInput value={preset} onChangeText={setPreset} onSubmitEditing={save} keyboardType="numeric" style={styles.input} />
          </View>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    gap: spacing.sm,
  },
  emptyCard: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    gap: 3,
  },
  selectedStrip: {
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: colors.cyanSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  selectedStripText: {
    color: colors.cyan,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: colors.cyan,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
    marginTop: 2,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800',
  },
  saveButton: {
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    backgroundColor: colors.cyan,
  },
  saveText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  inspectorRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  inspectorCell: {
    flex: 0.8,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: colors.background,
    padding: spacing.xs,
    gap: 2,
  },
  inspectorCellWide: {
    flex: 1.4,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: colors.background,
    padding: spacing.xs,
    gap: 2,
  },
  inspectorLabel: {
    color: colors.textDim,
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  inspectorValue: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '900',
  },
  primaryField: {
    gap: 4,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  fieldBox: {
    flex: 1,
    gap: 4,
  },
  label: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  tagInput: {
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    color: colors.text,
    backgroundColor: colors.background,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  input: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 9,
    color: colors.text,
    backgroundColor: colors.surface,
    fontSize: 12,
    fontWeight: '800',
  },
  inlineConfig: {
    gap: spacing.xs,
  },
  modeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  modeButton: {
    flexGrow: 1,
    flexBasis: 72,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  modeButtonActive: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  modeButtonText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  modeButtonTextActive: {
    color: colors.green,
  },
  pressed: {
    opacity: 0.72,
  },
});
