import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

type MobileWorkbenchHeaderProps = {
  mode?: 'edit' | 'simulate';
  autoScan?: boolean;
};

export const MobileWorkbenchHeader = memo(function MobileWorkbenchHeader({
  mode = 'simulate',
  autoScan = false,
}: MobileWorkbenchHeaderProps) {
  const runtimeMode = mode === 'edit' ? 'EDITOR' : autoScan ? 'AUTO' : 'SCAN';

  return (
    <View style={styles.workbenchHeader}>
      <View style={styles.workbenchCopy}>
        <Text style={styles.workbenchEyebrow}>PLC Simulator</Text>
        <Text style={styles.workbenchTitle}>Programa Ladder + I/O + Scan</Text>
        <Text style={styles.workbenchText}>
          Use como simulador direto: toque nas entradas, clique nos blocos para editar tags e rode o scan na mesma bancada.
        </Text>

        <View style={styles.flowRow}>
          <Text style={styles.flowChip}>I/O</Text>
          <Text style={styles.flowArrow}>→</Text>
          <Text style={styles.flowChip}>Ladder</Text>
          <Text style={styles.flowArrow}>→</Text>
          <Text style={styles.flowChip}>Q</Text>
        </View>
      </View>

      <Text style={[styles.workbenchMode, mode === 'edit' && styles.workbenchModeEdit]}>
        {runtimeMode}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  workbenchHeader: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: colors.background,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  workbenchCopy: {
    flex: 1,
    minWidth: 0,
  },
  workbenchEyebrow: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  workbenchTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 3,
  },
  workbenchText: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800',
    marginTop: 5,
  },
  flowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  flowChip: {
    color: colors.cyan,
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 9,
    fontWeight: '900',
    overflow: 'hidden',
  },
  flowArrow: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '900',
  },
  workbenchMode: {
    color: colors.background,
    backgroundColor: colors.green,
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    fontSize: 10,
    fontWeight: '900',
  },
  workbenchModeEdit: {
    backgroundColor: colors.amber,
  },
});
