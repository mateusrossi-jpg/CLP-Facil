import { memo, useMemo, useState } from 'react';
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
  const [variable, setVariable] = useState(block?.variable ?? '');
  const [presetMs, setPresetMs] = useState(String(block?.presetMs ?? 1000));
  const [preset, setPreset] = useState(String(block?.preset ?? 1));

  if (!block) {
    return (
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Editor rápido</Text>
        <Text style={styles.emptyText}>Toque em um componente da rung para editar nome, endereço, tipo e valores.</Text>
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
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Editor rápido</Text>
          <Text style={styles.title}>{blockKind(block)}</Text>
        </View>
        <Pressable onPress={save} style={styles.saveButton}>
          <Text style={styles.saveText}>Salvar</Text>
        </Pressable>
      </View>

      <View style={styles.fieldRow}>
        <View style={styles.fieldBox}>
          <Text style={styles.label}>Tag</Text>
          <TextInput value={variable} onChangeText={setVariable} autoCapitalize="characters" style={styles.input} />
        </View>
        <View style={styles.fieldBox}>
          <Text style={styles.label}>Nome</Text>
          <TextInput value={name} onChangeText={setName} style={styles.input} />
        </View>
      </View>

      <View style={styles.fieldBox}>
        <Text style={styles.label}>Descrição</Text>
        <TextInput value={description} onChangeText={setDescription} style={styles.input} />
      </View>

      {block.role === 'contact' ? (
        <View style={styles.modeGrid}>
          <SmallModeButton label="NA" active={(block.contactMode ?? 'NO') === 'NO'} onPress={() => onUpdateContactMode?.('NO')} />
          <SmallModeButton label="NF" active={block.contactMode === 'NC'} onPress={() => onUpdateContactMode?.('NC')} />
          <SmallModeButton label="↑" active={block.contactMode === 'RISING'} onPress={() => onUpdateContactMode?.('RISING')} />
          <SmallModeButton label="↓" active={block.contactMode === 'FALLING'} onPress={() => onUpdateContactMode?.('FALLING')} />
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
        <>
          <View style={styles.modeGrid}>
            <SmallModeButton label="TON" active={(block.timerMode ?? 'TON') === 'TON'} onPress={() => onUpdateTimerMode?.('TON')} />
            <SmallModeButton label="TOF" active={block.timerMode === 'TOF'} onPress={() => onUpdateTimerMode?.('TOF')} />
            <SmallModeButton label="TP" active={block.timerMode === 'TP'} onPress={() => onUpdateTimerMode?.('TP')} />
          </View>
          <View style={styles.fieldBox}>
            <Text style={styles.label}>Preset ms</Text>
            <TextInput value={presetMs} onChangeText={setPresetMs} keyboardType="numeric" style={styles.input} />
          </View>
        </>
      ) : null}

      {block.role === 'counter' ? (
        <>
          <View style={styles.modeGrid}>
            <SmallModeButton label="CTU" active={(block.counterMode ?? 'CTU') === 'CTU'} onPress={() => onUpdateCounterMode?.('CTU')} />
            <SmallModeButton label="CTD" active={block.counterMode === 'CTD'} onPress={() => onUpdateCounterMode?.('CTD')} />
            <SmallModeButton label="CTUD" active={block.counterMode === 'CTUD'} onPress={() => onUpdateCounterMode?.('CTUD')} />
          </View>
          <View style={styles.fieldBox}>
            <Text style={styles.label}>Preset</Text>
            <TextInput value={preset} onChangeText={setPreset} keyboardType="numeric" style={styles.input} />
          </View>
        </>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 20,
    padding: spacing.md,
    backgroundColor: colors.cyanSoft,
    gap: spacing.sm,
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
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },
  saveButton: {
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    backgroundColor: colors.cyan,
  },
  saveText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '900',
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
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  input: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 9,
    color: colors.text,
    backgroundColor: colors.surface,
    fontSize: 13,
    fontWeight: '800',
  },
  modeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  modeButton: {
    flexGrow: 1,
    flexBasis: 70,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
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
    fontSize: 11,
    fontWeight: '900',
  },
  modeButtonTextActive: {
    color: colors.green,
  },
  emptyText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },
});
