import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { spacing } from '../../../theme/spacing';
import { useAppTheme } from '../../../theme/theme';

type Props = { tags: Record<string, boolean> };

export const MobileMotorStarterScenario = memo(function MobileMotorStarterScenario({ tags }: Props) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme.colors), [theme.colors]);
  const startOn = tags['I0.0'];
  const stopOn = tags['I0.1'];
  const thermalTrip = tags['I0.2'];
  const contactorOn = tags['Q0.0'];
  const motorOn = tags['Q0.1'];
  const runLampOn = tags['Q0.2'];

  return (
    <View style={styles.scene}>
      <View style={styles.headRow}>
        <Text style={styles.title}>Partida direta 2.5D</Text>
        <View style={[styles.badge, thermalTrip ? styles.badgeAlarm : motorOn ? styles.badgeRun : styles.badgeIdle]}>
          <Text style={styles.badgeText}>{thermalTrip ? 'FALHA TÉRMICA' : motorOn ? 'RUN' : 'STOP'}</Text>
        </View>
      </View>

      <View style={styles.panel}>
        <View style={styles.busBar} />

        <View style={styles.row}>
          <View style={[styles.button, styles.start, startOn && styles.buttonOn]}><Text style={styles.buttonLabel}>START</Text></View>
          <View style={[styles.button, styles.stop, stopOn && styles.buttonOn]}><Text style={styles.buttonLabel}>STOP</Text></View>
        </View>

        <View style={styles.row}>
          <View style={[styles.module, contactorOn && styles.contactorOn]}><Text style={styles.moduleLabel}>Contator</Text></View>
          <View style={[styles.module, thermalTrip && styles.thermalTrip]}><Text style={styles.moduleLabel}>Relé térmico</Text></View>
        </View>

        <View style={styles.row}>
          <View style={[styles.motor, motorOn && styles.motorOn]}><Text style={styles.moduleLabel}>Motor</Text></View>
          <View style={styles.lampPanel}><View style={[styles.runLamp, runLampOn && styles.runLampOn]} /><Text style={styles.moduleLabel}>RUN</Text></View>
        </View>

        {thermalTrip ? <Text style={styles.faultText}>FALHA TÉRMICA</Text> : null}
      </View>
    </View>
  );
});

function createStyles(c: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
  scene: { backgroundColor: c.surfaceElevated, borderRadius: 12, padding: spacing.md, borderWidth: 1, borderColor: c.border },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  title: { color: c.text, fontWeight: '700' },
  badge: { borderRadius: 999, borderWidth: 1, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  badgeRun: { borderColor: c.green, backgroundColor: c.greenSoft },
  badgeIdle: { borderColor: c.amber, backgroundColor: c.amberSoft },
  badgeAlarm: { borderColor: c.red, backgroundColor: c.redSoft },
  badgeText: { color: c.text, fontSize: 10, fontWeight: '700' },
  panel: { borderWidth: 1, borderColor: c.borderStrong, borderRadius: 10, backgroundColor: c.backgroundSoft, padding: spacing.sm, gap: spacing.xs },
  busBar: { height: 8, backgroundColor: c.navy, borderRadius: 4, borderWidth: 1, borderColor: c.borderStrong, marginBottom: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.sm },
  button: { flex: 1, borderWidth: 1, borderColor: c.borderStrong, borderRadius: 9, paddingVertical: spacing.xs, alignItems: 'center' },
  start: { backgroundColor: c.greenSoft },
  stop: { backgroundColor: c.redSoft },
  buttonOn: { borderColor: c.cyan, shadowColor: c.cyan, shadowOpacity: 0.2, shadowRadius: 5 },
  buttonLabel: { color: c.text, fontSize: 12, fontWeight: '700' },
  module: { flex: 1, height: 42, borderRadius: 9, borderWidth: 1, borderColor: c.borderStrong, backgroundColor: c.surface, justifyContent: 'center', alignItems: 'center' },
  contactorOn: { borderColor: c.green, backgroundColor: c.greenSoft },
  thermalTrip: { borderColor: c.red, backgroundColor: c.redSoft },
  motor: { flex: 1, height: 44, borderRadius: 22, borderWidth: 1, borderColor: c.borderStrong, backgroundColor: c.inactive, justifyContent: 'center', alignItems: 'center' },
  motorOn: { borderColor: c.cyan, backgroundColor: c.cyanSoft },
  lampPanel: { width: 82, borderWidth: 1, borderColor: c.borderStrong, borderRadius: 9, justifyContent: 'center', alignItems: 'center', backgroundColor: c.surface },
  runLamp: { width: 14, height: 14, borderRadius: 7, backgroundColor: c.inactive, marginBottom: 3 },
  runLampOn: { backgroundColor: c.amber },
  moduleLabel: { color: c.textMuted, fontSize: 10, fontWeight: '700' },
  faultText: { marginTop: spacing.xs, color: c.red, fontWeight: '700', fontSize: 12, textAlign: 'center' },
  });
}
