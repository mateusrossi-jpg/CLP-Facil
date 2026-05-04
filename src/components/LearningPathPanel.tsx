import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ProfessionalExampleId } from '../data/professionalExampleCatalog';
import {
  LearningProgress,
  lessonProgressKey,
  moduleProgress,
  overallLearningProgress,
  professionalLearningPath,
} from '../learning/professionalLearningPath';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type LearningPathPanelProps = {
  progress?: LearningProgress;
  onToggleLesson?: (key: string, completed: boolean) => void;
  onOpenExample?: (exampleId: ProfessionalExampleId) => void;
};

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export const LearningPathPanel = memo(function LearningPathPanel({
  progress = {},
  onToggleLesson,
  onOpenExample,
}: LearningPathPanelProps) {
  const overall = useMemo(() => overallLearningProgress(progress), [progress]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Trilha guiada</Text>
          <Text style={styles.title}>Aprenda CLP por prática real</Text>
          <Text style={styles.subtitle}>Cada lição tem conceito, importância, prática e checagem de domínio.</Text>
        </View>
        <View style={styles.progressBadge}>
          <Text style={styles.progressPercent}>{percent(overall.ratio)}</Text>
          <Text style={styles.progressSmall}>{overall.completed}/{overall.total}</Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.min(Math.max(overall.ratio, 0), 1) * 100}%` }]} />
      </View>

      <View style={styles.flowBox}>
        <Text style={styles.flowTitle}>Formato: Conceito → Por quê → Prática → Domínio</Text>
      </View>

      <View style={styles.moduleStack}>
        {professionalLearningPath.map((module, moduleIndex) => {
          const moduleStatus = moduleProgress(module, progress);
          return (
            <View key={module.id} style={styles.moduleCard}>
              <View style={styles.moduleHeader}>
                <View style={styles.moduleIndexBubble}>
                  <Text style={styles.moduleIndex}>{moduleIndex + 1}</Text>
                </View>
                <View style={styles.moduleTextBox}>
                  <Text style={styles.moduleTitle}>{module.title}</Text>
                  <Text style={styles.moduleDescription}>{module.description}</Text>
                </View>
                <View style={styles.moduleProgressBadge}>
                  <Text style={styles.moduleProgressText}>{percent(moduleStatus.ratio)}</Text>
                </View>
              </View>

              <View style={styles.lessonStack}>
                {module.lessons.map((lesson, lessonIndex) => {
                  const key = lessonProgressKey(module.id, lessonIndex);
                  const completed = Boolean(progress[key]);
                  const exampleId = module.exampleIds[lessonIndex];

                  return (
                    <View key={key} style={[styles.lessonCard, completed && styles.lessonCardDone]}>
                      <View style={styles.lessonHeader}>
                        <Pressable
                          onPress={() => onToggleLesson?.(key, !completed)}
                          style={[styles.checkButton, completed && styles.checkButtonDone]}
                        >
                          <Text style={[styles.checkButtonText, completed && styles.checkButtonTextDone]}>{completed ? '✓' : '○'}</Text>
                        </Pressable>
                        <View style={styles.lessonHeaderText}>
                          <Text style={styles.lessonNumber}>Lição {lessonIndex + 1}</Text>
                          <Text style={styles.lessonTitle}>{lesson.title}</Text>
                          <Text style={styles.lessonConcept}>{lesson.concept}</Text>
                        </View>
                      </View>

                      <View style={styles.lessonInfoBox}>
                        <Text style={styles.infoLabel}>Por que importa</Text>
                        <Text style={styles.infoText}>{lesson.whyItMatters}</Text>
                      </View>
                      <View style={styles.lessonInfoBox}>
                        <Text style={styles.infoLabel}>Prática</Text>
                        <Text style={styles.infoText}>{lesson.practice}</Text>
                      </View>
                      <View style={styles.masteryBox}>
                        <Text style={styles.masteryLabel}>Checagem de domínio</Text>
                        <Text style={styles.masteryText}>{lesson.masteryCheck}</Text>
                      </View>

                      {exampleId ? (
                        <Pressable onPress={() => onOpenExample?.(exampleId)} style={styles.exampleButton}>
                          <Text style={styles.exampleButtonText}>Abrir exemplo prático</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>
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
  progressBadge: {
    minWidth: 68,
    borderColor: colors.green,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.greenSoft,
    alignItems: 'center',
  },
  progressPercent: {
    color: colors.green,
    fontSize: 16,
    fontWeight: '900',
  },
  progressSmall: {
    color: colors.green,
    fontSize: 10,
    fontWeight: '900',
  },
  progressTrack: {
    height: 9,
    borderRadius: 999,
    backgroundColor: colors.black,
    borderColor: colors.border,
    borderWidth: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.green,
  },
  flowBox: {
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    backgroundColor: colors.cyanSoft,
  },
  flowTitle: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: '900',
  },
  moduleStack: {
    gap: spacing.md,
  },
  moduleCard: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    gap: spacing.sm,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  moduleIndexBubble: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.goldSoft,
    borderColor: colors.gold,
    borderWidth: 1,
  },
  moduleIndex: {
    color: colors.amber,
    fontSize: 14,
    fontWeight: '900',
  },
  moduleTextBox: {
    flex: 1,
    minWidth: 0,
  },
  moduleTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  moduleDescription: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },
  moduleProgressBadge: {
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.cyanSoft,
  },
  moduleProgressText: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
  },
  lessonStack: {
    gap: spacing.sm,
  },
  lessonCard: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  lessonCardDone: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  checkButton: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderColor: colors.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  checkButtonDone: {
    borderColor: colors.green,
    backgroundColor: colors.green,
  },
  checkButtonText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '900',
  },
  checkButtonTextDone: {
    color: colors.black,
  },
  lessonHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  lessonNumber: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  lessonTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  lessonConcept: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  lessonInfoBox: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.sm,
    backgroundColor: colors.surfaceElevated,
  },
  infoLabel: {
    color: colors.gold,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  infoText: {
    color: colors.text,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  masteryBox: {
    borderColor: colors.green,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.greenSoft,
    marginTop: 4,
  },
  masteryLabel: {
    color: colors.green,
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  masteryText: {
    color: colors.text,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800',
  },
  exampleButton: {
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.cyanSoft,
  },
  exampleButtonText: {
    color: colors.cyan,
    fontSize: 11,
    fontWeight: '900',
  },
});
