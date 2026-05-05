import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EditorBlock, EditorProjectState } from '../engine/editorTypes';
import { PlcState } from '../engine/projectTypes';
import { EditorRuntimeState } from '../engine/runtimeTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type PlcEdgePulseMonitorCardProps = {
  project: EditorProjectState;
  state: PlcState;
  runtime: EditorRuntimeState;
};

type EdgePulseItem = {
  id: string;
  rungLabel: string;
  variable: string;
  mode: 'RISING' | 'FALLING';
  previous: boolean;
  current: boolean;
  pulsed: boolean;
};

function normalize(value: string | undefined): string {
  return (value ?? '').trim().toUpperCase();
}

function collectContactBlocks(project: EditorProjectState): Array<{ rungLabel: string; block: EditorBlock }> {
  return project.rungs.flatMap((rung) => [
    ...rung.seriesBlocks.map((block) => ({ rungLabel: rung.label, block })),
    ...rung.parallelBlocks.map((block) => ({ rungLabel: rung.label, block })),
    ...(rung.parallelBranches ?? []).flatMap((branch) => branch.blocks.map((block) => ({ rungLabel: rung.label, block }))),
  ]).filter(({ block }) => block.role === 'contact');
}

function collectEdgePulseItems(project: EditorProjectState, state: PlcState, runtime: EditorRuntimeState): EdgePulseItem[] {
  return collectContactBlocks(project)
    .filter(({ block }) => block.contactMode === 'RISING' || block.contactMode === 'FALLING')
    .map(({ rungLabel, block }) => {
      const variable = normalize(block.variable);
      const current = Boolean(state[variable]);
      const previous = Boolean(runtime.previousContactValues[block.id]);
      const mode = block.contactMode as 'RISING' | 'FALLING';
      const pulsed = mode === 'RISING' ? current && !previous : !current && previous;
      return {
        id: block.id,
        rungLabel,
        variable,
        mode,
        previous,
        current,
        pulsed,
      };
    });
}

function modeLabel(mode: 'RISING' | 'FALLING'): string {
  return mode === 'RISING' ? 'Borda ↑' : 'Borda ↓';
}

function modeDescription(mode: 'RISING' | 'FALLING'): string {
  return mode === 'RISING'
    ? 'Pulsa quando a variável muda de OFF para ON.'
    : 'Pulsa quando a variável muda de ON para OFF.';
}

function boolLabel(value: boolean): string {
  return value ? 'ON' : 'OFF';
}

export const PlcEdgePulseMonitorCard = memo(function PlcEdgePulseMonitorCard({ project, state, runtime }: PlcEdgePulseMonitorCardProps) {
  const items = useMemo(() => collectEdgePulseItems(project, state, runtime), [project, runtime, state]);
  const pulseCount = items.filter((item) => item.pulsed).length;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Monitor de bordas</Text>
          <Text style={styles.title}>Pulsos de um scan</Text>
        </View>
        <View style={[styles.countPill, pulseCount > 0 && styles.countPillOn]}>
          <Text style={styles.countLabel}>Pulsos</Text>
          <Text style={[styles.countValue, pulseCount > 0 && styles.countValueOn]}>{pulseCount}</Text>
        </View>
      </View>

      {items.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum contato de borda foi encontrado no programa atual.</Text>
      ) : (
        <View style={styles.itemStack}>
          {items.map((item) => (
            <View key={item.id} style={[styles.itemCard, item.pulsed && styles.itemCardPulse]}>
              <View style={styles.itemHeader}>
                <View style={styles.itemCopy}>
                  <Text style={[styles.modeText, item.pulsed && styles.modeTextPulse]}>{modeLabel(item.mode)}</Text>
                  <Text style={[styles.variableText, item.pulsed && styles.variableTextPulse]}>{item.variable}</Text>
                  <Text style={styles.rungText} numberOfLines={1}>{item.rungLabel}</Text>
                </View>
                <View style={[styles.pulsePill, item.pulsed && styles.pulsePillOn]}>
                  <Text style={[styles.pulseText, item.pulsed && styles.pulseTextOn]}>{item.pulsed ? 'PULSO' : 'SEM PULSO'}</Text>
                </View>
              </View>

              <View style={styles.stateRow}>
                <View style={styles.stateBox}>
                  <Text style={styles.stateLabel}>Anterior</Text>
                  <Text style={[styles.stateValue, item.previous && styles.stateValueOn]}>{boolLabel(item.previous)}</Text>
                </View>
                <Text style={[styles.arrowText, item.pulsed && styles.arrowTextPulse]}>{item.mode === 'RISING' ? '→ ↑' : '→ ↓'}</Text>
                <View style={styles.stateBox}>
                  <Text style={styles.stateLabel}>Atual</Text>
                  <Text style={[styles.stateValue, item.current && styles.stateValueOn]}>{boolLabel(item.current)}</Text>
                </View>
              </View>

              <Text style={styles.itemDescription}>{modeDescription(item.mode)}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.explanation}>Contatos de borda são verdadeiros apenas no scan em que a transição acontece. Isso é essencial para contadores, pulsos e comandos momentâneos.</Text>
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
    borderColor: colors.amber,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  countPillOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  countLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  countValue: {
    color: colors.amber,
    fontSize: 16,
    fontWeight: '900',
  },
  countValueOn: {
    color: colors.green,
  },
  itemStack: {
    gap: spacing.xs,
  },
  itemCard: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  itemCardPulse: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  itemCopy: {
    flex: 1,
    minWidth: 0,
  },
  modeText: {
    color: colors.amber,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  modeTextPulse: {
    color: colors.green,
  },
  variableText: {
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 2,
  },
  variableTextPulse: {
    color: colors.green,
  },
  rungText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  pulsePill: {
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.surfaceElevated,
  },
  pulsePillOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  pulseText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  pulseTextOn: {
    color: colors.green,
  },
  stateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stateBox: {
    flex: 1,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.surfaceElevated,
  },
  stateLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  stateValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  stateValueOn: {
    color: colors.green,
  },
  arrowText: {
    color: colors.textMuted,
    fontSize: 18,
    fontWeight: '900',
  },
  arrowTextPulse: {
    color: colors.green,
  },
  itemDescription: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
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
