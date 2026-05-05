import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { traceEditorScan } from '../engine/editorScanTrace';
import { EditorBlock, EditorProjectState } from '../engine/editorTypes';
import { PlcState } from '../engine/projectTypes';
import { EditorRuntimeState } from '../engine/runtimeTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type PlcSafetyInterlockCardProps = {
  project: EditorProjectState;
  state: PlcState;
  runtime?: EditorRuntimeState;
};

type SafetySeverity = 'ok' | 'info' | 'warn' | 'danger';

type SafetyItem = {
  id: string;
  severity: SafetySeverity;
  title: string;
  description: string;
};

function normalize(value: string | undefined): string {
  return (value ?? '').trim().toUpperCase();
}

function blockText(block: EditorBlock): string {
  const extra = block as EditorBlock & { description?: string };
  return `${block.name ?? ''} ${extra.description ?? ''} ${block.variable ?? ''}`.toLowerCase();
}

function isOutputAddress(address: string): boolean {
  const normalized = normalize(address);
  return normalized.startsWith('Q') || normalized.startsWith('O');
}

function collectBlocks(project: EditorProjectState): EditorBlock[] {
  return project.rungs.flatMap((rung) => [
    ...rung.seriesBlocks,
    ...rung.parallelBlocks,
    ...(rung.parallelBranches ?? []).flatMap((branch) => branch.blocks),
    ...(rung.coilBlock ? [rung.coilBlock] : []),
  ]);
}

function outputStateCount(state: PlcState): number {
  return Object.entries(state)
    .filter(([address]) => isOutputAddress(address))
    .filter(([, value]) => typeof value === 'number' ? value !== 0 : Boolean(value))
    .length;
}

function hasStopLikeContact(project: EditorProjectState): boolean {
  return collectBlocks(project).some((block) => (
    block.role === 'contact' && (blockText(block).includes('stop') || blockText(block).includes('emerg') || blockText(block).includes('parada'))
  ));
}

function duplicateCoilItems(project: EditorProjectState): SafetyItem[] {
  const writers = new Map<string, string[]>();

  for (const rung of project.rungs) {
    const variable = normalize(rung.coilBlock?.variable);
    if (!variable) continue;
    const current = writers.get(variable) ?? [];
    current.push(rung.label || rung.id);
    writers.set(variable, current);
  }

  return Array.from(writers.entries())
    .filter(([, rungs]) => rungs.length > 1)
    .map(([variable, rungs]) => ({
      id: `duplicate-${variable}`,
      severity: 'danger' as SafetySeverity,
      title: `Saída ${variable} comandada em mais de uma linha`,
      description: `A mesma bobina aparece em ${rungs.length} rungs: ${rungs.join(', ')}. Em CLP real isso pode gerar comportamento confuso por ordem de scan.`,
    }));
}

function openRungItems(project: EditorProjectState): SafetyItem[] {
  return project.rungs
    .filter((rung) => rung.coilBlock && rung.seriesBlocks.filter((block) => block.role === 'contact').length === 0 && (rung.parallelBranches ?? []).length === 0)
    .map((rung) => ({
      id: `open-rung-${rung.id}`,
      severity: 'warn' as SafetySeverity,
      title: `Linha ${rung.label} sem condição de entrada`,
      description: 'A bobina pode depender de uma linha sempre verdadeira. Em treinamento, vale exigir contato, intertravamento ou condição explícita.',
    }));
}

function timerCounterItems(project: EditorProjectState): SafetyItem[] {
  return project.rungs
    .filter((rung) => {
      const block = rung.coilBlock;
      if (!block) return false;
      const timerWithoutPreset = (block.role === 'timer' || block.timerMode) && !(block.presetMs && block.presetMs > 0);
      const counterWithoutPreset = (block.role === 'counter' || block.counterMode) && !(block.preset && block.preset > 0);
      return timerWithoutPreset || counterWithoutPreset;
    })
    .map((rung) => ({
      id: `preset-${rung.id}`,
      severity: 'warn' as SafetySeverity,
      title: `${rung.label} com PRE indefinido`,
      description: 'Timers e contadores didáticos devem ter preset claro para o aluno entender ACC, DN/Q e condição de atuação.',
    }));
}

function buildSafetyItems(project: EditorProjectState, state: PlcState, runtime?: EditorRuntimeState): SafetyItem[] {
  const trace = traceEditorScan(project, state, runtime);
  const activeOutputs = outputStateCount(state);
  const items: SafetyItem[] = [
    ...duplicateCoilItems(project),
    ...openRungItems(project),
    ...timerCounterItems(project),
  ];

  if (!hasStopLikeContact(project)) {
    items.push({
      id: 'no-stop-contact',
      severity: 'info',
      title: 'Nenhum contato de parada identificado',
      description: 'Para exercícios de motor, este simulador fica mais fiel quando há Stop NF, emergência ou intertravamento nomeado claramente.',
    });
  }

  if (activeOutputs > 3) {
    items.push({
      id: 'many-outputs-on',
      severity: 'warn',
      title: `${activeOutputs} saídas ligadas no mesmo scan`,
      description: 'Muitas saídas simultâneas podem ser normal em simulação, mas em bancada real merecem análise de carga, intertravamento e segurança.',
    });
  }

  if (trace.rungs.some((rung) => rung.activeBranchIds.length > 0)) {
    items.push({
      id: 'parallel-active',
      severity: 'info',
      title: 'Branch paralelo ativo no scan',
      description: 'Há lógica OR/selo conduzindo a linha. Confira se o contato de retenção deve ser interrompido por Stop ou proteção.',
    });
  }

  if (items.length === 0) {
    items.push({
      id: 'safety-ok',
      severity: 'ok',
      title: 'Sem alertas básicos de intertravamento',
      description: 'A lógica não apresentou duplicidade de bobina, linha sem condição ou preset ausente nesta verificação didática.',
    });
  }

  return items;
}

function severityLabel(severity: SafetySeverity): string {
  if (severity === 'danger') return 'Crítico';
  if (severity === 'warn') return 'Atenção';
  if (severity === 'info') return 'Info';
  return 'OK';
}

function severityScore(severity: SafetySeverity): number {
  if (severity === 'danger') return 4;
  if (severity === 'warn') return 3;
  if (severity === 'info') return 2;
  return 1;
}

export const PlcSafetyInterlockCard = memo(function PlcSafetyInterlockCard({ project, state, runtime }: PlcSafetyInterlockCardProps) {
  const items = useMemo(() => buildSafetyItems(project, state, runtime), [project, runtime, state]);
  const highest = items.reduce<SafetySeverity>((current, item) => severityScore(item.severity) > severityScore(current) ? item.severity : current, 'ok');

  return (
    <View style={[styles.card, highest === 'danger' && styles.cardDanger, highest === 'warn' && styles.cardWarn, highest === 'ok' && styles.cardOk]}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Safety / Interlock</Text>
          <Text style={styles.title}>Verificação didática de segurança</Text>
        </View>
        <View style={[styles.statusPill, highest === 'danger' && styles.statusPillDanger, highest === 'warn' && styles.statusPillWarn, highest === 'ok' && styles.statusPillOk]}>
          <Text style={[styles.statusText, highest === 'danger' && styles.statusTextDanger, highest === 'warn' && styles.statusTextWarn, highest === 'ok' && styles.statusTextOk]}>{severityLabel(highest)}</Text>
        </View>
      </View>

      <View style={styles.itemStack}>
        {items.slice(0, 6).map((item) => (
          <View key={item.id} style={[styles.itemCard, item.severity === 'danger' && styles.itemDanger, item.severity === 'warn' && styles.itemWarn, item.severity === 'ok' && styles.itemOk]}>
            <View style={styles.itemHeader}>
              <Text style={[styles.itemSeverity, item.severity === 'danger' && styles.textDanger, item.severity === 'warn' && styles.textWarn, item.severity === 'ok' && styles.textOk]}>{severityLabel(item.severity)}</Text>
              <Text style={styles.itemTitle}>{item.title}</Text>
            </View>
            <Text style={styles.itemDescription}>{item.description}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.explanation}>Esta análise é didática: ela não substitui norma, projeto elétrico ou validação de segurança real, mas ajuda o aluno a pensar como técnico de automação.</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 20,
    padding: spacing.md,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  cardDanger: {
    borderColor: colors.red,
    backgroundColor: colors.redSoft,
  },
  cardWarn: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
  },
  cardOk: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: colors.amber,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  statusPill: {
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    backgroundColor: colors.surface,
  },
  statusPillDanger: {
    borderColor: colors.red,
    backgroundColor: colors.redSoft,
  },
  statusPillWarn: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
  },
  statusPillOk: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  statusText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  statusTextDanger: {
    color: colors.red,
  },
  statusTextWarn: {
    color: colors.amber,
  },
  statusTextOk: {
    color: colors.green,
  },
  itemStack: {
    gap: spacing.xs,
  },
  itemCard: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    gap: 3,
  },
  itemDanger: {
    borderColor: colors.red,
    backgroundColor: colors.redSoft,
  },
  itemWarn: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
  },
  itemOk: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  itemSeverity: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  textDanger: {
    color: colors.red,
  },
  textWarn: {
    color: colors.amber,
  },
  textOk: {
    color: colors.green,
  },
  itemTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  itemDescription: {
    color: colors.text,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  explanation: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },
});
