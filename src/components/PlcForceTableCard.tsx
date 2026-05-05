import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EditorBlock, EditorProjectState } from '../engine/editorTypes';
import { PlcState } from '../engine/projectTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type PlcForceTableCardProps = {
  project: EditorProjectState;
  state: PlcState;
};

type ForceCandidateKind = 'input' | 'output' | 'memory';

type ForceCandidate = {
  address: string;
  label: string;
  kind: ForceCandidateKind;
  currentValue: boolean | number | undefined;
  forceStatus: 'available' | 'blocked_output_on' | 'numeric_not_supported';
};

function normalize(value: string | undefined): string {
  return (value ?? '').trim().toUpperCase();
}

function isNumericLiteral(value: string | undefined): boolean {
  if (!value) return false;
  return Number.isFinite(Number(value.trim().replace(',', '.')));
}

function inferKind(address: string): ForceCandidateKind | null {
  const normalized = normalize(address);
  if (normalized.startsWith('I')) return 'input';
  if (normalized.startsWith('Q') || normalized.startsWith('O')) return 'output';
  if (normalized.startsWith('M')) return 'memory';
  return null;
}

function collectBlocks(project: EditorProjectState): EditorBlock[] {
  return project.rungs.flatMap((rung) => [
    ...rung.seriesBlocks,
    ...rung.parallelBlocks,
    ...(rung.parallelBranches ?? []).flatMap((branch) => branch.blocks),
    ...(rung.coilBlock ? [rung.coilBlock] : []),
  ]);
}

function addCandidate(rows: Map<string, ForceCandidate>, address: string | undefined, label: string | undefined, state: PlcState) {
  const normalized = normalize(address);
  if (!normalized || isNumericLiteral(normalized) || rows.has(normalized)) return;
  const kind = inferKind(normalized);
  if (!kind) return;
  const currentValue = state[normalized];
  const numeric = typeof currentValue === 'number';
  const activeOutput = kind === 'output' && Boolean(currentValue);
  rows.set(normalized, {
    address: normalized,
    label: label || (kind === 'input' ? 'Entrada' : kind === 'output' ? 'Saída' : 'Memória'),
    kind,
    currentValue,
    forceStatus: numeric ? 'numeric_not_supported' : activeOutput ? 'blocked_output_on' : 'available',
  });
}

function collectForceCandidates(project: EditorProjectState, state: PlcState): ForceCandidate[] {
  const rows = new Map<string, ForceCandidate>();

  for (const variable of project.projectVariables ?? []) {
    addCandidate(rows, variable.address || variable.id, variable.name, state);
  }

  for (const block of collectBlocks(project)) {
    addCandidate(rows, block.variable, block.name, state);
    addCandidate(rows, block.sourceA, block.name, state);
    addCandidate(rows, block.sourceB, block.name, state);
    addCandidate(rows, block.destination, block.name, state);
    addCandidate(rows, block.downSource, block.name, state);
    addCandidate(rows, block.resetSource, block.name, state);
  }

  return Array.from(rows.values()).sort((left, right) => left.address.localeCompare(right.address)).slice(0, 10);
}

function kindLabel(kind: ForceCandidateKind): string {
  if (kind === 'input') return 'Entrada';
  if (kind === 'output') return 'Saída';
  return 'Memória';
}

function statusLabel(status: ForceCandidate['forceStatus']): string {
  if (status === 'blocked_output_on') return 'Cuidado';
  if (status === 'numeric_not_supported') return 'Numérico';
  return 'Pronto';
}

function valueLabel(value: boolean | number | undefined): string {
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'ON' : 'OFF';
  return '—';
}

function isActive(value: boolean | number | undefined): boolean {
  if (typeof value === 'number') return value !== 0;
  return Boolean(value);
}

export const PlcForceTableCard = memo(function PlcForceTableCard({ project, state }: PlcForceTableCardProps) {
  const candidates = useMemo(() => collectForceCandidates(project, state), [project, state]);
  const blockedCount = candidates.filter((candidate) => candidate.forceStatus !== 'available').length;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Force Table</Text>
          <Text style={styles.title}>Forçamento seguro de sinais</Text>
        </View>
        <View style={[styles.statusPill, blockedCount > 0 && styles.statusPillWarn]}>
          <Text style={[styles.statusText, blockedCount > 0 && styles.statusTextWarn]}>{blockedCount > 0 ? 'Atenção' : 'Seguro'}</Text>
        </View>
      </View>

      <View style={styles.warningBox}>
        <Text style={styles.warningTitle}>Modo didático</Text>
        <Text style={styles.warningText}>Forçar sinais pode mascarar falhas de campo. Em bancada real, use somente com supervisão e remova todos os forces ao finalizar o teste.</Text>
      </View>

      <View style={styles.rowStack}>
        {candidates.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum sinal I/Q/M encontrado para preparar forçamento.</Text>
        ) : candidates.map((candidate) => {
          const active = isActive(candidate.currentValue);
          const warn = candidate.forceStatus !== 'available';
          return (
            <View key={candidate.address} style={[styles.forceRow, active && styles.forceRowActive, warn && styles.forceRowWarn]}>
              <View style={styles.signalCopy}>
                <Text style={[styles.signalAddress, active && styles.signalAddressActive]}>{candidate.address}</Text>
                <Text style={styles.signalLabel} numberOfLines={1}>{candidate.label} • {kindLabel(candidate.kind)}</Text>
              </View>
              <View style={styles.valueBox}>
                <Text style={styles.valueLabel}>Atual</Text>
                <Text style={[styles.valueText, active && styles.valueTextActive]}>{valueLabel(candidate.currentValue)}</Text>
              </View>
              <View style={[styles.forceBadge, warn && styles.forceBadgeWarn]}>
                <Text style={[styles.forceBadgeText, warn && styles.forceBadgeTextWarn]}>{statusLabel(candidate.forceStatus)}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <Text style={styles.explanation}>Nesta etapa o app prepara a visualização de forces. O próximo passo pode ser implementar forces reais com botão Aplicar/Remover e bloqueio de segurança.</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderColor: colors.red,
    borderWidth: 1,
    borderRadius: 20,
    padding: spacing.md,
    backgroundColor: colors.redSoft,
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
    color: colors.red,
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
  statusPill: {
    borderColor: colors.green,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    backgroundColor: colors.greenSoft,
  },
  statusPillWarn: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
  },
  statusText: {
    color: colors.green,
    fontSize: 10,
    fontWeight: '900',
  },
  statusTextWarn: {
    color: colors.amber,
  },
  warningBox: {
    borderColor: colors.red,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    gap: 3,
  },
  warningTitle: {
    color: colors.red,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  warningText: {
    color: colors.text,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  rowStack: {
    gap: spacing.xs,
  },
  forceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  forceRowActive: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  forceRowWarn: {
    borderColor: colors.amber,
  },
  signalCopy: {
    flex: 1,
    minWidth: 0,
  },
  signalAddress: {
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '900',
  },
  signalAddressActive: {
    color: colors.green,
  },
  signalLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  valueBox: {
    minWidth: 54,
    alignItems: 'center',
  },
  valueLabel: {
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  valueText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 1,
  },
  valueTextActive: {
    color: colors.green,
  },
  forceBadge: {
    borderColor: colors.green,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.greenSoft,
  },
  forceBadgeWarn: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
  },
  forceBadgeText: {
    color: colors.green,
    fontSize: 9,
    fontWeight: '900',
  },
  forceBadgeTextWarn: {
    color: colors.amber,
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
