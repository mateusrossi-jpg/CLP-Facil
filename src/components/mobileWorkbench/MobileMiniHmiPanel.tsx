import { ComponentProps, memo, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { collectMobileIoPoints, isMobileIoActive, mobileIoValueLabel } from '../../simulation/mobileIoPoints';
import { MobilePlcExperience } from '../MobilePlcExperience';

type MobileMiniHmiPanelProps = Pick<ComponentProps<typeof MobilePlcExperience>, 'editorProject' | 'plcState' | 'evaluation' | 'mode' | 'onSetValue'>;

export const MobileMiniHmiPanel = memo(function MobileMiniHmiPanel({
  editorProject,
  plcState,
  evaluation,
  mode = 'simulate',
  onSetValue,
}: MobileMiniHmiPanelProps) {
  const points = useMemo(() => collectMobileIoPoints(editorProject, plcState), [editorProject, plcState]);
  const inputs = points.filter((point) => point.kind === 'input').slice(0, 6);
  const outputs = points.filter((point) => point.kind === 'output').slice(0, 6);
  const activeOutputs = outputs.filter((point) => isMobileIoActive(point.value));
  const running = mode === 'simulate';
  const mainOutput = outputs[0];
  const motorOn = mainOutput ? isMobileIoActive(mainOutput.value) : activeOutputs.length > 0;
  const scanNumber = evaluation.scanNumber ?? 0;

  return (
    <View style={[styles.panel, running && styles.panelRun, motorOn && styles.panelActive]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>Mini HMI Live</Text>
          <Text style={styles.title}>Bancada de operação</Text>
        </View>
        <View style={[styles.statusPill, running && styles.statusPillRun]}>
          <Text style={[styles.statusText, running && styles.statusTextRun]}>{running ? 'ONLINE' : 'EDIT'}</Text>
          <Text style={styles.scanText}>#{scanNumber}</Text>
        </View>
      </View>

      <View style={styles.machineCard}>
        <View style={[styles.motorHousing, motorOn && styles.motorHousingOn]}>
          <View style={[styles.motorCore, motorOn && styles.motorCoreOn]}>
            <Text style={[styles.motorIcon, motorOn && styles.motorIconOn]}>M</Text>
          </View>
          <View style={[styles.shaft, motorOn && styles.shaftOn]} />
        </View>
        <View style={styles.machineCopy}>
          <Text style={styles.machineLabel}>Atuador principal</Text>
          <Text style={[styles.machineState, motorOn && styles.machineStateOn]}>{motorOn ? 'MOTOR / SAÍDA LIGADA' : 'AGUARDANDO COMANDO'}</Text>
          <Text style={styles.machineMeta}>{mainOutput ? `${mainOutput.address} • ${mainOutput.name}` : 'Nenhuma saída Q configurada'}</Text>
        </View>
      </View>

      <View style={styles.group}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupTitle}>Entradas de campo</Text>
          <Text style={styles.groupHint}>toque para acionar</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
          {inputs.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma entrada I encontrada.</Text>
          ) : inputs.map((input) => {
            const active = isMobileIoActive(input.value);
            const editable = typeof input.value !== 'number' && running;
            return (
              <Pressable
                key={input.id}
                disabled={!editable}
                onPress={() => onSetValue?.(input.address, !active)}
                style={({ pressed }) => [styles.inputButton, active && styles.inputButtonOn, !editable && styles.disabled, pressed && editable && styles.pressed]}
              >
                <View style={[styles.inputLamp, active && styles.inputLampOn]} />
                <Text style={[styles.address, active && styles.addressOn]}>{input.address}</Text>
                <Text style={styles.name} numberOfLines={1}>{input.name}</Text>
                <Text style={[styles.value, active && styles.valueOn]}>{mobileIoValueLabel(input.value)}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.group}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupTitle}>Saídas / lâmpadas</Text>
          <Text style={styles.groupHint}>{activeOutputs.length} ligada(s)</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
          {outputs.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma saída Q/O encontrada.</Text>
          ) : outputs.map((output) => {
            const active = isMobileIoActive(output.value);
            return (
              <View key={output.id} style={[styles.outputLampCard, active && styles.outputLampCardOn]}>
                <View style={[styles.bigLamp, active && styles.bigLampOn]} />
                <Text style={[styles.address, active && styles.addressOn]}>{output.address}</Text>
                <Text style={styles.name} numberOfLines={1}>{output.name}</Text>
                <Text style={[styles.value, active && styles.valueOn]}>{mobileIoValueLabel(output.value)}</Text>
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
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.md,
  },
  panelRun: {
    borderColor: colors.cyan,
  },
  panelActive: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  eyebrow: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  statusPill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  statusPillRun: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  statusText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  statusTextRun: {
    color: colors.green,
  },
  scanText: {
    color: colors.cyan,
    fontSize: 9,
    fontWeight: '900',
  },
  machineCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  motorHousing: {
    width: 78,
    height: 60,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  motorHousingOn: {
    borderColor: colors.green,
    backgroundColor: colors.surface,
  },
  motorCore: {
    width: 42,
    height: 42,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  motorCoreOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  motorIcon: {
    color: colors.textMuted,
    fontSize: 18,
    fontWeight: '900',
  },
  motorIconOn: {
    color: colors.green,
  },
  shaft: {
    position: 'absolute',
    right: -18,
    width: 22,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.borderStrong,
  },
  shaftOn: {
    backgroundColor: colors.green,
  },
  machineCopy: {
    flex: 1,
    minWidth: 0,
  },
  machineLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  machineState: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
  },
  machineStateOn: {
    color: colors.green,
  },
  machineMeta: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
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
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
  },
  rail: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingRight: spacing.xs,
  },
  inputButton: {
    width: 118,
    minHeight: 94,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  inputButtonOn: {
    borderColor: colors.green,
    backgroundColor: colors.surface,
  },
  inputLamp: {
    width: 14,
    height: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.textDim,
    backgroundColor: colors.background,
  },
  inputLampOn: {
    borderColor: colors.green,
    backgroundColor: colors.green,
  },
  outputLampCard: {
    width: 118,
    minHeight: 104,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  outputLampCardOn: {
    borderColor: colors.green,
    backgroundColor: colors.surface,
  },
  bigLamp: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.textDim,
    backgroundColor: colors.background,
  },
  bigLampOn: {
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
    textAlign: 'center',
  },
  value: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  valueOn: {
    color: colors.green,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.72,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
});
