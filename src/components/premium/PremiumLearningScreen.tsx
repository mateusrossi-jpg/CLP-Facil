import { memo, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { clpLearningModules } from '../../education/clpLessonCatalog';
import {
  getAllModuleProgressSummaries,
  getCurrentLesson,
  getLessonProgress,
  getLessonStatusLabel,
  getOverallLearningProgress,
} from '../../education/clpLearningProgress';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { PremiumBadge, PremiumProgress, PremiumScreen, PremiumSection, PremiumSegmented } from './index';
import { PremiumLessonDetailCard } from './PremiumLessonDetailCard';

type LearningTab = 'tracks' | 'modules' | 'challenges' | 'achievements';
type BadgeTone = 'cyan' | 'green' | 'amber' | 'purple';

const trackTones: BadgeTone[] = ['cyan', 'green', 'amber', 'purple', 'cyan', 'green'];

function statusTone(status: ReturnType<typeof getLessonProgress>['status']): 'green' | 'amber' | 'cyan' | 'neutral' {
  if (status === 'completed') return 'green';
  if (status === 'in_progress') return 'amber';
  if (status === 'available') return 'cyan';
  return 'neutral';
}

export const PremiumLearningScreen = memo(function PremiumLearningScreen() {
  const [tab, setTab] = useState<LearningTab>('tracks');
  const allLessons = useMemo(() => clpLearningModules.flatMap((module) => module.lessons), []);
  const moduleProgress = useMemo(() => getAllModuleProgressSummaries(), []);
  const currentLesson = useMemo(() => getCurrentLesson(), []);
  const currentProgress = getLessonProgress(currentLesson.id);
  const nextLessons = allLessons.filter((lesson) => getLessonProgress(lesson.id).status !== 'locked').slice(0, 5);
  const averageProgress = getOverallLearningProgress();

  return (
    <PremiumScreen>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Aprender</Text>
        <Text style={styles.title}>Trilhas, módulos e progresso</Text>
        <Text style={styles.subtitle}>Aprenda a história, o funcionamento e a prática do CLP com lições guiadas e simulação.</Text>
        <View style={styles.heroStats}>
          <View style={styles.statBox}><Text style={styles.statValue}>{clpLearningModules.length}</Text><Text style={styles.statLabel}>trilhas</Text></View>
          <View style={styles.statBox}><Text style={styles.statValue}>{allLessons.length}</Text><Text style={styles.statLabel}>lições</Text></View>
          <View style={styles.statBox}><Text style={styles.statValue}>{averageProgress}%</Text><Text style={styles.statLabel}>progresso</Text></View>
        </View>
      </View>

      <PremiumSegmented
        value={tab}
        onChange={setTab}
        options={[
          { value: 'tracks', label: 'Trilhas' },
          { value: 'modules', label: 'Módulos' },
          { value: 'challenges', label: 'Desafios' },
          { value: 'achievements', label: 'Conquistas' },
        ]}
      />

      <PremiumSection title="Trilha atual" subtitle="Continue de onde parou" tone="green">
        <View style={styles.currentLesson}>
          <View style={styles.lessonHeader}>
            <View style={styles.lessonIcon}><Text style={styles.lessonIconText}>{currentProgress.progress}%</Text></View>
            <View style={styles.lessonCopy}>
              <Text style={styles.lessonTitle}>{currentLesson.title}</Text>
              <Text style={styles.lessonDescription}>{currentLesson.whyItMatters}</Text>
            </View>
            <PremiumBadge label={getLessonStatusLabel(currentProgress.status)} tone={statusTone(currentProgress.status)} />
          </View>
          <PremiumProgress value={currentProgress.progress} label={`${currentProgress.progress}% concluído`} />
        </View>
      </PremiumSection>

      <PremiumLessonDetailCard lesson={currentLesson} />

      {tab === 'tracks' ? (
        <PremiumSection title="Trilhas" subtitle="Do contexto histórico ao diagnóstico profissional" tone="cyan">
          <View style={styles.trackList}>
            {clpLearningModules.map((module, index) => {
              const tone = trackTones[index % trackTones.length];
              const summary = moduleProgress.find((item) => item.moduleId === module.id);
              const progress = summary?.progress ?? module.progress;
              return (
                <View key={module.id} style={styles.trackCard}>
                  <View style={styles.trackTop}>
                    <View style={styles.trackCopy}>
                      <Text style={styles.trackTitle}>{module.title}</Text>
                      <Text style={styles.trackDescription}>{module.description}</Text>
                      {summary ? <Text style={styles.trackMeta}>{summary.completedCount}/{summary.lessonCount} lições concluídas • {summary.availableCount} liberadas</Text> : null}
                    </View>
                    <PremiumBadge label={`${progress}%`} tone={tone} />
                  </View>
                  <PremiumProgress value={progress} />
                </View>
              );
            })}
          </View>
        </PremiumSection>
      ) : tab === 'modules' ? (
        <PremiumSection title="Próximas aulas" subtitle="Conteúdo educativo estruturado" tone="amber">
          <View style={styles.trackList}>
            {nextLessons.map((lesson, index) => {
              const progress = getLessonProgress(lesson.id);
              return (
                <View key={lesson.id} style={styles.moduleCard}>
                  <Text style={styles.moduleCode}>Lição {String(index + 1).padStart(2, '0')}</Text>
                  <View style={styles.moduleCopy}>
                    <Text style={styles.trackTitle}>{lesson.shortTitle}</Text>
                    <Text style={styles.trackDescription}>{lesson.concept}</Text>
                    <Text style={styles.trackMeta}>{progress.progress}% • {getLessonStatusLabel(progress.status)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </PremiumSection>
      ) : tab === 'challenges' ? (
        <PremiumSection title="Desafios" subtitle="Pratique até dominar" tone="purple">
          <View style={styles.trackList}>
            {allLessons.slice(0, 4).map((lesson, index) => {
              const progress = getLessonProgress(lesson.id);
              return (
                <View key={lesson.id} style={styles.challengeCard}>
                  <Text style={styles.challengeNumber}>{index + 1}</Text>
                  <Text style={styles.challengeText}>{lesson.practice}</Text>
                  <PremiumBadge label={getLessonStatusLabel(progress.status)} tone={statusTone(progress.status)} />
                </View>
              );
            })}
          </View>
        </PremiumSection>
      ) : (
        <PremiumSection title="Conquistas" subtitle="Marcos da evolução" tone="green">
          <View style={styles.achievementGrid}>
            {['Primeiro RUN', 'Selo dominado', 'Timer aplicado', 'Bancada pronta'].map((item, index) => (
              <View key={item} style={[styles.achievementCard, index < 2 && styles.achievementCardActive]}>
                <Text style={[styles.achievementIcon, index < 2 && styles.achievementIconActive]}>◆</Text>
                <Text style={styles.achievementText}>{item}</Text>
              </View>
            ))}
          </View>
        </PremiumSection>
      )}
    </PremiumScreen>
  );
});

const styles = StyleSheet.create({
  hero: { borderColor: colors.borderStrong, borderWidth: 1, borderRadius: 28, padding: spacing.lg, backgroundColor: colors.surface, gap: spacing.md },
  eyebrow: { color: colors.cyan, fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.1 },
  title: { color: colors.text, fontSize: 26, lineHeight: 31, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  heroStats: { flexDirection: 'row', gap: spacing.sm },
  statBox: { flex: 1, borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: spacing.md, backgroundColor: colors.surfaceElevated },
  statValue: { color: colors.green, fontSize: 20, fontWeight: '900' },
  statLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '900', marginTop: 2 },
  currentLesson: { borderColor: colors.border, borderWidth: 1, borderRadius: 18, padding: spacing.md, backgroundColor: colors.surfaceElevated, gap: spacing.md },
  lessonHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  lessonIcon: { width: 44, height: 44, borderRadius: 15, borderColor: colors.green, borderWidth: 1, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' },
  lessonIconText: { color: colors.green, fontSize: 13, fontWeight: '900' },
  lessonCopy: { flex: 1, minWidth: 0 },
  lessonTitle: { color: colors.text, fontSize: 15, fontWeight: '900' },
  lessonDescription: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 2 },
  trackList: { gap: spacing.sm },
  trackCard: { borderColor: colors.border, borderWidth: 1, borderRadius: 18, padding: spacing.md, backgroundColor: colors.surfaceElevated, gap: spacing.sm },
  trackTop: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, alignItems: 'flex-start' },
  trackCopy: { flex: 1, minWidth: 0 },
  trackTitle: { color: colors.text, fontSize: 14, fontWeight: '900' },
  trackDescription: { color: colors.textMuted, fontSize: 11, lineHeight: 16, marginTop: 2 },
  trackMeta: { color: colors.textDim, fontSize: 10, lineHeight: 15, marginTop: 4, fontWeight: '800' },
  moduleCard: { flexDirection: 'row', gap: spacing.sm, borderColor: colors.border, borderWidth: 1, borderRadius: 18, padding: spacing.md, backgroundColor: colors.surfaceElevated },
  moduleCode: { color: colors.amber, fontSize: 12, fontWeight: '900', width: 58 },
  moduleCopy: { flex: 1, minWidth: 0 },
  challengeCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderColor: colors.border, borderWidth: 1, borderRadius: 18, padding: spacing.md, backgroundColor: colors.surfaceElevated },
  challengeNumber: { color: colors.purple, fontSize: 18, fontWeight: '900', width: 26 },
  challengeText: { color: colors.text, fontSize: 13, fontWeight: '800', flex: 1 },
  achievementGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  achievementCard: { flexGrow: 1, flexBasis: 130, borderColor: colors.border, borderWidth: 1, borderRadius: 18, padding: spacing.md, backgroundColor: colors.surfaceElevated, alignItems: 'center', gap: spacing.xs },
  achievementCardActive: { borderColor: colors.green, backgroundColor: colors.greenSoft },
  achievementIcon: { color: colors.textDim, fontSize: 18 },
  achievementIconActive: { color: colors.green },
  achievementText: { color: colors.text, fontSize: 12, fontWeight: '900', textAlign: 'center' },
});
