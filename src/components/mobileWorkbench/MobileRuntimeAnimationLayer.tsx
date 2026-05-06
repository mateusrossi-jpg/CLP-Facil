import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EditorEvaluationResult } from '../../engine/editorEvaluator';
import { EditorRunMode } from '../EditorModeToggle';
import { spacing } from '../../theme/spacing';
import { useAppTheme } from '../../theme/theme';

type Props = {
  mode: EditorRunMode;
  autoScan: boolean;
  evaluation: EditorEvaluationResult;
  hasLogic: boolean;
};

export const MobileRuntimeAnimationLayer = memo(function MobileRuntimeAnimationLayer({ mode, autoScan, evaluation, hasLogic }: Props) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme.colors), [theme.colors]);
  if (!hasLogic) return null;
  const energized = Object.values(evaluation.rungResults ?? {}).filter(Boolean).length;
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
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme.colors), [theme.colors]);
  return <Text style={styles.chip}>{label}</Text>;
}

function createStyles(c: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
  card: { borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.surface, padding: spacing.sm, gap: spacing.xs },
  title: { color: c.text, fontWeight: '900', fontSize: 13 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { color: c.cyan, borderWidth: 1, borderColor: c.cyan, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, fontSize: 10, fontWeight: '900' },
  text: { color: c.textMuted, fontSize: 11, fontWeight: '700' },
  });
}
