import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EditorExampleProject } from '../data/editorExampleProjects';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type ExampleCategoryId = 'starter' | 'timers' | 'counters' | 'motors' | 'process';

type ExampleCategory = {
  id: ExampleCategoryId;
  title: string;
  description: string;
  matcher: (example: EditorExampleProject) => boolean;
};

type ExampleLibraryPanelProps = {
  examples: EditorExampleProject[];
  onOpenExample: (example: EditorExampleProject) => void;
};

const categories: ExampleCategory[] = [
  {
    id: 'starter',
    title: 'Primeiros comandos',
    description: 'Partida direta, selo, SET/RESET e comandos básicos para começar rápido.',
    matcher: (example) => /partida|selo|direct|seal|set|reset/i.test(`${example.id} ${example.title}`),
  },
  {
    id: 'timers',
    title: 'Temporizadores',
    description: 'TON, TOF, TP e atrasos de comando para entender ciclo de scan e tempo.',
    matcher: (example) => /ton|tof|timer|tempor/i.test(`${example.id} ${example.title}`),
  },
  {
    id: 'counters',
    title: 'Contadores e lote',
    description: 'CTU/CTD e contagem de peças para esteira, produção e exercícios.',
    matcher: (example) => /ctu|ctd|counter|contador|lote|batch/i.test(`${example.id} ${example.title}`),
  },
  {
    id: 'motors',
    title: 'Motores e comandos elétricos',
    description: 'Reversão, estrela-triângulo e intertravamentos para bancada didática.',
    matcher: (example) => /motor|revers|estrela|triângulo|triangulo|star|delta/i.test(`${example.id} ${example.title}`),
  },
  {
    id: 'process',
    title: 'Processos e automação',
    description: 'Bomba, nível, esteira e aplicações próximas de casos reais.',
    matcher: (example) => /bomba|pump|esteira|conveyor|nível|nivel|process/i.test(`${example.id} ${example.title}`),
  },
];

function examplesForCategory(examples: EditorExampleProject[], category: ExampleCategory) {
  return examples.filter(category.matcher).slice(0, 6);
}

function difficultyTone(difficulty: EditorExampleProject['difficulty']) {
  if (difficulty === 'Básico') return styles.basicBadge;
  if (difficulty === 'Intermediário') return styles.mediumBadge;
  return styles.advancedBadge;
}

function difficultyTextTone(difficulty: EditorExampleProject['difficulty']) {
  if (difficulty === 'Básico') return styles.basicBadgeText;
  if (difficulty === 'Intermediário') return styles.mediumBadgeText;
  return styles.advancedBadgeText;
}

export const ExampleLibraryPanel = memo(function ExampleLibraryPanel({ examples, onOpenExample }: ExampleLibraryPanelProps) {
  const { categoryGroups, remainingExamples } = useMemo(() => {
    const coveredIds = new Set<string>();
    const groups = categories
      .map((category) => {
        const grouped = examplesForCategory(examples, category).filter((example) => {
          if (coveredIds.has(example.id)) return false;
          coveredIds.add(example.id);
          return true;
        });
        return { category, examples: grouped };
      })
      .filter((group) => group.examples.length > 0);

    return {
      categoryGroups: groups,
      remainingExamples: examples.filter((example) => !coveredIds.has(example.id)).slice(0, 8),
    };
  }, [examples]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Biblioteca de exemplos</Text>
          <Text style={styles.title}>Circuitos prontos para aprender, testar e divulgar</Text>
          <Text style={styles.subtitle}>Carregue modelos reais no simulador em um toque: partida, selo, timers, contadores, motores e processos.</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{examples.length} modelos</Text>
        </View>
      </View>

      <View style={styles.tipBox}>
        <Text style={styles.tipTitle}>Fluxo recomendado</Text>
        <Text style={styles.tipText}>Abra um modelo, entre em Simular, acione as entradas da Tabela de I/O e depois teste a exportação na aba Hardware.</Text>
      </View>

      {categoryGroups.map(({ category, examples: groupedExamples }) => (
        <View key={category.id} style={styles.categoryCard}>
          <Text style={styles.categoryTitle}>{category.title}</Text>
          <Text style={styles.categoryDescription}>{category.description}</Text>
          <View style={styles.exampleGrid}>
            {groupedExamples.map((example) => (
              <View key={example.id} style={styles.exampleCard}>
                <View style={styles.exampleHeader}>
                  <Text style={styles.exampleTitle} numberOfLines={2}>{example.title}</Text>
                  <View style={[styles.difficultyBadge, difficultyTone(example.difficulty)]}>
                    <Text style={[styles.difficultyText, difficultyTextTone(example.difficulty)]}>{example.difficulty}</Text>
                  </View>
                </View>
                <Text style={styles.exampleDescription} numberOfLines={3}>{example.description}</Text>
                <Pressable onPress={() => onOpenExample(example)} style={styles.openButton}>
                  <Text style={styles.openButtonText}>Carregar no simulador</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      ))}

      {remainingExamples.length > 0 ? (
        <View style={styles.categoryCard}>
          <Text style={styles.categoryTitle}>Outros modelos</Text>
          <Text style={styles.categoryDescription}>Exemplos adicionais para explorar a biblioteca conforme o app evolui.</Text>
          <View style={styles.exampleGrid}>
            {remainingExamples.map((example) => (
              <View key={example.id} style={styles.exampleCard}>
                <View style={styles.exampleHeader}>
                  <Text style={styles.exampleTitle} numberOfLines={2}>{example.title}</Text>
                  <View style={[styles.difficultyBadge, difficultyTone(example.difficulty)]}>
                    <Text style={[styles.difficultyText, difficultyTextTone(example.difficulty)]}>{example.difficulty}</Text>
                  </View>
                </View>
                <Text style={styles.exampleDescription} numberOfLines={3}>{example.description}</Text>
                <Pressable onPress={() => onOpenExample(example)} style={styles.openButton}>
                  <Text style={styles.openButtonText}>Carregar no simulador</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
});

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
  tipBox: {
    borderColor: colors.amber,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    backgroundColor: colors.goldSoft,
  },
  tipTitle: {
    color: colors.amber,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
  },
  tipText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },
  categoryCard: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    gap: spacing.sm,
  },
  categoryTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  categoryDescription: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  exampleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  exampleCard: {
    flexGrow: 1,
    flexBasis: 210,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  exampleHeader: {
    gap: spacing.xs,
  },
  exampleTitle: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '900',
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  difficultyText: {
    fontSize: 9,
    fontWeight: '900',
  },
  basicBadge: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  mediumBadge: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  advancedBadge: {
    borderColor: colors.amber,
    backgroundColor: colors.goldSoft,
  },
  basicBadgeText: {
    color: colors.green,
  },
  mediumBadgeText: {
    color: colors.cyan,
  },
  advancedBadgeText: {
    color: colors.amber,
  },
  exampleDescription: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  openButton: {
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: colors.cyanSoft,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: 'auto',
  },
  openButtonText: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: '900',
  },
});
