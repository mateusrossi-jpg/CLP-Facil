import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { PremiumActionTile, PremiumBadge, PremiumMetric, PremiumProgress, PremiumScreen, PremiumSection } from './index';

export const PremiumHomeScreen = memo(function PremiumHomeScreen() {
  return (
    <PremiumScreen>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>E</Text>
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>Easy-PLC / CLP Fácil</Text>
            <Text style={styles.title}>Aprenda, simule e domine CLPs</Text>
            <Text style={styles.subtitle}>Ambiente mobile para Ladder, comandos elétricos, lições guiadas e bancada ESP32.</Text>
          </View>
        </View>
        <View style={styles.badgeRow}>
          <PremiumBadge label="Mobile-first" tone="cyan" />
          <PremiumBadge label="Educativo" tone="green" />
          <PremiumBadge label="Bancada" tone="amber" />
        </View>
      </View>

      <View style={styles.metricRow}>
        <PremiumMetric label="Progresso" value="42%" hint="trilha atual" tone="green" />
        <PremiumMetric label="Projetos" value="8" hint="salvos" tone="cyan" />
        <PremiumMetric label="Streak" value="5d" hint="estudo" tone="amber" />
      </View>

      <PremiumSection title="Continue aprendendo" subtitle="Retome de onde parou" tone="green">
        <View style={styles.lessonCard}>
          <View style={styles.lessonTop}>
            <View>
              <Text style={styles.lessonTitle}>Lição 03 — Selo</Text>
              <Text style={styles.lessonText}>Entenda por que uma saída mantém o motor ligado após soltar a partida.</Text>
            </View>
            <PremiumBadge label="Atual" tone="green" />
          </View>
          <PremiumProgress value={58} label="58% concluído" />
        </View>
      </PremiumSection>

      <PremiumSection title="Ações rápidas" subtitle="Comece em poucos toques" tone="cyan">
        <View style={styles.actionGrid}>
          <PremiumActionTile title="Simulação rápida" description="RUN, I/O e rung compacto" icon="▶" tone="green" />
          <PremiumActionTile title="Criar projeto" description="Novo Ladder mobile" icon="＋" tone="cyan" />
          <PremiumActionTile title="Abrir exemplo" description="Selo, semáforo, esteira" icon="▦" tone="amber" />
        </View>
      </PremiumSection>

      <PremiumSection title="Projetos recentes" subtitle="Continue sua prática" tone="purple">
        <View style={styles.projectList}>
          {[
            ['Tanque_Nível', 'Reservatório • 4 rungs • 2 timers', 'Ativo'],
            ['Partida_Selo', 'Motor • 2 rungs • básico', 'Estudo'],
            ['Esteira_01', 'Processo • 6 rungs • intermediário', 'Teste'],
          ].map(([title, meta, status]) => (
            <View key={title} style={styles.projectCard}>
              <View style={styles.projectIcon}><Text style={styles.projectIconText}>⌁</Text></View>
              <View style={styles.projectCopy}>
                <Text style={styles.projectTitle}>{title}</Text>
                <Text style={styles.projectMeta}>{meta}</Text>
              </View>
              <PremiumBadge label={status} tone={status === 'Ativo' ? 'green' : status === 'Teste' ? 'amber' : 'cyan'} />
            </View>
          ))}
        </View>
      </PremiumSection>

      <PremiumSection title="Exemplos prontos" subtitle="Modelos didáticos para simular" tone="amber">
        <View style={styles.exampleRow}>
          {['Partida direta', 'Selo', 'Reversão', 'Semáforo'].map((item) => (
            <View key={item} style={styles.exampleChip}>
              <Text style={styles.exampleText}>{item}</Text>
            </View>
          ))}
        </View>
      </PremiumSection>
    </PremiumScreen>
  );
});

const styles = StyleSheet.create({
  hero: {
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 28,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  heroTop: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  logoBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    borderColor: colors.cyan,
    borderWidth: 1,
    backgroundColor: colors.cyanSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: colors.cyan, fontSize: 28, fontWeight: '900' },
  heroCopy: { flex: 1, minWidth: 0 },
  eyebrow: { color: colors.cyan, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  title: { color: colors.text, fontSize: 24, lineHeight: 30, fontWeight: '900', marginTop: 3 },
  subtitle: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 4 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metricRow: { flexDirection: 'row', gap: spacing.sm },
  lessonCard: { borderColor: colors.border, borderWidth: 1, borderRadius: 18, padding: spacing.md, backgroundColor: colors.surfaceElevated, gap: spacing.md },
  lessonTop: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  lessonTitle: { color: colors.text, fontSize: 15, fontWeight: '900' },
  lessonText: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 3 },
  actionGrid: { gap: spacing.sm },
  projectList: { gap: spacing.sm },
  projectCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderColor: colors.border, borderWidth: 1, borderRadius: 18, padding: spacing.md, backgroundColor: colors.surfaceElevated },
  projectIcon: { width: 38, height: 38, borderRadius: 14, backgroundColor: colors.cyanSoft, borderColor: colors.cyan, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  projectIconText: { color: colors.cyan, fontSize: 18, fontWeight: '900' },
  projectCopy: { flex: 1, minWidth: 0 },
  projectTitle: { color: colors.text, fontSize: 13, fontWeight: '900' },
  projectMeta: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  exampleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  exampleChip: { borderColor: colors.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surfaceElevated },
  exampleText: { color: colors.text, fontSize: 12, fontWeight: '800' },
});
