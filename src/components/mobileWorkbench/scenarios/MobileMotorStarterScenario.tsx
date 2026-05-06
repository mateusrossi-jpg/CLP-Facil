import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';

type Props = { tags: Record<string, boolean> };

const StatusChip = ({ label, active, tone }: { label: string; active: boolean; tone: 'green' | 'red' | 'amber' }) => (
  <View style={[styles.chip, active && (tone === 'green' ? styles.chipGreen : tone === 'red' ? styles.chipRed : styles.chipAmber)]}>
    <Text style={styles.chipText}>{label}</Text>
  </View>
);

export const MobileMotorStarterScenario = memo(function MobileMotorStarterScenario({ tags }: Props) {
  const thermalTrip = tags['I0.2'];

  return (
    <View style={styles.scene}>
      <Text style={styles.title}>Painel de partida direta</Text>
      <View style={styles.busbar} />
      <View style={styles.row}>
        <View style={[styles.button, styles.startBtn, tags['I0.0'] && styles.startActive]}><Text style={styles.buttonLabel}>START</Text></View>
        <View style={[styles.button, styles.stopBtn, tags['I0.1'] && styles.stopActive]}><Text style={styles.buttonLabel}>STOP</Text></View>
      </View>
      <View style={styles.grid}>
        <StatusChip label="Contator" active={tags['Q0.0']} tone="green" />
        <StatusChip label="Motor" active={tags['Q0.1']} tone="green" />
        <StatusChip label="RUN" active={tags['Q0.2']} tone="amber" />
        <StatusChip label="Térmico" active={thermalTrip} tone="red" />
      </View>
      <View style={[styles.thermalBox, thermalTrip && styles.thermalTrip]}>
        <Text style={styles.thermalText}>{thermalTrip ? 'FALHA TÉRMICA' : 'Relé térmico normal'}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  scene: { backgroundColor: colors.surfaceElevated, borderRadius: 12, padding: spacing.md, borderWidth: 1, borderColor: colors.border, gap: spacing.xs },
  title: { color: colors.text, fontWeight: '700', fontSize: 12 },
  busbar: { height: 6, borderRadius: 999, backgroundColor: colors.borderStrong },
  row: { flexDirection: 'row', gap: spacing.sm, marginTop: 2 },
  button: { flex: 1, paddingVertical: spacing.xs, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
  startBtn: { backgroundColor: colors.greenSoft, borderColor: colors.green },
  stopBtn: { backgroundColor: colors.redSoft, borderColor: colors.red },
  startActive: { shadowColor: colors.green, shadowOpacity: 0.28, shadowRadius: 8 },
  stopActive: { shadowColor: colors.red, shadowOpacity: 0.28, shadowRadius: 8 },
  buttonLabel: { color: colors.text, fontSize: 12, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
  chip: { minWidth: 72, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: spacing.sm, paddingVertical: 5 },
  chipGreen: { borderColor: colors.green, backgroundColor: colors.greenSoft },
  chipRed: { borderColor: colors.red, backgroundColor: colors.redSoft },
  chipAmber: { borderColor: colors.amber, backgroundColor: colors.amberSoft },
  chipText: { color: colors.textMuted, fontSize: 11, textAlign: 'center' },
  thermalBox: { marginTop: spacing.xs, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.xs },
  thermalTrip: { borderColor: colors.red, backgroundColor: colors.redSoft },
  thermalText: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
});
