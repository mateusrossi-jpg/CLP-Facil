import { memo, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EditorBlock, EditorProjectState } from '../engine/editorTypes';
import { PlcForceEntry, applyPlcForces, clearPlcForce, upsertPlcForce } from '../engine/plcForceTable';
import { PlcState } from '../engine/projectTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type PlcForceTableCardProps = {
  project: EditorProjectState;
  state: PlcState;
  onSetValue?: (variable: string, value: boolean | number) => void;
};

type ForceCandidateKind = 'input' | 'output' | 'memory';

type ForceCandidate = {
  address: string;
  label: string;
  kind: ForceCandidateKind;
  currentValue: boolean | number | undefined;
  forceStatus: 'available' | 'blocked_output_on' | 'numeric_not_supported';
};

type OriginalForceValues = Record<string, boolean | number | undefined>;

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

function forceFor(address: string, entries: PlcForceEntry[]): PlcForceEntry | undefined {
  const normalized = normalize(address);
  return entries.find((entry) => normalize(entry.address) === normalized);
}

function restoreValue(value: boolean | number | undefined): boolean | number {
  if (typeof value === 'number') return value;
  return Boolean(value);
}

export const PlcForceTableCard = memo(function PlcForceTableCard({ project, state, onSetValue }: PlcForceTableCardProps) {
  const [forceEntries, setForceEntries] = useState<PlcForceEntry[]>([]);
  const [originalValues, setOriginalValues] = useState<OriginalForceValues>({});
  const [lastMessage, setLastMessage] = useState('Nenhum force aplicado nesta sessão.');
  const candidates = useMemo(() => collectForceCandidates(project, state), [project, state]);
  const preview = useMemo(() => applyPlcForces(state, forceEntries), [forceEntries, state]);
  const blockedCount = candidates.filter((candidate) => candidate.forceStatus !== 'available').length + preview.blockedForces.length;

  const applyForce = (candidate: ForceCandidate, mode: PlcForceEntry['mode']) => {
    const nextEntries = upsertPlcForce(forceEntries, { address: candidate.address, mode, enabled: true, reason: 'Aplicado pela Force Table didática.' });
    const result = applyPlcForces(state, nextEntries);
    const applied = result.appliedForces.find((entry) => normalize(entry.address) === candidate.address);
    const blocked = result.blockedForces.find((entry) => normalize(entry.address) === candidate.address);

    if (blocked || !applied) {
      const diagnostic = result.diagnostics.find((item) => normalize(item.address) === candidate.address);
      setLastMessage(diagnostic?.message ?? `${candidate.address} bloqueado pela política de force.`);
      setForceEntries(nextEntries);
      return;
    }

    setOriginalValues((current) => {
      if (Object.prototype.hasOwnProperty.call(current, candidate.address)) return current;
      return { ...current, [candidate.address]: candidate.currentValue };
    });
    setForceEntries(nextEntries);
    onSetValue?.(candidate.address, mode === 'force_on');
    setLastMessage(`${candidate.address} forçado para ${mode === 'force_on' ? 'ON' : 'OFF'}.`);
  };

  const clearForce = (candidate: ForceCandidate) => {
    const restored = restoreValue(originalValues[candidate.address]);
    setForceEntries((current) => clearPlcForce(current, candidate.address));
    setOriginalValues((current) => {
      const { [candidate.address]: _removed, ...next } = current;
      return next;
    });
    onSetValue?.(candidate.address, restored);
    setLastMessage(`Force de ${candidate.address} removido. Valor restaurado para ${valueLabel(restored)}.`);
  };

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

      <View style={styles.messageBox}>
        <Text style={styles.messageText}>{onSetValue ? lastMessage : 'Controles prontos. Esta tela precisa receber onSetValue para aplicar forces no estado da simulação.'}</Text>
      </View>

      <View style={styles.rowStack}>
        {candidates.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum sinal I/Q/M encontrado para preparar forçamento.</Text>
        ) : candidates.map((candidate) => {
          const active = isActive(candidate.currentValue);
          const warn = candidate.forceStatus !== 'available';
          const activeForce = forceFor(candidate.address, forceEntries);
          const blocked = preview.blockedForces.some((entry) => normalize(entry.address) === candidate.address);
          return (
            <View key={candidate.address} style={[styles.forceRow, active && styles.forceRowActive, (warn || blocked) && styles.forceRowWarn]}>
              <View style={styles.signalCopy}>
                <Text style={[styles.signalAddress, active && styles.signalAddressActive]}>{candidate.address}</Text>
                <Text style={styles.signalLabel} numberOfLines={1}>{candidate.label} • {kindLabel(candidate.kind)}</Text>
                {activeForce ? <Text style={styles.forceSessionText}>Sessão: {activeForce.mode === 'force_on' ? 'FORCE ON' : 'FORCE OFF'}</Text> : null}
              </View>
              <View style={styles.valueBox}>
                <Text style={styles.valueLabel}>Atual</Text>
                <Text style={[styles.valueText, active && styles.valueTextActive]}>{valueLabel(candidate.currentValue)}</Text>
              </View>
              <View style={[styles.forceBadge, (warn || blocked) && styles.forceBadgeWarn]}>
                <Text style={[styles.forceBadgeText, (warn || blocked) && styles.forceBadgeTextWarn]}>{blocked ? 'Bloqueado' : statusLabel(candidate.forceStatus)}</Text>
              </View>
              <View style={styles.buttonColumn}>
                <Pressable onPress={() => applyForce(candidate, 'force_on')} style={[styles.forceButton, styles.forceOnButton]}>
                  <Text style={styles.forceOnText}>ON</Text>
                </Pressable>
                <Pressable onPress={() => applyForce(candidate, 'force_off')} style={[styles.forceButton, styles.forceOffButton]}>
                  <Text style={styles.forceOffText}>OFF</Text>
                </Pressable>
                <Pressable onPress={() => clearForce(candidate)} style={styles.clearButton}>
                  <Text style={styles.clearText}>Limpar</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>

      <Text style={styles.explanation}>A política padrão permite force em entradas e memórias, bloqueia saídas por segurança e registra forces bloqueados para o aluno entender o risco.</Text>
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
  messageBox: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  messageText: {
    color: colors.text,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800',
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
  forceSessionText: {
    color: colors.red,
    fontSize: 9,
    fontWeight: '900',
    marginTop: 2,
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
  buttonColumn: {
    gap: 3,
  },
  forceButton: {
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    alignItems: 'center',
  },
  forceOnButton: {
    borderColor: colors.green,
    borderWidth: 1,
    backgroundColor: colors.greenSoft,
  },
  forceOffButton: {
    borderColor: colors.red,
    borderWidth: 1,
    backgroundColor: colors.redSoft,
  },
  forceOnText: {
    color: colors.green,
    fontSize: 9,
    fontWeight: '900',
  },
  forceOffText: {
    color: colors.red,
    fontSize: 9,
    fontWeight: '900',
  },
  clearButton: {
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  clearText: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
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
