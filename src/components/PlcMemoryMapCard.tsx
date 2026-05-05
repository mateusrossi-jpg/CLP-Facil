import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EditorBlock, EditorProjectState } from '../engine/editorTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type PlcMemoryMapCardProps = {
  project: EditorProjectState;
};

type MemoryArea = 'I' | 'Q' | 'M' | 'T' | 'C' | 'N';

type MemoryMapRow = {
  address: string;
  label: string;
  area: MemoryArea;
  source: 'Tabela' | 'Programa';
};

function normalize(value: string | undefined): string {
  return (value ?? '').trim().toUpperCase();
}

function isNumericLiteral(value: string | undefined): boolean {
  if (!value) return false;
  return Number.isFinite(Number(value.trim().replace(',', '.')));
}

function inferArea(address: string): MemoryArea {
  const normalized = normalize(address);
  if (normalized.startsWith('I')) return 'I';
  if (normalized.startsWith('Q') || normalized.startsWith('O')) return 'Q';
  if (normalized.startsWith('T')) return 'T';
  if (normalized.startsWith('C')) return 'C';
  if (normalized.startsWith('N')) return 'N';
  return 'M';
}

function areaTitle(area: MemoryArea): string {
  if (area === 'I') return 'Entradas';
  if (area === 'Q') return 'Saídas';
  if (area === 'T') return 'Timers';
  if (area === 'C') return 'Contadores';
  if (area === 'N') return 'Numéricos';
  return 'Memórias';
}

function areaDescription(area: MemoryArea): string {
  if (area === 'I') return 'Imagem de sinais vindos do campo.';
  if (area === 'Q') return 'Imagem escrita para atuadores.';
  if (area === 'T') return 'Instruções de tempo com PRE/ACC/DN.';
  if (area === 'C') return 'Contagem por pulso ou evento.';
  if (area === 'N') return 'Registradores numéricos.';
  return 'Bits internos auxiliares.';
}

function collectBlocks(project: EditorProjectState): EditorBlock[] {
  return project.rungs.flatMap((rung) => [
    ...rung.seriesBlocks,
    ...rung.parallelBlocks,
    ...(rung.parallelBranches ?? []).flatMap((branch) => branch.blocks),
    ...(rung.coilBlock ? [rung.coilBlock] : []),
  ]);
}

function addRow(rows: Map<string, MemoryMapRow>, address: string | undefined, label: string | undefined, source: MemoryMapRow['source']) {
  const normalized = normalize(address);
  if (!normalized || isNumericLiteral(normalized)) return;
  if (rows.has(normalized)) return;
  rows.set(normalized, {
    address: normalized,
    label: label || areaTitle(inferArea(normalized)),
    area: inferArea(normalized),
    source,
  });
}

function collectMemoryRows(project: EditorProjectState): MemoryMapRow[] {
  const rows = new Map<string, MemoryMapRow>();

  for (const variable of project.projectVariables ?? []) {
    addRow(rows, variable.address || variable.id, variable.name, 'Tabela');
  }

  for (const block of collectBlocks(project)) {
    addRow(rows, block.variable, block.name, 'Programa');
    addRow(rows, block.sourceA, block.name, 'Programa');
    addRow(rows, block.sourceB, block.name, 'Programa');
    addRow(rows, block.destination, block.name, 'Programa');
    addRow(rows, block.downSource, block.name, 'Programa');
    addRow(rows, block.resetSource, block.name, 'Programa');
  }

  return Array.from(rows.values()).sort((left, right) => left.address.localeCompare(right.address));
}

function areaRows(rows: MemoryMapRow[], area: MemoryArea): MemoryMapRow[] {
  return rows.filter((row) => row.area === area).slice(0, 6);
}

function MemoryAreaCard({ area, rows }: { area: MemoryArea; rows: MemoryMapRow[] }) {
  return (
    <View style={styles.areaCard}>
      <View style={styles.areaHeader}>
        <View style={styles.areaBadge}>
          <Text style={styles.areaBadgeText}>{area}</Text>
        </View>
        <View style={styles.areaCopy}>
          <Text style={styles.areaTitle}>{areaTitle(area)}</Text>
          <Text style={styles.areaDescription}>{areaDescription(area)}</Text>
        </View>
        <Text style={styles.areaCount}>{rows.length}</Text>
      </View>

      <View style={styles.rowStack}>
        {rows.length === 0 ? (
          <Text style={styles.emptyText}>Sem endereços nesta área.</Text>
        ) : rows.map((row) => (
          <View key={row.address} style={styles.addressRow}>
            <Text style={styles.addressText}>{row.address}</Text>
            <Text style={styles.labelText} numberOfLines={1}>{row.label}</Text>
            <Text style={styles.sourceText}>{row.source}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export const PlcMemoryMapCard = memo(function PlcMemoryMapCard({ project }: PlcMemoryMapCardProps) {
  const rows = useMemo(() => collectMemoryRows(project), [project]);
  const areas: MemoryArea[] = ['I', 'Q', 'M', 'T', 'C', 'N'];

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Mapa de memória PLC</Text>
          <Text style={styles.title}>Endereços usados pelo programa</Text>
        </View>
        <View style={styles.countPill}>
          <Text style={styles.countLabel}>Tags</Text>
          <Text style={styles.countValue}>{rows.length}</Text>
        </View>
      </View>

      <View style={styles.areaGrid}>
        {areas.map((area) => (
          <MemoryAreaCard key={area} area={area} rows={areaRows(rows, area)} />
        ))}
      </View>

      <Text style={styles.explanation}>O mapa de memória mostra como o programa usa entradas, saídas, memórias e registradores. Essa visão aproxima o app de ambientes reais de programação de CLP.</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 20,
    padding: spacing.md,
    backgroundColor: colors.surface,
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
    letterSpacing: 0.8,
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
    backgroundColor: colors.cyanSoft,
  },
  countLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  countValue: {
    color: colors.cyan,
    fontSize: 16,
    fontWeight: '900',
  },
  areaGrid: {
    gap: spacing.xs,
  },
  areaCard: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    gap: spacing.xs,
  },
  areaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  areaBadge: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.cyan,
    borderWidth: 1,
    backgroundColor: colors.cyanSoft,
  },
  areaBadgeText: {
    color: colors.cyan,
    fontSize: 13,
    fontWeight: '900',
  },
  areaCopy: {
    flex: 1,
    minWidth: 0,
  },
  areaTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  areaDescription: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    marginTop: 1,
  },
  areaCount: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
  },
  rowStack: {
    gap: 5,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    backgroundColor: colors.surface,
  },
  addressText: {
    flex: 0.7,
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '900',
  },
  labelText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  sourceText: {
    color: colors.cyan,
    fontSize: 9,
    fontWeight: '900',
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
