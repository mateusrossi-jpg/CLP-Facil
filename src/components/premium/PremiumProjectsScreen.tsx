import { memo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { PremiumBadge, PremiumMetric, PremiumScreen, PremiumSection, PremiumSegmented } from './index';

type ProjectFilter = 'all' | 'basic' | 'intermediate' | 'advanced' | 'favorites';

type ProjectCard = {
  title: string;
  description: string;
  category: string;
  difficulty: 'Básico' | 'Intermediário' | 'Avançado';
  rungs: number;
  timers: number;
  counters: number;
  favorite: boolean;
};

const projects: ProjectCard[] = [
  { title: 'Partida direta', description: 'Acionamento simples de motor com contato NA e bobina.', category: 'Motores', difficulty: 'Básico', rungs: 1, timers: 0, counters: 0, favorite: true },
  { title: 'Selo', description: 'Comando de retenção com partida, parada e saída do motor.', category: 'Comandos', difficulty: 'Básico', rungs: 2, timers: 0, counters: 0, favorite: true },
  { title: 'Reversão', description: 'Intertravamento entre contatores K1 e K2 para inverter giro.', category: 'Motores', difficulty: 'Intermediário', rungs: 4, timers: 0, counters: 0, favorite: false },
  { title: 'Estrela-triângulo', description: 'Sequência temporizada para partida reduzida de motor.', category: 'Motores', difficulty: 'Avançado', rungs: 7, timers: 2, counters: 0, favorite: false },
  { title: 'Semáforo', description: 'Sequência didática com temporizadores encadeados.', category: 'Processos', difficulty: 'Intermediário', rungs: 6, timers: 3, counters: 0, favorite: true },
  { title: 'Bomba alternada', description: 'Alternância entre bombas com memória e proteção.', category: 'Processos', difficulty: 'Avançado', rungs: 8, timers: 1, counters: 1, favorite: false },
  { title: 'Esteira', description: 'Controle de esteira com sensor, contagem e parada.', category: 'Processos', difficulty: 'Intermediário', rungs: 5, timers: 1, counters: 1, favorite: false },
  { title: 'Portão automático', description: 'Abertura e fechamento com fim de curso e temporização.', category: 'Automação', difficulty: 'Intermediário', rungs: 6, timers: 2, counters: 0, favorite: true },
];

function difficultyTone(difficulty: ProjectCard['difficulty']): 'green' | 'amber' | 'purple' {
  if (difficulty === 'Básico') return 'green';
  if (difficulty === 'Intermediário') return 'amber';
  return 'purple';
}

function filterProjects(filter: ProjectFilter): ProjectCard[] {
  if (filter === 'basic') return projects.filter((project) => project.difficulty === 'Básico');
  if (filter === 'intermediate') return projects.filter((project) => project.difficulty === 'Intermediário');
  if (filter === 'advanced') return projects.filter((project) => project.difficulty === 'Avançado');
  if (filter === 'favorites') return projects.filter((project) => project.favorite);
  return projects;
}

export const PremiumProjectsScreen = memo(function PremiumProjectsScreen() {
  const [filter, setFilter] = useState<ProjectFilter>('all');
  const filteredProjects = filterProjects(filter);
  const featuredProject = projects[1];

  return (
    <PremiumScreen>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Projetos</Text>
        <Text style={styles.title}>Biblioteca de exemplos</Text>
        <Text style={styles.subtitle}>Modelos prontos para estudar, editar, simular e exportar para bancada.</Text>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <Text style={styles.searchText}>Buscar projeto, aplicação ou instrução...</Text>
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
        <PremiumMetric label="Projetos" value={projects.length} hint="biblioteca" tone="cyan" />
        <PremiumMetric label="Favoritos" value={projects.filter((project) => project.favorite).length} hint="salvos" tone="amber" />
        <PremiumMetric label="Avançados" value={projects.filter((project) => project.difficulty === 'Avançado').length} hint="prática" tone="purple" />
      </View>

      <PremiumSection title="Projeto em destaque" subtitle="Ideal para iniciar no pensamento Ladder" tone="green">
        <View style={styles.featuredCard}>
          <View style={styles.featuredTop}>
            <View style={styles.featuredIcon}><Text style={styles.featuredIconText}>M</Text></View>
            <View style={styles.featuredCopy}>
              <Text style={styles.featuredTitle}>{featuredProject.title}</Text>
              <Text style={styles.featuredDescription}>{featuredProject.description}</Text>
            </View>
            <PremiumBadge label={featuredProject.difficulty} tone={difficultyTone(featuredProject.difficulty)} />
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaChip}>{featuredProject.rungs} rungs</Text>
            <Text style={styles.metaChip}>{featuredProject.timers} timers</Text>
            <Text style={styles.metaChip}>{featuredProject.counters} contadores</Text>
            <Text style={styles.metaChip}>Easy-PLC</Text>
          </View>
          <View style={styles.actionsRow}>
            <Pressable style={styles.primaryButton}><Text style={styles.primaryText}>Abrir projeto</Text></Pressable>
            <Pressable style={styles.secondaryButton}><Text style={styles.secondaryText}>Simular</Text></Pressable>
          </View>
        </View>
      </PremiumSection>

      <PremiumSection title="Projetos populares" subtitle="Escolha um modelo e comece a praticar" tone="cyan">
        <View style={styles.projectGrid}>
          {filteredProjects.map((project) => (
            <View key={project.title} style={styles.projectCard}>
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
                <PremiumBadge label={project.difficulty} tone={difficultyTone(project.difficulty)} />
                <PremiumBadge label={project.category} tone="cyan" />
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaChip}>{project.rungs} rungs</Text>
                {project.timers > 0 ? <Text style={styles.metaChip}>{project.timers} timers</Text> : null}
                {project.counters > 0 ? <Text style={styles.metaChip}>{project.counters} contadores</Text> : null}
              </View>
              <Pressable style={styles.openButton}><Text style={styles.openButtonText}>Abrir</Text></Pressable>
            </View>
          ))}
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
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderColor: colors.border, borderWidth: 1, borderRadius: 18, padding: spacing.md, backgroundColor: colors.surfaceElevated },
  searchIcon: { color: colors.cyan, fontSize: 18, fontWeight: '900' },
  searchText: { color: colors.textDim, fontSize: 12, fontWeight: '800' },
  metricRow: { flexDirection: 'row', gap: spacing.sm },
  featuredCard: { borderColor: colors.border, borderWidth: 1, borderRadius: 20, padding: spacing.md, backgroundColor: colors.surfaceElevated, gap: spacing.md },
  featuredTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  featuredIcon: { width: 48, height: 48, borderRadius: 16, borderColor: colors.green, borderWidth: 1, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' },
  featuredIconText: { color: colors.green, fontSize: 22, fontWeight: '900' },
  featuredCopy: { flex: 1, minWidth: 0 },
  featuredTitle: { color: colors.text, fontSize: 17, fontWeight: '900' },
  featuredDescription: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 3 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  metaChip: { color: colors.textMuted, borderColor: colors.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 4, fontSize: 10, fontWeight: '900', backgroundColor: colors.surface },
  actionsRow: { flexDirection: 'row', gap: spacing.sm },
  primaryButton: { flex: 1, borderColor: colors.green, borderWidth: 1, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', backgroundColor: colors.greenSoft },
  primaryText: { color: colors.green, fontSize: 12, fontWeight: '900' },
  secondaryButton: { flex: 1, borderColor: colors.cyan, borderWidth: 1, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', backgroundColor: colors.cyanSoft },
  secondaryText: { color: colors.cyan, fontSize: 12, fontWeight: '900' },
  projectGrid: { gap: spacing.sm },
  projectCard: { borderColor: colors.border, borderWidth: 1, borderRadius: 20, padding: spacing.md, backgroundColor: colors.surfaceElevated, gap: spacing.sm },
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
  openButton: { borderColor: colors.borderStrong, borderWidth: 1, borderRadius: 14, paddingVertical: spacing.sm, alignItems: 'center', backgroundColor: colors.surface },
  openButtonText: { color: colors.text, fontSize: 12, fontWeight: '900' },
});
