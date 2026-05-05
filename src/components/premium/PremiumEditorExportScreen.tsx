import { memo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { PremiumBadge, PremiumScreen, PremiumSection, PremiumSegmented } from './index';

type EditorTab = 'editor' | 'export';
type ExportTarget = 'arduino' | 'esp32' | 'esphome';
type LadderComponentType = 'contact_no' | 'contact_nc' | 'coil' | 'timer';
type CanvasZoom = 'fit' | 'normal' | 'wide';

type LadderComponentDraft = {
  id: string;
  rung: number;
  type: LadderComponentType;
  tag: string;
  label: string;
  comment: string;
  preset?: string;
};

const instructionTools = [
  ['NA', 'Contato NA', 'cyan'],
  ['NF', 'Contato NF', 'cyan'],
  ['COIL', 'Bobina', 'green'],
  ['TON', 'Timer', 'amber'],
  ['CTU', 'Contador', 'purple'],
  ['+', 'Mais', 'cyan'],
] as const;

const initialComponents: LadderComponentDraft[] = [
  { id: 'r1-i00', rung: 1, type: 'contact_no', tag: 'I0.0', label: 'Start', comment: 'Condição de partida' },
  { id: 'r1-i01', rung: 1, type: 'contact_nc', tag: 'I0.1', label: 'Stop', comment: 'Parada normalmente fechada' },
  { id: 'r1-q00', rung: 1, type: 'coil', tag: 'Q0.0', label: 'Motor', comment: 'Bobina principal do motor' },
  { id: 'r2-q00-seal', rung: 2, type: 'contact_no', tag: 'Q0.0', label: 'Selo', comment: 'Contato auxiliar de retenção' },
  { id: 'r2-q00', rung: 2, type: 'coil', tag: 'Q0.0', label: 'Motor', comment: 'Mantém motor ligado' },
  { id: 'r3-t1', rung: 3, type: 'timer', tag: 'T1', label: 'Tempo didático', comment: 'Temporização de demonstração', preset: '5s' },
];

const codeSamples: Record<ExportTarget, string[]> = {
  arduino: ['// Easy-PLC: Partida com selo', 'bool I00 = digitalRead(2);', 'bool STOP = digitalRead(3);', 'Q00 = (I00 || Q00) && !STOP;', 'digitalWrite(8, Q00);'],
  esp32: ['// Easy-PLC: ESP32 GPIO map', 'const int I00 = 18;', 'const int STOP = 19;', 'const int Q00 = 23;', 'digitalWrite(Q00, latchMotor);'],
  esphome: ['switch:', '  - platform: gpio', '    pin: GPIO23', '    id: motor_q00', 'binary_sensor:', '  - platform: gpio'],
};

function targetLabel(target: ExportTarget): string {
  if (target === 'arduino') return 'Arduino';
  if (target === 'esp32') return 'ESP32';
  return 'ESPHome';
}

function componentTypeLabel(type: LadderComponentType): string {
  if (type === 'contact_no') return 'Contato NA';
  if (type === 'contact_nc') return 'Contato NF';
  if (type === 'coil') return 'Bobina';
  return 'Timer TON';
}

function componentCode(type: LadderComponentType): string {
  if (type === 'contact_no') return 'NA';
  if (type === 'contact_nc') return 'NF';
  if (type === 'coil') return 'COIL';
  return 'TON';
}

function componentTone(type: LadderComponentType): 'cyan' | 'green' | 'amber' {
  if (type === 'coil') return 'green';
  if (type === 'timer') return 'amber';
  return 'cyan';
}

function makeRungLabel(line: number): string {
  if (line === 1) return 'Condições de partida e parada';
  if (line === 2) return 'Partida com selo do motor';
  return 'Temporização didática';
}

function canvasWidthForZoom(zoom: CanvasZoom): number {
  if (zoom === 'fit') return 520;
  if (zoom === 'normal') return 640;
  return 780;
}

function zoomLabel(zoom: CanvasZoom): string {
  if (zoom === 'fit') return 'Enquadrado';
  if (zoom === 'normal') return '100%';
  return 'Amplo';
}

export const PremiumEditorExportScreen = memo(function PremiumEditorExportScreen() {
  const [tab, setTab] = useState<EditorTab>('editor');
  const [target, setTarget] = useState<ExportTarget>('esp32');
  const [components, setComponents] = useState<LadderComponentDraft[]>(initialComponents);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>('r2-q00-seal');
  const [editingComponent, setEditingComponent] = useState<LadderComponentDraft | null>(null);
  const [canvasZoom, setCanvasZoom] = useState<CanvasZoom>('fit');
  const [canvasFocus, setCanvasFocus] = useState<'all' | 'selected'>('all');
  const selectedComponent = components.find((component) => component.id === selectedComponentId) ?? null;
  const canvasWidth = canvasWidthForZoom(canvasZoom);

  function openEditor(component: LadderComponentDraft) {
    setSelectedComponentId(component.id);
    setEditingComponent({ ...component });
  }

  function saveEditingComponent() {
    if (!editingComponent) return;
    setComponents((current) => current.map((component) => component.id === editingComponent.id ? editingComponent : component));
    setSelectedComponentId(editingComponent.id);
    setEditingComponent(null);
  }

  function zoomIn() {
    setCanvasZoom((current) => current === 'fit' ? 'normal' : 'wide');
  }

  function zoomOut() {
    setCanvasZoom((current) => current === 'wide' ? 'normal' : 'fit');
  }

  function fitCanvas() {
    setCanvasZoom('fit');
    setCanvasFocus('all');
  }

  return (
    <PremiumScreen>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.eyebrow}>Editor Ladder</Text>
            <Text style={styles.title}>Partida_Selo</Text>
            <Text style={styles.subtitle}>Edite rungs no celular e exporte para bancada Arduino, ESP32 ou ESPHome.</Text>
          </View>
          <PremiumBadge label="Mobile" tone="cyan" />
        </View>
        <View style={styles.statusRow}>
          <PremiumBadge label="3 rungs" tone="green" />
          <PremiumBadge label={`${components.length} blocos`} tone="cyan" />
          <PremiumBadge label="Sem erros" tone="green" />
        </View>
      </View>

      <PremiumSegmented
        value={tab}
        onChange={setTab}
        options={[
          { value: 'editor', label: 'Editor' },
          { value: 'export', label: 'Exportar' },
        ]}
      />

      {tab === 'editor' ? (
        <>
          <PremiumSection title="Ferramentas" subtitle="Toque para inserir instruções no rung" tone="cyan">
            <View style={styles.toolGrid}>
              {instructionTools.map(([code, label, tone]) => (
                <Pressable key={code} style={[styles.toolButton, tone === 'green' && styles.toolGreen, tone === 'amber' && styles.toolAmber, tone === 'purple' && styles.toolPurple]}>
                  <Text style={styles.toolCode}>{code}</Text>
                  <Text style={styles.toolLabel}>{label}</Text>
                </Pressable>
              ))}
            </View>
          </PremiumSection>

          <PremiumSection title="Área Ladder" subtitle="Arraste lateralmente, ajuste o zoom e toque nos blocos para editar" tone="green">
            <View style={styles.editorHintBox}>
              <Text style={styles.editorHintTitle}>Interação mobile</Text>
              <Text style={styles.editorHintText}>Toque seleciona, toque novamente abre edição. Use o controle de canvas para navegar em rungs maiores.</Text>
            </View>

            <View style={styles.canvasToolbar}>
              <View style={styles.canvasToolbarCopy}>
                <Text style={styles.canvasToolbarTitle}>Canvas Ladder</Text>
                <Text style={styles.canvasToolbarText}>Zoom: {zoomLabel(canvasZoom)} • Foco: {canvasFocus === 'all' ? 'todos os rungs' : 'seleção'}</Text>
              </View>
              <View style={styles.canvasActions}>
                <Pressable onPress={zoomOut} style={styles.canvasButton}><Text style={styles.canvasButtonText}>−</Text></Pressable>
                <Pressable onPress={fitCanvas} style={styles.canvasFitButton}><Text style={styles.canvasFitText}>Enquadrar</Text></Pressable>
                <Pressable onPress={zoomIn} style={styles.canvasButton}><Text style={styles.canvasButtonText}>+</Text></Pressable>
              </View>
            </View>

            <View style={styles.canvasIndicatorBox}>
              <View style={[styles.canvasIndicatorFill, canvasZoom === 'normal' && styles.canvasIndicatorNormal, canvasZoom === 'wide' && styles.canvasIndicatorWide]} />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={[styles.ladderCanvas, { minWidth: canvasWidth }]}> 
              <ScrollView showsVerticalScrollIndicator nestedScrollEnabled contentContainerStyle={styles.ladderVerticalCanvas}>
                <View style={[styles.ladderStage, { minWidth: canvasWidth }]}> 
                  {[1, 2, 3].map((line) => {
                    const active = line === 2;
                    const rungComponents = components.filter((component) => component.rung === line);
                    const output = rungComponents.find((component) => component.type === 'coil' || component.type === 'timer');
                    return (
                      <View key={line} style={[styles.rungCard, active && styles.rungActive]}>
                        <Text style={styles.rungNumber}>{line}</Text>
                        <View style={styles.rungLogic}>
                          <View style={styles.componentRail}>
                            {rungComponents.filter((component) => component.id !== output?.id).map((component) => {
                              const selected = component.id === selectedComponentId;
                              const tone = componentTone(component.type);
                              return (
                                <Pressable
                                  key={component.id}
                                  onPress={() => selected ? openEditor(component) : (setSelectedComponentId(component.id), setCanvasFocus('selected'))}
                                  onLongPress={() => openEditor(component)}
                                  style={[
                                    styles.ladderBlock,
                                    tone === 'green' && styles.ladderBlockGreen,
                                    tone === 'amber' && styles.ladderBlockAmber,
                                    selected && styles.ladderBlockSelected,
                                  ]}
                                >
                                  <Text style={[styles.blockCode, selected && styles.blockCodeSelected]}>{componentCode(component.type)}</Text>
                                  <Text style={styles.blockTag}>{component.tag}</Text>
                                  <Text style={styles.blockLabel} numberOfLines={1}>{component.label}</Text>
                                </Pressable>
                              );
                            })}
                          </View>
                          <Text style={styles.rungComment} numberOfLines={1}>{makeRungLabel(line)}</Text>
                        </View>
                        <Pressable
                          onPress={() => output ? (output.id === selectedComponentId ? openEditor(output) : (setSelectedComponentId(output.id), setCanvasFocus('selected'))) : undefined}
                          onLongPress={() => output ? openEditor(output) : undefined}
                          style={[styles.outputBox, active && styles.outputBoxActive, output?.id === selectedComponentId && styles.outputBoxSelected]}
                        >
                          <Text style={styles.outputLabel}>Saída</Text>
                          <Text style={[styles.outputValue, active && styles.outputValueActive]}>{output?.tag ?? '—'}</Text>
                          <Text style={styles.outputSmall}>{output ? componentCode(output.type) : 'Vazio'}</Text>
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            </ScrollView>
          </PremiumSection>

          <PremiumSection title="Componente selecionado" subtitle="Preparado para edição rápida no smartphone" tone="amber">
            <View style={styles.commentBox}>
              <Text style={styles.commentTitle}>{selectedComponent ? `${componentTypeLabel(selectedComponent.type)} — ${selectedComponent.tag}` : 'Nenhum componente selecionado'}</Text>
              <Text style={styles.commentText}>{selectedComponent?.comment ?? 'Toque em um contato, bobina ou timer para selecionar.'}</Text>
            </View>
            <View style={styles.actionRow}>
              <Pressable disabled={!selectedComponent} onPress={() => selectedComponent ? openEditor(selectedComponent) : undefined} style={styles.primaryAction}><Text style={styles.primaryActionText}>Editar componente</Text></Pressable>
              <Pressable onPress={() => setCanvasFocus('selected')} style={styles.secondaryAction}><Text style={styles.secondaryActionText}>Focar seleção</Text></Pressable>
              <Pressable onPress={fitCanvas} style={styles.secondaryAction}><Text style={styles.secondaryActionText}>Enquadrar</Text></Pressable>
            </View>
          </PremiumSection>

          {editingComponent ? (
            <View style={styles.bottomSheetBackdrop}>
              <View style={styles.bottomSheet}>
                <View style={styles.sheetHandle} />
                <View style={styles.sheetHeader}>
                  <View>
                    <Text style={styles.sheetEyebrow}>Editar componente</Text>
                    <Text style={styles.sheetTitle}>{componentTypeLabel(editingComponent.type)}</Text>
                  </View>
                  <PremiumBadge label={editingComponent.tag} tone={componentTone(editingComponent.type)} />
                </View>

                <View style={styles.diffBox}>
                  <Text style={styles.diffLabel}>Valor anterior</Text>
                  <Text style={styles.diffValue}>{components.find((component) => component.id === editingComponent.id)?.tag ?? editingComponent.tag}</Text>
                  <Text style={styles.diffLabel}>Novo valor</Text>
                  <Text style={styles.diffValueNew}>{editingComponent.tag}</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Tag / endereço</Text>
                  <TextInput value={editingComponent.tag} onChangeText={(tag) => setEditingComponent({ ...editingComponent, tag })} style={styles.input} placeholderTextColor={colors.textDim} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nome / descrição curta</Text>
                  <TextInput value={editingComponent.label} onChangeText={(label) => setEditingComponent({ ...editingComponent, label })} style={styles.input} placeholderTextColor={colors.textDim} />
                </View>
                {editingComponent.type === 'timer' ? (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Preset</Text>
                    <TextInput value={editingComponent.preset} onChangeText={(preset) => setEditingComponent({ ...editingComponent, preset })} style={styles.input} placeholderTextColor={colors.textDim} />
                  </View>
                ) : null}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Comentário</Text>
                  <TextInput value={editingComponent.comment} onChangeText={(comment) => setEditingComponent({ ...editingComponent, comment })} style={[styles.input, styles.inputMultiline]} multiline placeholderTextColor={colors.textDim} />
                </View>

                <View style={styles.actionRow}>
                  <Pressable onPress={() => setEditingComponent(null)} style={styles.secondaryAction}><Text style={styles.secondaryActionText}>Cancelar</Text></Pressable>
                  <Pressable onPress={saveEditingComponent} style={styles.primaryAction}><Text style={styles.primaryActionText}>Salvar</Text></Pressable>
                </View>
              </View>
            </View>
          ) : null}
        </>
      ) : (
        <>
          <PremiumSection title="Exportar para bancada" subtitle="Gere código mantendo simulação e hardware separados" tone="cyan">
            <PremiumSegmented
              value={target}
              onChange={setTarget}
              options={[
                { value: 'arduino', label: 'Arduino' },
                { value: 'esp32', label: 'ESP32' },
                { value: 'esphome', label: 'ESPHome' },
              ]}
            />
            <View style={styles.exportSummary}>
              <View style={styles.exportMetric}><Text style={styles.exportMetricValue}>{targetLabel(target)}</Text><Text style={styles.exportMetricLabel}>alvo</Text></View>
              <View style={styles.exportMetric}><Text style={styles.exportMetricValue}>5</Text><Text style={styles.exportMetricLabel}>GPIOs</Text></View>
              <View style={styles.exportMetric}><Text style={styles.exportMetricValue}>OK</Text><Text style={styles.exportMetricLabel}>validação</Text></View>
            </View>
          </PremiumSection>

          <PremiumSection title="Validação de GPIO" subtitle="Evite pinos perigosos, reservados ou inadequados" tone="amber">
            <View style={styles.pinList}>
              <Text style={styles.pinOk}>✓ GPIO18 — Entrada I0.0</Text>
              <Text style={styles.pinOk}>✓ GPIO23 — Saída Q0.0</Text>
              <Text style={styles.pinWarn}>⚠ GPIO0 — reservado para boot, evitar em saída crítica</Text>
            </View>
          </PremiumSection>

          <PremiumSection title="Código gerado" subtitle="Preview com contraste alto" tone="green">
            <View style={styles.codeBlock}>
              {codeSamples[target].map((line) => (
                <Text key={line} style={styles.codeLine}>{line}</Text>
              ))}
            </View>
            <View style={styles.actionRow}>
              <Pressable style={styles.secondaryAction}><Text style={styles.secondaryActionText}>Copiar código</Text></Pressable>
              <Pressable style={styles.primaryAction}><Text style={styles.primaryActionText}>Exportar código</Text></Pressable>
            </View>
          </PremiumSection>
        </>
      )}
    </PremiumScreen>
  );
});

const styles = StyleSheet.create({
  hero: { borderColor: colors.borderStrong, borderWidth: 1, borderRadius: 28, padding: spacing.lg, backgroundColor: colors.surface, gap: spacing.md },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  eyebrow: { color: colors.cyan, fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.1 },
  title: { color: colors.text, fontSize: 26, lineHeight: 31, fontWeight: '900', marginTop: 2 },
  subtitle: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 4 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  toolGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  toolButton: { flexGrow: 1, flexBasis: 94, borderColor: colors.cyan, borderWidth: 1, borderRadius: 16, padding: spacing.md, backgroundColor: colors.cyanSoft },
  toolGreen: { borderColor: colors.green, backgroundColor: colors.greenSoft },
  toolAmber: { borderColor: colors.amber, backgroundColor: colors.amberSoft },
  toolPurple: { borderColor: colors.purple, backgroundColor: colors.purpleSoft },
  toolCode: { color: colors.text, fontSize: 15, fontWeight: '900' },
  toolLabel: { color: colors.textMuted, fontSize: 10, marginTop: 2, fontWeight: '800' },
  editorHintBox: { borderColor: colors.cyan, borderWidth: 1, borderRadius: 16, padding: spacing.md, backgroundColor: colors.cyanSoft },
  editorHintTitle: { color: colors.cyan, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.8 },
  editorHintText: { color: colors.text, fontSize: 11, lineHeight: 16, fontWeight: '800', marginTop: 3 },
  canvasToolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, borderColor: colors.border, borderWidth: 1, borderRadius: 18, padding: spacing.md, backgroundColor: colors.surfaceElevated },
  canvasToolbarCopy: { flex: 1, minWidth: 0 },
  canvasToolbarTitle: { color: colors.text, fontSize: 13, fontWeight: '900' },
  canvasToolbarText: { color: colors.textMuted, fontSize: 10, lineHeight: 15, fontWeight: '800', marginTop: 2 },
  canvasActions: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center' },
  canvasButton: { width: 34, height: 34, borderColor: colors.cyan, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cyanSoft },
  canvasButtonText: { color: colors.cyan, fontSize: 18, fontWeight: '900' },
  canvasFitButton: { borderColor: colors.green, borderWidth: 1, borderRadius: 12, paddingHorizontal: spacing.sm, height: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.greenSoft },
  canvasFitText: { color: colors.green, fontSize: 10, fontWeight: '900' },
  canvasIndicatorBox: { height: 8, borderRadius: 999, backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1, overflow: 'hidden' },
  canvasIndicatorFill: { height: '100%', width: '38%', borderRadius: 999, backgroundColor: colors.green },
  canvasIndicatorNormal: { width: '62%', backgroundColor: colors.cyan },
  canvasIndicatorWide: { width: '88%', backgroundColor: colors.amber },
  ladderCanvas: { paddingBottom: 4 },
  ladderVerticalCanvas: { paddingBottom: 4 },
  ladderStage: { borderColor: colors.border, borderWidth: 1, borderRadius: 20, padding: spacing.sm, backgroundColor: colors.codeBackground, gap: spacing.sm },
  rungCard: { flexDirection: 'row', alignItems: 'stretch', borderColor: colors.border, borderWidth: 1, borderRadius: 16, overflow: 'hidden', backgroundColor: colors.surfaceElevated, minHeight: 96 },
  rungActive: { borderColor: colors.green, backgroundColor: colors.greenSoft },
  rungNumber: { width: 34, color: colors.cyan, fontSize: 14, fontWeight: '900', textAlign: 'center', paddingTop: spacing.md },
  rungLogic: { flex: 1, minWidth: 0, padding: spacing.md, borderLeftColor: colors.border, borderLeftWidth: 1, borderRightColor: colors.border, borderRightWidth: 1, gap: spacing.sm },
  componentRail: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  ladderBlock: { minWidth: 96, borderColor: colors.cyan, borderWidth: 1, borderRadius: 14, padding: spacing.sm, backgroundColor: colors.cyanSoft },
  ladderBlockGreen: { borderColor: colors.green, backgroundColor: colors.greenSoft },
  ladderBlockAmber: { borderColor: colors.amber, backgroundColor: colors.amberSoft },
  ladderBlockSelected: { borderColor: colors.text, borderWidth: 2 },
  blockCode: { color: colors.cyan, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  blockCodeSelected: { color: colors.text },
  blockTag: { color: colors.text, fontFamily: 'monospace', fontSize: 13, fontWeight: '900', marginTop: 2 },
  blockLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '800', marginTop: 2 },
  rungComment: { color: colors.textMuted, fontSize: 10, marginTop: 3 },
  outputBox: { width: 96, padding: spacing.sm, backgroundColor: colors.amberSoft, justifyContent: 'center' },
  outputBoxActive: { backgroundColor: colors.greenSoft },
  outputBoxSelected: { borderColor: colors.text, borderWidth: 2 },
  outputLabel: { color: colors.amber, fontSize: 9, fontWeight: '900', textTransform: 'uppercase' },
  outputValue: { color: colors.text, fontFamily: 'monospace', fontSize: 12, fontWeight: '900', marginTop: 2 },
  outputValueActive: { color: colors.green },
  outputSmall: { color: colors.textMuted, fontSize: 10, fontWeight: '800', marginTop: 2 },
  commentBox: { borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: spacing.md, backgroundColor: colors.surfaceElevated },
  commentTitle: { color: colors.text, fontSize: 14, fontWeight: '900' },
  commentText: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  secondaryAction: { flexGrow: 1, borderColor: colors.borderStrong, borderWidth: 1, borderRadius: 14, paddingVertical: spacing.md, paddingHorizontal: spacing.md, alignItems: 'center', backgroundColor: colors.surfaceElevated },
  secondaryActionText: { color: colors.text, fontSize: 12, fontWeight: '900' },
  dangerAction: { flexGrow: 1, borderColor: colors.red, borderWidth: 1, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', backgroundColor: colors.redSoft },
  dangerActionText: { color: colors.red, fontSize: 12, fontWeight: '900' },
  primaryAction: { flexGrow: 1, borderColor: colors.green, borderWidth: 1, borderRadius: 14, paddingVertical: spacing.md, paddingHorizontal: spacing.md, alignItems: 'center', backgroundColor: colors.greenSoft },
  primaryActionText: { color: colors.green, fontSize: 12, fontWeight: '900' },
  bottomSheetBackdrop: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: spacing.md, backgroundColor: 'rgba(2, 8, 23, 0.58)' },
  bottomSheet: { borderColor: colors.borderStrong, borderWidth: 1, borderRadius: 26, padding: spacing.lg, backgroundColor: colors.surface, gap: spacing.md },
  sheetHandle: { width: 46, height: 4, borderRadius: 999, backgroundColor: colors.borderStrong, alignSelf: 'center' },
  sheetHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  sheetEyebrow: { color: colors.cyan, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.8 },
  sheetTitle: { color: colors.text, fontSize: 18, lineHeight: 23, fontWeight: '900', marginTop: 2 },
  diffBox: { borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: spacing.md, backgroundColor: colors.surfaceElevated, gap: 3 },
  diffLabel: { color: colors.textDim, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  diffValue: { color: colors.textMuted, fontSize: 12, fontFamily: 'monospace', fontWeight: '900' },
  diffValueNew: { color: colors.green, fontSize: 12, fontFamily: 'monospace', fontWeight: '900' },
  inputGroup: { gap: spacing.xs },
  inputLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  input: { borderColor: colors.border, borderWidth: 1, borderRadius: 14, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surfaceElevated, color: colors.text, fontSize: 13, fontWeight: '800' },
  inputMultiline: { minHeight: 76, textAlignVertical: 'top' },
  exportSummary: { flexDirection: 'row', gap: spacing.sm },
  exportMetric: { flex: 1, borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: spacing.md, backgroundColor: colors.surfaceElevated },
  exportMetricValue: { color: colors.green, fontSize: 16, fontWeight: '900' },
  exportMetricLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '900', marginTop: 2 },
  pinList: { gap: spacing.xs },
  pinOk: { color: colors.green, fontSize: 12, lineHeight: 18, fontWeight: '800' },
  pinWarn: { color: colors.amber, fontSize: 12, lineHeight: 18, fontWeight: '800' },
  codeBlock: { borderColor: colors.borderStrong, borderWidth: 1, borderRadius: 18, padding: spacing.md, backgroundColor: colors.codeBackground, gap: 3 },
  codeLine: { color: colors.codeText, fontFamily: 'monospace', fontSize: 11, lineHeight: 16 },
});
