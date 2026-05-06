import { memo, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EditorEvaluationResult } from '../../engine/editorEvaluator';
import { EditorProjectState } from '../../engine/editorTypes';
import { PlcState } from '../../engine/projectTypes';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { MobileScenarioId, MobileScenarioSelector } from './MobileScenarioSelector';
import { MobileConveyorScenario } from './scenarios/MobileConveyorScenario';
import { MobileMotorStarterScenario } from './scenarios/MobileMotorStarterScenario';
import { MobileTankScenario } from './scenarios/MobileTankScenario';

type Props = { editorProject: EditorProjectState; plcState: PlcState; evaluation: EditorEvaluationResult };

type TagMap = Record<string, boolean>;

const scenarioTags: Record<MobileScenarioId, string[]> = {
  conveyor: ['I0.0', 'I0.1', 'I0.2', 'Q0.0', 'Q0.1', 'Q0.2'],
  tank: ['I0.0', 'I0.1', 'Q0.0', 'Q0.1', 'Q0.2'],
  motorStarter: ['I0.0', 'I0.1', 'I0.2', 'Q0.0', 'Q0.1', 'Q0.2'],
};

function readBoolTag(state: PlcState, address: string): boolean {
  const value = state[address] ?? state[address.replace('.0', '')];
  return typeof value === 'number' ? value !== 0 : Boolean(value);
}

export const MobileScenarioLab = memo(function MobileScenarioLab({ editorProject, plcState, evaluation }: Props) {
  const [scenarioId, setScenarioId] = useState<MobileScenarioId>('conveyor');
  const tags = useMemo(() => {
    return scenarioTags[scenarioId].reduce<TagMap>((acc, tag) => {
      acc[tag] = readBoolTag(plcState, tag);
      return acc;
    }, {});
  }, [plcState, scenarioId]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Laboratório 2.5D</Text>
      <Text style={styles.subtitle}>Veja sua lógica Ladder acionando cenários visuais de automação.</Text>
      <MobileScenarioSelector activeScenario={scenarioId} onSelectScenario={setScenarioId} />
      <View style={styles.tagGrid}>
        {scenarioTags[scenarioId].map((tag) => <View key={tag} style={styles.tag}><Text style={styles.tagName}>{tag}</Text><Text style={[styles.tagState, tags[tag] ? styles.on : styles.off]}>{tags[tag] ? 'ON' : 'OFF'}</Text></View>)}
      </View>
      {scenarioId === 'conveyor' ? <MobileConveyorScenario tags={tags} /> : null}
      {scenarioId === 'tank' ? <MobileTankScenario tags={tags} /> : null}
      {scenarioId === 'motorStarter' ? <MobileMotorStarterScenario tags={tags} /> : null}
      <Text style={styles.footer}>Rungs: {editorProject.rungs.length} · Scan: {evaluation.scanNumber ?? 0}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing.md, gap: spacing.sm },
  title: { color: colors.text, fontSize: 16, fontWeight: '700' },
  subtitle: { color: colors.textMuted, fontSize: 12 },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tag: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, minWidth: 72 },
  tagName: { color: colors.textMuted, fontSize: 11 },
  tagState: { fontSize: 12, fontWeight: '700' },
  on: { color: colors.green },
  off: { color: colors.inactive },
  footer: { color: colors.textDim, fontSize: 11 },
});
