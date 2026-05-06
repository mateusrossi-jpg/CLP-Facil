import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';

type Props = { tags: Record<string, boolean> };

export const MobileTankScenario = memo(function MobileTankScenario({ tags }: Props) {
  const pumpOn = tags['Q0.0'];
  const valveOn = tags['Q0.1'];
  const sensorLow = tags['I0.0'];
  const sensorHigh = tags['I0.1'];
  const alarm = (sensorHigh && pumpOn) || tags['Q0.2'];

  const level = sensorHigh ? 90 : pumpOn ? 70 : valveOn ? 45 : 30;

  return (
    <View style={styles.scene}>
      <View style={styles.headRow}>
        <Text style={styles.title}>Tanque 2.5D</Text>
        <View style={[styles.badge, alarm ? styles.badgeAlarm : styles.badgeNormal]}><Text style={styles.badgeText}>{alarm ? 'ALARM' : 'RUN'}</Text></View>
      </View>

      <View style={styles.layout}>
        <View style={styles.tankShell}>
          <View style={styles.tankTop} />
          <View style={styles.tankBody}><View style={[styles.liquid, { height: `${level}%` }]} /></View>
          <Text style={styles.panelText}>Nível {level}%</Text>
        </View>

        <View style={styles.pipePanel}>
          <View style={[styles.pipe, valveOn && styles.pipeOn]} />
          <View style={[styles.valve, valveOn && styles.valveOn]}><Text style={styles.labelMini}>Válvula</Text></View>
          <View style={[styles.pump, pumpOn && styles.pumpOn]}><Text style={styles.labelMini}>Bomba</Text></View>
        </View>
      </View>

      <View style={styles.sensorRow}>
        <View style={[styles.sensorChip, sensorLow && styles.sensorOn]}><Text style={styles.sensorText}>Sensor baixo</Text></View>
        <View style={[styles.sensorChip, sensorHigh && styles.sensorOn]}><Text style={styles.sensorText}>Sensor alto</Text></View>
        <View style={[styles.siren, alarm && styles.sirenOn]}><Text style={styles.sensorText}>Sirene</Text></View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  scene: { backgroundColor: colors.surfaceElevated, borderRadius: 12, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  title: { color: colors.text, fontWeight: '700' },
  badge: { borderRadius: 999, borderWidth: 1, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  badgeNormal: { borderColor: colors.cyan, backgroundColor: colors.cyanSoft },
  badgeAlarm: { borderColor: colors.red, backgroundColor: colors.redSoft },
  badgeText: { color: colors.text, fontSize: 10, fontWeight: '700' },
  layout: { flexDirection: 'row', gap: spacing.sm },
  tankShell: { flex: 1, backgroundColor: colors.backgroundSoft, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 10, padding: spacing.xs },
  tankTop: { height: 6, borderRadius: 3, backgroundColor: colors.slate, marginHorizontal: 8, marginBottom: 4 },
  tankBody: { height: 96, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 8, overflow: 'hidden', justifyContent: 'flex-end', backgroundColor: '#091122' },
  liquid: { width: '100%', backgroundColor: colors.blueSoft, borderTopWidth: 1, borderTopColor: colors.cyanGlow },
  panelText: { color: colors.textDim, fontSize: 11, marginTop: spacing.xs, textAlign: 'center' },
  pipePanel: { width: 106, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 10, backgroundColor: colors.backgroundSoft, padding: spacing.xs, justifyContent: 'space-between' },
  pipe: { height: 8, borderRadius: 4, backgroundColor: colors.inactive },
  pipeOn: { backgroundColor: colors.green },
  valve: { height: 28, borderRadius: 8, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.inactive, justifyContent: 'center', alignItems: 'center' },
  valveOn: { backgroundColor: colors.greenSoft, borderColor: colors.green },
  pump: { height: 30, borderRadius: 8, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.inactive, justifyContent: 'center', alignItems: 'center' },
  pumpOn: { backgroundColor: colors.cyanSoft, borderColor: colors.cyan },
  sensorRow: { marginTop: spacing.sm, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  sensorChip: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 3, backgroundColor: colors.surface },
  sensorOn: { borderColor: colors.green, backgroundColor: colors.greenSoft },
  siren: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 3, backgroundColor: colors.surface },
  sirenOn: { borderColor: colors.red, backgroundColor: colors.redSoft },
  sensorText: { color: colors.text, fontSize: 10, fontWeight: '700' },
  labelMini: { color: colors.textMuted, fontSize: 10, fontWeight: '600' },
});
