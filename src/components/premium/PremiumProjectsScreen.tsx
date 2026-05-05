import { memo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { getProjectLearningLinkSummary } from '../../education/projectLearningLinks';
import {
  getFeaturedTrainingProject,
  getProjectCategoryLabel,
  getProjectDifficultyLabel,
  trainingProjects,
  type ProjectCatalogFilter,
  type ProjectDifficulty,
  type TrainingProject,
} from '../../projects/projectCatalog';
import { searchTrainingProjects } from '../../projects/projectSearch';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import type { BottomNavKey } from '../navigationTypes';
import { PremiumBadge, PremiumMetric, PremiumScreen, PremiumSection, PremiumSegmented } from './index';
import { PremiumProjectWorkspace } from './PremiumProjectWorkspace';

type ProjectFilter = ProjectCatalogFilter;

type PremiumProjectsScreenProps = {
  onNavigate?: (route: BottomNavKey) => void;
};

function difficultyTone(difficulty: ProjectDifficulty): 'green' | 'amber' | 'purple' {
  if (difficulty === 'basic') return 'green';
  if (difficulty === 'intermediate') return 'amber';
  return 'purple';
}

export const PremiumProjectsScreen = memo(function PremiumProjectsScreen({ onNavigate }: PremiumProjectsScreenProps) {
  const featuredProject = getFeaturedTrainingProject();
  const [filter, setFilter] = useState<ProjectFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState<TrainingProject>(featuredProject);
  const filteredProjects = searchTrainingProjects({ filter, search });
  const featuredLearning = getProjectLearningLinkSummary(featuredProject.id);

  return (
    <PremiumScreen>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Projetos</Text>
        <Text style={styles.title}>Biblioteca de exemplos</Text>
        <Text style={styles.subtitle}>Modelos prontos para estudar, editar, simular e exportar para bancada.</Text>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar projeto, I/O, tag ou instrução..."
            placeholderTextColor={colors.textDim}
            style={styles.searchInput}
          />
        </View>
      </View>

      <PremiumSegmented
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: 'Todos' },
          { value: 'basic', label: 'Básico' },
          { value: 'intermediate', label: 'Interm.' },
          { value: 'advanced', label: 'Avançado' },
          { value: 'favorites', label: 'Fav.' },
        ]}
      />

      <View style={styles.metricRow}>
        <PremiumMetric label="Projetos" value={trainingProjects.length} hint="biblioteca" tone="cyan" />
        <PremiumMetric label="Favoritos" value={trainingProjects.filter((project) => project.favorite).length} hint="salvos" tone="amber" />
        <PremiumMetric label="Filtrados" value={filteredProjects.length} hint="resultado" tone="green" />
      </View>

      <PremiumProjectWorkspace project={selectedProject} onNavigate={onNavigate} />

      <PremiumSection title="Projeto em destaque" subtitle="Ideal para iniciar no pensamento Ladder" tone="green">
        <View style={styles.featuredCard}>
          <View style={styles.featuredTop}>
            <View style={styles.featuredIcon}><Text style={styles.featuredIconText}>{featuredProject.title.slice(0, 1)}</Text></View>
            <View style={styles.featuredCopy}>
              <Text style={styles.featuredTitle}>{featuredProject.title}</Text>
              <Text style={styles.featuredDescription}>{featuredProject.description}</Text>
            </View>
            <PremiumBadge label={getProjectDifficultyLabel(featuredProject.difficulty)} tone={difficultyTone(featuredProject.difficulty)} />
          </View>
          <View style={styles.learningLinkBox}>
            <Text style={styles.learningLinkTitle}>Ligado ao modo Aprender</Text>
            <Text style={styles.learningLinkText}>{featuredLearning.linkedLessons.length} lições • {featuredLearning.linkedPracticeCount} práticas guiadas • score didático {featuredLearning.teachingScore}%</Text>
          </View>
          <View style={styles.goalList}>
            {featuredProject.learningGoals.slice(0, 3).map((goal) => <Text key={goal} style={styles.goalText}>• {goal}</Text>)}
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaChip}>{featuredProject.rungs} rungs</Text>
            <Text style={styles.metaChip}>{featuredProject.timers} timers</Text>
            <Text style={styles.metaChip}>{featuredProject.counters} contadores</Text>
            <Text style={styles.metaChip}>{featuredProject.estimatedMinutes} min</Text>
          </View>
          <View style={styles.actionsRow}>
            <Pressable onPress={() => setSelectedProject(featuredProject)} style={styles.primaryButton}><Text style={styles.primaryText}>Abrir projeto</Text></Pressable>
            <Pressable onPress={() => { setSelectedProject(featuredProject); onNavigate?.('simulate'); }} style={styles.secondaryButton}><Text style={styles.secondaryText}>Simular</Text></Pressable>
          </View>
        </View>
      </PremiumSection>

      <PremiumSection title="Projetos populares" subtitle="Escolha um modelo e comece a praticar" tone="cyan">
        <View style={styles.projectGrid}>
          {filteredProjects.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Nenhum projeto encontrado</Text>
              <Text style={styles.emptyText}>Tente buscar por motor, I0.0, Q0.0, KM1, sensor, fim de curso, timer, contador, TON ou CTU.</Text>
            </View>
          ) : null}
          {filteredProjects.map((project) => {
            const learning = getProjectLearningLinkSummary(project.id);
            const selected = selectedProject.id === project.id;
            return (
              <View key={project.id} style={[styles.projectCard, selected && styles.projectCardSelected]}>
                <View style={styles.cardTop}>
                  <View style={[styles.projectIcon, project.favorite && styles.projectIconFavorite]}>
                    <Text style={[styles.projectIconText, project.favorite && styles.projectIconTextFavorite]}>{project.title.slice(0, 1)}</Text>
                  </View>
                  <View style={styles.projectCopy}>
                    <Text style={styles.projectTitle}>{project.title}</Text>
                    <Text style={styles.projectDescription}>{project.description}</Text>
                  </View>
                  <Text style={styles.favorite}>{project.favorite ? '★' : '☆'}</Text>
                </View>
                <View style={styles.badgeRow}>
                  <PremiumBadge label={getProjectDifficultyLabel(project.difficulty)} tone={difficultyTone(project.difficulty)} />
                  <PremiumBadge label={getProjectCategoryLabel(project.category)} tone="cyan" />
                  {learning.teachingScore > 0 ? <PremiumBadge label={`${learning.linkedLessons.length} aulas`} tone="green" /> : null}
                  {selected ? <PremiumBadge label="Aberto" tone="green" /> : null}
                </View>
                {learning.teachingScore > 0 ? (
                  <View style={styles.learningMiniBox}>
                    <Text style={styles.learningMiniText}>{learning.linkedPracticeCount} práticas guiadas • score didático {learning.teachingScore}%</Text>
                  </View>
                ) : null}
                <View style={styles.metaRow}>
                  <Text style={styles.metaChip}>{project.rungs} rungs</Text>
                  {project.timers > 0 ? <Text style={styles.metaChip}>{project.timers} timers</Text> : null}
                  {project.counters > 0 ? <Text style={styles.metaChip}>{project.counters} contadores</Text> : null}
                  <Text style={styles.metaChip}>I/O {project.ioSummary.inputs}/{project.ioSummary.outputs}</Text>
                </View>
                <View style={styles.instructionRow}>
                  {project.instructions.slice(0, 4).map((instruction) => <Text key={instruction} style={styles.instructionChip}>{instruction}</Text>)}
                </View>
                <Pressable onPress={() => setSelectedProject(project)} style={[styles.openButton, selected && styles.openButtonSelected]}><Text style={[styles.openButtonText, selected && styles.openButtonTextSelected]}>{selected ? 'Projeto aberto' : 'Abrir'}</Text></Pressable>
              </View>
            );
          })}
        </View>
      </PremiumSection>
    </PremiumScreen>
  );
});

const styles = StyleSheet.create({
  hero: { borderColor: colors.borderStrong, borderWidth: 1, borderRadius: 28, padding: spacing.lg, backgroundColor: colors.surface, gap: spacing.md },
  eyebrow: { color: colors.cyan, fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.1 },
  title: { color: colors.text, fontSize: 26, lineHeight: 31, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderColor: colors.border, borderWidth: 1, borderRadius: 18, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surfaceElevated },
  searchIcon: { color: colors.cyan, fontSize: 18, fontWeight: '900' },
  searchInput: { flex: 1, minHeight: 34, color: colors.text, fontSize: 12, fontWeight: '800', paddingVertical: 0 },
  metricRow: { flexDirection: 'row', gap: spacing.sm },
  featuredCard: { borderColor: colors.border, borderWidth: 1, borderRadius: 20, padding: spacing.md, backgroundColor: colors.surfaceElevated, gap: spacing.md },
  featuredTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  featuredIcon: { width: 48, height: 48, borderRadius: 16, borderColor: colors.green, borderWidth: 1, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' },
  featuredIconText: { color: colors.green, fontSize: 22, fontWeight: '900' },
  featuredCopy: { flex: 1, minWidth: 0 },
  featuredTitle: { color: colors.text, fontSize: 17, fontWeight: '900' },
  featuredDescription: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 3 },
  learningLinkBox: { borderColor: colors.green, borderWidth: 1, borderRadius: 14, padding: spacing.sm, backgroundColor: colors.greenSoft },
  learningLinkTitle: { color: colors.green, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', marginBottom: 3 },
  learningLinkText: { color: colors.text, fontSize: 11, lineHeight: 16, fontWeight: '800' },
  learningMiniBox: { borderColor: colors.green, borderWidth: 1, borderRadius: 12, padding: spacing.sm, backgroundColor: colors.greenSoft },
  learningMiniText: { color: colors.text, fontSize: 10, lineHeight: 14, fontWeight: '800' },
  goalList: { gap: 3, borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: spacing.sm, backgroundColor: colors.surface },
  goalText: { color: colors.textMuted, fontSize: 11, lineHeight: 16, fontWeight: '800' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  metaChip: { color: colors.textMuted, borderColor: colors.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 4, fontSize: 10, fontWeight: '900', backgroundColor: colors.surface },
  instructionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  instructionChip: { color: colors.cyan, borderColor: colors.cyan, borderWidth: 1, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 4, fontSize: 10, fontWeight: '900', backgroundColor: colors.cyanSoft },
  actionsRow: { flexDirection: 'row', gap: spacing.sm },
  primaryButton: { flex: 1, borderColor: colors.green, borderWidth: 1, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', backgroundColor: colors.greenSoft },
  primaryText: { color: colors.green, fontSize: 12, fontWeight: '900' },
  secondaryButton: { flex: 1, borderColor: colors.cyan, borderWidth: 1, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', backgroundColor: colors.cyanSoft },
  secondaryText: { color: colors.cyan, fontSize: 12, fontWeight: '900' },
  projectGrid: { gap: spacing.sm },
  projectCard: { borderColor: colors.border, borderWidth: 1, borderRadius: 20, padding: spacing.md, backgroundColor: colors.surfaceElevated, gap: spacing.sm },
  projectCardSelected: { borderColor: colors.green, backgroundColor: colors.greenSoft },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  projectIcon: { width: 42, height: 42, borderRadius: 15, borderColor: colors.borderStrong, borderWidth: 1, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  projectIconFavorite: { borderColor: colors.amber, backgroundColor: colors.amberSoft },
  projectIconText: { color: colors.textMuted, fontSize: 17, fontWeight: '900' },
  projectIconTextFavorite: { color: colors.amber },
  projectCopy: { flex: 1, minWidth: 0 },
  projectTitle: { color: colors.text, fontSize: 14, fontWeight: '900' },
  projectDescription: { color: colors.textMuted, fontSize: 11, lineHeight: 16, marginTop: 2 },
  favorite: { color: colors.amber, fontSize: 18, fontWeight: '900' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  emptyCard: { borderColor: colors.border, borderWidth: 1, borderRadius: 18, padding: spacing.md, backgroundColor: colors.surfaceElevated, gap: spacing.xs },
  emptyTitle: { color: colors.text, fontSize: 14, fontWeight: '900' },
  emptyText: { color: colors.textMuted, fontSize: 12, lineHeight: 18, fontWeight: '700' },
  openButton: { borderColor: colors.borderStrong, borderWidth: 1, borderRadius: 14, paddingVertical: spacing.sm, alignItems: 'center', backgroundColor: colors.surface },
  openButtonSelected: { borderColor: colors.green, backgroundColor: colors.greenSoft },
  openButtonText: { color: colors.text, fontSize: 12, fontWeight: '900' },
  openButtonTextSelected: { color: colors.green },
});
