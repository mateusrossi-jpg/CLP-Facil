import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';

type Props = { tags: Record<string, boolean> };

const Sensor = ({ active, label }: { active: boolean; label: string }) => (
  <View style={styles.sensorWrap}>
    <Text style={styles.small}>{label}</Text>
    <View style={[styles.sensorDot, active && styles.sensorOn]} />
  </View>
);

export const MobileTankScenario = memo(function MobileTankScenario({ tags }: Props) {
  const level = tags['I0.1'] ? 90 : tags['Q0.0'] ? 70 : tags['Q0.1'] ? 45 : 30;
  const alarm = (tags['I0.1'] && tags['Q0.0']) || tags['Q0.2'];
  return (
    <View style={styles.scene}>
      <View style={styles.row}>
        <View style={styles.tankWrap}>
          <Text style={styles.machineLabel}>Tanque</Text>
          <View style={styles.tank3d}>
            <View style={[styles.level, { height: `${level}%` }]} />
          </View>
          <Text style={styles.levelText}>Nível: {level}%</Text>
        </View>
        <View style={styles.sidePanel}>
          <View style={[styles.pump, tags['Q0.0'] && styles.pumpOn]}><Text style={styles.small}>Bomba</Text></View>
          <View style={[styles.valve, tags['Q0.1'] && styles.valveOn]}><Text style={styles.small}>Válvula</Text></View>
          <View style={[styles.siren, alarm && styles.sirenOn]}><Text style={styles.small}>Sirene</Text></View>
        </View>
      </View>
      <View style={[styles.pipe, tags['Q0.1'] && styles.pipeOn]} />
      <View style={styles.sensorRow}>
        <Sensor active={tags['I0.0']} label="Baixo" />
        <Sensor active={tags['I0.1']} label="Alto" />
      </View>
      <Text style={[styles.alarmText, alarm && styles.alarmOn]}>{alarm ? 'ALARME DE PROCESSO' : 'Processo estável'}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  scene: { backgroundColor: colors.surfaceElevated, borderRadius: 12, padding: spacing.md, borderWidth: 1, borderColor: colors.border, gap: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.sm },
  tankWrap: { flex: 1 },
  machineLabel: { color: colors.textDim, fontSize: 10, marginBottom: 4, textTransform: 'uppercase' },
  tank3d: { height: 98, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 10, overflow: 'hidden', backgroundColor: colors.backgroundSoft, justifyContent: 'flex-end', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6 },
  level: { width: '100%', backgroundColor: colors.blueSoft, borderTopWidth: 1, borderTopColor: colors.cyanGlow },
  levelText: { color: colors.cyanGlow, fontSize: 11, marginTop: 4 },
  sidePanel: { width: 88, gap: spacing.xs },
  pump: { borderRadius: 8, padding: spacing.xs, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  pumpOn: { borderColor: colors.green, backgroundColor: colors.greenSoft },
  valve: { borderRadius: 8, padding: spacing.xs, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  valveOn: { borderColor: colors.cyanGlow, backgroundColor: colors.cyanSoft },
  siren: { borderRadius: 8, padding: spacing.xs, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  sirenOn: { borderColor: colors.red, backgroundColor: colors.redSoft },
  pipe: { height: 6, borderRadius: 999, backgroundColor: colors.inactive },
  pipeOn: { backgroundColor: colors.cyanGlow },
  sensorRow: { flexDirection: 'row', gap: spacing.md, marginTop: 2 },
  sensorWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sensorDot: { width: 10, height: 10, borderRadius: 999, backgroundColor: colors.inactive },
  sensorOn: { backgroundColor: colors.amber },
  alarmText: { color: colors.textMuted, fontSize: 11 },
  alarmOn: { color: colors.red, fontWeight: '700' },
  small: { color: colors.textMuted, fontSize: 10 },
});
