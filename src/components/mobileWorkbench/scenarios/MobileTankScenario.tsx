import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';

type Props = { tags: Record<string, boolean> };

export const MobileTankScenario = memo(function MobileTankScenario({ tags }: Props) {
  const levelHeight = tags['I0.1'] ? '75%' : tags['I0.0'] ? '35%' : '15%';
  const alarm = (tags['I0.1'] && tags['Q0.0']) || tags['Q0.2'];
  return <View style={styles.scene}><Text style={styles.title}>Tanque</Text><View style={styles.tank}><View style={[styles.level, { height: levelHeight }]} /></View><View style={[styles.pump, tags['Q0.0'] && styles.pumpOn]} /><View style={[styles.valve, tags['Q0.1'] && styles.valveOn]} /><Text style={[styles.alarm, alarm && styles.alarmOn]}>{alarm ? 'ALARME' : 'Normal'}</Text></View>;
});

const styles = StyleSheet.create({
  scene: { backgroundColor: colors.surfaceElevated, borderRadius: 12, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  title: { color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  tank: { height: 82, width: 82, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 8, justifyContent: 'flex-end', overflow: 'hidden', backgroundColor: colors.backgroundSoft },
  level: { width: '100%', backgroundColor: colors.blueSoft, borderTopWidth: 1, borderColor: colors.cyan },
  pump: { marginTop: spacing.sm, width: 36, height: 20, borderRadius: 10, backgroundColor: colors.inactive },
  pumpOn: { backgroundColor: colors.cyan },
  valve: { marginTop: spacing.xs, width: 20, height: 20, borderRadius: 4, backgroundColor: colors.inactive },
  valveOn: { backgroundColor: colors.green },
  alarm: { marginTop: spacing.sm, color: colors.textMuted, fontSize: 12 },
  alarmOn: { color: colors.red, fontWeight: '700' },
});
