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
  const inputs = points.filter((point) => point.kind === 'input').slice(0, 6);
  const outputs = points.filter((point) => point.kind === 'output').slice(0, 6);

  return (
    <View style={styles.card}>
      <View style={styles.group}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupTitle}>Entradas</Text>
          <Text style={styles.groupHint}>toque para acionar</Text>
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
                <Text style={[styles.address, active && styles.addressOn]}>{input.address}</Text>
                <Text style={styles.name} numberOfLines={1}>{input.name}</Text>
                <Text style={[styles.state, active && styles.stateOn]}>{mobileIoValueLabel(input.value)}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.group}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupTitle}>Saidas</Text>
          <Text style={styles.groupHint}>resultado</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.outputRail}>
          {outputs.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma saida Q/O encontrada.</Text>
          ) : outputs.map((output) => {
            const active = isMobileIoActive(output.value);
            return (
              <View key={output.id} style={[styles.outputRow, active && styles.outputRowOn]}>
                <View style={[styles.lamp, active && styles.lampOn]} />
                <View style={styles.outputCopy}>
                  <Text style={[styles.address, active && styles.addressOn]}>{output.address}</Text>
                  <Text style={styles.name} numberOfLines={1}>{output.name}</Text>
                </View>
                <Text style={[styles.state, active && styles.stateOn]}>{mobileIoValueLabel(output.value)}</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    gap: spacing.sm,
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
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  groupHint: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '800',
  },
  inputRail: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingRight: spacing.xs,
  },
  inputButton: {
    width: 132,
    minHeight: 66,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.sm,
    justifyContent: 'center',
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
  outputRow: {
    width: 184,
    minHeight: 52,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  outputRowOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  outputCopy: {
    flex: 1,
    minWidth: 0,
  },
  lamp: {
    width: 14,
    height: 14,
    borderRadius: 999,
    borderColor: colors.textDim,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
  lampOn: {
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
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  state: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 4,
  },
  stateOn: {
    color: colors.green,
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
