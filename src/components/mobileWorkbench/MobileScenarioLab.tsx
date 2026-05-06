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
type TagMeta = { tag: string; functionLabel: string };

const scenarioTags: Record<MobileScenarioId, TagMeta[]> = {
  conveyor: [
    { tag: 'I0.0', functionLabel: 'START' },
    { tag: 'I0.1', functionLabel: 'STOP' },
    { tag: 'I0.2', functionLabel: 'SENSOR_PECA' },
    { tag: 'Q0.0', functionLabel: 'MOTOR_ESTEIRA' },
    { tag: 'Q0.1', functionLabel: 'LUZ_VERDE' },
    { tag: 'Q0.2', functionLabel: 'LUZ_VERMELHA' },
  ],
  tank: [
    { tag: 'I0.0', functionLabel: 'SENSOR_BAIXO' },
    { tag: 'I0.1', functionLabel: 'SENSOR_ALTO' },
    { tag: 'Q0.0', functionLabel: 'BOMBA' },
    { tag: 'Q0.1', functionLabel: 'VALVULA' },
    { tag: 'Q0.2', functionLabel: 'ALARME' },
  ],
  motorStarter: [
    { tag: 'I0.0', functionLabel: 'START' },
    { tag: 'I0.1', functionLabel: 'STOP' },
    { tag: 'I0.2', functionLabel: 'TERMICO' },
    { tag: 'Q0.0', functionLabel: 'CONTATOR' },
    { tag: 'Q0.1', functionLabel: 'MOTOR' },
    { tag: 'Q0.2', functionLabel: 'LAMPADA_RUN' },
  ],
};

function readBoolTag(state: PlcState, address: string): boolean {
  const value = state[address] ?? state[address.replace('.0', '')];
  return typeof value === 'number' ? value !== 0 : Boolean(value);
}

export const MobileScenarioLab = memo(function MobileScenarioLab({ editorProject, plcState, evaluation }: Props) {
  const [scenarioId, setScenarioId] = useState<MobileScenarioId>('conveyor');
  const activeTags = scenarioTags[scenarioId];
  const tags = useMemo(
    () =>
      activeTags.reduce<TagMap>((acc, item) => {
        acc[item.tag] = readBoolTag(plcState, item.tag);
        return acc;
      }, {}),
    [activeTags, plcState],
  );

  const hasRungs = editorProject.rungs.length > 0;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Laboratório 2.5D</Text>
      <Text style={styles.subtitle}>Veja sua lógica Ladder acionando cenários visuais de automação.</Text>

      <View style={styles.badgeRow}>
        <View style={[styles.badge, hasRungs ? styles.badgeOn : styles.badgeWarn]}><Text style={styles.badgeText}>{hasRungs ? 'Conectado ao runtime' : 'Crie uma lógica Ladder'}</Text></View>
        <View style={styles.badge}><Text style={styles.badgeText}>Scan {evaluation.scanNumber ?? 0}</Text></View>
        <View style={styles.badge}><Text style={styles.badgeText}>Rungs {editorProject.rungs.length}</Text></View>
      </View>

      <MobileScenarioSelector activeScenario={scenarioId} onSelectScenario={setScenarioId} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tags do cenário</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.headCell, styles.tagCol]}>TAG</Text>
          <Text style={[styles.headCell, styles.stateCol]}>Estado</Text>
          <Text style={[styles.headCell, styles.funcCol]}>Função</Text>
        </View>
        {activeTags.map((item) => (
          <View key={item.tag} style={styles.tableRow}>
            <Text style={[styles.rowCell, styles.tagCol]}>{item.tag}</Text>
            <Text style={[styles.rowCell, styles.stateCol, tags[item.tag] ? styles.on : styles.off]}>{tags[item.tag] ? 'ON' : 'OFF'}</Text>
            <Text style={[styles.rowCell, styles.funcCol]}>{item.functionLabel}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
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
  badge: { borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceElevated, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  badgeOn: { borderColor: colors.green, backgroundColor: colors.greenSoft },
  badgeWarn: { borderColor: colors.amber, backgroundColor: colors.amberSoft },
  badgeText: { color: colors.text, fontSize: 11, fontWeight: '600' },
  section: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.backgroundSoft, padding: spacing.sm, gap: spacing.xs },
  sectionTitle: { color: colors.text, fontSize: 13, fontWeight: '700' },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 4 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 4 },
  headCell: { color: colors.textDim, fontWeight: '700', fontSize: 11 },
  rowCell: { color: colors.text, fontSize: 12 },
  tagCol: { flex: 1.1 },
  stateCol: { flex: 0.8 },
  funcCol: { flex: 1.6 },
  on: { color: colors.green },
  off: { color: colors.inactive },
});
