import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EditorBlock, EditorProjectState } from '../engine/editorTypes';
import { PlcState } from '../engine/projectTypes';
import { EditorRuntimeState } from '../engine/runtimeTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type PlcWatchTableCardProps = {
  project: EditorProjectState;
  state: PlcState;
  runtime?: EditorRuntimeState;
};

type WatchKind = 'input' | 'output' | 'memory' | 'timer' | 'counter' | 'number';

type WatchRow = {
  address: string;
  name: string;
  kind: WatchKind;
  value: boolean | number | undefined;
  source: 'Tabela' | 'Programa' | 'Runtime';
};

function normalize(value: string | undefined): string {
  return (value ?? '').trim().toUpperCase();
}

function isNumericLiteral(value: string | undefined): boolean {
  if (!value) return false;
  return Number.isFinite(Number(value.trim().replace(',', '.')));
}

function inferKind(address: string): WatchKind {
  const normalized = normalize(address);
  if (normalized.startsWith('I')) return 'input';
  if (normalized.startsWith('Q') || normalized.startsWith('O')) return 'output';
  if (normalized.startsWith('T')) return 'timer';
  if (normalized.startsWith('C')) return 'counter';
  if (normalized.startsWith('N')) return 'number';
  return 'memory';
}

function labelForKind(kind: WatchKind): string {
  if (kind === 'input') return 'Entrada';
  if (kind === 'output') return 'Saída';
  if (kind === 'timer') return 'Timer';
  if (kind === 'counter') return 'Counter';
  if (kind === 'number') return 'Número';
  return 'Memória';
}

function valueForRuntime(address: string, state: PlcState, runtime?: EditorRuntimeState): boolean | number | undefined {
  const normalized = normalize(address);
  if (state[normalized] !== undefined) return state[normalized];

  if (normalized.startsWith('T') && runtime) {
    const timer = Object.entries(runtime.timers).find(([blockId]) => normalize(blockId) === normalized);
    if (timer) return timer[1].q;
  }

  if (normalized.startsWith('C') && runtime) {
    const counter = Object.entries(runtime.counters).find(([blockId]) => normalize(blockId) === normalized);
    if (counter) return counter[1].currentValue;
  }

  return undefined;
}

function collectBlocks(project: EditorProjectState): EditorBlock[] {
  return project.rungs.flatMap((rung) => [
    ...rung.seriesBlocks,
    ...rung.parallelBlocks,
    ...(rung.parallelBranches ?? []).flatMap((branch) => branch.blocks),
    ...(rung.coilBlock ? [rung.coilBlock] : []),
  ]);
}

function addWatchRow(rows: Map<string, WatchRow>, row: WatchRow) {
  if (!row.address || isNumericLiteral(row.address)) return;
  if (rows.has(row.address)) {
    const current = rows.get(row.address);
    if (current && current.source !== 'Tabela' && row.source === 'Tabela') rows.set(row.address, row);
    return;
  }
  rows.set(row.address, row);
}

function collectWatchRows(project: EditorProjectState, state: PlcState, runtime?: EditorRuntimeState): WatchRow[] {
  const rows = new Map<string, WatchRow>();

  for (const variable of project.projectVariables ?? []) {
    const address = normalize(variable.address || variable.id);
    const kind = variable.dataType === 'timer'
      ? 'timer'
      : variable.dataType === 'counter'
        ? 'counter'
        : variable.dataType === 'number'
          ? 'number'
          : inferKind(address);
    addWatchRow(rows, {
      address,
      name: variable.name || labelForKind(kind),
      kind,
      value: valueForRuntime(address, state, runtime),
      source: 'Tabela',
    });
  }

  for (const block of collectBlocks(project)) {
    const candidateFields = [block.variable, block.sourceA, block.sourceB, block.destination, block.downSource, block.resetSource];
    for (const candidate of candidateFields) {
      const address = normalize(candidate);
      if (!address || isNumericLiteral(address)) continue;
      const kind = inferKind(address);
      addWatchRow(rows, {
        address,
        name: block.name || labelForKind(kind),
        kind,
        value: valueForRuntime(address, state, runtime),
        source: 'Programa',
      });
    }
  }

  for (const [blockId, timer] of Object.entries(runtime?.timers ?? {})) {
    const address = normalize(blockId);
    addWatchRow(rows, {
      address,
      name: 'Timer runtime',
      kind: 'timer',
      value: timer.q,
      source: 'Runtime',
    });
  }

  for (const [blockId, counter] of Object.entries(runtime?.counters ?? {})) {
    const address = normalize(blockId);
    addWatchRow(rows, {
      address,
      name: 'Counter runtime',
      kind: 'counter',
      value: counter.currentValue,
      source: 'Runtime',
    });
  }

  return Array.from(rows.values()).sort((left, right) => left.address.localeCompare(right.address));
}

function isActive(value: boolean | number | undefined): boolean {
  if (typeof value === 'number') return value !== 0;
  return Boolean(value);
}

function formatValue(value: boolean | number | undefined): string {
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'ON' : 'OFF';
  return '—';
}

export const PlcWatchTableCard = memo(function PlcWatchTableCard({ project, state, runtime }: PlcWatchTableCardProps) {
  const rows = useMemo(() => collectWatchRows(project, state, runtime), [project, runtime, state]);
  const activeCount = rows.filter((row) => isActive(row.value)).length;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Watch Table</Text>
          <Text style={styles.title}>Tags observadas no scan</Text>
        </View>
        <View style={styles.countPill}>
          <Text style={styles.countLabel}>ON</Text>
          <Text style={styles.countValue}>{activeCount}/{rows.length}</Text>
        </View>
      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, styles.addressCell]}>Tag</Text>
        <Text style={[styles.headerCell, styles.kindCell]}>Tipo</Text>
        <Text style={[styles.headerCell, styles.valueCell]}>Valor</Text>
      </View>

      <View style={styles.rowStack}>
        {rows.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma tag encontrada para observação.</Text>
        ) : rows.slice(0, 12).map((row) => {
          const active = isActive(row.value);
          return (
            <View key={`${row.address}-${row.source}`} style={[styles.watchRow, active && styles.watchRowActive]}>
              <View style={styles.addressCell}>
                <Text style={[styles.addressText, active && styles.addressTextActive]} numberOfLines={1}>{row.address}</Text>
                <Text style={styles.nameText} numberOfLines={1}>{row.name} • {row.source}</Text>
              </View>
              <Text style={[styles.kindCell, styles.kindText]}>{labelForKind(row.kind)}</Text>
              <Text style={[styles.valueCell, styles.valueText, active && styles.valueTextActive]}>{formatValue(row.value)}</Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.explanation}>A Watch Table reúne as variáveis do programa para acompanhar o valor atual durante o ciclo de scan, como em softwares de CLP reais.</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 20,
    padding: spacing.md,
    backgroundColor: colors.cyanSoft,
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
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  countPill: {
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  countLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  countValue: {
    color: colors.cyan,
    fontSize: 14,
    fontWeight: '900',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  headerCell: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  rowStack: {
    gap: spacing.xs,
  },
  watchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  watchRowActive: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  addressCell: {
    flex: 1.25,
    minWidth: 0,
  },
  kindCell: {
    flex: 0.8,
    minWidth: 0,
  },
  valueCell: {
    flex: 0.55,
    minWidth: 0,
    textAlign: 'right',
  },
  addressText: {
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '900',
  },
  addressTextActive: {
    color: colors.green,
  },
  nameText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  kindText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  valueText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
  },
  valueTextActive: {
    color: colors.green,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  explanation: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },
});
