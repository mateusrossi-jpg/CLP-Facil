import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { EditorBlock, EditorProjectState } from '../engine/editorTypes';
import { compileLadderProjectForHardware } from '../hardware/compileLadderProject';
import { getHardwareBoardProfile, hardwareBoardProfiles } from '../hardware/defaultBoards';
import { exportArduinoSketch } from '../hardware/exportArduinoSketch';
import { exportEspHomeYaml } from '../hardware/exportEspHomeYaml';
import { HardwareExportConfig, HardwareOutputPolarity, HardwarePinMap, HardwareTarget } from '../hardware/hardwareTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type HardwareExportPanelProps = {
  editorProject: EditorProjectState;
};

type IoVariable = {
  variable: string;
  label: string;
  scope: 'input' | 'output';
};

type ExportFormat = 'arduino' | 'esphome';

function normalizeVariable(variable: string | undefined): string {
  return (variable ?? '').trim().toUpperCase();
}

function isNumericLiteral(value: string | undefined): boolean {
  if (!value) return false;
  return Number.isFinite(Number(value.trim().replace(',', '.')));
}

function inferScope(variable: string): 'input' | 'output' | 'memory' {
  const normalized = normalizeVariable(variable);
  if (normalized.startsWith('I')) return 'input';
  if (normalized.startsWith('Q') || normalized.startsWith('O')) return 'output';
  return 'memory';
}

function allEditorBlocks(project: EditorProjectState): EditorBlock[] {
  return project.rungs.flatMap((rung) => [
    ...rung.seriesBlocks,
    ...rung.parallelBlocks,
    ...(rung.parallelBranches ?? []).flatMap((branch) => branch.blocks),
    ...(rung.coilBlock ? [rung.coilBlock] : []),
  ]);
}

function collectIoVariables(project: EditorProjectState): IoVariable[] {
  const variables = new Map<string, IoVariable>();

  for (const item of project.projectVariables ?? []) {
    const variable = normalizeVariable(item.id || item.address);
    const scope = item.scope === 'input' ? 'input' : item.scope === 'output' ? 'output' : inferScope(variable);
    if (!variable || (scope !== 'input' && scope !== 'output')) continue;
    variables.set(variable, {
      variable,
      label: item.name || variable,
      scope,
    });
  }

  for (const block of allEditorBlocks(project)) {
    const candidates = [block.variable, block.sourceA, block.sourceB, block.destination, block.downSource, block.resetSource];
    for (const candidate of candidates) {
      const variable = normalizeVariable(candidate);
      if (!variable || isNumericLiteral(variable)) continue;
      const scope = inferScope(variable);
      if (scope !== 'input' && scope !== 'output') continue;
      if (!variables.has(variable)) {
        variables.set(variable, {
          variable,
          label: block.name || variable,
          scope,
        });
      }
    }
  }

  return Array.from(variables.values()).sort((left, right) => {
    if (left.scope !== right.scope) return left.scope === 'input' ? -1 : 1;
    return left.variable.localeCompare(right.variable);
  });
}

function defaultPinFor(index: number, scope: 'input' | 'output', target: HardwareTarget): string {
  const profile = getHardwareBoardProfile(target);
  const list = scope === 'input' ? profile.digitalInputPins : profile.digitalOutputPins;
  return list[index] ?? '';
}

function formatTargetLabel(target: HardwareTarget): string {
  return hardwareBoardProfiles.find((profile) => profile.target === target)?.label ?? target;
}

export function HardwareExportPanel({ editorProject }: HardwareExportPanelProps) {
  const [target, setTarget] = useState<HardwareTarget>('esp32');
  const [format, setFormat] = useState<ExportFormat>('arduino');
  const [scanMs, setScanMs] = useState('50');
  const [nodeName, setNodeName] = useState('easy-clp-node');
  const [pinOverrides, setPinOverrides] = useState<Record<string, string>>({});
  const [outputPolarity, setOutputPolarity] = useState<Record<string, HardwareOutputPolarity>>({});
  const [safeStates, setSafeStates] = useState<Record<string, boolean>>({});

  const ioVariables = useMemo(() => collectIoVariables(editorProject), [editorProject]);
  const profile = getHardwareBoardProfile(target);
  const inputVariables = ioVariables.filter((variable) => variable.scope === 'input');
  const outputVariables = ioVariables.filter((variable) => variable.scope === 'output');

  const pinMap: HardwarePinMap[] = useMemo(() => ioVariables.map((item) => {
    const sourceList = item.scope === 'input' ? inputVariables : outputVariables;
    const sourceIndex = sourceList.findIndex((candidate) => candidate.variable === item.variable);
    const pin = pinOverrides[item.variable] ?? defaultPinFor(sourceIndex, item.scope, target);

    return {
      variable: item.variable,
      label: `${item.variable} ${item.label}`,
      pin,
      mode: item.scope === 'input' ? 'input_pullup' : 'output',
      outputPolarity: item.scope === 'output' ? outputPolarity[item.variable] ?? 'active_high' : undefined,
      safeState: item.scope === 'output' ? safeStates[item.variable] ?? false : undefined,
      debounceMs: item.scope === 'input' ? 30 : undefined,
    };
  }), [ioVariables, inputVariables, outputVariables, outputPolarity, pinOverrides, safeStates, target]);

  const config: HardwareExportConfig = useMemo(() => ({
    target,
    nodeName,
    scanMs: Math.max(Number(scanMs.replace(',', '.')) || profile.defaultScanMs, 1),
    pinMap,
  }), [nodeName, pinMap, profile.defaultScanMs, scanMs, target]);

  const compiledProject = useMemo(() => compileLadderProjectForHardware(editorProject, config), [config, editorProject]);
  const generatedCode = useMemo(() => {
    if (format === 'esphome') return exportEspHomeYaml(compiledProject);
    return exportArduinoSketch(compiledProject);
  }, [compiledProject, format]);

  function updatePin(variable: string, value: string) {
    setPinOverrides((current) => ({ ...current, [variable]: value.trim() }));
  }

  function togglePolarity(variable: string) {
    setOutputPolarity((current) => ({
      ...current,
      [variable]: current[variable] === 'active_low' ? 'active_high' : 'active_low',
    }));
  }

  function toggleSafeState(variable: string) {
    setSafeStates((current) => ({ ...current, [variable]: !current[variable] }));
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Hardware</Text>
          <Text style={styles.title}>Exportar para ESP32, Arduino e ESPHome</Text>
          <Text style={styles.subtitle}>Mapeie as entradas e saídas do Ladder para GPIOs e gere o código de bancada.</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>BETA</Text>
        </View>
      </View>

      <View style={styles.warningBox}>
        <Text style={styles.warningTitle}>Uso seguro</Text>
        <Text style={styles.warningText}>Código didático. Para cargas reais, mantenha proteção física, isolamento, emergência, fusível/disjuntor, relé térmico e intertravamentos independentes.</Text>
      </View>

      <Text style={styles.sectionLabel}>Placa alvo</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.targetRow}>
        {hardwareBoardProfiles.map((board) => {
          const selected = target === board.target;
          return (
            <Pressable key={board.target} onPress={() => setTarget(board.target)} style={[styles.targetChip, selected && styles.targetChipSelected]}>
              <Text style={[styles.targetChipText, selected && styles.targetChipTextSelected]}>{board.label}</Text>
            </Pressable>
          );
        })}
        <Pressable onPress={() => { setTarget('esphome'); setFormat('esphome'); }} style={[styles.targetChip, target === 'esphome' && styles.targetChipSelected]}>
          <Text style={[styles.targetChipText, target === 'esphome' && styles.targetChipTextSelected]}>ESPHome YAML</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.configGrid}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nome do node</Text>
          <TextInput value={nodeName} onChangeText={setNodeName} style={styles.input} autoCapitalize="none" />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Scan</Text>
          <TextInput value={scanMs} onChangeText={setScanMs} style={styles.input} keyboardType="numeric" />
        </View>
      </View>

      <Text style={styles.sectionLabel}>Mapeamento de I/O</Text>
      <View style={styles.mapList}>
        {ioVariables.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma entrada ou saída I/Q encontrada no projeto atual.</Text>
        ) : ioVariables.map((item) => {
          const mapped = pinMap.find((pin) => pin.variable === item.variable);
          const activeLow = mapped?.outputPolarity === 'active_low';
          const safeOn = Boolean(mapped?.safeState);
          return (
            <View key={item.variable} style={styles.mapRow}>
              <View style={styles.mapInfo}>
                <Text style={styles.mapVariable}>{item.variable}</Text>
                <Text style={styles.mapLabel} numberOfLines={1}>{item.label}</Text>
                <Text style={styles.mapScope}>{item.scope === 'input' ? 'Entrada' : 'Saída'}</Text>
              </View>
              <TextInput
                value={mapped?.pin ?? ''}
                onChangeText={(value) => updatePin(item.variable, value)}
                placeholder="GPIO"
                placeholderTextColor={colors.textDim}
                style={styles.pinInput}
                autoCapitalize="characters"
              />
              {item.scope === 'output' ? (
                <View style={styles.outputActions}>
                  <Pressable onPress={() => togglePolarity(item.variable)} style={[styles.smallChip, activeLow && styles.smallChipSelected]}>
                    <Text style={[styles.smallChipText, activeLow && styles.smallChipTextSelected]}>{activeLow ? 'LOW' : 'HIGH'}</Text>
                  </Pressable>
                  <Pressable onPress={() => toggleSafeState(item.variable)} style={[styles.smallChip, safeOn && styles.safeOnChip]}>
                    <Text style={[styles.smallChipText, safeOn && styles.safeOnText]}>{safeOn ? 'BOOT ON' : 'BOOT OFF'}</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      <Text style={styles.sectionLabel}>Formato de saída</Text>
      <View style={styles.formatRow}>
        <Pressable onPress={() => setFormat('arduino')} style={[styles.formatButton, format === 'arduino' && styles.formatButtonSelected]}>
          <Text style={[styles.formatText, format === 'arduino' && styles.formatTextSelected]}>Arduino / ESP32 C++</Text>
        </Pressable>
        <Pressable onPress={() => setFormat('esphome')} style={[styles.formatButton, format === 'esphome' && styles.formatButtonSelected]}>
          <Text style={[styles.formatText, format === 'esphome' && styles.formatTextSelected]}>ESPHome YAML</Text>
        </Pressable>
      </View>

      {profile.notes.length > 0 ? (
        <View style={styles.notesBox}>
          <Text style={styles.notesTitle}>{formatTargetLabel(target)}</Text>
          {profile.notes.map((note) => <Text key={note} style={styles.noteText}>• {note}</Text>)}
        </View>
      ) : null}

      {compiledProject.warnings.length > 0 ? (
        <View style={styles.notesBox}>
          <Text style={styles.notesTitle}>Pendências do mapeamento</Text>
          {compiledProject.warnings.map((warning) => <Text key={warning} style={styles.noteText}>• {warning}</Text>)}
        </View>
      ) : null}

      <View style={styles.codeHeader}>
        <Text style={styles.codeTitle}>{format === 'arduino' ? 'Sketch gerado' : 'YAML gerado'}</Text>
        <Text style={styles.codeMeta}>{generatedCode.split('\n').length} linhas</Text>
      </View>
      <TextInput
        value={generatedCode}
        editable={false}
        multiline
        scrollEnabled
        style={styles.codeBox}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 18,
    padding: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
    marginTop: 2,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  badge: {
    borderColor: colors.green,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.greenSoft,
  },
  badgeText: {
    color: colors.green,
    fontSize: 10,
    fontWeight: '900',
  },
  warningBox: {
    borderColor: colors.amber,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    backgroundColor: colors.goldSoft,
  },
  warningTitle: {
    color: colors.amber,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 3,
  },
  warningText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  sectionLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
    marginTop: spacing.xs,
  },
  targetRow: {
    gap: spacing.sm,
    paddingVertical: 2,
  },
  targetChip: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceElevated,
  },
  targetChipSelected: {
    borderColor: colors.gold,
    backgroundColor: colors.goldSoft,
  },
  targetChipText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
  },
  targetChipTextSelected: {
    color: colors.amber,
  },
  configGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  inputGroup: {
    flex: 1,
    minWidth: 130,
  },
  inputLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 5,
  },
  input: {
    color: colors.text,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    fontWeight: '800',
  },
  mapList: {
    gap: spacing.sm,
  },
  mapRow: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    gap: spacing.sm,
  },
  mapInfo: {
    minWidth: 0,
  },
  mapVariable: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  mapLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  mapScope: {
    color: colors.cyan,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 3,
  },
  pinInput: {
    color: colors.text,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.black,
    fontWeight: '900',
  },
  outputActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  smallChip: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: colors.surface,
  },
  smallChipSelected: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  safeOnChip: {
    borderColor: colors.amber,
    backgroundColor: colors.goldSoft,
  },
  smallChipText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  smallChipTextSelected: {
    color: colors.cyan,
  },
  safeOnText: {
    color: colors.amber,
  },
  formatRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  formatButton: {
    flexGrow: 1,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
  },
  formatButtonSelected: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  formatText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
  },
  formatTextSelected: {
    color: colors.green,
  },
  notesBox: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    backgroundColor: colors.black,
  },
  notesTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: spacing.xs,
  },
  noteText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  codeTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  codeMeta: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
  codeBox: {
    minHeight: 260,
    maxHeight: 420,
    color: colors.text,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    backgroundColor: colors.black,
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 16,
    textAlignVertical: 'top',
  },
});
