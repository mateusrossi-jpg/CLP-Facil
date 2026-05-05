import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EditorBlock, EditorProjectState } from '../engine/editorTypes';
import { EditorRuntimeState, getCounterRuntime, getTimerRuntime } from '../engine/runtimeTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type PlcTimerCounterMonitorCardProps = {
  project: EditorProjectState;
  runtime: EditorRuntimeState;
};

type TimerCounterItem = {
  id: string;
  rungLabel: string;
  variable: string;
  kind: 'timer' | 'counter';
  mode: string;
  preset: number;
  accumulated: number;
  done: boolean;
  enabled: boolean;
};

function isTimerBlock(block: EditorBlock): boolean {
  return block.role === 'timer' || Boolean(block.timerMode);
}

function isCounterBlock(block: EditorBlock): boolean {
  return block.role === 'counter' || Boolean(block.counterMode);
}

function collectTimerCounterItems(project: EditorProjectState, runtime: EditorRuntimeState): TimerCounterItem[] {
  const items: TimerCounterItem[] = [];

  for (const rung of project.rungs) {
    const block = rung.coilBlock;
    if (!block) continue;

    const energized = Boolean(runtime.previousRungPower[rung.id]);

    if (isTimerBlock(block)) {
      const timer = getTimerRuntime(runtime, block.id);
      items.push({
        id: block.id,
        rungLabel: rung.label,
        variable: (block.variable || block.name || block.id).trim().toUpperCase(),
        kind: 'timer',
        mode: block.timerMode ?? 'TON',
        preset: block.presetMs ?? 0,
        accumulated: timer.elapsedMs,
        done: timer.q,
        enabled: energized,
      });
      continue;
    }

    if (isCounterBlock(block)) {
      const counter = getCounterRuntime(runtime, block.id);
      items.push({
        id: block.id,
        rungLabel: rung.label,
        variable: (block.variable || block.name || block.id).trim().toUpperCase(),
        kind: 'counter',
        mode: block.counterMode ?? 'CTU',
        preset: block.preset ?? 0,
        accumulated: counter.currentValue,
        done: counter.q,
        enabled: energized,
      });
    }
  }

  return items;
}

function progressFor(item: TimerCounterItem): number {
  if (item.preset <= 0) return item.done ? 100 : 0;
  return Math.min(100, Math.max(0, Math.round((item.accumulated / item.preset) * 100)));
}

function formatValue(item: TimerCounterItem, value: number): string {
  if (item.kind === 'timer') return `${value} ms`;
  return String(value);
}

export const PlcTimerCounterMonitorCard = memo(function PlcTimerCounterMonitorCard({ project, runtime }: PlcTimerCounterMonitorCardProps) {
  const items = useMemo(() => collectTimerCounterItems(project, runtime), [project, runtime]);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Monitor T/C</Text>
          <Text style={styles.title}>Timers e contadores do scan</Text>
        </View>
        <View style={styles.countPill}>
          <Text style={styles.countLabel}>Itens</Text>
          <Text style={styles.countValue}>{items.length}</Text>
        </View>
      </View>

      {items.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum timer ou contador foi encontrado no programa atual.</Text>
      ) : (
        <View style={styles.itemStack}>
          {items.map((item) => {
            const progress = progressFor(item);
            return (
              <View key={item.id} style={[styles.itemCard, item.enabled && styles.itemCardEnabled, item.done && styles.itemCardDone]}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemCopy}>
                    <Text style={[styles.itemMode, item.done && styles.itemModeDone]}>{item.mode} • {item.kind === 'timer' ? 'Timer' : 'Contador'}</Text>
                    <Text style={[styles.itemVariable, item.done && styles.itemVariableDone]}>{item.variable}</Text>
                    <Text style={styles.itemRung} numberOfLines={1}>{item.rungLabel}</Text>
                  </View>
                  <View style={[styles.donePill, item.done && styles.donePillOn]}>
                    <Text style={[styles.doneText, item.done && styles.doneTextOn]}>{item.done ? 'DN/Q' : item.enabled ? 'EN' : 'OFF'}</Text>
                  </View>
                </View>

                <View style={styles.valueRow}>
                  <View style={styles.valueBox}>
                    <Text style={styles.valueLabel}>PRE</Text>
                    <Text style={styles.valueText}>{formatValue(item, item.preset)}</Text>
                  </View>
                  <View style={styles.valueBox}>
                    <Text style={styles.valueLabel}>ACC</Text>
                    <Text style={[styles.valueText, item.done && styles.valueTextDone]}>{formatValue(item, item.accumulated)}</Text>
                  </View>
                </View>

                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progress}%` }, item.done && styles.progressFillDone]} />
                </View>
              </View>
            );
          })}
        </View>
      )}

      <Text style={styles.explanation}>PRE é o valor programado. ACC é o acumulado atual. DN/Q indica que o timer ou contador atingiu a condição de saída.</Text>
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
    fontSize: 16,
    fontWeight: '900',
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
  itemCardEnabled: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  itemCardDone: {
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
  itemMode: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  itemModeDone: {
    color: colors.green,
  },
  itemVariable: {
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 2,
  },
  itemVariableDone: {
    color: colors.green,
  },
  itemRung: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  donePill: {
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.surfaceElevated,
  },
  donePillOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  doneText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  doneTextOn: {
    color: colors.green,
  },
  valueRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  valueBox: {
    flex: 1,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.surfaceElevated,
  },
  valueLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  valueText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  valueTextDone: {
    color: colors.green,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    borderColor: colors.border,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.cyan,
  },
  progressFillDone: {
    backgroundColor: colors.green,
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
