import { memo, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EditorEvaluationResult } from '../engine/editorEvaluator';
import { EditorProjectState } from '../engine/editorTypes';
import { PlcState } from '../engine/projectTypes';
import { MobileIoDock } from './MobileIoDock';
import { MobileRungViewer } from './MobileRungViewer';
import { EditorRunMode } from './EditorModeToggle';

type MobilePlcWorkspaceProps = {
  editorProject: EditorProjectState;
  plcState: PlcState;
  evaluation: EditorEvaluationResult;
  autoScan?: boolean;
  mode?: EditorRunMode;
  missionTitle?: string;

  mission?: unknown;
  onChangeBlockVariable?: (variable: string) => void;
  onChangeBlockName?: (name: string) => void;
  onChangeContactMode?: (...args: any[]) => void;
  onChangeCoilMode?: (...args: any[]) => void;
  onChangeTimerMode?: (...args: any[]) => void;
  onChangeCounterMode?: (...args: any[]) => void;
  onChangeCompareMode?: (...args: any[]) => void;
  onChangeMathMode?: (...args: any[]) => void;
  onChangeSourceA?: (...args: any[]) => void;
  onChangeSourceB?: (...args: any[]) => void;
  onChangeDestination?: (...args: any[]) => void;
  onChangeDownSource?: (...args: any[]) => void;
  onChangeResetSource?: (...args: any[]) => void;
  onChangePresetMs?: (...args: any[]) => void;
  onChangePreset?: (...args: any[]) => void;
  onAddRung?: () => void;
  onRemoveRung?: () => void;
  onAdvanceMission?: () => void;
  onSetValue?: (variable: string, value: boolean | number) => void;
  onRunScan?: () => void;
  onToggleAutoScan?: () => void;
  onChangeMode?: (mode: EditorRunMode) => void;
  onSelectRungId?: (rungId: string) => void;
  onSelectBlockId?: (blockId: string) => void;
  onAddContact?: () => void;
  onAddCoil?: () => void;
  onAddTimer?: () => void;
  onAddCounter?: () => void;
  onAddBranch?: () => void;
  onRemoveBlock?: () => void;
};

const noop = () => undefined;

const toolButtons = [
  { label: 'NA', symbol: '--| |--', on: 'onAddContact' as const },
  { label: 'NF', symbol: '--|/|--', on: 'onAddContact' as const },
  { label: 'Bobina', symbol: '--( )--', on: 'onAddCoil' as const },
  { label: 'TON', symbol: '[TON]', on: 'onAddTimer' as const },
  { label: 'CTU', symbol: '[CTU]', on: 'onAddCounter' as const },
  { label: 'Branch', symbol: 'BR', on: 'onAddBranch' as const },
  { label: 'Remover', symbol: 'DEL', on: 'onRemoveBlock' as const },
];

export const MobilePlcWorkspace = memo(function MobilePlcWorkspace(props: MobilePlcWorkspaceProps) {
  const {
    editorProject,
    plcState,
    evaluation,
    autoScan = false,
    mode,
    onSetValue = noop,
    onRunScan = noop,
    onToggleAutoScan = noop,
    onChangeMode,
    onSelectRungId,
    onSelectBlockId,
  } = props;

  const [localMode, setLocalMode] = useState<EditorRunMode>('simulate');
  const [rungIndex, setRungIndex] = useState(0);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [message, setMessage] = useState('Pronto para editar e simular.');

  const activeMode = mode ?? localMode;
  const isRun = activeMode === 'simulate';
  const scan = evaluation.scanNumber ?? 0;
  const diagnostics = evaluation.diagnostics ?? [];

  const selectedRungId = editorProject.rungs[rungIndex]?.id;

  const runErrors = useMemo(() => {
    const errors: string[] = [];
    editorProject.rungs.forEach((rung, index) => {
      const contacts = [...rung.seriesBlocks, ...rung.parallelBlocks, ...(rung.parallelBranches ?? []).flatMap((branch) => branch.blocks)].filter((b) => b.role === 'contact');
      const allBlocks = [...contacts, ...(rung.coilBlock ? [rung.coilBlock] : [])];
      const hasOutput = Boolean(rung.coilBlock);
      if (contacts.length > 0 && !hasOutput) errors.push(`Rung ${index + 1} sem saída.`);
      allBlocks.forEach((block) => {
        const tag = (block.variable ?? block.destination ?? block.sourceA ?? '').trim();
        if (!tag) errors.push(`Bloco ${block.name || block.id} sem TAG.`);
        if ((block.role === 'timer' || block.role === 'counter') && (!block.preset || Number(block.preset) <= 0)) {
          errors.push(`${block.role.toUpperCase()} ${block.name || block.id} com preset inválido.`);
        }
      });
    });
    return errors;
  }, [editorProject]);

  function setMode(next: EditorRunMode) {
    setLocalMode(next);
    onChangeMode?.(next);
  }

  function handleRunStop() {
    if (!isRun) {
      setMode('simulate');
      setMessage('RUN ativo.');
      if (!autoScan) onToggleAutoScan();
      return;
    }
    if (runErrors.length > 0) {
      setMessage(runErrors[0]);
      return;
    }
    onToggleAutoScan();
    setMessage(autoScan ? 'STOP ativo.' : 'RUN ativo.');
  }

  return (
    <View style={styles.page}>
      <View style={styles.topbar}>
        {['Undo', 'Redo', 'Novo', 'Abrir/Salvar', 'Exportar', 'Ajuda'].map((item) => (
          <Pressable key={item} onPress={() => setMessage(`${item} ainda será expandido.`)} style={styles.topBtn}><Text style={styles.topBtnText}>{item}</Text></Pressable>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolRow}>
        {toolButtons.map((tool) => (
          <Pressable
            key={tool.label}
            onPress={() => {
              const fn = props[tool.on] as undefined | (() => void);
              fn?.();
              setMessage(`${tool.label} inserido no rung selecionado.`);
            }}
            style={styles.toolBtn}
          >
            <Text style={styles.toolSymbol}>{tool.symbol}</Text>
            <Text style={styles.toolLabel}>{tool.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.canvas}>
        <MobileRungViewer
          editorProject={editorProject}
          plcState={plcState}
          evaluation={evaluation}
          rungIndex={rungIndex}
          selectedBlockId={selectedBlockId}
          onSelectRungIndex={(index) => {
            setRungIndex(index);
            const rungId = editorProject.rungs[index]?.id;
            if (rungId) onSelectRungId?.(rungId);
          }}
          onSelectBlock={(block) => {
            setSelectedBlockId(block.id);
            onSelectBlockId?.(block.id);
          }}
        />
      </View>

      <View style={styles.runRow}>
        <Pressable onPress={handleRunStop} style={[styles.runBtn, autoScan && styles.runBtnOn]}>
          <Text style={styles.runText}>{autoScan ? 'STOP' : 'RUN'}</Text>
        </Pressable>
        <Pressable onPress={onRunScan} style={styles.scanBtn}><Text style={styles.scanText}>SCAN</Text></Pressable>
        <View style={styles.scanInfo}><Text style={styles.scanInfoText}>Scan #{scan}</Text><Text style={styles.scanInfoText}>{selectedRungId ? `Rung ${rungIndex + 1}` : 'Sem rung'}</Text></View>
      </View>

      <MobileIoDock editorProject={editorProject} plcState={plcState} onSetValue={onSetValue} />

      <View style={styles.footer}><Text style={styles.footerText}>{runErrors.length > 0 ? runErrors[0] : message}</Text>{diagnostics[0] ? <Text style={styles.footerWarn}>{diagnostics[0].message}</Text> : null}</View>
    </View>
  );
});

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F4F7FB', padding: 10, gap: 8 },
  topbar: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  topBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  topBtnText: { fontSize: 12, fontWeight: '800', color: '#0F172A' },
  toolRow: { gap: 8, paddingVertical: 4 },
  toolBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#93C5FD', borderRadius: 10, padding: 10, minWidth: 88, alignItems: 'center' },
  toolSymbol: { color: '#1E3A8A', fontWeight: '800', fontSize: 12 },
  toolLabel: { color: '#0F172A', fontSize: 11, fontWeight: '700' },
  canvas: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, overflow: 'hidden' },
  runRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  runBtn: { flex: 1, minHeight: 52, backgroundColor: '#16A34A', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  runBtnOn: { backgroundColor: '#DC2626' },
  runText: { color: '#fff', fontSize: 20, fontWeight: '900' },
  scanBtn: { minHeight: 52, minWidth: 90, backgroundColor: '#0EA5E9', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  scanText: { color: '#fff', fontWeight: '900' },
  scanInfo: { flex: 1 },
  scanInfoText: { color: '#334155', fontSize: 12, fontWeight: '700' },
  footer: { minHeight: 38, backgroundColor: '#E2E8F0', borderRadius: 8, padding: 8 },
  footerText: { color: '#0F172A', fontSize: 12, fontWeight: '600' },
  footerWarn: { color: '#B45309', fontSize: 11, marginTop: 2 },
});
