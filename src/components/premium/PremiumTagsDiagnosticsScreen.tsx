import { memo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { PremiumBadge, PremiumMetric, PremiumScreen, PremiumSection, PremiumSegmented } from './index';

type TagTab = 'inputs' | 'outputs' | 'memories' | 'timers' | 'counters';
type ForceMode = 'Normal' | 'Force ON' | 'Force OFF';

type TagRow = {
  tag: string;
  type: string;
  scope: string;
  value: string;
  description: string;
  force: ForceMode;
};

const rows: Record<TagTab, TagRow[]> = {
  inputs: [
    { tag: 'I0.0', type: 'BOOL', scope: 'Entrada', value: 'ON', description: 'Botão de partida', force: 'Normal' },
    { tag: 'I0.1', type: 'BOOL', scope: 'Entrada', value: 'OFF', description: 'Botão de parada NF', force: 'Normal' },
    { tag: 'I0.2', type: 'BOOL', scope: 'Entrada', value: 'OFF', description: 'Sensor de proteção', force: 'Force OFF' },
  ],
  outputs: [
    { tag: 'Q0.0', type: 'BOOL', scope: 'Saída', value: 'ON', description: 'Contator motor K1', force: 'Normal' },
    { tag: 'Q0.1', type: 'BOOL', scope: 'Saída', value: 'OFF', description: 'Sinaleiro verde', force: 'Normal' },
    { tag: 'Q0.2', type: 'BOOL', scope: 'Saída', value: 'OFF', description: 'Alarme', force: 'Normal' },
  ],
  memories: [
    { tag: 'M0.0', type: 'BOOL', scope: 'Memória', value: 'ON', description: 'Selo do motor', force: 'Force ON' },
    { tag: 'M0.1', type: 'BOOL', scope: 'Memória', value: 'OFF', description: 'Intertravamento', force: 'Normal' },
  ],
  timers: [
    { tag: 'T1', type: 'TON', scope: 'Timer', value: '3.2s', description: 'Retardo de partida', force: 'Normal' },
    { tag: 'T2', type: 'TOF', scope: 'Timer', value: '0.0s', description: 'Retardo de desligamento', force: 'Normal' },
  ],
  counters: [
    { tag: 'C1', type: 'CTU', scope: 'Contador', value: '7/10', description: 'Peças detectadas', force: 'Normal' },
    { tag: 'C2', type: 'CTD', scope: 'Contador', value: '2/5', description: 'Ciclos restantes', force: 'Normal' },
  ],
};

function forceTone(force: ForceMode): 'green' | 'amber' | 'red' | 'neutral' {
  if (force === 'Force ON') return 'green';
  if (force === 'Force OFF') return 'red';
  return 'neutral';
}

function activeRows(tab: TagTab): number {
  return rows[tab].filter((row) => row.value === 'ON' || row.value.includes('/')).length;
}

export const PremiumTagsDiagnosticsScreen = memo(function PremiumTagsDiagnosticsScreen() {
  const [tab, setTab] = useState<TagTab>('inputs');
  const selectedRows = rows[tab];
  const forcedCount = Object.values(rows).flat().filter((row) => row.force !== 'Normal').length;

  return (
    <PremiumScreen>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>Tags e Diagnóstico</Text>
            <Text style={styles.title}>Tabela estilo CLP</Text>
            <Text style={styles.subtitle}>Monitore tags, Force didático, timers, contadores e eventos do scan em uma visão profissional.</Text>
          </View>
          <PremiumBadge label="RUN" tone="green" />
        </View>
        <View style={styles.metricRow}>
          <PremiumMetric label="Scan" value="12 ms" hint="último ciclo" tone="green" />
          <PremiumMetric label="Linha" value="2" hint="ativa" tone="cyan" />
          <PremiumMetric label="Forces" value={forcedCount} hint="didáticos" tone="amber" />
        </View>
      </View>

      <PremiumSection title="Alerta de segurança" subtitle="Force deve ser usado apenas para estudo e diagnóstico supervisionado" tone="amber">
        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>Force didático ativo</Text>
          <Text style={styles.warningText}>Há sinais forçados nesta simulação. Em CLPs reais, forçar entradas ou saídas pode movimentar máquinas e gerar risco ao operador.</Text>
        </View>
      </PremiumSection>

      <PremiumSegmented
        value={tab}
        onChange={setTab}
        options={[
          { value: 'inputs', label: 'Entradas' },
          { value: 'outputs', label: 'Saídas' },
          { value: 'memories', label: 'Mem.' },
          { value: 'timers', label: 'Timers' },
          { value: 'counters', label: 'Cont.' },
        ]}
      />

      <PremiumSection title="Tabela de tags" subtitle={`${activeRows(tab)} sinais ativos nesta seção`} tone="cyan">
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, styles.tagCell]}>Tag</Text>
          <Text style={[styles.headerCell, styles.valueCell]}>Valor</Text>
          <Text style={[styles.headerCell, styles.forceCell]}>Force</Text>
        </View>
        <View style={styles.tableBody}>
          {selectedRows.map((row) => {
            const active = row.value === 'ON' || row.value.includes('/');
            return (
              <View key={row.tag} style={[styles.tagRow, active && styles.tagRowActive]}>
                <View style={styles.tagInfo}>
                  <View style={styles.tagLine}>
                    <Text style={[styles.tagName, active && styles.tagNameActive]}>{row.tag}</Text>
                    <Text style={styles.tagType}>{row.type}</Text>
                  </View>
                  <Text style={styles.tagDescription} numberOfLines={1}>{row.scope} • {row.description}</Text>
                </View>
                <Text style={[styles.valueText, active && styles.valueTextActive]}>{row.value}</Text>
                <PremiumBadge label={row.force} tone={forceTone(row.force)} />
              </View>
            );
          })}
        </View>
      </PremiumSection>

      <PremiumSection title="Diagnóstico do scan" subtitle="Eventos recentes da execução" tone="green">
        <View style={styles.diagnosticDock}>
          <View style={styles.diagnosticCell}>
            <Text style={styles.diagnosticLabel}>Linha ativa</Text>
            <Text style={styles.diagnosticValue}>2</Text>
          </View>
          <View style={styles.diagnosticCellMain}>
            <Text style={styles.diagnosticLabel}>Saída ativa</Text>
            <Text style={styles.diagnosticValue}>Q0.0 ON</Text>
          </View>
          <View style={styles.diagnosticCell}>
            <Text style={styles.diagnosticLabel}>Scan</Text>
            <Text style={styles.diagnosticValue}>124</Text>
          </View>
        </View>

        <View style={styles.eventList}>
          {[
            ['12 ms', 'Linha 2 verdadeira: selo mantém Q0.0 energizada.'],
            ['11 ms', 'I0.0 reconhecido como ON no início do ciclo.'],
            ['10 ms', 'Force OFF aplicado em I0.2 para simulação segura.'],
          ].map(([time, event]) => (
            <View key={time + event} style={styles.eventRow}>
              <Text style={styles.eventTime}>{time}</Text>
              <Text style={styles.eventText}>{event}</Text>
            </View>
          ))}
        </View>
      </PremiumSection>

      <PremiumSection title="Ações rápidas" subtitle="Ferramentas de análise" tone="purple">
        <View style={styles.actionRow}>
          <Pressable style={styles.actionButton}><Text style={styles.actionText}>Limpar forces</Text></Pressable>
          <Pressable style={styles.actionButton}><Text style={styles.actionText}>Exportar log</Text></Pressable>
          <Pressable style={styles.primaryAction}><Text style={styles.primaryActionText}>Abrir simulação</Text></Pressable>
        </View>
      </PremiumSection>
    </PremiumScreen>
  );
});

const styles = StyleSheet.create({
  hero: { borderColor: colors.borderStrong, borderWidth: 1, borderRadius: 28, padding: spacing.lg, backgroundColor: colors.surface, gap: spacing.md },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.md },
  heroCopy: { flex: 1, minWidth: 0 },
  eyebrow: { color: colors.cyan, fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.1 },
  title: { color: colors.text, fontSize: 26, lineHeight: 31, fontWeight: '900', marginTop: 2 },
  subtitle: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 4 },
  metricRow: { flexDirection: 'row', gap: spacing.sm },
  warningBox: { borderColor: colors.amber, borderWidth: 1, borderRadius: 18, padding: spacing.md, backgroundColor: colors.amberSoft },
  warningTitle: { color: colors.amber, fontSize: 13, fontWeight: '900' },
  warningText: { color: colors.text, fontSize: 12, lineHeight: 18, marginTop: 4, fontWeight: '700' },
  tableHeader: { flexDirection: 'row', paddingHorizontal: spacing.sm, gap: spacing.sm },
  headerCell: { color: colors.textDim, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  tagCell: { flex: 1 },
  valueCell: { width: 56, textAlign: 'center' },
  forceCell: { width: 86, textAlign: 'center' },
  tableBody: { gap: spacing.xs },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: spacing.sm, backgroundColor: colors.surfaceElevated },
  tagRowActive: { borderColor: colors.green, backgroundColor: colors.greenSoft },
  tagInfo: { flex: 1, minWidth: 0 },
  tagLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  tagName: { color: colors.text, fontFamily: 'monospace', fontSize: 13, fontWeight: '900' },
  tagNameActive: { color: colors.green },
  tagType: { color: colors.textDim, fontSize: 10, fontWeight: '900' },
  tagDescription: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  valueText: { width: 56, color: colors.textMuted, fontFamily: 'monospace', fontSize: 12, fontWeight: '900', textAlign: 'center' },
  valueTextActive: { color: colors.green },
  diagnosticDock: { flexDirection: 'row', borderColor: colors.border, borderWidth: 1, borderRadius: 18, overflow: 'hidden', backgroundColor: colors.surfaceElevated },
  diagnosticCell: { flex: 1, padding: spacing.md },
  diagnosticCellMain: { flex: 1.35, padding: spacing.md, borderLeftColor: colors.border, borderLeftWidth: 1, borderRightColor: colors.border, borderRightWidth: 1 },
  diagnosticLabel: { color: colors.textDim, fontSize: 9, fontWeight: '900', textTransform: 'uppercase' },
  diagnosticValue: { color: colors.green, fontSize: 13, fontWeight: '900', marginTop: 3 },
  eventList: { gap: spacing.xs },
  eventRow: { flexDirection: 'row', gap: spacing.sm, borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: spacing.sm, backgroundColor: colors.surfaceElevated },
  eventTime: { color: colors.cyan, fontFamily: 'monospace', fontSize: 11, fontWeight: '900', width: 46 },
  eventText: { flex: 1, color: colors.textMuted, fontSize: 11, lineHeight: 16 },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actionButton: { flexGrow: 1, borderColor: colors.borderStrong, borderWidth: 1, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', backgroundColor: colors.surfaceElevated },
  actionText: { color: colors.text, fontSize: 12, fontWeight: '900' },
  primaryAction: { flexGrow: 1, borderColor: colors.green, borderWidth: 1, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', backgroundColor: colors.greenSoft },
  primaryActionText: { color: colors.green, fontSize: 12, fontWeight: '900' },
});
