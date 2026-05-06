import { memo, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EditorProjectState } from '../engine/editorTypes';
import { PlcState } from '../engine/projectTypes';
import { collectMobileIoPoints, isMobileIoActive, mobileIoValueLabel } from '../simulation/mobileIoPoints';
import { spacing } from '../theme/spacing';
import { useAppTheme } from '../theme/theme';

type MobileIoDockProps = {
  editorProject: EditorProjectState;
  plcState: PlcState;
  onSetValue?: (variable: string, value: boolean | number) => void;
};

export const MobileIoDock = memo(function MobileIoDock({ editorProject, plcState, onSetValue }: MobileIoDockProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme.colors), [theme.colors]);
  const points = useMemo(() => collectMobileIoPoints(editorProject, plcState), [editorProject, plcState]);
  const inputs = points.filter((point) => point.kind === 'input').slice(0, 8);
  const outputs = points.filter((point) => point.kind === 'output').slice(0, 8);
  const activeInputs = inputs.filter((input) => isMobileIoActive(input.value)).length;
  const activeOutputs = outputs.filter((output) => isMobileIoActive(output.value)).length;

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>I/O</Text>
        <View style={styles.counterCluster}>
          <Text style={[styles.counterPill, activeInputs > 0 && styles.counterPillOn]}>I {activeInputs}/{inputs.length}</Text>
          <Text style={[styles.counterPill, activeOutputs > 0 && styles.counterPillOn]}>Q {activeOutputs}/{outputs.length}</Text>
        </View>
      </View>
      <Text style={styles.panelHint}>entradas clicáveis • saídas ao vivo</Text>

      <View style={styles.group}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupTitle}>Entradas</Text>
          <Text style={styles.groupHint}>toque ON/OFF</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.inputRail}>
          {inputs.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma entrada I encontrada.</Text>
          ) : inputs.map((input) => {
            const active = isMobileIoActive(input.value);
            const editable = typeof input.value !== 'number';
            return (
              <Pressable
                key={input.id}
                disabled={!editable}
                onPress={() => onSetValue?.(input.address, !active)}
                style={({ pressed }) => [styles.inputButton, active && styles.inputButtonOn, !editable && styles.disabled, pressed && editable && styles.pressed]}
              >
                <View style={[styles.ioLamp, active && styles.ioLampOn]} />
                <Text style={[styles.address, active && styles.addressOn]}>{input.address}</Text>
                <Text style={styles.name} numberOfLines={1}>{input.name}</Text>
                <Text style={[styles.statePill, active && styles.statePillOn]}>{mobileIoValueLabel(input.value)}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.group}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupTitle}>Saídas</Text>
          <Text style={styles.groupHint}>resultado do scan</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.outputRail}>
          {outputs.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma saída Q/O encontrada.</Text>
          ) : outputs.map((output) => {
            const active = isMobileIoActive(output.value);
            return (
              <View key={output.id} style={[styles.outputTile, active && styles.outputTileOn]}>
                <View style={[styles.outputLamp, active && styles.outputLampOn]} />
                <View style={styles.outputCopy}>
                  <Text style={[styles.address, active && styles.addressOn]}>{output.address}</Text>
                  <Text style={styles.name} numberOfLines={1}>{output.name}</Text>
                </View>
                <Text style={[styles.statePill, active && styles.statePillOn]}>{mobileIoValueLabel(output.value)}</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
});

function createStyles(c: ReturnType<typeof useAppTheme>["colors"]) {
  return StyleSheet.create({
  panel: {
    borderColor: c.border,
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: c.background,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  panelHeader: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  panelTitle: {
    color: c.cyan,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  panelHint: {
    color: c.textDim,
    fontSize: 10,
    fontWeight: '800',
    marginTop: -spacing.xs,
  },
  counterCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  counterPill: {
    color: c.textMuted,
    borderColor: c.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 10,
    fontWeight: '900',
    overflow: 'hidden',
  },
  counterPillOn: {
    color: c.background,
    borderColor: c.green,
    backgroundColor: c.green,
  },
  group: {
    gap: spacing.xs,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  groupTitle: {
    color: c.text,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  groupHint: {
    color: c.textDim,
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  inputRail: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingRight: spacing.xs,
  },
  inputButton: {
    width: 104,
    minHeight: 78,
    borderColor: c.border,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: c.surfaceElevated,
    padding: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  inputButtonOn: {
    borderColor: c.green,
    backgroundColor: c.greenSoft,
  },
  outputRail: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingRight: spacing.xs,
  },
  outputTile: {
    width: 144,
    minHeight: 58,
    borderColor: c.border,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: c.surfaceElevated,
    padding: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  outputTileOn: {
    borderColor: c.green,
    backgroundColor: c.greenSoft,
  },
  outputCopy: {
    flex: 1,
    minWidth: 0,
  },
  ioLamp: {
    width: 14,
    height: 14,
    borderRadius: 999,
    borderColor: c.textDim,
    borderWidth: 1,
    backgroundColor: c.surface,
  },
  ioLampOn: {
    borderColor: c.green,
    backgroundColor: c.green,
  },
  outputLamp: {
    width: 16,
    height: 16,
    borderRadius: 999,
    borderColor: c.textDim,
    borderWidth: 1,
    backgroundColor: c.surface,
  },
  outputLampOn: {
    borderColor: c.green,
    backgroundColor: c.green,
  },
  address: {
    color: c.text,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '900',
  },
  addressOn: {
    color: c.green,
  },
  name: {
    color: c.textMuted,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 1,
    textAlign: 'center',
  },
  statePill: {
    color: c.textMuted,
    borderColor: c.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
    fontSize: 9,
    fontWeight: '900',
    overflow: 'hidden',
    marginTop: 2,
  },
  statePillOn: {
    color: c.background,
    borderColor: c.green,
    backgroundColor: c.green,
  },
  emptyText: {
    color: c.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.72,
  },
  });
}
