import { ComponentProps, memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { collectMobileIoPoints, isMobileIoActive } from '../../simulation/mobileIoPoints';
import { MobilePlcExperience } from '../MobilePlcExperience';

type MobileFactoryProcessPanelProps = Pick<ComponentProps<typeof MobilePlcExperience>, 'editorProject' | 'plcState' | 'evaluation' | 'mode'>;

function outputActive(outputs: ReturnType<typeof collectMobileIoPoints>, index: number): boolean {
  const point = outputs[index] ?? outputs[0];
  return point ? isMobileIoActive(point.value) : false;
}

function inputActive(inputs: ReturnType<typeof collectMobileIoPoints>, index: number): boolean {
  const point = inputs[index] ?? inputs[0];
  return point ? isMobileIoActive(point.value) : false;
}

export const MobileFactoryProcessPanel = memo(function MobileFactoryProcessPanel({
  editorProject,
  plcState,
  evaluation,
  mode = 'simulate',
}: MobileFactoryProcessPanelProps) {
  const points = useMemo(() => collectMobileIoPoints(editorProject, plcState), [editorProject, plcState]);
  const inputs = points.filter((point) => point.kind === 'input');
  const outputs = points.filter((point) => point.kind === 'output');
  const conveyorOn = outputActive(outputs, 0);
  const pistonOn = outputActive(outputs, 1);
  const towerGreen = outputActive(outputs, 2) || conveyorOn;
  const photoSensor = inputActive(inputs, 0);
  const limitSensor = inputActive(inputs, 1);
  const running = mode === 'simulate';
  const scanNumber = evaluation.scanNumber ?? 0;
  const boxPosition = conveyorOn ? ((scanNumber % 5) * 18) + 8 : photoSensor ? 48 : 18;
  const alarm = pistonOn && !photoSensor;

  return (
    <View style={[styles.panel, running && styles.panelRun, alarm && styles.panelAlarm]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>Factory I/O</Text>
          <Text style={styles.title}>Esteira + sensor + pistão</Text>
        </View>
        <View style={[styles.statusBadge, alarm ? styles.statusBadgeAlarm : conveyorOn ? styles.statusBadgeRun : styles.statusBadgeIdle]}>
          <Text style={[styles.statusText, alarm ? styles.statusTextAlarm : conveyorOn ? styles.statusTextRun : styles.statusTextIdle]}>{alarm ? 'ALARM' : conveyorOn ? 'RUN' : 'STOP'}</Text>
        </View>
      </View>

      <View style={styles.factoryArea}>
        <View style={styles.towerStack}>
          <View style={[styles.towerLamp, alarm && styles.towerRed]} />
          <View style={[styles.towerLamp, conveyorOn && !alarm && styles.towerYellow]} />
          <View style={[styles.towerLamp, towerGreen && !alarm && styles.towerGreen]} />
          <View style={styles.towerBase} />
        </View>

        <View style={styles.machineArea}>
          <View style={styles.sensorBeamRow}>
            <View style={[styles.photoSensor, photoSensor && styles.photoSensorOn]}>
              <Text style={[styles.sensorText, photoSensor && styles.sensorTextOn]}>{inputs[0]?.address ?? 'I0.0'}</Text>
            </View>
            <View style={[styles.sensorBeam, photoSensor && styles.sensorBeamOn]} />
            <View style={[styles.reflector, photoSensor && styles.reflectorOn]} />
          </View>

          <View style={styles.pistonRow}>
            <View style={[styles.pistonBody, pistonOn && styles.pistonBodyOn]}>
              <Text style={[styles.pistonText, pistonOn && styles.pistonTextOn]}>{outputs[1]?.address ?? 'Q0.1'}</Text>
            </View>
            <View style={[styles.pistonRod, pistonOn && styles.pistonRodOn, pistonOn && styles.pistonRodExtended]} />
            <View style={[styles.pusherPlate, pistonOn && styles.pusherPlateOn]} />
          </View>

          <View style={styles.conveyorWrap}>
            <View style={[styles.conveyorBelt, conveyorOn && styles.conveyorBeltOn]}>
              <View style={[styles.beltStripe, conveyorOn && styles.beltStripeOn]} />
              <View style={[styles.beltStripe, conveyorOn && styles.beltStripeOn]} />
              <View style={[styles.beltStripe, conveyorOn && styles.beltStripeOn]} />
              <View style={[styles.box, photoSensor && styles.boxDetected, alarm && styles.boxAlarm, { left: `${boxPosition}%` }]}>
                <Text style={styles.boxText}>BOX</Text>
              </View>
            </View>
            <View style={styles.rollerRow}>
              <View style={[styles.roller, conveyorOn && styles.rollerOn]} />
              <View style={[styles.roller, conveyorOn && styles.rollerOn]} />
              <View style={[styles.roller, conveyorOn && styles.rollerOn]} />
              <View style={[styles.roller, conveyorOn && styles.rollerOn]} />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.ioRow}>
        <View style={styles.ioChip}>
          <Text style={styles.ioLabel}>Esteira</Text>
          <Text style={[styles.ioValue, conveyorOn && styles.ioValueOn]}>{outputs[0]?.address ?? 'Q0.0'} {conveyorOn ? 'ON' : 'OFF'}</Text>
        </View>
        <View style={styles.ioChip}>
          <Text style={styles.ioLabel}>Pistão</Text>
          <Text style={[styles.ioValue, pistonOn && styles.ioValueOn]}>{outputs[1]?.address ?? 'Q0.1'} {pistonOn ? 'ON' : 'OFF'}</Text>
        </View>
        <View style={styles.ioChip}>
          <Text style={styles.ioLabel}>Foto</Text>
          <Text style={[styles.ioValue, photoSensor && styles.ioValueOn]}>{inputs[0]?.address ?? 'I0.0'} {photoSensor ? 'ON' : 'OFF'}</Text>
        </View>
        <View style={styles.ioChip}>
          <Text style={styles.ioLabel}>Fim curso</Text>
          <Text style={[styles.ioValue, limitSensor && styles.ioValueOn]}>{inputs[1]?.address ?? 'I0.1'} {limitSensor ? 'ON' : 'OFF'}</Text>
        </View>
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
  panelAlarm: {
    borderColor: colors.red,
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
  statusBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  statusBadgeIdle: {
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  statusBadgeRun: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  statusBadgeAlarm: {
    borderColor: colors.red,
    backgroundColor: colors.redSoft,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
  },
  statusTextIdle: {
    color: colors.textMuted,
  },
  statusTextRun: {
    color: colors.green,
  },
  statusTextAlarm: {
    color: colors.red,
  },
  factoryArea: {
    minHeight: 238,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.background,
    padding: spacing.sm,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  towerStack: {
    width: 42,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  towerLamp: {
    width: 22,
    height: 22,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceElevated,
  },
  towerRed: {
    borderColor: colors.red,
    backgroundColor: colors.red,
  },
  towerYellow: {
    borderColor: colors.amber,
    backgroundColor: colors.amber,
  },
  towerGreen: {
    borderColor: colors.green,
    backgroundColor: colors.green,
  },
  towerBase: {
    width: 6,
    height: 74,
    borderRadius: 999,
    backgroundColor: colors.borderStrong,
  },
  machineArea: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    gap: spacing.sm,
  },
  sensorBeamRow: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoSensor: {
    width: 54,
    minHeight: 34,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoSensorOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  sensorText: {
    color: colors.textMuted,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '900',
  },
  sensorTextOn: {
    color: colors.green,
  },
  sensorBeam: {
    flex: 1,
    height: 3,
    borderRadius: 999,
    backgroundColor: colors.borderStrong,
    marginHorizontal: spacing.xs,
  },
  sensorBeamOn: {
    backgroundColor: colors.green,
  },
  reflector: {
    width: 16,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceElevated,
  },
  reflectorOn: {
    borderColor: colors.green,
  },
  pistonRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pistonBody: {
    width: 62,
    height: 40,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    borderRadius: 14,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pistonBodyOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  pistonText: {
    color: colors.textMuted,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '900',
  },
  pistonTextOn: {
    color: colors.green,
  },
  pistonRod: {
    width: 36,
    height: 8,
    backgroundColor: colors.borderStrong,
  },
  pistonRodExtended: {
    width: 72,
  },
  pistonRodOn: {
    backgroundColor: colors.green,
  },
  pusherPlate: {
    width: 8,
    height: 44,
    borderRadius: 6,
    backgroundColor: colors.borderStrong,
  },
  pusherPlateOn: {
    backgroundColor: colors.green,
  },
  conveyorWrap: {
    gap: 4,
  },
  conveyorBelt: {
    height: 70,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    borderRadius: 18,
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  conveyorBeltOn: {
    borderColor: colors.green,
    backgroundColor: colors.surface,
  },
  beltStripe: {
    width: 4,
    height: '100%',
    backgroundColor: colors.border,
    opacity: 0.7,
  },
  beltStripeOn: {
    backgroundColor: colors.green,
    opacity: 0.35,
  },
  box: {
    position: 'absolute',
    top: 16,
    width: 48,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxDetected: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  boxAlarm: {
    borderColor: colors.red,
    backgroundColor: colors.redSoft,
  },
  boxText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '900',
  },
  rollerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  roller: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceElevated,
  },
  rollerOn: {
    borderColor: colors.green,
  },
  ioRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  ioChip: {
    flexGrow: 1,
    minWidth: 104,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },
  ioLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  ioValue: {
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  ioValueOn: {
    color: colors.green,
  },
});
