import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EditorBlock, EditorProjectState } from '../engine/editorTypes';
import { EditorEvaluationResult } from '../engine/editorEvaluator';
import { PlcState } from '../engine/projectTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type PlcBenchTestPlanCardProps = {
  project: EditorProjectState;
  state: PlcState;
  evaluation: EditorEvaluationResult;
};

type TestStepStatus = 'ready' | 'observe' | 'attention';

type TestStep = {
  id: string;
  title: string;
  action: string;
  expected: string;
  status: TestStepStatus;
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

function hasContactTerm(project: EditorProjectState, terms: string[]): boolean {
  return collectBlocks(project).some((block) => block.role === 'contact' && terms.some((term) => blockText(block).includes(term)));
}

function hasTimerOrCounter(project: EditorProjectState): boolean {
  return project.rungs.some((rung) => {
    const block = rung.coilBlock;
    return Boolean(block && (block.role === 'timer' || block.role === 'counter' || block.timerMode || block.counterMode));
  });
}

function hasParallel(project: EditorProjectState): boolean {
  return project.rungs.some((rung) => (rung.parallelBranches ?? []).length > 0 || rung.parallelBlocks.length > 0);
}

function outputAddresses(project: EditorProjectState): string[] {
  return project.rungs
    .map((rung) => normalize(rung.coilBlock?.variable))
    .filter((variable) => variable.startsWith('Q') || variable.startsWith('O'))
    .filter((value, index, list) => list.indexOf(value) === index)
    .slice(0, 4);
}

function activeOutputs(state: PlcState): string[] {
  return Object.entries(state)
    .filter(([address, value]) => {
      const normalized = normalize(address);
      const active = typeof value === 'number' ? value !== 0 : Boolean(value);
      return (normalized.startsWith('Q') || normalized.startsWith('O')) && active;
    })
    .map(([address]) => normalize(address))
    .sort((left, right) => left.localeCompare(right))
    .slice(0, 4);
}

function buildPlan(project: EditorProjectState, state: PlcState, evaluation: EditorEvaluationResult): TestStep[] {
  const diagnostics = evaluation.diagnostics?.length ?? 0;
  const hasStart = hasContactTerm(project, ['start', 'liga', 'partida']);
  const hasStop = hasContactTerm(project, ['stop', 'parada', 'emerg']);
  const outputs = outputAddresses(project);
  const outputsOn = activeOutputs(state);
  const energizedRungs = Object.values(evaluation.rungResults ?? {}).filter(Boolean).length;
  const advanced = hasTimerOrCounter(project);
  const parallel = hasParallel(project);
  const readyForBench = hasStart && hasStop && outputs.length > 0 && diagnostics === 0;

  const steps: TestStep[] = [
    {
      id: 'prepare',
      title: '1. Preparar bancada virtual',
      action: 'Deixe entradas em repouso, remova forces e execute um scan manual.',
      expected: diagnostics > 0 ? 'Revise os diagnósticos antes de confiar no teste.' : 'Sem diagnóstico crítico antes de iniciar.',
      status: diagnostics > 0 ? 'attention' : 'ready',
    },
    {
      id: 'start',
      title: '2. Testar partida',
      action: hasStart ? 'Mantenha Stop em condição segura, acione Start/Liga/Partida e execute o scan.' : 'Nomeie ou adicione uma entrada de partida antes deste teste.',
      expected: outputs.length > 0 ? `A lógica deve conduzir até ${outputs.join(', ')} somente quando as permissões forem verdadeiras.` : 'Uma bobina Q/O deve existir para observar atuação.',
      status: hasStart && outputs.length > 0 ? 'observe' : 'attention',
    },
    {
      id: 'output',
      title: '3. Validar saída/atuador',
      action: outputs.length > 0 ? `Observe ${outputs.join(', ')} na Imagem de Processo, Watch Table e Fluxo do Rung.` : 'Adicione uma saída Q/O antes de validar atuador.',
      expected: outputsOn.length > 0 ? `${outputsOn.join(', ')} está ON neste scan; confirme se era esperado.` : 'A saída deve ligar apenas quando todas as condições forem verdadeiras.',
      status: outputsOn.length > 0 ? 'observe' : outputs.length > 0 ? 'ready' : 'attention',
    },
    {
      id: 'stop',
      title: '4. Testar parada/intertravamento',
      action: hasStop ? 'Acione Stop/Parada/Emergência e execute novo scan.' : 'Adicione ou nomeie um Stop/Parada/Emergência para validar segurança.',
      expected: outputs.length > 0 ? `${outputs.join(', ')} deve desligar; selo ou timer não pode manter a saída após Stop.` : 'Sem saída Q/O, não há como provar a parada.',
      status: hasStop ? 'observe' : 'attention',
    },
    {
      id: 'seal',
      title: '5. Verificar selo ou branch paralelo',
      action: parallel ? 'Depois da partida, solte Start e veja se o branch de retenção mantém a lógica conforme o esperado.' : 'Inclua um branch paralelo/selo quando o exercício pedir retenção.',
      expected: parallel ? 'O selo deve manter apenas com permissivos verdadeiros e cair ao acionar Stop.' : 'Sem branch paralelo, trate o exercício como comando simples.',
      status: parallel ? 'observe' : 'attention',
    },
    {
      id: 'advanced',
      title: '6. Testar timer/contador',
      action: advanced ? 'Acompanhe PRE, ACC e DN/Q no Monitor T/C durante scans sucessivos.' : 'Adicione TON/CTU para praticar comportamento temporal ou por pulsos.',
      expected: advanced ? 'ACC deve evoluir e DN/Q deve mudar somente quando a condição for atingida.' : 'Timer/contador é opcional, mas aumenta o nível da prática.',
      status: advanced ? 'observe' : 'attention',
    },
    {
      id: 'final-diagnostics',
      title: '7. Revisar conclusão do teste',
      action: 'Abra Relatório, Rubrica e Trace textual depois dos testes.',
      expected: readyForBench && energizedRungs > 0 ? 'Teste pronto para apresentação didática: há Start, Stop, saída e diagnóstico limpo.' : 'Antes de concluir, resolva pendências de I/O, Stop ou diagnóstico.',
      status: readyForBench && energizedRungs > 0 ? 'ready' : 'attention',
    },
  ];

  return steps;
}

function statusLabel(status: TestStepStatus): string {
  if (status === 'attention') return 'Atenção';
  if (status === 'observe') return 'Observar';
  return 'Pronto';
}

function statusScore(status: TestStepStatus): number {
  if (status === 'attention') return 3;
  if (status === 'observe') return 2;
  return 1;
}

export const PlcBenchTestPlanCard = memo(function PlcBenchTestPlanCard({ project, state, evaluation }: PlcBenchTestPlanCardProps) {
  const steps = useMemo(() => buildPlan(project, state, evaluation), [evaluation, project, state]);
  const highest = steps.reduce<TestStepStatus>((current, step) => statusScore(step.status) > statusScore(current) ? step.status : current, 'ready');

  return (
    <View style={[styles.card, highest === 'attention' && styles.cardAttention]}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Plano de teste</Text>
          <Text style={styles.title}>Roteiro de bancada virtual</Text>
        </View>
        <View style={[styles.statusPill, highest === 'attention' && styles.statusPillAttention]}>
          <Text style={[styles.statusText, highest === 'attention' && styles.statusTextAttention]}>{statusLabel(highest)}</Text>
        </View>
      </View>

      <View style={styles.stepStack}>
        {steps.map((step) => (
          <View key={step.id} style={[styles.stepCard, step.status === 'attention' && styles.stepAttention, step.status === 'observe' && styles.stepObserve]}>
            <View style={styles.stepHeader}>
              <Text style={[styles.stepStatus, step.status === 'attention' && styles.stepStatusAttention, step.status === 'observe' && styles.stepStatusObserve]}>{statusLabel(step.status)}</Text>
              <Text style={styles.stepTitle}>{step.title}</Text>
            </View>
            <Text style={styles.stepAction}>{step.action}</Text>
            <Text style={styles.stepExpected}>Esperado: {step.expected}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.explanation}>Use este roteiro como ensaio de laboratório: cada passo conecta programação Ladder com comportamento de uma bancada real.</Text>
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
  statusPill: {
    borderColor: colors.green,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    backgroundColor: colors.surface,
  },
  statusPillAttention: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
  },
  statusText: {
    color: colors.green,
    fontSize: 10,
    fontWeight: '900',
  },
  statusTextAttention: {
    color: colors.amber,
  },
  stepStack: {
    gap: spacing.xs,
  },
  stepCard: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    gap: 3,
  },
  stepAttention: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
  },
  stepObserve: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stepStatus: {
    color: colors.green,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  stepStatusAttention: {
    color: colors.amber,
  },
  stepStatusObserve: {
    color: colors.cyan,
  },
  stepTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  stepAction: {
    color: colors.text,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800',
  },
  stepExpected: {
    color: colors.textMuted,
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
