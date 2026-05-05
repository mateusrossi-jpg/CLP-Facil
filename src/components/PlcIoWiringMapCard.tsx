import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EditorBlock, EditorProjectState } from '../engine/editorTypes';
import { PlcState } from '../engine/projectTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type PlcIoWiringMapCardProps = {
  project: EditorProjectState;
  state: PlcState;
};

type IoKind = 'input' | 'output';

type IoPoint = {
  address: string;
  label: string;
  kind: IoKind;
  active: boolean;
  source: 'Tabela' | 'Programa';
};

function normalize(value: string | undefined): string {
  return (value ?? '').trim().toUpperCase();
}

function isNumericLiteral(value: string | undefined): boolean {
  if (!value) return false;
  return Number.isFinite(Number(value.trim().replace(',', '.')));
}

function isActive(value: boolean | number | undefined): boolean {
  if (typeof value === 'number') return value !== 0;
  return Boolean(value);
}

function ioKind(address: string): IoKind | null {
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

function addPoint(points: Map<string, IoPoint>, address: string | undefined, label: string | undefined, state: PlcState, source: IoPoint['source']) {
  const normalized = normalize(address);
  if (!normalized || isNumericLiteral(normalized) || points.has(normalized)) return;
  const kind = ioKind(normalized);
  if (!kind) return;
  points.set(normalized, {
    address: normalized,
    label: label || (kind === 'input' ? 'Entrada de campo' : 'Saída de campo'),
    kind,
    active: isActive(state[normalized]),
    source,
  });
}

function collectIoPoints(project: EditorProjectState, state: PlcState): IoPoint[] {
  const points = new Map<string, IoPoint>();

  for (const variable of project.projectVariables ?? []) {
    addPoint(points, variable.address || variable.id, variable.name, state, 'Tabela');
  }

  for (const block of collectBlocks(project)) {
    addPoint(points, block.variable, block.name, state, 'Programa');
    addPoint(points, block.sourceA, block.name, state, 'Programa');
    addPoint(points, block.sourceB, block.name, state, 'Programa');
    addPoint(points, block.destination, block.name, state, 'Programa');
    addPoint(points, block.downSource, block.name, state, 'Programa');
    addPoint(points, block.resetSource, block.name, state, 'Programa');
  }

  return Array.from(points.values()).sort((left, right) => left.address.localeCompare(right.address));
}

function fieldDeviceLabel(point: IoPoint): string {
  const text = `${point.address} ${point.label}`.toLowerCase();
  if (point.kind === 'input') {
    if (text.includes('stop') || text.includes('parada') || text.includes('emerg')) return 'Botoeira NF / Emergência';
    if (text.includes('start') || text.includes('liga') || text.includes('partida') || text.includes('abrir') || text.includes('fechar')) return 'Botoeira NA';
    if (text.includes('fim') || text.includes('curso')) return 'Fim de curso / sensor de posição';
    if (text.includes('sensor') || text.includes('peça') || text.includes('peca') || text.includes('nivel') || text.includes('nível')) return 'Sensor digital';
    if (text.includes('chave') || text.includes('seletor')) return 'Chave seletora';
    return 'Entrada digital';
  }
  if (text.includes('motor') || text.includes('contator') || text.includes('km') || text.includes('k1') || text.includes('k2')) return 'Contator / comando de motor';
  if (text.includes('lamp') || text.includes('luz') || text.includes('led') || text.includes('verde') || text.includes('amarelo') || text.includes('vermelho')) return 'Sinalizador / lâmpada';
  if (text.includes('valv') || text.includes('solenoide')) return 'Válvula solenoide';
  if (text.includes('sirene') || text.includes('alarme')) return 'Sirene / alarme';
  return 'Relé / saída digital';
}

function testHint(point: IoPoint): string {
  const text = `${point.address} ${point.label}`.toLowerCase();
  if (point.kind === 'input') {
    if (text.includes('stop') || text.includes('parada') || text.includes('emerg')) return 'Acione Stop e confirme que toda saída segura desliga no scan seguinte.';
    if (text.includes('sensor') || text.includes('peça') || text.includes('peca') || text.includes('fim') || text.includes('curso')) return 'Simule a mudança do sensor e observe o rung, timer ou contador associado.';
    return point.active ? 'Entrada acionada: observe se o rung conduz.' : 'Acione esta entrada e execute um scan.';
  }
  if (text.includes('motor') || text.includes('contator') || text.includes('km')) return point.active ? 'Contator ligado: teste Stop e intertravamentos antes de considerar seguro.' : 'Contator desligado: confirme se falta partida, permissivo ou selo.';
  if (text.includes('lamp') || text.includes('luz') || text.includes('led')) return point.active ? 'Sinalizador ligado: confirme se a condição indicada é a esperada.' : 'Sinalizador desligado: verifique a condição do rung correspondente.';
  return point.active ? 'Saída ligada: confirme se o intertravamento desliga.' : 'Saída desligada: confirme condição de acionamento.';
}

function PointRow({ point }: { point: IoPoint }) {
  return (
    <View style={[styles.pointRow, point.active && styles.pointRowActive]}>
      <View style={styles.pointMain}>
        <View style={styles.pointHeader}>
          <Text style={[styles.addressText, point.active && styles.addressTextActive]}>{point.address}</Text>
          <Text style={styles.sourceText}>{point.source}</Text>
        </View>
        <Text style={styles.labelText} numberOfLines={1}>{point.label}</Text>
        <Text style={styles.deviceText}>{fieldDeviceLabel(point)}</Text>
        <Text style={styles.hintText}>{testHint(point)}</Text>
      </View>
      <View style={[styles.statePill, point.active && styles.statePillActive]}>
        <Text style={[styles.stateText, point.active && styles.stateTextActive]}>{point.active ? 'ON' : 'OFF'}</Text>
      </View>
    </View>
  );
}

export const PlcIoWiringMapCard = memo(function PlcIoWiringMapCard({ project, state }: PlcIoWiringMapCardProps) {
  const points = useMemo(() => collectIoPoints(project, state), [project, state]);
  const inputs = points.filter((point) => point.kind === 'input').slice(0, 8);
  const outputs = points.filter((point) => point.kind === 'output').slice(0, 8);
  const missingIo = inputs.length === 0 || outputs.length === 0;

  return (
    <View style={[styles.card, missingIo && styles.cardAttention]}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Mapa de ligação I/O</Text>
          <Text style={styles.title}>Entradas e saídas da bancada virtual</Text>
        </View>
        <View style={[styles.countPill, missingIo && styles.countPillAttention]}>
          <Text style={styles.countLabel}>I/O</Text>
          <Text style={[styles.countValue, missingIo && styles.countValueAttention]}>{inputs.length}/{outputs.length}</Text>
        </View>
      </View>

      <View style={styles.groupCard}>
        <Text style={styles.groupTitle}>Entradas de campo</Text>
        {inputs.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma entrada I encontrada. Adicione contato de entrada para simular botoeira ou sensor.</Text>
        ) : inputs.map((point) => <PointRow key={point.address} point={point} />)}
      </View>

      <View style={styles.groupCard}>
        <Text style={styles.groupTitle}>Saídas / atuadores</Text>
        {outputs.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma saída Q/O encontrada. Adicione bobina de saída para observar atuação.</Text>
        ) : outputs.map((point) => <PointRow key={point.address} point={point} />)}
      </View>

      <Text style={styles.explanation}>Este mapa ajuda o aluno a ligar lógica Ladder com campo: botoeiras, sensores, relés, lâmpadas e contatores da bancada.</Text>
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
  cardAttention: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
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
  countPillAttention: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
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
  countValueAttention: {
    color: colors.amber,
  },
  groupCard: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  groupTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.sm,
    backgroundColor: colors.surfaceElevated,
  },
  pointRowActive: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  pointMain: {
    flex: 1,
    minWidth: 0,
  },
  pointHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
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
  sourceText: {
    color: colors.cyan,
    fontSize: 9,
    fontWeight: '900',
  },
  labelText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  deviceText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 2,
  },
  hintText: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  statePill: {
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    backgroundColor: colors.surface,
  },
  statePillActive: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  stateText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  stateTextActive: {
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
