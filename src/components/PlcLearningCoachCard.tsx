import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EditorBlock, EditorProjectState } from '../engine/editorTypes';
import { EditorEvaluationResult } from '../engine/editorEvaluator';
import { PlcState } from '../engine/projectTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type PlcLearningCoachCardProps = {
  project: EditorProjectState;
  state: PlcState;
  evaluation: EditorEvaluationResult;
};

type CoachPriority = 'next' | 'practice' | 'warning' | 'mastery';

type CoachStep = {
  id: string;
  priority: CoachPriority;
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

function collectBlocks(project: EditorProjectState): EditorBlock[] {
  return project.rungs.flatMap((rung) => [
    ...rung.seriesBlocks,
    ...rung.parallelBlocks,
    ...(rung.parallelBranches ?? []).flatMap((branch) => branch.blocks),
    ...(rung.coilBlock ? [rung.coilBlock] : []),
  ]);
}

function countActiveByPrefix(state: PlcState, prefixes: string[]): number {
  return Object.entries(state).filter(([address, value]) => {
    const normalized = normalize(address);
    const active = typeof value === 'number' ? value !== 0 : Boolean(value);
    return prefixes.some((prefix) => normalized.startsWith(prefix)) && active;
  }).length;
}

function hasContactNamed(project: EditorProjectState, terms: string[]): boolean {
  return collectBlocks(project).some((block) => (
    block.role === 'contact' && terms.some((term) => blockText(block).includes(term))
  ));
}

function hasTimerOrCounter(project: EditorProjectState): boolean {
  return project.rungs.some((rung) => {
    const block = rung.coilBlock;
    return Boolean(block && (block.role === 'timer' || block.role === 'counter' || block.timerMode || block.counterMode));
  });
}

function hasParallelLogic(project: EditorProjectState): boolean {
  return project.rungs.some((rung) => (rung.parallelBranches ?? []).length > 0 || rung.parallelBlocks.length > 0);
}

function hasOutput(project: EditorProjectState): boolean {
  return project.rungs.some((rung) => {
    const variable = normalize(rung.coilBlock?.variable);
    return variable.startsWith('Q') || variable.startsWith('O');
  });
}

function buildCoachSteps(project: EditorProjectState, state: PlcState, evaluation: EditorEvaluationResult): CoachStep[] {
  const steps: CoachStep[] = [];
  const diagnostics = evaluation.diagnostics?.length ?? 0;
  const activeInputs = countActiveByPrefix(state, ['I']);
  const activeOutputs = countActiveByPrefix(state, ['Q', 'O']);
  const energizedRungs = Object.values(evaluation.rungResults ?? {}).filter(Boolean).length;
  const hasStart = hasContactNamed(project, ['start', 'liga', 'partida']);
  const hasStop = hasContactNamed(project, ['stop', 'parada', 'emerg']);

  if (project.rungs.length === 0) {
    steps.push({
      id: 'create-first-rung',
      priority: 'next',
      title: 'Crie a primeira linha ladder',
      description: 'Monte uma lógica mínima com contato de entrada e bobina de saída para iniciar a simulação didática.',
    });
    return steps;
  }

  if (!hasOutput(project)) {
    steps.push({
      id: 'add-output',
      priority: 'next',
      title: 'Adicione uma bobina de saída',
      description: 'Uma saída Q/O torna o resultado do rung visível e aproxima o exercício de um CLP real.',
    });
  }

  if (diagnostics > 0) {
    steps.push({
      id: 'review-diagnostics',
      priority: 'warning',
      title: 'Revise os diagnósticos antes de avançar',
      description: `Há ${diagnostics} diagnóstico(s) ativo(s). Abra o trace e corrija inconsistências antes de considerar o teste aprovado.`,
    });
  }

  if (!hasStart || !hasStop) {
    steps.push({
      id: 'name-start-stop',
      priority: 'practice',
      title: 'Nomeie partida e parada',
      description: 'Use nomes como Start/Liga/Partida e Stop/Parada/Emergência para treinar lógica de comando real.',
    });
  }

  if (activeInputs === 0 && energizedRungs === 0) {
    steps.push({
      id: 'toggle-inputs',
      priority: 'next',
      title: 'Acione uma entrada e execute o scan',
      description: 'Ligue uma entrada I e observe imagem de processo, fluxo do rung e Watch Table para entender a varredura.',
    });
  }

  if (energizedRungs > 0 && activeOutputs === 0) {
    steps.push({
      id: 'follow-output-path',
      priority: 'practice',
      title: 'Siga o caminho até a bobina',
      description: 'Há rung energizado, mas nenhuma saída ativa. Use Fluxo de energia e Diagnóstico para encontrar onde a lógica não chegou à bobina.',
    });
  }

  if (!hasParallelLogic(project)) {
    steps.push({
      id: 'practice-seal',
      priority: 'practice',
      title: 'Pratique selo/branch paralelo',
      description: 'Adicione um branch paralelo para treinar retenção, lógica OR e intertravamento de parada.',
    });
  }

  if (!hasTimerOrCounter(project)) {
    steps.push({
      id: 'practice-timer-counter',
      priority: 'practice',
      title: 'Inclua timer ou contador',
      description: 'Timers e contadores deixam o exercício mais próximo de aplicações reais e ativam o Monitor T/C.',
    });
  }

  if (activeOutputs > 0) {
    steps.push({
      id: 'validate-active-outputs',
      priority: 'warning',
      title: 'Confirme as saídas ativas',
      description: `${activeOutputs} saída(s) estão ON. Verifique se isso é esperado e se o Stop/intertravamento consegue desligar.`,
    });
  }

  if (steps.length === 0) {
    steps.push({
      id: 'mastery',
      priority: 'mastery',
      title: 'Exercício em bom nível didático',
      description: 'A lógica possui estrutura observável. Agora teste variações: falha, reset, borda, selo e diferentes estados de entrada.',
    });
  }

  return steps.slice(0, 6);
}

function priorityLabel(priority: CoachPriority): string {
  if (priority === 'warning') return 'Revisar';
  if (priority === 'practice') return 'Praticar';
  if (priority === 'mastery') return 'Avançado';
  return 'Próximo';
}

function priorityScore(priority: CoachPriority): number {
  if (priority === 'warning') return 4;
  if (priority === 'next') return 3;
  if (priority === 'practice') return 2;
  return 1;
}

export const PlcLearningCoachCard = memo(function PlcLearningCoachCard({ project, state, evaluation }: PlcLearningCoachCardProps) {
  const steps = useMemo(() => buildCoachSteps(project, state, evaluation), [evaluation, project, state]);
  const highest = steps.reduce<CoachPriority>((current, step) => priorityScore(step.priority) > priorityScore(current) ? step.priority : current, 'mastery');

  return (
    <View style={[styles.card, highest === 'warning' && styles.cardWarning, highest === 'mastery' && styles.cardMastery]}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Coach PLC</Text>
          <Text style={styles.title}>Próximos passos de aprendizado</Text>
        </View>
        <View style={[styles.priorityPill, highest === 'warning' && styles.priorityPillWarning, highest === 'mastery' && styles.priorityPillMastery]}>
          <Text style={[styles.priorityPillText, highest === 'warning' && styles.priorityPillTextWarning, highest === 'mastery' && styles.priorityPillTextMastery]}>{priorityLabel(highest)}</Text>
        </View>
      </View>

      <View style={styles.stepStack}>
        {steps.map((step, index) => (
          <View key={step.id} style={[styles.stepCard, step.priority === 'warning' && styles.stepWarning, step.priority === 'mastery' && styles.stepMastery]}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepNumber, step.priority === 'warning' && styles.stepNumberWarning, step.priority === 'mastery' && styles.stepNumberMastery]}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={[styles.stepPriority, step.priority === 'warning' && styles.stepPriorityWarning, step.priority === 'mastery' && styles.stepPriorityMastery]}>{priorityLabel(step.priority)}</Text>
              <Text style={styles.stepTitle}>{step.title}</Text>
            </View>
            <Text style={styles.stepDescription}>{step.description}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.explanation}>O coach transforma o simulador em tutor: ele sugere o próximo teste com base no programa, estado do scan e diagnósticos.</Text>
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
  cardWarning: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
  },
  cardMastery: {
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
    color: colors.cyan,
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
  priorityPill: {
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    backgroundColor: colors.surface,
  },
  priorityPillWarning: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
  },
  priorityPillMastery: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  priorityPillText: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
  },
  priorityPillTextWarning: {
    color: colors.amber,
  },
  priorityPillTextMastery: {
    color: colors.green,
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
  stepWarning: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
  },
  stepMastery: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.cyan,
    borderWidth: 1,
    backgroundColor: colors.cyanSoft,
  },
  stepNumberWarning: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
  },
  stepNumberMastery: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  stepNumberText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '900',
  },
  stepPriority: {
    color: colors.cyan,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  stepPriorityWarning: {
    color: colors.amber,
  },
  stepPriorityMastery: {
    color: colors.green,
  },
  stepTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  stepDescription: {
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
