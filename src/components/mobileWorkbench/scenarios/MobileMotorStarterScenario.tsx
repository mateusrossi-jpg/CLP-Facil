import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';

type Props = { tags: Record<string, boolean> };

export const MobileMotorStarterScenario = memo(function MobileMotorStarterScenario({ tags }: Props) {
  return <View style={styles.scene}><Text style={styles.title}>Partida direta</Text><View style={styles.row}><View style={[styles.button, styles.start]}><Text style={styles.buttonLabel}>START</Text></View><View style={[styles.button, styles.stop]}><Text style={styles.buttonLabel}>STOP</Text></View></View><View style={[styles.contactor, tags['Q0.0'] && styles.contactorOn]} /><View style={[styles.thermal, tags['I0.2'] && styles.thermalTrip]}><Text style={styles.small}>Térmico</Text></View><View style={[styles.motor, tags['Q0.1'] && styles.motorOn]} /><View style={[styles.runLamp, tags['Q0.2'] && styles.runLampOn]} /></View>;
});

const styles = StyleSheet.create({
  scene: { backgroundColor: colors.surfaceElevated, borderRadius: 12, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  title: { color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  button: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 8 },
  start: { backgroundColor: colors.greenSoft },
  stop: { backgroundColor: colors.redSoft },
  buttonLabel: { color: colors.text, fontSize: 12 },
  contactor: { marginTop: spacing.sm, height: 18, borderRadius: 6, backgroundColor: colors.inactive },
  contactorOn: { backgroundColor: colors.green },
  thermal: { marginTop: spacing.xs, padding: spacing.xs, borderRadius: 6, backgroundColor: colors.surface },
  thermalTrip: { backgroundColor: colors.redSoft, borderWidth: 1, borderColor: colors.red },
  motor: { marginTop: spacing.xs, width: 40, height: 24, borderRadius: 12, backgroundColor: colors.inactive },
  motorOn: { backgroundColor: colors.cyan },
  runLamp: { marginTop: spacing.xs, width: 12, height: 12, borderRadius: 6, backgroundColor: colors.inactive },
  runLampOn: { backgroundColor: colors.amber },
  small: { color: colors.textMuted, fontSize: 11 },
});
