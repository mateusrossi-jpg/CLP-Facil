import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  getGuidedPracticesLinkedToProject,
  getProjectLearningLinkSummary,
} from '../../education/projectLearningLinks';
import { getBenchBoardTargetLabel, getBenchMappingForProject, getBenchPinRiskLabel, type BenchPinRisk } from '../../projects/projectBenchMappings';
import { getProjectCategoryLabel, getProjectDifficultyLabel, type ProjectDifficulty, type TrainingProject } from '../../projects/projectCatalog';
import { getIoPointsForProject, getProjectIoKindLabel, getSafetyCriticalIoPoints, type ProjectIoKind, type ProjectIoPoint } from '../../projects/projectIoMaps';
import { getRungTemplatesForProject } from '../../projects/projectLadderTemplates';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { PremiumBadge, PremiumProgress, PremiumSection } from './PremiumCards';

type PremiumProjectDetailCardProps = {
  project: TrainingProject;
};

const ioKinds: ProjectIoKind[] = ['input', 'output', 'memory', 'timer', 'counter'];

function difficultyTone(difficulty: ProjectDifficulty): 'green' | 'amber' | 'purple' {
  if (difficulty === 'basic') return 'green';
  if (difficulty === 'intermediate') return 'amber';
  return 'purple';
}

function riskTone(risk: BenchPinRisk): 'green' | 'amber' | 'neutral' {
  if (risk === 'safe') return 'green';
  if (risk === 'attention') return 'amber';
  return 'neutral';
}

function IoPointRow({ point }: { point: ProjectIoPoint }) {
  return (
    <View style={[styles.ioPoint, point.safetyCritical && styles.ioPointCritical]}>
      <View style={styles.ioTagBox}>
        <Text style={[styles.ioTag, point.safetyCritical && styles.ioTagCritical]}>{point.tag}</Text>
      </View>
      <View style={styles.ioCopy}>
        <Text style={styles.ioLabel}>{point.label}{point.normallyClosed ? ' • NF' : ''}</Text>
        <Text style={styles.ioDescription}>{point.description}</Text>
      </View>
      {point.safetyCritical ? <Text style={styles.safetyMark}>!</Text> : null}
    </View>
  );
}

export const PremiumProjectDetailCard = memo(function PremiumProjectDetailCard({ project }: PremiumProjectDetailCardProps) {
  const learning = getProjectLearningLinkSummary(project.id);
  const linkedPractices = getGuidedPracticesLinkedToProject(project.id);
  const rungTemplates = getRungTemplatesForProject(project.id);
  const ioPoints = getIoPointsForProject(project.id);
  const safetyPoints = getSafetyCriticalIoPoints(project.id);
  const benchMapping = getBenchMappingForProject(project.id);

  return (
    <PremiumSection title="Projeto aberto" subtitle="Detalhe técnico e didático do exemplo selecionado" tone="green">
      <View style={styles.hero}>
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>{project.title.slice(0, 1)}</Text>
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>Biblioteca Easy-PLC</Text>
          <Text style={styles.title}>{project.title}</Text>
          <Text style={styles.description}>{project.description}</Text>
        </View>
      </View>

      <View style={styles.badgeRow}>
        <PremiumBadge label={getProjectDifficultyLabel(project.difficulty)} tone={difficultyTone(project.difficulty)} />
        <PremiumBadge label={getProjectCategoryLabel(project.category)} tone="cyan" />
        <PremiumBadge label={`${project.estimatedMinutes} min`} tone="neutral" />
      </View>

      <View style={styles.metricGrid}>
        <View style={styles.metricCard}><Text style={styles.metricValue}>{project.rungs}</Text><Text style={styles.metricLabel}>rungs</Text></View>
        <View style={styles.metricCard}><Text style={styles.metricValue}>{project.timers}</Text><Text style={styles.metricLabel}>timers</Text></View>
        <View style={styles.metricCard}><Text style={styles.metricValue}>{project.counters}</Text><Text style={styles.metricLabel}>contadores</Text></View>
        <View style={styles.metricCard}><Text style={styles.metricValue}>{project.ioSummary.inputs}/{project.ioSummary.outputs}</Text><Text style={styles.metricLabel}>I/O</Text></View>
      </View>

      <View style={styles.learningBox}>
        <Text style={styles.learningTitle}>Ligação com Aprender</Text>
        <Text style={styles.learningText}>{learning.linkedLessons.length} lições vinculadas • {learning.linkedPracticeCount} práticas guiadas</Text>
        <PremiumProgress value={learning.teachingScore} label={`Score didático ${learning.teachingScore}%`} />
      </View>

      {benchMapping ? (
        <View style={styles.block}>
          <View style={styles.blockHeaderRow}>
            <Text style={styles.blockTitle}>Bancada sugerida</Text>
            <PremiumBadge label={getBenchBoardTargetLabel(benchMapping.recommendedTarget)} tone="cyan" />
          </View>
          <Text style={styles.blockText}>{benchMapping.summary}</Text>
          {benchMapping.pins.map((pin) => (
            <View key={`${pin.tag}-${pin.arduinoPin}-${pin.esp32Pin}`} style={[styles.benchPin, pin.risk === 'attention' && styles.benchPinAttention]}>
              <View style={styles.benchTagBox}>
                <Text style={styles.benchTag}>{pin.tag}</Text>
                <Text style={styles.benchDirection}>{pin.direction === 'input' ? 'Entrada' : 'Saída'}</Text>
              </View>
              <View style={styles.benchCopy}>
                <Text style={styles.benchLabel}>{pin.label}</Text>
                <Text style={styles.benchPins}>Arduino {pin.arduinoPin} • ESP32 {pin.esp32Pin}</Text>
                <Text style={styles.benchNote}>{pin.note}</Text>
              </View>
              <PremiumBadge label={getBenchPinRiskLabel(pin.risk)} tone={riskTone(pin.risk)} />
            </View>
          ))}
          <View style={styles.safetyNoteBox}>
            <Text style={styles.safetyNoteTitle}>Notas de segurança</Text>
            {benchMapping.safetyNotes.map((note) => <Text key={note} style={styles.safetyNoteText}>• {note}</Text>)}
          </View>
        </View>
      ) : null}

      {ioPoints.length > 0 ? (
        <View style={styles.block}>
          <View style={styles.blockHeaderRow}>
            <Text style={styles.blockTitle}>Mapa de I/O do projeto</Text>
            {safetyPoints.length > 0 ? <PremiumBadge label={`${safetyPoints.length} críticos`} tone="amber" /> : null}
          </View>
          {ioKinds.map((kind) => {
            const points = ioPoints.filter((point) => point.kind === kind);
            if (points.length === 0) return null;
            return (
              <View key={kind} style={styles.ioGroup}>
                <Text style={styles.ioGroupTitle}>{getProjectIoKindLabel(kind)}</Text>
                {points.map((point) => <IoPointRow key={point.id} point={point} />)}
              </View>
            );
          })}
        </View>
      ) : null}

      {rungTemplates.length > 0 ? (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Prévia Ladder compacta</Text>
          {rungTemplates.map((rung) => (
            <View key={rung.id} style={styles.rungCard}>
              <View style={styles.rungTop}>
                <Text style={styles.rungNumber}>R{rung.rungNumber}</Text>
                <View style={styles.rungCopy}>
                  <Text style={styles.rungTitle}>{rung.title}</Text>
                  <Text style={styles.rungDescription}>{rung.description}</Text>
                </View>
              </View>
              <View style={styles.rungLogicRow}>
                <View style={styles.conditionStack}>
                  {rung.conditions.map((condition) => <Text key={condition} style={styles.conditionChip}>{condition}</Text>)}
                </View>
                <Text style={styles.rungArrow}>→</Text>
                <View style={styles.outputBox}>
                  <Text style={styles.outputText}>{rung.output}</Text>
                  <Text style={styles.outputDescription}>{rung.outputDescription}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {learning.linkedLessons.length > 0 || linkedPractices.length > 0 ? (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Conteúdo vinculado</Text>
          {learning.linkedLessons.map((lesson) => (
            <View key={lesson.id} style={styles.linkedItem}>
              <Text style={styles.linkedLabel}>Lição</Text>
              <Text style={styles.linkedTitle}>{lesson.title}</Text>
              <Text style={styles.linkedDescription}>{lesson.practice}</Text>
            </View>
          ))}
          {linkedPractices.map((practice) => (
            <View key={practice.lessonId} style={styles.linkedItem}>
              <Text style={styles.linkedLabel}>Prática guiada</Text>
              <Text style={styles.linkedTitle}>{practice.title}</Text>
              <Text style={styles.linkedDescription}>{practice.objective}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Objetivos de aprendizagem</Text>
        {project.learningGoals.map((goal) => <Text key={goal} style={styles.blockText}>• {goal}</Text>)}
      </View>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Instruções utilizadas</Text>
        <View style={styles.instructionRow}>
          {project.instructions.map((instruction) => <Text key={instruction} style={styles.instructionChip}>{instruction}</Text>)}
        </View>
      </View>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Tags de estudo</Text>
        <View style={styles.instructionRow}>
          {project.tags.map((tag) => <Text key={tag} style={styles.tagChip}>{tag}</Text>)}
        </View>
      </View>
    </PremiumSection>
  );
});

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderColor: colors.green,
    borderWidth: 1,
    backgroundColor: colors.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { color: colors.green, fontSize: 22, fontWeight: '900' },
  heroCopy: { flex: 1, minWidth: 0 },
  eyebrow: { color: colors.green, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.8 },
  title: { color: colors.text, fontSize: 17, lineHeight: 23, fontWeight: '900', marginTop: 2 },
  description: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 3, fontWeight: '700' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metricCard: {
    flexGrow: 1,
    flexBasis: 90,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
  },
  metricValue: { color: colors.cyan, fontSize: 19, fontWeight: '900' },
  metricLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', marginTop: 2 },
  learningBox: { borderColor: colors.green, borderWidth: 1, borderRadius: 18, padding: spacing.md, backgroundColor: colors.greenSoft, gap: spacing.sm },
  learningTitle: { color: colors.green, fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  learningText: { color: colors.text, fontSize: 12, lineHeight: 18, fontWeight: '800' },
  block: { borderColor: colors.border, borderWidth: 1, borderRadius: 18, padding: spacing.md, backgroundColor: colors.surfaceElevated, gap: spacing.xs },
  blockHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  blockTitle: { color: colors.text, fontSize: 13, fontWeight: '900' },
  blockText: { color: colors.textMuted, fontSize: 12, lineHeight: 18, fontWeight: '700' },
  benchPin: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: spacing.sm, backgroundColor: colors.surface },
  benchPinAttention: { borderColor: colors.amber, backgroundColor: colors.amberSoft },
  benchTagBox: { minWidth: 56, borderColor: colors.borderStrong, borderWidth: 1, borderRadius: 10, paddingHorizontal: spacing.sm, paddingVertical: 5, alignItems: 'center', backgroundColor: colors.surfaceElevated },
  benchTag: { color: colors.cyan, fontSize: 11, fontWeight: '900' },
  benchDirection: { color: colors.textDim, fontSize: 9, fontWeight: '900', marginTop: 2 },
  benchCopy: { flex: 1, minWidth: 0 },
  benchLabel: { color: colors.text, fontSize: 12, fontWeight: '900' },
  benchPins: { color: colors.cyan, fontSize: 10, lineHeight: 14, fontWeight: '900', marginTop: 2 },
  benchNote: { color: colors.textMuted, fontSize: 10, lineHeight: 14, fontWeight: '700', marginTop: 2 },
  safetyNoteBox: { borderColor: colors.amber, borderWidth: 1, borderRadius: 14, padding: spacing.sm, backgroundColor: colors.amberSoft, gap: 3 },
  safetyNoteTitle: { color: colors.amber, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  safetyNoteText: { color: colors.text, fontSize: 11, lineHeight: 16, fontWeight: '800' },
  ioGroup: { gap: 5, marginTop: spacing.xs },
  ioGroupTitle: { color: colors.cyan, fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.6 },
  ioPoint: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: spacing.sm, backgroundColor: colors.surface },
  ioPointCritical: { borderColor: colors.amber, backgroundColor: colors.amberSoft },
  ioTagBox: { minWidth: 48, borderColor: colors.borderStrong, borderWidth: 1, borderRadius: 10, paddingHorizontal: spacing.sm, paddingVertical: 5, alignItems: 'center', backgroundColor: colors.surfaceElevated },
  ioTag: { color: colors.cyan, fontSize: 11, fontWeight: '900' },
  ioTagCritical: { color: colors.amber },
  ioCopy: { flex: 1, minWidth: 0 },
  ioLabel: { color: colors.text, fontSize: 12, lineHeight: 16, fontWeight: '900' },
  ioDescription: { color: colors.textMuted, fontSize: 10, lineHeight: 14, fontWeight: '700', marginTop: 2 },
  safetyMark: { color: colors.amber, fontSize: 16, fontWeight: '900' },
  rungCard: { borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: spacing.sm, backgroundColor: colors.surface, gap: spacing.sm },
  rungTop: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  rungNumber: { color: colors.cyan, fontSize: 11, fontWeight: '900', borderColor: colors.cyan, borderWidth: 1, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 3, backgroundColor: colors.cyanSoft },
  rungCopy: { flex: 1, minWidth: 0 },
  rungTitle: { color: colors.text, fontSize: 12, lineHeight: 17, fontWeight: '900' },
  rungDescription: { color: colors.textMuted, fontSize: 11, lineHeight: 16, fontWeight: '700', marginTop: 2 },
  rungLogicRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  conditionStack: { flex: 1, gap: 4 },
  conditionChip: { color: colors.textMuted, borderColor: colors.border, borderWidth: 1, borderRadius: 10, paddingHorizontal: spacing.sm, paddingVertical: 4, fontSize: 10, fontWeight: '800', backgroundColor: colors.surfaceElevated },
  rungArrow: { color: colors.green, fontSize: 17, fontWeight: '900' },
  outputBox: { width: 100, borderColor: colors.green, borderWidth: 1, borderRadius: 12, padding: spacing.sm, backgroundColor: colors.greenSoft },
  outputText: { color: colors.green, fontSize: 11, lineHeight: 15, fontWeight: '900' },
  outputDescription: { color: colors.text, fontSize: 9, lineHeight: 13, fontWeight: '700', marginTop: 2 },
  linkedItem: { borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: spacing.sm, backgroundColor: colors.surface, gap: 3 },
  linkedLabel: { color: colors.green, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  linkedTitle: { color: colors.text, fontSize: 12, lineHeight: 17, fontWeight: '900' },
  linkedDescription: { color: colors.textMuted, fontSize: 11, lineHeight: 16, fontWeight: '700' },
  instructionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  instructionChip: { color: colors.cyan, borderColor: colors.cyan, borderWidth: 1, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 4, fontSize: 10, fontWeight: '900', backgroundColor: colors.cyanSoft },
  tagChip: { color: colors.textMuted, borderColor: colors.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 4, fontSize: 10, fontWeight: '900', backgroundColor: colors.surface },
});
