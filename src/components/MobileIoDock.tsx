import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EditorBlock, EditorProjectState } from '../engine/editorTypes';
import { PlcState } from '../engine/projectTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type MobileIoDockProps = {
  editorProject: EditorProjectState;
  plcState: PlcState;
  onSetValue?: (variable: string, value: boolean | number) => void;
};

type MobileIoKind = 'input' | 'output';

type MobileIoPoint = {
  id: string;
  address: string;
  name: string;
  kind: MobileIoKind;
  value: boolean | number | undefined;
};

function normalize(value: string | undefined): string {
  return (value ?? '').trim().toUpperCase();
}

function isNumericLiteral(value: string | undefined): boolean {
  if (!value) return false;
  return Number.isFinite(Number(value.trim().replace(',', '.')));
}

function ioKind(address: string): MobileIoKind | null {
  const normalized = normalize(address);
  if (normalized.startsWith('I')) return 'input';
  if (normalized.startsWith('Q') || normalized.startsWith('O')) return 'output';
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

function addPoint(points: Map<string, MobileIoPoint>, address: string | undefined, name: string | undefined, state: PlcState) {
  const normalized = normalize(address);
  if (!normalized || isNumericLiteral(normalized) || points.has(normalized)) return;
  const kind = ioKind(normalized);
  if (!kind) return;
  points.set(normalized, {
    id: normalized,
    address: normalized,
    name: name || (kind === 'input' ? 'Entrada' : 'Saida'),
    kind,
    value: state[normalized],
  });
}

function collectIoPoints(project: EditorProjectState, state: PlcState): MobileIoPoint[] {
  const points = new Map<string, MobileIoPoint>();

  for (const variable of project.projectVariables ?? []) {
    addPoint(points, variable.address || variable.id, variable.name, state);
  }

  for (const block of collectBlocks(project)) {
    addPoint(points, block.variable, block.name, state);
    addPoint(points, block.sourceA, block.name, state);
    addPoint(points, block.sourceB, block.name, state);
    addPoint(points, block.destination, block.name, state);
    addPoint(points, block.downSource, block.name, state);
    addPoint(points, block.resetSource, block.name, state);
  }

  return Array.from(points.values()).sort((left, right) => left.address.localeCompare(right.address));
}

function isActive(value: boolean | number | undefined): boolean {
  if (typeof value === 'number') return value !== 0;
  return Boolean(value);
}

function valueLabel(value: boolean | number | undefined): string {
  if (typeof value === 'number') return String(value);
  return isActive(value) ? 'ON' : 'OFF';
}

export const MobileIoDock = memo(function MobileIoDock({ editorProject, plcState, onSetValue }: MobileIoDockProps) {
  const points = useMemo(() => collectIoPoints(editorProject, plcState), [editorProject, plcState]);
  const inputs = points.filter((point) => point.kind === 'input').slice(0, 6);
  const outputs = points.filter((point) => point.kind === 'output').slice(0, 6);

  return (
    <View style={styles.card}>
      <View style={styles.group}>
        <Text style={styles.groupTitle}>Entradas</Text>
        <View style={styles.inputGrid}>
          {inputs.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma entrada I encontrada.</Text>
          ) : inputs.map((input) => {
            const active = isActive(input.value);
            const editable = typeof input.value !== 'number';
            return (
              <Pressable
                key={input.id}
                disabled={!editable}
                onPress={() => onSetValue?.(input.address, !active)}
                style={({ pressed }) => [styles.inputButton, active && styles.inputButtonOn, !editable && styles.disabled, pressed && editable && styles.pressed]}
              >
                <Text style={[styles.address, active && styles.addressOn]}>{input.address}</Text>
                <Text style={styles.name} numberOfLines={1}>{input.name}</Text>
                <Text style={[styles.state, active && styles.stateOn]}>{valueLabel(input.value)}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.group}>
        <Text style={styles.groupTitle}>Saidas</Text>
        <View style={styles.outputList}>
          {outputs.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma saida Q/O encontrada.</Text>
          ) : outputs.map((output) => {
            const active = isActive(output.value);
            return (
              <View key={output.id} style={[styles.outputRow, active && styles.outputRowOn]}>
                <View style={[styles.lamp, active && styles.lampOn]} />
                <View style={styles.outputCopy}>
                  <Text style={[styles.address, active && styles.addressOn]}>{output.address}</Text>
                  <Text style={styles.name} numberOfLines={1}>{output.name}</Text>
                </View>
                <Text style={[styles.state, active && styles.stateOn]}>{valueLabel(output.value)}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  group: {
    gap: spacing.xs,
  },
  groupTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  inputGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  inputButton: {
    flexGrow: 1,
    flexBasis: 104,
    minHeight: 70,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.sm,
    justifyContent: 'center',
  },
  inputButtonOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  outputList: {
    gap: spacing.xs,
  },
  outputRow: {
    minHeight: 52,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  outputRowOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  outputCopy: {
    flex: 1,
    minWidth: 0,
  },
  lamp: {
    width: 14,
    height: 14,
    borderRadius: 999,
    borderColor: colors.textDim,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
  lampOn: {
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
    marginTop: 2,
  },
  state: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 4,
  },
  stateOn: {
    color: colors.green,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.72,
  },
});
