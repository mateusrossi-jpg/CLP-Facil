import { memo, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EditorProjectState } from '../engine/editorTypes';
import { PlcState } from '../engine/projectTypes';
import { collectMobileIoPoints, isMobileIoActive, mobileIoValueLabel } from '../simulation/mobileIoPoints';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type MobileIoDockProps = {
  editorProject: EditorProjectState;
  plcState: PlcState;
  onSetValue?: (variable: string, value: boolean | number) => void;
};

export const MobileIoDock = memo(function MobileIoDock({ editorProject, plcState, onSetValue }: MobileIoDockProps) {
  const points = useMemo(() => collectMobileIoPoints(editorProject, plcState), [editorProject, plcState]);
  const inputs = points.filter((point) => point.kind === 'input').slice(0, 8);
  const outputs = points.filter((point) => point.kind === 'output').slice(0, 8);

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>I/O</Text>
        <Text style={styles.panelHint}>entradas clicáveis • saídas ao vivo</Text>
      </View>

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

const styles = StyleSheet.create({
  panel: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: colors.background,
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
    color: colors.cyan,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  panelHint: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '800',
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
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  groupHint: {
    color: colors.textDim,
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
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  inputButtonOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  outputRail: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingRight: spacing.xs,
  },
  outputTile: {
    width: 144,
    minHeight: 58,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  outputTileOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  outputCopy: {
    flex: 1,
    minWidth: 0,
  },
  ioLamp: {
    width: 14,
    height: 14,
    borderRadius: 999,
    borderColor: colors.textDim,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
  ioLampOn: {
    borderColor: colors.green,
    backgroundColor: colors.green,
  },
  outputLamp: {
    width: 16,
    height: 16,
    borderRadius: 999,
    borderColor: colors.textDim,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
  outputLampOn: {
    borderColor: colors.green,
    backgroundColor: colors.green,
  },
  address: {
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '900',
  },
  addressOn: {
    color: colors.green,
  },
  name: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 1,
    textAlign: 'center',
  },
  statePill: {
    color: colors.textMuted,
    borderColor: colors.border,
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
    color: colors.background,
    borderColor: colors.green,
    backgroundColor: colors.green,
  },
  emptyText: {
    color: colors.textMuted,
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
