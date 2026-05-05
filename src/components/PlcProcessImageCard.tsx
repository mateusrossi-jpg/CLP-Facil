import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { runPlcScanCycle } from '../engine/plcScanCycle';
import { EditorProjectState } from '../engine/editorTypes';
import { PlcState } from '../engine/projectTypes';
import { EditorRuntimeState } from '../engine/runtimeTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type PlcProcessImageCardProps = {
  project: EditorProjectState;
  state: PlcState;
  scanNumber: number;
  runtime?: EditorRuntimeState;
};

type ProcessImageRow = {
  address: string;
  value: boolean | number;
};

function toRows(image: PlcState): ProcessImageRow[] {
  return Object.entries(image)
    .map(([address, value]) => ({ address, value }))
    .sort((left, right) => left.address.localeCompare(right.address))
    .slice(0, 8);
}

function isActive(value: boolean | number): boolean {
  return typeof value === 'number' ? value !== 0 : Boolean(value);
}

function ProcessImageColumn({ title, subtitle, rows }: { title: string; subtitle: string; rows: ProcessImageRow[] }) {
  return (
    <View style={styles.column}>
      <Text style={styles.columnTitle}>{title}</Text>
      <Text style={styles.columnSubtitle}>{subtitle}</Text>
      <View style={styles.rowStack}>
        {rows.length === 0 ? (
          <Text style={styles.emptyText}>Sem sinais nesta imagem.</Text>
        ) : rows.map((row) => {
          const active = isActive(row.value);
          return (
            <View key={row.address} style={[styles.signalRow, active && styles.signalRowActive]}>
              <View style={[styles.signalDot, active && styles.signalDotActive]} />
              <Text style={[styles.signalAddress, active && styles.signalAddressActive]}>{row.address}</Text>
              <Text style={[styles.signalValue, active && styles.signalValueActive]}>{typeof row.value === 'number' ? row.value : active ? 'ON' : 'OFF'}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export const PlcProcessImageCard = memo(function PlcProcessImageCard({
  project,
  state,
  scanNumber,
  runtime,
}: PlcProcessImageCardProps) {
  const cycle = useMemo(
    () => runPlcScanCycle(project, state, Math.max(scanNumber, 1), runtime),
    [project, runtime, scanNumber, state],
  );
  const inputRows = useMemo(() => toRows(cycle.inputImage), [cycle.inputImage]);
  const outputRows = useMemo(() => toRows(cycle.outputImage), [cycle.outputImage]);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Imagem de processo</Text>
          <Text style={styles.title}>Entradas congeladas → Saídas atualizadas</Text>
        </View>
        <View style={styles.scanPill}>
          <Text style={styles.scanPillLabel}>Scan</Text>
          <Text style={styles.scanPillValue}>#{cycle.scanNumber || scanNumber || 0}</Text>
        </View>
      </View>

      <View style={styles.columnsRow}>
        <ProcessImageColumn title="Entrada" subtitle="Lida no começo" rows={inputRows} />
        <ProcessImageColumn title="Saída" subtitle="Escrita no fim" rows={outputRows} />
      </View>

      <Text style={styles.explanation}>
        Em um CLP real, o programa normalmente trabalha com uma imagem das entradas lida no início do ciclo. As saídas são atualizadas depois que os rungs são resolvidos.
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderColor: colors.amber,
    borderWidth: 1,
    borderRadius: 20,
    padding: spacing.md,
    backgroundColor: colors.amberSoft,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: colors.amber,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  scanPill: {
    borderColor: colors.amber,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  scanPillLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  scanPillValue: {
    color: colors.amber,
    fontSize: 14,
    fontWeight: '900',
  },
  columnsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  column: {
    flex: 1,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  columnTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  columnSubtitle: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  rowStack: {
    gap: 5,
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.xs,
    paddingVertical: 5,
    backgroundColor: colors.surfaceElevated,
  },
  signalRowActive: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  signalDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    borderColor: colors.textDim,
    borderWidth: 1,
  },
  signalDotActive: {
    borderColor: colors.green,
    backgroundColor: colors.green,
  },
  signalAddress: {
    flex: 1,
    color: colors.textMuted,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '900',
  },
  signalAddressActive: {
    color: colors.green,
  },
  signalValue: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '900',
  },
  signalValueActive: {
    color: colors.green,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  explanation: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },
});
