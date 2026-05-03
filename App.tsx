import { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { AppCard } from './src/components/AppCard';
import { AppHeader } from './src/components/AppHeader';
import { ExplanationPanel } from './src/components/ExplanationPanel';
import { InputButton } from './src/components/InputButton';
import { LadderDiagram } from './src/components/LadderDiagram';
import { MotorIndicator } from './src/components/MotorIndicator';
import { OutputIndicator } from './src/components/OutputIndicator';
import { directStartWithSealProject } from './src/data/defaultProjects';
import { createInitialState, evaluateProject, setInput } from './src/engine/ladderEvaluator';
import { PlcState } from './src/engine/projectTypes';
import { colors } from './src/theme/colors';
import { spacing } from './src/theme/spacing';

type Mode = 'home' | 'learn' | 'simulate';

export default function App() {
  const project = directStartWithSealProject;
  const initial = useMemo(() => createInitialState(project), [project]);
  const [mode, setMode] = useState<Mode>('home');
  const [plcState, setPlcState] = useState<PlcState>(initial);
  const evaluation = evaluateProject(project, plcState);

  function applyInput(inputId: string, value: boolean) {
    const result = setInput(project, evaluation.state, inputId, value);
    setPlcState(result.state);
  }

  function toggleSafetyInput(inputId: 'I2' | 'I3') {
    const current = Boolean(evaluation.state[inputId]);
    applyInput(inputId, !current);
  }

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
              badge="Lições"
              onPress={() => setMode('learn')}
            />
            <AppCard
              title="Simular"
              description="Monte e teste lógicas Ladder por blocos. O primeiro projeto é uma partida direta com selo."
              badge="MVP"
              onPress={() => setMode('simulate')}
            />
            <AppCard
              title="Desafios"
              description="Exercícios práticos com validação automática. Planejado para a próxima etapa."
              badge="Futuro"
            />
            <Text style={styles.footer}>Projeto educacional em desenvolvimento. A primeira versão prioriza clareza, prática e estabilidade.</Text>
          </>
        ) : null}

        {mode === 'learn' ? (
          <>
            <AppHeader title="Modo Aprender" subtitle="Comece entendendo o circuito antes de montar sua própria lógica." />
            <AppCard title="Partida direta com selo" description="Entenda como o botão Liga aciona o contator e como o contato auxiliar mantém o motor ligado." badge="Disponível" onPress={() => setMode('simulate')} />
            <AppCard title="Contato NA e NF" description="Base para compreender botões, sensores e proteções no Ladder." badge="Próximo" />
            <AppCard title="Intertravamento" description="Evita comandos conflitantes, como avanço e reverso ao mesmo tempo." badge="Próximo" />
            <AppCard title="Voltar" description="Retornar para a tela inicial." onPress={() => setMode('home')} />
          </>
        ) : null}

        {mode === 'simulate' ? (
          <>
            <AppHeader title="Modo Simular" subtitle={project.description} />
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
