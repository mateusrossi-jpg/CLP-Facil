import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';

type Props = { tags: Record<string, boolean> };

export const MobileConveyorScenario = memo(function MobileConveyorScenario({ tags }: Props) {
  const motorOn = tags['Q0.0'];
  const sensorOn = tags['I0.2'];
  const stopOn = tags['I0.1'];
  const greenOn = tags['Q0.1'];
  const redOn = tags['Q0.2'];

  return (
    <View style={styles.scene}>
      <View style={styles.statusRow}>
        <Text style={styles.title}>Esteira 2.5D</Text>
        <View style={[styles.badge, stopOn ? styles.badgeStop : redOn ? styles.badgeAlarm : styles.badgeRun]}>
          <Text style={styles.badgeText}>{stopOn ? 'STOP' : redOn ? 'ALARM' : motorOn ? 'RUN' : 'IDLE'}</Text>
        </View>
      </View>

      <View style={styles.floor}>
        <View style={styles.beltTop} />
        <View style={[styles.beltTrack, motorOn && styles.beltTrackOn]}>
          <View style={styles.rollersRow}>{Array.from({ length: 7 }).map((_, idx) => <View key={`r-${idx}`} style={[styles.roller, motorOn && styles.rollerOn]} />)}</View>
          <View style={[styles.box, sensorOn && styles.boxDetected]}><Text style={styles.labelMini}>Peça</Text></View>
        </View>
        <View style={styles.beltFace} />

        <View style={[styles.motor, motorOn && styles.motorOn]}><Text style={styles.labelMini}>Motor</Text></View>
        <View style={styles.sensorBlock}><Text style={styles.labelMini}>Sensor</Text><View style={[styles.sensorDot, sensorOn && styles.sensorDotOn]} /></View>
        <View style={[styles.beam, sensorOn && styles.beamOn]} />

        <View style={styles.tower}>
          <Text style={styles.labelMini}>Torre</Text>
          <View style={[styles.light, greenOn && styles.greenOn]} />
          <View style={[styles.light, redOn && styles.redOn]} />
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  scene: { backgroundColor: colors.surfaceElevated, borderRadius: 12, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  title: { color: colors.text, fontWeight: '700' },
  badge: { borderRadius: 999, borderWidth: 1, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  badgeRun: { borderColor: colors.green, backgroundColor: colors.greenSoft },
  badgeAlarm: { borderColor: colors.red, backgroundColor: colors.redSoft },
  badgeStop: { borderColor: colors.amber, backgroundColor: colors.amberSoft },
  badgeText: { color: colors.text, fontSize: 10, fontWeight: '700' },
  floor: { backgroundColor: colors.backgroundSoft, borderRadius: 10, borderWidth: 1, borderColor: colors.borderStrong, padding: spacing.sm, overflow: 'hidden' },
  beltTop: { height: 6, backgroundColor: colors.slate },
  beltTrack: { height: 58, backgroundColor: '#182133', borderLeftWidth: 2, borderRightWidth: 2, borderColor: colors.borderStrong, justifyContent: 'center' },
  beltTrackOn: { borderColor: colors.green, shadowColor: colors.green, shadowOpacity: 0.2, shadowRadius: 6 },
  rollersRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.xs },
  roller: { width: 16, height: 8, borderRadius: 5, backgroundColor: colors.inactive },
  rollerOn: { backgroundColor: colors.greenSoft },
  beltFace: { height: 10, backgroundColor: '#0d1525', marginBottom: spacing.xs },
  box: { position: 'absolute', left: 42, top: 28, width: 38, height: 30, borderRadius: 6, borderWidth: 1, borderColor: colors.amber, backgroundColor: colors.amberSoft, justifyContent: 'center', alignItems: 'center' },
  boxDetected: { backgroundColor: colors.amber },
  motor: { position: 'absolute', left: spacing.sm, bottom: spacing.xs, width: 66, height: 26, borderRadius: 13, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.inactive, justifyContent: 'center', alignItems: 'center' },
  motorOn: { backgroundColor: colors.greenSoft, borderColor: colors.green },
  sensorBlock: { position: 'absolute', right: 72, bottom: spacing.xs, alignItems: 'center', gap: 2 },
  sensorDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.inactive },
  sensorDotOn: { backgroundColor: colors.cyanGlow },
  beam: { position: 'absolute', right: 88, top: 32, width: 60, height: 2, backgroundColor: colors.inactive },
  beamOn: { backgroundColor: colors.cyanGlow },
  tower: { position: 'absolute', right: spacing.sm, top: spacing.xs, alignItems: 'center', gap: 3 },
  light: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.inactive },
  greenOn: { backgroundColor: colors.green },
  redOn: { backgroundColor: colors.red },
  labelMini: { color: colors.textMuted, fontSize: 10, fontWeight: '600' },
});
