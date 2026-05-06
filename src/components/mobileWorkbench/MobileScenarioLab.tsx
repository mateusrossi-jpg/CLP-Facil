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

function StatusBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeLabel}>{label}</Text>
      <Text style={styles.badgeValue}>{value}</Text>
    </View>
  );
}

export const MobileScenarioLab = memo(function MobileScenarioLab({ editorProject, plcState, evaluation }: Props) {
  const [scenarioId, setScenarioId] = useState<MobileScenarioId>('conveyor');
  const tags = useMemo(() => {
    return scenarioTags[scenarioId].reduce<TagMap>((acc, tag) => {
      acc[tag] = readBoolTag(plcState, tag);
      return acc;
    }, {});
  }, [plcState, scenarioId]);

  const hasLogic = editorProject.rungs.length > 0;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Laboratório 2.5D</Text>
      <Text style={styles.subtitle}>Veja sua lógica Ladder acionando cenários visuais de automação.</Text>
      <View style={styles.badgeRow}>
        <StatusBadge label="CENÁRIO" value={scenarioId} />
        <StatusBadge label="SCAN" value={evaluation.scanNumber ?? 0} />
        <StatusBadge label="RUNGS" value={editorProject.rungs.length} />
      </View>
      <Text style={[styles.runtime, hasLogic ? styles.runtimeOn : styles.runtimeOff]}>
        {hasLogic ? 'Conectado ao runtime do simulador.' : 'Crie uma lógica Ladder para acionar este cenário.'}
      </Text>
      <MobileScenarioSelector activeScenario={scenarioId} onSelectScenario={setScenarioId} />
      <View style={styles.tagsCard}>
        <Text style={styles.sectionTitle}>Tags do cenário</Text>
        <View style={styles.tagGrid}>
          {scenarioTags[scenarioId].map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagName}>{tag}</Text>
              <Text style={[styles.tagState, tags[tag] ? styles.on : styles.off]}>{tags[tag] ? 'ON' : 'OFF'}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.sceneCard}>
        <Text style={styles.sectionTitle}>Cena ativa</Text>
        {scenarioId === 'conveyor' ? <MobileConveyorScenario tags={tags} /> : null}
        {scenarioId === 'tank' ? <MobileTankScenario tags={tags} /> : null}
        {scenarioId === 'motorStarter' ? <MobileMotorStarterScenario tags={tags} /> : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing.md, gap: spacing.sm },
  title: { color: colors.text, fontSize: 17, fontWeight: '700' },
  subtitle: { color: colors.textMuted, fontSize: 12 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  badge: { borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceElevated, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 5, flexDirection: 'row', gap: 6 },
  badgeLabel: { color: colors.textDim, fontSize: 10, fontWeight: '700' },
  badgeValue: { color: colors.cyanGlow, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  runtime: { fontSize: 12, borderRadius: 8, borderWidth: 1, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  runtimeOn: { color: colors.green, borderColor: colors.greenSoft, backgroundColor: colors.surfaceElevated },
  runtimeOff: { color: colors.amber, borderColor: colors.amberSoft, backgroundColor: colors.surfaceElevated },
  tagsCard: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceElevated, borderRadius: 12, padding: spacing.sm, gap: spacing.xs },
  sceneCard: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceElevated, borderRadius: 12, padding: spacing.sm, gap: spacing.xs },
  sectionTitle: { color: colors.text, fontWeight: '700', fontSize: 12 },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tag: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 8, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, minWidth: 72, backgroundColor: colors.surface },
  tagName: { color: colors.textMuted, fontSize: 11 },
  tagState: { fontSize: 12, fontWeight: '700' },
  on: { color: colors.green },
  off: { color: colors.inactive },
});
