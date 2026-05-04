import { memo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { PremiumBadge, PremiumProgress, PremiumScreen, PremiumSection, PremiumSegmented } from './index';

type LearningTab = 'tracks' | 'modules' | 'challenges' | 'achievements';

const tracks = [
  ['História do CLP', 'Antes do CLP, relés, contatores e origem industrial.', 15, 'cyan'],
  ['Como o CLP funciona', 'CPU, memória, entradas, saídas e ciclo de scan.', 28, 'green'],
  ['Pensamento Ladder', 'NA, NF, bobina, selo e intertravamento.', 46, 'amber'],
  ['Instruções essenciais', 'SET, RESET, TON, TOF, CTU, CTD e bordas.', 18, 'purple'],
  ['Aplicações reais', 'Motores, semáforo, reservatório, esteira e portão.', 8, 'cyan'],
  ['Diagnóstico', 'Tags, força didática, scan e troubleshooting.', 4, 'green'],
] as const;

const nextLessons = [
  ['Lição 01', 'Antes do CLP', 'Como painéis com relés resolviam automações antes do controlador programável.'],
  ['Lição 02', 'Por que o CLP surgiu', 'Mudanças de lógica, manutenção e flexibilidade na indústria.'],
  ['Lição 03', 'Ciclo de scan', 'Leitura das entradas, execução e atualização das saídas.'],
];

export const PremiumLearningScreen = memo(function PremiumLearningScreen() {
  const [tab, setTab] = useState<LearningTab>('tracks');

  return (
    <PremiumScreen>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Aprender</Text>
        <Text style={styles.title}>Trilhas, módulos e progresso</Text>
        <Text style={styles.subtitle}>Aprenda a história, o funcionamento e a prática do CLP com lições guiadas e simulação.</Text>
        <View style={styles.heroStats}>
          <View style={styles.statBox}><Text style={styles.statValue}>6</Text><Text style={styles.statLabel}>trilhas</Text></View>
          <View style={styles.statBox}><Text style={styles.statValue}>32</Text><Text style={styles.statLabel}>lições</Text></View>
          <View style={styles.statBox}><Text style={styles.statValue}>42%</Text><Text style={styles.statLabel}>progresso</Text></View>
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
            <View style={styles.lessonIcon}><Text style={styles.lessonIconText}>03</Text></View>
            <View style={styles.lessonCopy}>
              <Text style={styles.lessonTitle}>Lição 03 — Selo</Text>
              <Text style={styles.lessonDescription}>Entenda como uma saída mantém o comando ativo e por que isso substitui lógica cabeada.</Text>
            </View>
            <PremiumBadge label="Atual" tone="green" />
          </View>
          <PremiumProgress value={58} label="58% concluído" />
        </View>
      </PremiumSection>

      {tab === 'tracks' ? (
        <PremiumSection title="Trilhas" subtitle="Do contexto histórico ao diagnóstico profissional" tone="cyan">
          <View style={styles.trackList}>
            {tracks.map(([name, description, progress, tone]) => (
              <View key={name} style={styles.trackCard}>
                <View style={styles.trackTop}>
                  <View style={styles.trackCopy}>
                    <Text style={styles.trackTitle}>{name}</Text>
                    <Text style={styles.trackDescription}>{description}</Text>
                  </View>
                  <PremiumBadge label={`${progress}%`} tone={tone} />
                </View>
                <PremiumProgress value={progress} />
              </View>
            ))}
          </View>
        </PremiumSection>
      ) : tab === 'modules' ? (
        <PremiumSection title="Próximas aulas" subtitle="Conteúdo educativo estruturado" tone="amber">
          <View style={styles.trackList}>
            {nextLessons.map(([code, title, description]) => (
              <View key={code} style={styles.moduleCard}>
                <Text style={styles.moduleCode}>{code}</Text>
                <View style={styles.moduleCopy}>
                  <Text style={styles.trackTitle}>{title}</Text>
                  <Text style={styles.trackDescription}>{description}</Text>
                </View>
              </View>
            ))}
          </View>
        </PremiumSection>
      ) : tab === 'challenges' ? (
        <PremiumSection title="Desafios" subtitle="Pratique até dominar" tone="purple">
          <View style={styles.trackList}>
            {['Montar uma partida direta', 'Criar selo com stop NF', 'Adicionar TON de segurança'].map((challenge, index) => (
              <View key={challenge} style={styles.challengeCard}>
                <Text style={styles.challengeNumber}>{index + 1}</Text>
                <Text style={styles.challengeText}>{challenge}</Text>
                <PremiumBadge label={index === 0 ? 'Liberado' : 'Bloqueado'} tone={index === 0 ? 'green' : 'neutral'} />
              </View>
            ))}
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
  lessonIconText: { color: colors.green, fontSize: 15, fontWeight: '900' },
  lessonCopy: { flex: 1, minWidth: 0 },
  lessonTitle: { color: colors.text, fontSize: 15, fontWeight: '900' },
  lessonDescription: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 2 },
  trackList: { gap: spacing.sm },
  trackCard: { borderColor: colors.border, borderWidth: 1, borderRadius: 18, padding: spacing.md, backgroundColor: colors.surfaceElevated, gap: spacing.sm },
  trackTop: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, alignItems: 'flex-start' },
  trackCopy: { flex: 1, minWidth: 0 },
  trackTitle: { color: colors.text, fontSize: 14, fontWeight: '900' },
  trackDescription: { color: colors.textMuted, fontSize: 11, lineHeight: 16, marginTop: 2 },
  moduleCard: { flexDirection: 'row', gap: spacing.sm, borderColor: colors.border, borderWidth: 1, borderRadius: 18, padding: spacing.md, backgroundColor: colors.surfaceElevated },
  moduleCode: { color: colors.amber, fontSize: 12, fontWeight: '900', width: 54 },
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
