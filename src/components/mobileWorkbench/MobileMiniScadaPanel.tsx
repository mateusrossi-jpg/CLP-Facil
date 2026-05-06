import { ComponentProps, memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { collectMobileIoPoints, isMobileIoActive } from '../../simulation/mobileIoPoints';
import { MobilePlcExperience } from '../MobilePlcExperience';

type MobileMiniScadaPanelProps = Pick<ComponentProps<typeof MobilePlcExperience>, 'editorProject' | 'plcState' | 'evaluation' | 'mode'>;

function clampPercent(value: number): number {
  return Math.max(8, Math.min(92, value));
}

export const MobileMiniScadaPanel = memo(function MobileMiniScadaPanel({
  editorProject,
  plcState,
  evaluation,
  mode = 'simulate',
}: MobileMiniScadaPanelProps) {
  const points = useMemo(() => collectMobileIoPoints(editorProject, plcState), [editorProject, plcState]);
  const inputs = points.filter((point) => point.kind === 'input');
  const outputs = points.filter((point) => point.kind === 'output');
  const pumpOutput = outputs[0];
  const valveOutput = outputs[1] ?? outputs[0];
  const lowSensor = inputs[0];
  const highSensor = inputs[1] ?? inputs[0];
  const pumpOn = pumpOutput ? isMobileIoActive(pumpOutput.value) : false;
  const valveOpen = valveOutput ? isMobileIoActive(valveOutput.value) : pumpOn;
  const lowSensorOn = lowSensor ? isMobileIoActive(lowSensor.value) : false;
  const highSensorOn = highSensor ? isMobileIoActive(highSensor.value) : false;
  const energizedRungs = editorProject.rungs.filter((rung) => Boolean(evaluation.rungResults?.[rung.id])).length;
  const running = mode === 'simulate';
  const level = clampPercent((pumpOn ? 54 : 28) + (valveOpen ? 18 : 0) + (highSensorOn ? 18 : 0) - (lowSensorOn ? 8 : 0));
  const alarm = highSensorOn && pumpOn;

  return (
    <View style={[styles.panel, running && styles.panelRun, alarm && styles.panelAlarm]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>Mini SCADA</Text>
          <Text style={styles.title}>Processo tanque + bomba</Text>
        </View>
        <View style={[styles.badge, alarm ? styles.badgeAlarm : pumpOn ? styles.badgeRun : styles.badgeIdle]}>
          <Text style={[styles.badgeText, alarm ? styles.badgeTextAlarm : pumpOn ? styles.badgeTextRun : styles.badgeTextIdle]}>{alarm ? 'ALARM' : pumpOn ? 'PROCESS ON' : 'IDLE'}</Text>
        </View>
      </View>

      <View style={styles.processArea}>
        <View style={styles.leftColumn}>
          <View style={[styles.sensorCard, lowSensorOn && styles.sensorCardOn]}>
            <View style={[styles.sensorLamp, lowSensorOn && styles.sensorLampOn]} />
            <View style={styles.sensorCopy}>
              <Text style={styles.sensorLabel}>Sensor baixo</Text>
              <Text style={[styles.sensorAddress, lowSensorOn && styles.sensorAddressOn]}>{lowSensor?.address ?? 'I0.0'}</Text>
            </View>
          </View>
          <View style={[styles.sensorCard, highSensorOn && styles.sensorCardOn, alarm && styles.sensorCardAlarm]}>
            <View style={[styles.sensorLamp, highSensorOn && styles.sensorLampOn, alarm && styles.sensorLampAlarm]} />
            <View style={styles.sensorCopy}>
              <Text style={styles.sensorLabel}>Sensor alto</Text>
              <Text style={[styles.sensorAddress, highSensorOn && styles.sensorAddressOn, alarm && styles.sensorAddressAlarm]}>{highSensor?.address ?? 'I0.1'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.centerColumn}>
          <View style={styles.tankTop} />
          <View style={styles.tankBody}>
            <View style={[styles.waterFill, pumpOn && styles.waterFillOn, alarm && styles.waterFillAlarm, { height: `${level}%` }]} />
            <View style={styles.levelScale}>
              <Text style={styles.scaleText}>H</Text>
              <Text style={styles.scaleText}>L</Text>
            </View>
            <Text style={[styles.levelText, pumpOn && styles.levelTextOn, alarm && styles.levelTextAlarm]}>{level}%</Text>
          </View>
          <View style={styles.tankBase} />
        </View>

        <View style={styles.rightColumn}>
          <View style={[styles.valve, valveOpen && styles.valveOpen]}>
            <Text style={[styles.valveText, valveOpen && styles.valveTextOpen]}>{valveOpen ? 'OPEN' : 'CLOSE'}</Text>
          </View>
          <View style={[styles.pipeVertical, valveOpen && styles.pipeOn]} />
          <View style={[styles.pump, pumpOn && styles.pumpOn]}>
            <View style={[styles.pumpCore, pumpOn && styles.pumpCoreOn]}>
              <Text style={[styles.pumpIcon, pumpOn && styles.pumpIconOn]}>P</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.flowRow}>
        <View style={[styles.flowPipe, pumpOn && styles.flowPipeOn]} />
        <View style={[styles.flowDot, pumpOn && styles.flowDotOn]} />
        <View style={[styles.flowPipe, valveOpen && styles.flowPipeOn]} />
        <Text style={[styles.flowLabel, (pumpOn || valveOpen) && styles.flowLabelOn]}>fluxo de processo</Text>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.ioChip}>
          <Text style={styles.ioLabel}>Bomba</Text>
          <Text style={[styles.ioValue, pumpOn && styles.ioValueOn]}>{pumpOutput?.address ?? 'Q0.0'} {pumpOn ? 'ON' : 'OFF'}</Text>
        </View>
        <View style={styles.ioChip}>
          <Text style={styles.ioLabel}>Válvula</Text>
          <Text style={[styles.ioValue, valveOpen && styles.ioValueOn]}>{valveOutput?.address ?? 'Q0.1'} {valveOpen ? 'ON' : 'OFF'}</Text>
        </View>
        <View style={styles.ioChip}>
          <Text style={styles.ioLabel}>Rungs</Text>
          <Text style={[styles.ioValue, energizedRungs > 0 && styles.ioValueOn]}>{energizedRungs}/{editorProject.rungs.length}</Text>
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
  badge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  badgeIdle: {
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  badgeRun: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  badgeAlarm: {
    borderColor: colors.red,
    backgroundColor: colors.redSoft,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  badgeTextIdle: {
    color: colors.textMuted,
  },
  badgeTextRun: {
    color: colors.green,
  },
  badgeTextAlarm: {
    color: colors.red,
  },
  processArea: {
    minHeight: 224,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.background,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  leftColumn: {
    width: 92,
    gap: spacing.sm,
  },
  centerColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightColumn: {
    width: 82,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sensorCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sensorCardOn: {
    borderColor: colors.green,
    backgroundColor: colors.surface,
  },
  sensorCardAlarm: {
    borderColor: colors.red,
  },
  sensorLamp: {
    width: 12,
    height: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.textDim,
    backgroundColor: colors.background,
  },
  sensorLampOn: {
    borderColor: colors.green,
    backgroundColor: colors.green,
  },
  sensorLampAlarm: {
    borderColor: colors.red,
    backgroundColor: colors.red,
  },
  sensorCopy: {
    flex: 1,
    minWidth: 0,
  },
  sensorLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
  },
  sensorAddress: {
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '900',
  },
  sensorAddressOn: {
    color: colors.green,
  },
  sensorAddressAlarm: {
    color: colors.red,
  },
  tankTop: {
    width: 110,
    height: 12,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    backgroundColor: colors.borderStrong,
  },
  tankBody: {
    width: 116,
    height: 164,
    borderWidth: 3,
    borderColor: colors.borderStrong,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  waterFill: {
    width: '100%',
    backgroundColor: colors.cyanSoft,
  },
  waterFillOn: {
    backgroundColor: colors.greenSoft,
  },
  waterFillAlarm: {
    backgroundColor: colors.redSoft,
  },
  levelScale: {
    position: 'absolute',
    top: 12,
    right: 8,
    bottom: 12,
    justifyContent: 'space-between',
  },
  scaleText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  levelText: {
    position: 'absolute',
    alignSelf: 'center',
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  levelTextOn: {
    color: colors.green,
  },
  levelTextAlarm: {
    color: colors.red,
  },
  tankBase: {
    width: 132,
    height: 12,
    borderBottomLeftRadius: 999,
    borderBottomRightRadius: 999,
    backgroundColor: colors.borderStrong,
  },
  valve: {
    width: 64,
    height: 40,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valveOpen: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  valveText: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
  },
  valveTextOpen: {
    color: colors.green,
  },
  pipeVertical: {
    width: 8,
    height: 44,
    backgroundColor: colors.borderStrong,
  },
  pipeOn: {
    backgroundColor: colors.green,
  },
  pump: {
    width: 64,
    height: 64,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pumpOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  pumpCore: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pumpCoreOn: {
    backgroundColor: colors.surface,
  },
  pumpIcon: {
    color: colors.textMuted,
    fontSize: 18,
    fontWeight: '900',
  },
  pumpIconOn: {
    color: colors.green,
  },
  flowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  flowPipe: {
    flex: 1,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.borderStrong,
  },
  flowPipeOn: {
    backgroundColor: colors.green,
  },
  flowDot: {
    width: 14,
    height: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.textDim,
    backgroundColor: colors.surfaceElevated,
  },
  flowDotOn: {
    borderColor: colors.green,
    backgroundColor: colors.green,
  },
  flowLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  flowLabelOn: {
    color: colors.green,
  },
  footerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  ioChip: {
    flex: 1,
    minWidth: 92,
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
