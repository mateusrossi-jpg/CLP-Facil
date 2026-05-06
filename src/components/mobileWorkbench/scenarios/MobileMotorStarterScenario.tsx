import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';

type Props = { tags: Record<string, boolean> };

export const MobileMotorStarterScenario = memo(function MobileMotorStarterScenario({ tags }: Props) {
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

const styles = StyleSheet.create({
  scene: { backgroundColor: colors.surfaceElevated, borderRadius: 12, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  title: { color: colors.text, fontWeight: '700' },
  badge: { borderRadius: 999, borderWidth: 1, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  badgeRun: { borderColor: colors.green, backgroundColor: colors.greenSoft },
  badgeIdle: { borderColor: colors.amber, backgroundColor: colors.amberSoft },
  badgeAlarm: { borderColor: colors.red, backgroundColor: colors.redSoft },
  badgeText: { color: colors.text, fontSize: 10, fontWeight: '700' },
  panel: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 10, backgroundColor: colors.backgroundSoft, padding: spacing.sm, gap: spacing.xs },
  busBar: { height: 8, backgroundColor: '#223350', borderRadius: 4, borderWidth: 1, borderColor: colors.borderStrong, marginBottom: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.sm },
  button: { flex: 1, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 9, paddingVertical: spacing.xs, alignItems: 'center' },
  start: { backgroundColor: colors.greenSoft },
  stop: { backgroundColor: colors.redSoft },
  buttonOn: { borderColor: colors.cyan, shadowColor: colors.cyan, shadowOpacity: 0.2, shadowRadius: 5 },
  buttonLabel: { color: colors.text, fontSize: 12, fontWeight: '700' },
  module: { flex: 1, height: 42, borderRadius: 9, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' },
  contactorOn: { borderColor: colors.green, backgroundColor: colors.greenSoft },
  thermalTrip: { borderColor: colors.red, backgroundColor: colors.redSoft },
  motor: { flex: 1, height: 44, borderRadius: 22, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.inactive, justifyContent: 'center', alignItems: 'center' },
  motorOn: { borderColor: colors.cyan, backgroundColor: colors.cyanSoft },
  lampPanel: { width: 82, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 9, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface },
  runLamp: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.inactive, marginBottom: 3 },
  runLampOn: { backgroundColor: colors.amber },
  moduleLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '700' },
  faultText: { marginTop: spacing.xs, color: colors.red, fontWeight: '700', fontSize: 12, textAlign: 'center' },
});
