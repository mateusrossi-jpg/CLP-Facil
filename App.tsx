import { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { AppCard } from './src/components/AppCard';
import { AppHeader } from './src/components/AppHeader';
import { ExplanationPanel } from './src/components/ExplanationPanel';
import { InputButton } from './src/components/InputButton';
import { LadderDiagram } from './src/components/LadderDiagram';
import { LessonCard } from './src/components/LessonCard';
import { LessonDetail } from './src/components/LessonDetail';
import { MotorIndicator } from './src/components/MotorIndicator';
import { OutputIndicator } from './src/components/OutputIndicator';
import { directStartWithSealProject } from './src/data/defaultProjects';
import { Lesson, learningModules, lessons } from './src/data/learningContent';
import { createInitialState, evaluateProject, setInput } from './src/engine/ladderEvaluator';
import { PlcState } from './src/engine/projectTypes';
import { colors } from './src/theme/colors';
import { spacing } from './src/theme/spacing';

type Mode = 'home' | 'learn' | 'lesson' | 'simulate';

export default function App() {
  const project = directStartWithSealProject;
  const initial = useMemo(() => createInitialState(project), [project]);
  const [mode, setMode] = useState<Mode>('home');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [plcState, setPlcState] = useState<PlcState>(initial);
  const evaluation = evaluateProject(project, plcState);

  function openLesson(lesson: Lesson) {
    setSelectedLesson(lesson);
    setMode('lesson');
  }

  function openSimulator() {
    setMode('simulate');
  }

  function applyInput(inputId: string, value: boolean) {
    const result = setInput(project, evaluation.state, inputId, value);
    setPlcState(result.state);
  }

  function resetSimulation() {
    setPlcState(createInitialState(project));
  }

  function toggleSafetyInput(inputId: 'I2' | 'I3') {
    const current = Boolean(evaluation.state[inputId]);
    applyInput(inputId, !current);
  }

  const availableLessons = lessons.filter((lesson) => lesson.status === 'available');

  return (
    <SafeAreaView style={styles.safe}>
      <ExpoStatusBar style="light" />
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.container}>
        {mode === 'home' ? (
          <>
            <AppHeader
              title="Simulador Ladder Educativo"
              subtitle="Aprenda comandos elétricos e lógica CLP no celular, com lições guiadas e um modo simulador para testar circuitos."
            />
            <AppCard
              title="Aprender"
              description="Lições guiadas com contato NA, contato NF, selo, intertravamento, motores, temporizadores e contadores."
              badge={`${availableLessons.length} lições`}
              onPress={() => setMode('learn')}
            />
            <AppCard
              title="Simular"
              description="Monte e teste lógicas Ladder por blocos. O primeiro projeto é uma partida direta com selo."
              badge="Simulador"
              onPress={openSimulator}
            />
            <AppCard
              title="Desafios"
              description="Exercícios práticos com validação automática. Planejado para a próxima etapa."
              badge="Futuro"
            />
            <Text style={styles.footer}>Projeto educacional em desenvolvimento. A primeira versão mantém lições e simulador como módulos igualmente importantes.</Text>
          </>
        ) : null}

        {mode === 'learn' ? (
          <>
            <AppHeader title="Modo Aprender" subtitle="Escolha uma lição, entenda a teoria e depois pratique no simulador quando a lição permitir." />
            {learningModules.map((module) => {
              const moduleLessons = lessons.filter((lesson) => lesson.moduleId === module.id);
              return (
                <View key={module.id} style={styles.moduleBlock}>
                  <View style={styles.moduleHeader}>
                    <Text style={styles.moduleTitle}>{module.title}</Text>
                    <Text style={[styles.moduleStatus, module.status === 'planned' && styles.moduleStatusPlanned]}>
                      {module.status === 'available' ? 'Disponível' : 'Futuro'}
                    </Text>
                  </View>
                  <Text style={styles.moduleDescription}>{module.description}</Text>
                  {moduleLessons.map((lesson) => (
                    <LessonCard key={lesson.id} lesson={lesson} onPress={() => openLesson(lesson)} />
                  ))}
                </View>
              );
            })}
            <AppCard title="Voltar" description="Retornar para a tela inicial." onPress={() => setMode('home')} />
          </>
        ) : null}

        {mode === 'lesson' && selectedLesson ? (
          <>
            <AppHeader title="Modo Aprender" subtitle="Lição guiada com ponte direta para prática no simulador." />
            <LessonDetail lesson={selectedLesson} onOpenSimulator={selectedLesson.simulatorProjectId ? openSimulator : undefined} />
            <AppCard title="Voltar para lições" description="Escolher outra lição." onPress={() => setMode('learn')} />
          </>
        ) : null}

        {mode === 'simulate' ? (
          <>
            <AppHeader title="Modo Simular" subtitle={project.description} />
            <View style={styles.simulatorModeBanner}>
              <Text style={styles.simulatorModeTitle}>Projeto livre inicial</Text>
              <Text style={styles.simulatorModeText}>Este é o primeiro simulador funcional. A próxima etapa será permitir adicionar/remover contatos e criar novos projetos.</Text>
            </View>
            <LadderDiagram project={project} state={evaluation.state} energizedRungs={evaluation.energizedRungs} />

            <Text style={styles.sectionTitle}>Entradas virtuais</Text>
            <View style={styles.inputGrid}>
              <InputButton
                label="I0 Liga"
                description="NA momentâneo"
                active={Boolean(evaluation.state.I0)}
                onPressIn={() => applyInput('I0', true)}
                onPressOut={() => applyInput('I0', false)}
              />
              <InputButton
                label="I1 Desliga"
                description="NF momentâneo"
                active={!evaluation.state.I1}
                danger
                onPressIn={() => applyInput('I1', false)}
                onPressOut={() => applyInput('I1', true)}
              />
              <InputButton
                label="I2 Emergência"
                description="NF travado"
                active={!evaluation.state.I2}
                danger
                onPress={() => toggleSafetyInput('I2')}
              />
              <InputButton
                label="I3 Sobrecarga"
                description="NF travado"
                active={!evaluation.state.I3}
                danger
                onPress={() => toggleSafetyInput('I3')}
              />
            </View>

            <Text style={styles.sectionTitle}>Saídas e atuadores</Text>
            <OutputIndicator label="Q0 / K1" description="Contator principal" active={Boolean(evaluation.state.Q0)} />
            <MotorIndicator active={Boolean(evaluation.state.MTR1)} />
            <ExplanationPanel text={evaluation.explanation} />
            <AppCard title="Resetar simulação" description="Voltar entradas e saídas para o estado inicial." onPress={resetSimulation} />
            <AppCard title="Voltar" description="Retornar para a tela inicial." onPress={() => setMode('home')} />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.background,
  },
  moduleBlock: {
    marginBottom: spacing.xl,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  moduleTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  moduleStatus: {
    color: colors.green,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  moduleStatusPlanned: {
    color: colors.amber,
  },
  moduleDescription: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  simulatorModeBanner: {
    backgroundColor: colors.cyanSoft,
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 18,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  simulatorModeTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: spacing.xs,
  },
  simulatorModeText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  inputGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
    marginBottom: spacing.lg,
  },
  footer: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.lg,
  },
});
