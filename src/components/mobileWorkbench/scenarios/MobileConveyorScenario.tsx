import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';

type Props = { tags: Record<string, boolean> };

const Lamp = ({ on, color }: { on: boolean; color: 'green' | 'amber' | 'red' }) => (
  <View style={[styles.lamp, { borderColor: colors.borderStrong }, on && (color === 'green' ? styles.greenOn : color === 'amber' ? styles.amberOn : styles.redOn)]} />
);

export const MobileConveyorScenario = memo(function MobileConveyorScenario({ tags }: Props) {
  const motorOn = tags['Q0.0'];
  const sensorOn = tags['I0.2'];
  const stopActive = tags['I0.1'];

  return (
    <View style={styles.scene}>
      <View style={styles.floor} />
      <View style={styles.beltDeck}>
        <Text style={styles.machineLabel}>Esteira</Text>
        <View style={[styles.belt, motorOn && styles.beltOn]}>
          <View style={styles.rollerRow}>{[0, 1, 2, 3].map((idx) => <View key={idx} style={styles.roller} />)}</View>
          <View style={[styles.box, sensorOn && styles.boxDetected]} />
          <Text style={styles.partLabel}>Peça</Text>
        </View>
        <View style={[styles.motor, motorOn && styles.motorOn]}><Text style={styles.small}>Motor</Text></View>
      </View>
      <View style={styles.sensorBlock}>
        <Text style={styles.small}>Sensor</Text>
        <View style={[styles.sensor, sensorOn && styles.sensorOn]} />
        <View style={[styles.beam, sensorOn && styles.beamOn]} />
      </View>
      <View style={styles.tower}>
        <Text style={styles.small}>Torre</Text>
        <Lamp on={tags['Q0.1']} color="green" />
        <Lamp on={stopActive} color="amber" />
        <Lamp on={tags['Q0.2']} color="red" />
      </View>
      <View style={styles.panel}>
        <Text style={styles.panelText}>AUTO: {motorOn ? 'EXECUTANDO' : 'PARADO'}</Text>
        <Text style={[styles.panelText, stopActive && styles.stopAlert]}>STOP: {stopActive ? 'ATIVO' : 'NORMAL'}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  scene: { backgroundColor: colors.surfaceElevated, borderRadius: 12, padding: spacing.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', gap: spacing.xs },
  floor: { position: 'absolute', left: -12, right: -12, bottom: 0, height: 42, backgroundColor: colors.backgroundSoft, transform: [{ skewY: '-6deg' }] },
  beltDeck: { borderRadius: 10, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface, padding: spacing.sm },
  machineLabel: { color: colors.textDim, fontSize: 10, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  belt: { height: 48, borderRadius: 8, backgroundColor: colors.slate, borderWidth: 1, borderColor: colors.borderStrong, justifyContent: 'center', paddingHorizontal: spacing.sm },
  beltOn: { borderColor: colors.green, shadowColor: colors.green, shadowOpacity: 0.25, shadowRadius: 6 },
  rollerRow: { position: 'absolute', flexDirection: 'row', gap: spacing.sm, left: spacing.sm, right: spacing.sm, top: 6 },
  roller: { flex: 1, height: 4, borderRadius: 4, backgroundColor: colors.borderStrong },
  box: { width: 24, height: 20, backgroundColor: colors.amberSoft, borderColor: colors.amber, borderWidth: 1, borderRadius: 4 },
  boxDetected: { backgroundColor: colors.amber },
  partLabel: { position: 'absolute', right: spacing.sm, bottom: 3, color: colors.textDim, fontSize: 10 },
  motor: { marginTop: spacing.xs, width: 62, paddingVertical: 5, borderRadius: 999, backgroundColor: colors.inactive, alignItems: 'center' },
  motorOn: { backgroundColor: colors.greenSoft, borderWidth: 1, borderColor: colors.green },
  sensorBlock: { position: 'absolute', right: spacing.md, top: 54, alignItems: 'flex-end' },
  sensor: { width: 12, height: 12, borderRadius: 999, backgroundColor: colors.inactive },
  sensorOn: { backgroundColor: colors.cyanGlow },
  beam: { marginTop: 4, width: 36, height: 2, backgroundColor: colors.border },
  beamOn: { backgroundColor: colors.cyanGlow },
  tower: { position: 'absolute', right: spacing.md, top: spacing.sm, gap: 4, alignItems: 'center' },
  lamp: { width: 12, height: 12, borderRadius: 999, backgroundColor: colors.inactive, borderWidth: 1 },
  greenOn: { backgroundColor: colors.green },
  amberOn: { backgroundColor: colors.amber },
  redOn: { backgroundColor: colors.red },
  panel: { marginTop: spacing.xs, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.xs, gap: 2 },
  panelText: { color: colors.textMuted, fontSize: 11 },
  stopAlert: { color: colors.amber, fontWeight: '700' },
  small: { color: colors.textMuted, fontSize: 10 },
});
