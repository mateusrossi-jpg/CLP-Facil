import { memo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { PremiumBadge, PremiumScreen, PremiumSection, PremiumSegmented } from './index';

type EditorTab = 'editor' | 'export';
type ExportTarget = 'arduino' | 'esp32' | 'esphome';

const instructionTools = [
  ['NA', 'Contato NA', 'cyan'],
  ['NF', 'Contato NF', 'cyan'],
  ['COIL', 'Bobina', 'green'],
  ['TON', 'Timer', 'amber'],
  ['CTU', 'Contador', 'purple'],
  ['+', 'Mais', 'cyan'],
] as const;

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

export const PremiumEditorExportScreen = memo(function PremiumEditorExportScreen() {
  const [tab, setTab] = useState<EditorTab>('editor');
  const [target, setTarget] = useState<ExportTarget>('esp32');

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
          <PremiumBadge label="5 tags" tone="cyan" />
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

          <PremiumSection title="Área Ladder" subtitle="Rungs compactos com saída sempre visível" tone="green">
            <View style={styles.ladderStage}>
              {[1, 2, 3].map((line) => {
                const active = line === 2;
                return (
                  <View key={line} style={[styles.rungCard, active && styles.rungActive]}>
                    <Text style={styles.rungNumber}>{line}</Text>
                    <View style={styles.rungLogic}>
                      <Text style={[styles.rungCode, active && styles.rungCodeActive]} numberOfLines={1}>
                        {line === 1 ? 'NA I0.0  •  NF I0.1' : line === 2 ? 'NA Q0.0  •  Selo' : 'TON T1  •  5s'}
                      </Text>
                      <Text style={styles.rungComment} numberOfLines={1}>
                        {line === 1 ? 'Condições de partida e parada' : line === 2 ? 'Partida com selo do motor' : 'Temporização didática'}
                      </Text>
                    </View>
                    <View style={[styles.outputBox, active && styles.outputBoxActive]}>
                      <Text style={styles.outputLabel}>Saída</Text>
                      <Text style={[styles.outputValue, active && styles.outputValueActive]}>{line === 3 ? 'T1' : 'Q0.0'}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </PremiumSection>

          <PremiumSection title="Comentário do rung" subtitle="Explicação didática para estudo e revisão" tone="amber">
            <View style={styles.commentBox}>
              <Text style={styles.commentTitle}>Linha 2 — Selo</Text>
              <Text style={styles.commentText}>Quando I0.0 liga a bobina Q0.0, o contato auxiliar Q0.0 mantém o motor acionado até o STOP abrir o circuito.</Text>
            </View>
            <View style={styles.actionRow}>
              <Pressable style={styles.secondaryAction}><Text style={styles.secondaryActionText}>Desfazer</Text></Pressable>
              <Pressable style={styles.secondaryAction}><Text style={styles.secondaryActionText}>Refazer</Text></Pressable>
              <Pressable style={styles.dangerAction}><Text style={styles.dangerActionText}>Excluir rung</Text></Pressable>
            </View>
          </PremiumSection>
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
  ladderStage: { borderColor: colors.border, borderWidth: 1, borderRadius: 20, padding: spacing.sm, backgroundColor: colors.codeBackground, gap: spacing.sm },
  rungCard: { flexDirection: 'row', alignItems: 'stretch', borderColor: colors.border, borderWidth: 1, borderRadius: 16, overflow: 'hidden', backgroundColor: colors.surfaceElevated },
  rungActive: { borderColor: colors.green, backgroundColor: colors.greenSoft },
  rungNumber: { width: 34, color: colors.cyan, fontSize: 14, fontWeight: '900', textAlign: 'center', paddingTop: spacing.md },
  rungLogic: { flex: 1, minWidth: 0, padding: spacing.md, borderLeftColor: colors.border, borderLeftWidth: 1, borderRightColor: colors.border, borderRightWidth: 1 },
  rungCode: { color: colors.text, fontFamily: 'monospace', fontSize: 12, fontWeight: '900' },
  rungCodeActive: { color: colors.green },
  rungComment: { color: colors.textMuted, fontSize: 10, marginTop: 3 },
  outputBox: { width: 86, padding: spacing.sm, backgroundColor: colors.amberSoft, justifyContent: 'center' },
  outputBoxActive: { backgroundColor: colors.greenSoft },
  outputLabel: { color: colors.amber, fontSize: 9, fontWeight: '900', textTransform: 'uppercase' },
  outputValue: { color: colors.text, fontFamily: 'monospace', fontSize: 12, fontWeight: '900', marginTop: 2 },
  outputValueActive: { color: colors.green },
  commentBox: { borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: spacing.md, backgroundColor: colors.surfaceElevated },
  commentTitle: { color: colors.text, fontSize: 14, fontWeight: '900' },
  commentText: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  secondaryAction: { flexGrow: 1, borderColor: colors.borderStrong, borderWidth: 1, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', backgroundColor: colors.surfaceElevated },
  secondaryActionText: { color: colors.text, fontSize: 12, fontWeight: '900' },
  dangerAction: { flexGrow: 1, borderColor: colors.red, borderWidth: 1, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', backgroundColor: colors.redSoft },
  dangerActionText: { color: colors.red, fontSize: 12, fontWeight: '900' },
  exportSummary: { flexDirection: 'row', gap: spacing.sm },
  exportMetric: { flex: 1, borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: spacing.md, backgroundColor: colors.surfaceElevated },
  exportMetricValue: { color: colors.green, fontSize: 16, fontWeight: '900' },
  exportMetricLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '900', marginTop: 2 },
  pinList: { gap: spacing.xs },
  pinOk: { color: colors.green, fontSize: 12, lineHeight: 18, fontWeight: '800' },
  pinWarn: { color: colors.amber, fontSize: 12, lineHeight: 18, fontWeight: '800' },
  codeBlock: { borderColor: colors.borderStrong, borderWidth: 1, borderRadius: 18, padding: spacing.md, backgroundColor: colors.codeBackground, gap: 3 },
  codeLine: { color: colors.codeText, fontFamily: 'monospace', fontSize: 11, lineHeight: 16 },
  primaryAction: { flexGrow: 1, borderColor: colors.green, borderWidth: 1, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', backgroundColor: colors.greenSoft },
  primaryActionText: { color: colors.green, fontSize: 12, fontWeight: '900' },
});
