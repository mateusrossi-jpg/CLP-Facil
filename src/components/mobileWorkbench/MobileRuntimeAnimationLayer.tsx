import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EditorEvaluationResult } from '../../engine/editorEvaluator';
import { EditorRunMode } from '../EditorModeToggle';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

type Props = {
  mode: EditorRunMode;
  autoScan: boolean;
  evaluation: EditorEvaluationResult;
  hasLogic: boolean;
};

export const MobileRuntimeAnimationLayer = memo(function MobileRuntimeAnimationLayer({ mode, autoScan, evaluation, hasLogic }: Props) {
  if (!hasLogic) return null;
  const rungResults = Array.isArray(evaluation.rungResults) ? evaluation.rungResults : [];
  const energized = rungResults.reduce((count, rung) => count + (rung.active ? 1 : 0), 0);
  const scan = evaluation.scanNumber ?? 0;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Runtime Animation</Text>
      <View style={styles.row}>
        <Chip label={`RUN/EDIT: ${mode === 'simulate' ? 'RUN' : 'EDIT'}`} />
        <Chip label={`AUTO/MANUAL: ${autoScan ? 'AUTO' : 'MANUAL'}`} />
        <Chip label={`TICK: ${scan}`} />
      </View>
      <Text style={styles.text}>Rungs energizadas: {energized}</Text>
      <Text style={styles.text}>Energia visual e fluxo runtime acompanham o scan atual.</Text>
    </View>
  );
});

function Chip({ label }: { label: string }) {
  return <Text style={styles.chip}>{label}</Text>;
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.surface, padding: spacing.sm, gap: spacing.xs },
  title: { color: colors.text, fontWeight: '900', fontSize: 13 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { color: colors.cyan, borderWidth: 1, borderColor: colors.cyan, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, fontSize: 10, fontWeight: '900' },
  text: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
});
