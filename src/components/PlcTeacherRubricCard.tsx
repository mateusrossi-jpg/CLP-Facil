import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EditorBlock, EditorProjectState } from '../engine/editorTypes';
import { EditorEvaluationResult } from '../engine/editorEvaluator';
import { PlcState } from '../engine/projectTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type PlcTeacherRubricCardProps = {
  project: EditorProjectState;
  state: PlcState;
  evaluation: EditorEvaluationResult;
};

type RubricLevel = 'excellent' | 'good' | 'attention' | 'missing';

type RubricItem = {
  id: string;
  title: string;
  description: string;
  points: number;
  maxPoints: number;
  level: RubricLevel;
};

type CriticalReview = {
  cap: number;
  blockers: string[];
};

function normalize(value: string | undefined): string {
  return (value ?? '').trim().toUpperCase();
}

function textOf(block: EditorBlock): string {
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

function hasStart(project: EditorProjectState): boolean {
  return collectBlocks(project).some((block) => block.role === 'contact' && (textOf(block).includes('start') || textOf(block).includes('liga') || textOf(block).includes('partida')));
}

function hasStop(project: EditorProjectState): boolean {
  return collectBlocks(project).some((block) => block.role === 'contact' && (textOf(block).includes('stop') || textOf(block).includes('parada') || textOf(block).includes('emerg')));
}

function hasOutput(project: EditorProjectState): boolean {
  return project.rungs.some((rung) => {
    const variable = normalize(rung.coilBlock?.variable);
    return variable.startsWith('Q') || variable.startsWith('O');
  });
}

function hasAnyInput(project: EditorProjectState): boolean {
  return collectBlocks(project).some((block) => {
    const variable = normalize(block.variable);
    return block.role === 'contact' && variable.startsWith('I');
  });
}

function hasAdvancedInstruction(project: EditorProjectState): boolean {
  return project.rungs.some((rung) => {
    const block = rung.coilBlock;
    return Boolean(block && (block.role === 'timer' || block.role === 'counter' || block.timerMode || block.counterMode));
  });
}

function hasParallel(project: EditorProjectState): boolean {
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

function activeOutputCount(state: PlcState): number {
  return Object.entries(state)
    .filter(([address]) => {
      const normalized = normalize(address);
      return normalized.startsWith('Q') || normalized.startsWith('O');
    })
    .filter(([, value]) => typeof value === 'number' ? value !== 0 : Boolean(value))
    .length;
}

function levelFor(points: number, maxPoints: number): RubricLevel {
  if (points >= maxPoints) return 'excellent';
  if (points >= Math.ceil(maxPoints * 0.7)) return 'good';
  if (points > 0) return 'attention';
  return 'missing';
}

function buildRubric(project: EditorProjectState, state: PlcState, evaluation: EditorEvaluationResult): RubricItem[] {
  const diagnostics = evaluation.diagnostics?.length ?? 0;
  const duplicates = duplicateCoilCount(project);
  const outputsOn = activeOutputCount(state);
  const started = hasStart(project);
  const stopped = hasStop(project);
  const hasInput = hasAnyInput(project);
  const output = hasOutput(project);
  const advanced = hasAdvancedInstruction(project);
  const parallel = hasParallel(project);

  const structurePoints = project.rungs.length > 0 ? Math.min(20, 8 + project.rungs.length * 4) : 0;
  const ioPoints = output && hasInput ? 15 : output || hasInput ? 8 : 0;
  const safetyPoints = started && stopped ? 20 : started || stopped ? 10 : 0;
  const diagnosticPoints = diagnostics === 0 && duplicates === 0 ? 20 : diagnostics <= 1 && duplicates === 0 ? 12 : 5;
  const advancedPoints = advanced && parallel ? 15 : advanced || parallel ? 10 : 0;
  const testPoints = output ? outputsOn > 0 ? 8 : 6 : 0;

  return [
    {
      id: 'structure',
      title: 'Estrutura do programa',
      description: project.rungs.length > 0 ? `${project.rungs.length} linha(s) ladder organizada(s) para análise.` : 'Nenhuma linha ladder encontrada.',
      points: structurePoints,
      maxPoints: 20,
      level: levelFor(structurePoints, 20),
    },
    {
      id: 'io',
      title: 'Uso de I/O',
      description: output && hasInput ? 'Há entrada de campo e saída/atuador para validar o exercício.' : 'Inclua pelo menos uma entrada I e uma bobina Q/O para tornar o exercício observável.',
      points: ioPoints,
      maxPoints: 15,
      level: levelFor(ioPoints, 15),
    },
    {
      id: 'safety',
      title: 'Partida, parada e segurança',
      description: started && stopped ? 'Elementos de partida e parada foram identificados.' : 'Nomeie claramente partida e parada/emergência para melhorar a avaliação.',
      points: safetyPoints,
      maxPoints: 20,
      level: levelFor(safetyPoints, 20),
    },
    {
      id: 'diagnostics',
      title: 'Diagnóstico e duplicidades',
      description: diagnostics === 0 && duplicates === 0 ? 'Sem diagnósticos ou duplicidade de bobina neste scan.' : `${diagnostics} diagnóstico(s) e ${duplicates} duplicidade(s) de bobina para revisar.`,
      points: diagnosticPoints,
      maxPoints: 20,
      level: levelFor(diagnosticPoints, 20),
    },
    {
      id: 'advanced',
      title: 'Recursos de CLP',
      description: advanced || parallel ? 'O exercício usa recurso avançado como timer, contador ou branch paralelo.' : 'Adicione temporizador, contador ou selo para aumentar o nível didático.',
      points: advancedPoints,
      maxPoints: 15,
      level: levelFor(advancedPoints, 15),
    },
    {
      id: 'test',
      title: 'Condição de teste',
      description: output ? outputsOn > 0 ? `${outputsOn} saída(s) ligada(s); confirme se a condição é esperada e se Stop desliga.` : 'Saída definida, mas ainda não foi observada ligada neste estado de teste.' : 'Sem saída Q/O não há atuador para validar em bancada.',
      points: testPoints,
      maxPoints: 10,
      level: levelFor(testPoints, 10),
    },
  ];
}

function criticalReview(project: EditorProjectState, evaluation: EditorEvaluationResult): CriticalReview {
  const diagnostics = evaluation.diagnostics?.length ?? 0;
  const duplicates = duplicateCoilCount(project);
  const blockers: string[] = [];
  let cap = 100;

  if (!hasOutput(project)) {
    blockers.push('saída Q/O');
    cap = Math.min(cap, 55);
  }
  if (!hasStop(project)) {
    blockers.push('Stop/Parada');
    cap = Math.min(cap, 70);
  }
  if (!hasStart(project)) {
    blockers.push('Start/Partida');
    cap = Math.min(cap, 80);
  }
  if (diagnostics > 0 || duplicates > 0) {
    blockers.push('diagnóstico revisado');
    cap = Math.min(cap, 75);
  }

  return { cap, blockers };
}

function levelLabel(level: RubricLevel): string {
  if (level === 'excellent') return 'Excelente';
  if (level === 'good') return 'Bom';
  if (level === 'attention') return 'Atenção';
  return 'Ausente';
}

function rawScore(items: RubricItem[]): number {
  const points = items.reduce((total, item) => total + item.points, 0);
  const max = items.reduce((total, item) => total + item.maxPoints, 0);
  if (max <= 0) return 0;
  return Math.round((points / max) * 100);
}

function totalScore(items: RubricItem[], review: CriticalReview): number {
  return Math.min(rawScore(items), review.cap);
}

function scoreConclusion(score: number, review: CriticalReview): string {
  if (review.blockers.length > 0) return `Nota limitada: revise ${review.blockers.join(', ')} antes de considerar domínio do exercício.`;
  if (score >= 85) return 'Projeto muito forte para demonstração didática.';
  if (score >= 70) return 'Projeto bom, com alguns pontos para refinamento.';
  if (score >= 50) return 'Projeto funcional, mas ainda precisa de melhoria didática e segurança.';
  return 'Projeto inicial; complete I/O, segurança e diagnóstico antes de avaliar.';
}

export const PlcTeacherRubricCard = memo(function PlcTeacherRubricCard({ project, state, evaluation }: PlcTeacherRubricCardProps) {
  const items = useMemo(() => buildRubric(project, state, evaluation), [evaluation, project, state]);
  const review = useMemo(() => criticalReview(project, evaluation), [evaluation, project]);
  const score = totalScore(items, review);

  return (
    <View style={[styles.card, score >= 85 && styles.cardExcellent, score < 70 && styles.cardAttention]}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Modo professor</Text>
          <Text style={styles.title}>Rubrica automática do exercício</Text>
        </View>
        <View style={[styles.scorePill, score >= 85 && styles.scorePillExcellent, score < 70 && styles.scorePillAttention]}>
          <Text style={styles.scoreLabel}>Nota</Text>
          <Text style={[styles.scoreValue, score >= 85 && styles.scoreValueExcellent, score < 70 && styles.scoreValueAttention]}>{score}</Text>
        </View>
      </View>

      <Text style={styles.conclusion}>{scoreConclusion(score, review)}</Text>

      <View style={styles.itemStack}>
        {items.map((item) => (
          <View key={item.id} style={[styles.itemCard, item.level === 'excellent' && styles.itemExcellent, item.level === 'attention' && styles.itemAttention, item.level === 'missing' && styles.itemMissing]}>
            <View style={styles.itemHeader}>
              <Text style={[styles.itemLevel, item.level === 'excellent' && styles.itemLevelExcellent, item.level === 'attention' && styles.itemLevelAttention, item.level === 'missing' && styles.itemLevelMissing]}>{levelLabel(item.level)}</Text>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemPoints}>{item.points}/{item.maxPoints}</Text>
            </View>
            <Text style={styles.itemDescription}>{item.description}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.explanation}>A rubrica é uma avaliação didática automática. Ela ajuda professor e aluno a discutir qualidade, segurança e clareza da lógica.</Text>
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
  cardExcellent: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
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
  scorePill: {
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  scorePillExcellent: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  scorePillAttention: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
  },
  scoreLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  scoreValue: {
    color: colors.cyan,
    fontSize: 18,
    fontWeight: '900',
  },
  scoreValueExcellent: {
    color: colors.green,
  },
  scoreValueAttention: {
    color: colors.amber,
  },
  conclusion: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '900',
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
  itemExcellent: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  itemAttention: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
  },
  itemMissing: {
    borderColor: colors.red,
    backgroundColor: colors.redSoft,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  itemLevel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  itemLevelExcellent: {
    color: colors.green,
  },
  itemLevelAttention: {
    color: colors.amber,
  },
  itemLevelMissing: {
    color: colors.red,
  },
  itemTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  itemPoints: {
    color: colors.textMuted,
    fontSize: 10,
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
