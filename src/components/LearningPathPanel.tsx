import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { duolingoStyleLearningPath, totalLearningPathLessons } from '../education/learningPathPlan';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export const LearningPathPanel = memo(function LearningPathPanel() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Trilha guiada</Text>
          <Text style={styles.title}>Aprendizado passo a passo</Text>
          <Text style={styles.subtitle}>Cada lição mostra conceito, motivo, prática no simulador e checagem de domínio.</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{totalLearningPathLessons()} lições</Text>
        </View>
      </View>

      <View style={styles.flowBox}>
        <Text style={styles.flowTitle}>Formato: Conceito → Por quê → Prática → Domínio</Text>
      </View>

      {duolingoStyleLearningPath.map((module, moduleIndex) => (
        <View key={module.id} style={styles.moduleCard}>
          <View style={styles.moduleHeader}>
            <View style={styles.moduleIndexBubble}>
              <Text style={styles.moduleIndex}>{moduleIndex + 1}</Text>
            </View>
            <View style={styles.moduleTextBox}>
              <Text style={styles.moduleTitle}>{module.title}</Text>
              <Text style={styles.moduleDescription}>{module.description}</Text>
            </View>
          </View>

          {module.lessons.map((lesson, lessonIndex) => (
            <View key={lesson.id} style={styles.lessonCard}>
              <Text style={styles.lessonNumber}>Lição {lessonIndex + 1}</Text>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              <Text style={styles.label}>Objetivo</Text>
              <Text style={styles.text}>{lesson.objective}</Text>
              <Text style={styles.labelStrong}>Por que importa</Text>
              <Text style={styles.textStrong}>{lesson.whyItMatters}</Text>
              <Text style={styles.label}>Prática</Text>
              <Text style={styles.text}>{lesson.practice}</Text>
              <View style={styles.masteryBox}>
                <Text style={styles.masteryTitle}>Domínio</Text>
                <Text style={styles.masteryText}>{lesson.masteryCheck}</Text>
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderColor: colors.borderStrong, borderWidth: 1, borderRadius: 18, padding: spacing.lg, marginTop: spacing.lg, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  headerText: { flex: 1, minWidth: 0 },
  eyebrow: { color: colors.gold, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  title: { color: colors.text, fontSize: 22, lineHeight: 28, fontWeight: '900', marginTop: 2 },
  subtitle: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: spacing.xs },
  badge: { borderColor: colors.green, borderWidth: 1, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 4, backgroundColor: colors.greenSoft },
  badgeText: { color: colors.green, fontSize: 10, fontWeight: '900' },
  flowBox: { borderColor: colors.cyan, borderWidth: 1, borderRadius: 14, padding: spacing.md, backgroundColor: colors.cyanSoft },
  flowTitle: { color: colors.cyan, fontSize: 12, fontWeight: '900' },
  moduleCard: { borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: spacing.md, backgroundColor: colors.surfaceElevated, gap: spacing.sm },
  moduleHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  moduleIndexBubble: { width: 32, height: 32, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.goldSoft, borderColor: colors.gold, borderWidth: 1 },
  moduleIndex: { color: colors.amber, fontSize: 14, fontWeight: '900' },
  moduleTextBox: { flex: 1, minWidth: 0 },
  moduleTitle: { color: colors.text, fontSize: 16, fontWeight: '900' },
  moduleDescription: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 3 },
  lessonCard: { borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: spacing.md, backgroundColor: colors.surface, gap: spacing.xs },
  lessonNumber: { color: colors.cyan, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  lessonTitle: { color: colors.text, fontSize: 14, fontWeight: '900' },
  label: { color: colors.cyan, fontSize: 10, fontWeight: '900', marginTop: 4, textTransform: 'uppercase' },
  labelStrong: { color: colors.amber, fontSize: 10, fontWeight: '900', marginTop: 4, textTransform: 'uppercase' },
  text: { color: colors.textMuted, fontSize: 11, lineHeight: 16 },
  textStrong: { color: colors.text, fontSize: 11, lineHeight: 16, fontWeight: '800' },
  masteryBox: { borderColor: colors.green, borderWidth: 1, borderRadius: 12, padding: spacing.sm, backgroundColor: colors.greenSoft, marginTop: 4 },
  masteryTitle: { color: colors.green, fontSize: 10, fontWeight: '900', marginBottom: 3, textTransform: 'uppercase' },
  masteryText: { color: colors.text, fontSize: 11, lineHeight: 16, fontWeight: '800' },
});
