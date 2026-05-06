import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { spacing } from '../../../theme/spacing';
import { useAppTheme } from '../../../theme/theme';

type Props = { tags: Record<string, boolean> };

export const MobileConveyorScenario = memo(function MobileConveyorScenario({ tags }: Props) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme.colors), [theme.colors]);
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

function createStyles(c: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
  scene: { backgroundColor: c.surfaceElevated, borderRadius: 12, padding: spacing.md, borderWidth: 1, borderColor: c.border },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  title: { color: c.text, fontWeight: '700' },
  badge: { borderRadius: 999, borderWidth: 1, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  badgeRun: { borderColor: c.green, backgroundColor: c.greenSoft },
  badgeAlarm: { borderColor: c.red, backgroundColor: c.redSoft },
  badgeStop: { borderColor: c.amber, backgroundColor: c.amberSoft },
  badgeText: { color: c.text, fontSize: 10, fontWeight: '700' },
  floor: { backgroundColor: c.backgroundSoft, borderRadius: 10, borderWidth: 1, borderColor: c.borderStrong, padding: spacing.sm, overflow: 'hidden' },
  beltTop: { height: 6, backgroundColor: c.slate },
  beltTrack: { height: 58, backgroundColor: c.navy, borderLeftWidth: 2, borderRightWidth: 2, borderColor: c.borderStrong, justifyContent: 'center' },
  beltTrackOn: { borderColor: c.green, shadowColor: c.green, shadowOpacity: 0.2, shadowRadius: 6 },
  rollersRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.xs },
  roller: { width: 16, height: 8, borderRadius: 5, backgroundColor: c.inactive },
  rollerOn: { backgroundColor: c.greenSoft },
  beltFace: { height: 10, backgroundColor: c.black, marginBottom: spacing.xs },
  box: { position: 'absolute', left: 42, top: 28, width: 38, height: 30, borderRadius: 6, borderWidth: 1, borderColor: c.amber, backgroundColor: c.amberSoft, justifyContent: 'center', alignItems: 'center' },
  boxDetected: { backgroundColor: c.amber },
  motor: { position: 'absolute', left: spacing.sm, bottom: spacing.xs, width: 66, height: 26, borderRadius: 13, borderWidth: 1, borderColor: c.borderStrong, backgroundColor: c.inactive, justifyContent: 'center', alignItems: 'center' },
  motorOn: { backgroundColor: c.greenSoft, borderColor: c.green },
  sensorBlock: { position: 'absolute', right: 72, bottom: spacing.xs, alignItems: 'center', gap: 2 },
  sensorDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: c.inactive },
  sensorDotOn: { backgroundColor: c.cyanGlow },
  beam: { position: 'absolute', right: 88, top: 32, width: 60, height: 2, backgroundColor: c.inactive },
  beamOn: { backgroundColor: c.cyanGlow },
  tower: { position: 'absolute', right: spacing.sm, top: spacing.xs, alignItems: 'center', gap: 3 },
  light: { width: 14, height: 14, borderRadius: 7, backgroundColor: c.inactive },
  greenOn: { backgroundColor: c.green },
  redOn: { backgroundColor: c.red },
  labelMini: { color: c.textMuted, fontSize: 10, fontWeight: '600' },
  });
}
