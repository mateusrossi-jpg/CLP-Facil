import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EditorBlock, EditorProjectState } from '../engine/editorTypes';
import { EditorEvaluationResult } from '../engine/editorEvaluator';
import { PlcState } from '../engine/projectTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type PlcCommissioningChecklistCardProps = {
  project: EditorProjectState;
  state: PlcState;
  evaluation: EditorEvaluationResult;
};

type ChecklistStatus = 'done' | 'attention' | 'pending';

type ChecklistItem = {
  id: string;
  title: string;
  description: string;
  status: ChecklistStatus;
};

function normalize(value: string | undefined): string {
  return (value ?? '').trim().toUpperCase();
}

function blockText(block: EditorBlock): string {
  const extra = block as EditorBlock & { description?: string };
  return `${block.name ?? ''} ${extra.description ?? ''} ${block.variable ?? ''}`.toLowerCase();
}

function collectBlocks(project: EditorProjectState): EditorBlock[] {
  return project.rungs.flatMap((rung) => [
    ...rung.seriesBlocks,
    ...rung.parallelBlocks,
    ...(rung.parallelBranches ?? []).flatMap((branch) => branch.blocks),
    ...(rung.coilBlock ? [rung.coilBlock] : []),
  ]);
}

function activeOutputCount(state: PlcState): number {
  return Object.entries(state)
    .filter(([address]) => {
      const normalized = normalize(address);
      return normalized.startsWith('Q') || normalized.startsWith('O');
    })
    .filter(([, value]) => typeof value === 'number' ? value !== 0 : Boolean(value))
    .length;
}

function hasStopLikeContact(project: EditorProjectState): boolean {
  return collectBlocks(project).some((block) => {
    const text = blockText(block);
    return block.role === 'contact' && (text.includes('stop') || text.includes('parada') || text.includes('emerg'));
  });
}

function hasStartLikeContact(project: EditorProjectState): boolean {
  return collectBlocks(project).some((block) => {
    const text = blockText(block);
    return block.role === 'contact' && (text.includes('start') || text.includes('liga') || text.includes('partida'));
  });
}

function hasOutputCoil(project: EditorProjectState): boolean {
  return project.rungs.some((rung) => {
    const variable = normalize(rung.coilBlock?.variable);
    return variable.startsWith('Q') || variable.startsWith('O');
  });
}

function hasTimerOrCounter(project: EditorProjectState): boolean {
  return project.rungs.some((rung) => {
    const block = rung.coilBlock;
    return Boolean(block && (block.role === 'timer' || block.role === 'counter' || block.timerMode || block.counterMode));
  });
}

function hasAnyParallelBranch(project: EditorProjectState): boolean {
  return project.rungs.some((rung) => (rung.parallelBranches ?? []).length > 0 || rung.parallelBlocks.length > 0);
}

function duplicateCoilCount(project: EditorProjectState): number {
  const writers = new Map<string, number>();
  for (const rung of project.rungs) {
    const variable = normalize(rung.coilBlock?.variable);
    if (!variable) continue;
    writers.set(variable, (writers.get(variable) ?? 0) + 1);
  }
  return Array.from(writers.values()).filter((count) => count > 1).length;
}

function buildChecklist(project: EditorProjectState, state: PlcState, evaluation: EditorEvaluationResult): ChecklistItem[] {
  const diagnostics = evaluation.diagnostics?.length ?? 0;
  const outputsOn = activeOutputCount(state);
  const duplicateCoils = duplicateCoilCount(project);
  const hasRungs = project.rungs.length > 0;
  const hasStart = hasStartLikeContact(project);
  const hasStop = hasStopLikeContact(project);

  return [
    {
      id: 'program-loaded',
      title: 'Programa carregado',
      description: hasRungs ? `${project.rungs.length} linha(s) ladder pronta(s) para teste.` : 'Crie pelo menos uma linha ladder antes de comissionar.',
      status: hasRungs ? 'done' : 'pending',
    },
    {
      id: 'start-stop-logic',
      title: 'Partida e parada identificadas',
      description: hasStart && hasStop
        ? 'A lógica possui elementos nomeados de partida e parada/emergência.'
        : 'Nomeie claramente Start/Liga/Partida e Stop/Parada/Emergência para melhorar o treino.',
      status: hasStart && hasStop ? 'done' : 'attention',
    },
    {
      id: 'outputs-safe',
      title: 'Saídas em condição observável',
      description: outputsOn > 0 ? `${outputsOn} saída(s) ligada(s) neste scan. Confirme se isso era esperado.` : 'Nenhuma saída ativa neste scan.',
      status: outputsOn > 0 ? 'attention' : 'done',
    },
    {
      id: 'coils-unique',
      title: 'Bobinas sem duplicidade crítica',
      description: duplicateCoils > 0 ? `${duplicateCoils} endereço(s) de bobina aparecem em mais de uma linha.` : 'Nenhuma duplicidade básica de bobina foi detectada.',
      status: duplicateCoils > 0 ? 'attention' : 'done',
    },
    {
      id: 'output-coil-present',
      title: 'Atuador/saída definido',
      description: hasOutputCoil(project) ? 'O programa possui pelo menos uma bobina de saída Q/O.' : 'Adicione uma saída Q/O para testar atuação realista.',
      status: hasOutputCoil(project) ? 'done' : 'pending',
    },
    {
      id: 'advanced-instructions',
      title: 'Recursos avançados mapeados',
      description: hasTimerOrCounter(project) || hasAnyParallelBranch(project)
        ? 'Há timer/contador ou branch paralelo para observar no comissionamento.'
        : 'Para exercícios avançados, adicione temporizador, contador ou selo/branch paralelo.',
      status: hasTimerOrCounter(project) || hasAnyParallelBranch(project) ? 'done' : 'attention',
    },
    {
      id: 'diagnostics-clear',
      title: 'Diagnósticos revisados',
      description: diagnostics > 0 ? `${diagnostics} diagnóstico(s) ativo(s). Revise antes de considerar o teste aprovado.` : 'Sem diagnósticos ativos neste scan.',
      status: diagnostics > 0 ? 'attention' : 'done',
    },
  ];
}

function statusLabel(status: ChecklistStatus): string {
  if (status === 'done') return 'OK';
  if (status === 'attention') return 'Atenção';
  return 'Pendente';
}

function scoreFromItems(items: ChecklistItem[]): number {
  if (items.length === 0) return 0;
  const done = items.filter((item) => item.status === 'done').length;
  return Math.round((done / items.length) * 100);
}

export const PlcCommissioningChecklistCard = memo(function PlcCommissioningChecklistCard({ project, state, evaluation }: PlcCommissioningChecklistCardProps) {
  const items = useMemo(() => buildChecklist(project, state, evaluation), [evaluation, project, state]);
  const score = scoreFromItems(items);
  const attentionCount = items.filter((item) => item.status !== 'done').length;

  return (
    <View style={[styles.card, attentionCount > 0 && styles.cardAttention]}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Comissionamento guiado</Text>
          <Text style={styles.title}>Checklist de teste do programa</Text>
        </View>
        <View style={[styles.scorePill, score >= 85 && styles.scorePillOk]}>
          <Text style={styles.scoreLabel}>Pronto</Text>
          <Text style={[styles.scoreValue, score >= 85 && styles.scoreValueOk]}>{score}%</Text>
        </View>
      </View>

      <View style={styles.itemStack}>
        {items.map((item) => (
          <View key={item.id} style={[styles.itemCard, item.status === 'done' && styles.itemDone, item.status === 'attention' && styles.itemAttention]}>
            <View style={styles.itemHeader}>
              <View style={[styles.statusDot, item.status === 'done' && styles.statusDotDone, item.status === 'attention' && styles.statusDotAttention]} />
              <Text style={[styles.itemStatus, item.status === 'done' && styles.itemStatusDone, item.status === 'attention' && styles.itemStatusAttention]}>{statusLabel(item.status)}</Text>
              <Text style={styles.itemTitle}>{item.title}</Text>
            </View>
            <Text style={styles.itemDescription}>{item.description}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.explanation}>Use este checklist como roteiro de bancada: primeiro valide segurança e nomes, depois entradas, saídas, timers, selo e diagnósticos.</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderColor: colors.green,
    borderWidth: 1,
    borderRadius: 20,
    padding: spacing.md,
    backgroundColor: colors.greenSoft,
    gap: spacing.sm,
  },
  cardAttention: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
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
    color: colors.green,
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
  scorePill: {
    borderColor: colors.amber,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  scorePillOk: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  scoreLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  scoreValue: {
    color: colors.amber,
    fontSize: 16,
    fontWeight: '900',
  },
  scoreValueOk: {
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
  itemDone: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  itemAttention: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    borderColor: colors.textDim,
    borderWidth: 1,
  },
  statusDotDone: {
    borderColor: colors.green,
    backgroundColor: colors.green,
  },
  statusDotAttention: {
    borderColor: colors.amber,
    backgroundColor: colors.amber,
  },
  itemStatus: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  itemStatusDone: {
    color: colors.green,
  },
  itemStatusAttention: {
    color: colors.amber,
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
