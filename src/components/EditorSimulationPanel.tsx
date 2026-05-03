import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EditorDiagnosticSeverity, EditorEvaluationResult } from '../engine/editorEvaluator';
import { PlcState } from '../engine/projectTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const inputs = ['I0', 'I1', 'I2', 'I3'];
const outputs = ['Q0', 'Q1', 'M0', 'M1', 'T0', 'T1', 'C0', 'C1'];

const severityLabel: Record<EditorDiagnosticSeverity, string> = {
  info: 'INFO',
  warning: 'AVISO',
  error: 'ERRO',
};

function diagnosticStyle(severity: EditorDiagnosticSeverity) {
  if (severity === 'error') return styles.diagnosticError;
  if (severity === 'warning') return styles.diagnosticWarning;
  return styles.diagnosticInfo;
}

function formatMs(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}s`;
  return `${value}ms`;
}

type EditorSimulationPanelProps = {
  state: PlcState;
  evaluation: EditorEvaluationResult;
  onToggleInput: (inputId: string) => void;
};

export function EditorSimulationPanel({ state, evaluation, onToggleInput }: EditorSimulationPanelProps) {
  const timers = Object.entries(evaluation.runtime.timers);
  const counters = Object.entries(evaluation.runtime.counters);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Simulação do projeto editável</Text>
          <Text style={styles.subtitle}>Acione entradas virtuais para testar a lógica que você montou no editor.</Text>
        </View>
        <Text style={styles.scanBadge}>SCAN {evaluation.scanNumber}</Text>
      </View>

      <Text style={styles.sectionTitle}>Entradas</Text>
      <View style={styles.grid}>
        {inputs.map((input) => {
          const active = Boolean(state[input]);
          return (
            <Pressable key={input} onPress={() => onToggleInput(input)} style={({ pressed }) => [styles.ioCard, active && styles.inputActive, pressed && styles.pressed]}>
              <Text style={styles.ioLabel}>{input}</Text>
              <Text style={[styles.ioState, active && styles.activeText]}>{active ? '1' : '0'}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Saídas, memórias e blocos</Text>
      <View style={styles.grid}>
        {outputs.map((output) => {
          const active = Boolean(evaluation.state[output]);
          return (
            <View key={output} style={[styles.ioCard, active && styles.outputActive]}>
              <Text style={styles.ioLabel}>{output}</Text>
              <Text style={[styles.ioState, active && styles.outputText]}>{active ? '1' : '0'}</Text>
            </View>
          );
        })}
      </View>

      {timers.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Temporizadores</Text>
          {timers.map(([timerId, timer]) => (
            <View key={timerId} style={styles.runtimeRow}>
              <Text style={styles.runtimeLabel}>{timerId}</Text>
              <Text style={styles.runtimeValue}>ET {formatMs(timer.elapsedMs)} • Q {timer.q ? '1' : '0'}</Text>
            </View>
          ))}
        </>
      ) : null}

      {counters.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Contadores</Text>
          {counters.map(([counterId, counter]) => (
            <View key={counterId} style={styles.runtimeRow}>
              <Text style={styles.runtimeLabel}>{counterId}</Text>
              <Text style={styles.runtimeValue}>CV {counter.currentValue} • Q {counter.q ? '1' : '0'}</Text>
            </View>
          ))}
        </>
      ) : null}

      <Text style={styles.sectionTitle}>Linhas energizadas</Text>
      {Object.entries(evaluation.rungResults).map(([rungId, energized]) => (
        <View key={rungId} style={styles.rungRow}>
          <Text style={styles.rungLabel}>{rungId}</Text>
          <Text style={[styles.rungState, energized && styles.outputText]}>{energized ? 'ENERGIZADA' : 'ABERTA'}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Diagnóstico</Text>
      {evaluation.diagnostics.length === 0 ? (
        <View style={styles.diagnosticOk}>
          <Text style={styles.diagnosticOkText}>Nenhum problema estrutural encontrado.</Text>
        </View>
      ) : (
        evaluation.diagnostics.map((diagnostic) => (
          <View key={diagnostic.id} style={[styles.diagnosticRow, diagnosticStyle(diagnostic.severity)]}>
            <Text style={styles.diagnosticBadge}>{severityLabel[diagnostic.severity]}</Text>
            <Text style={styles.diagnosticMessage}>{diagnostic.message}</Text>
          </View>
        ))
      )}

      <Text style={styles.explanation}>{evaluation.explanation}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  scanBadge: {
    color: colors.cyan,
    fontSize: 11,
    fontWeight: '900',
  },
  sectionTitle: {
    color: colors.cyan,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  ioCard: {
    minWidth: 70,
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    alignItems: 'center',
  },
  inputActive: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  outputActive: {
    borderColor: colors.green,
    backgroundColor: '#143822',
  },
  ioLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  ioState: {
    color: colors.textMuted,
    fontSize: 18,
    fontWeight: '900',
    marginTop: spacing.xs,
  },
  activeText: {
    color: colors.cyan,
  },
  outputText: {
    color: colors.green,
  },
  runtimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  runtimeLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    flex: 1,
  },
  runtimeValue: {
    color: colors.green,
    fontSize: 12,
    fontWeight: '900',
  },
  rungRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rungLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  rungState: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
  },
  diagnosticOk: {
    borderColor: colors.green,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    backgroundColor: '#143822',
  },
  diagnosticOkText: {
    color: colors.green,
    fontSize: 13,
    fontWeight: '800',
  },
  diagnosticRow: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  diagnosticInfo: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  diagnosticWarning: {
    borderColor: colors.amber,
    backgroundColor: '#2B230F',
  },
  diagnosticError: {
    borderColor: colors.red,
    backgroundColor: '#3A151A',
  },
  diagnosticBadge: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
    marginBottom: spacing.xs,
  },
  diagnosticMessage: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  explanation: {
    color: colors.amber,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.md,
  },
  pressed: {
    opacity: 0.75,
  },
});
