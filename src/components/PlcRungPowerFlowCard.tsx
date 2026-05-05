import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { traceEditorScan, EditorContactTrace } from '../engine/editorScanTrace';
import { EditorProjectState } from '../engine/editorTypes';
import { PlcState } from '../engine/projectTypes';
import { EditorRuntimeState } from '../engine/runtimeTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type PlcRungPowerFlowCardProps = {
  project: EditorProjectState;
  state: PlcState;
  runtime?: EditorRuntimeState;
  focusedRungId?: string | null;
};

function ContactChip({ contact }: { contact: EditorContactTrace }) {
  return (
    <View style={[styles.contactChip, contact.energized && styles.contactChipOn]}>
      <Text style={[styles.contactMode, contact.energized && styles.contactModeOn]}>{contact.mode}</Text>
      <Text style={[styles.contactVariable, contact.energized && styles.contactVariableOn]}>{contact.variable}</Text>
      <Text style={[styles.contactState, contact.energized && styles.contactStateOn]}>{contact.energized ? 'TRUE' : 'FALSE'}</Text>
    </View>
  );
}

function ContactConnector({ active }: { active: boolean }) {
  return <View style={[styles.connector, active && styles.connectorOn]} />;
}

export const PlcRungPowerFlowCard = memo(function PlcRungPowerFlowCard({
  project,
  state,
  runtime,
  focusedRungId,
}: PlcRungPowerFlowCardProps) {
  const trace = useMemo(() => traceEditorScan(project, state, runtime), [project, runtime, state]);
  const focused = useMemo(() => {
    if (focusedRungId) {
      const byFocus = trace.rungs.find((rung) => rung.rungId === focusedRungId);
      if (byFocus) return byFocus;
    }
    return trace.rungs.find((rung) => rung.energized) ?? trace.rungs[0];
  }, [focusedRungId, trace.rungs]);

  if (!focused) {
    return (
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Fluxo de energia do rung</Text>
        <Text style={styles.emptyText}>Nenhuma linha ladder disponível para acompanhar.</Text>
      </View>
    );
  }

  const hasParallel = focused.branchTraces.length > 0;

  return (
    <View style={[styles.card, focused.energized && styles.cardOn]}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Fluxo de energia do rung</Text>
          <Text style={[styles.title, focused.energized && styles.titleOn]}>{focused.label}</Text>
        </View>
        <View style={[styles.powerPill, focused.energized && styles.powerPillOn]}>
          <Text style={[styles.powerPillText, focused.energized && styles.powerPillTextOn]}>{focused.energized ? 'ENERGIZADO' : 'ABERTO'}</Text>
        </View>
      </View>

      <View style={styles.pathBox}>
        <View style={styles.railStart}>
          <Text style={styles.railText}>L</Text>
        </View>
        <View style={styles.seriesPath}>
          {focused.seriesContacts.length === 0 ? (
            <Text style={styles.emptyText}>Sem contatos em série nesta linha.</Text>
          ) : focused.seriesContacts.map((contact, index) => (
            <View key={contact.blockId} style={styles.contactGroup}>
              <ContactChip contact={contact} />
              {index < focused.seriesContacts.length - 1 ? <ContactConnector active={focused.energized || contact.energized} /> : null}
            </View>
          ))}
        </View>
        <View style={[styles.outputCoil, focused.energized && styles.outputCoilOn]}>
          <Text style={styles.outputCoilLabel}>Bobina</Text>
          <Text style={[styles.outputCoilValue, focused.energized && styles.outputCoilValueOn]}>{focused.outputVariable ?? '—'}</Text>
        </View>
      </View>

      {hasParallel ? (
        <View style={styles.branchBox}>
          <Text style={styles.branchTitle}>Branches paralelos / OR</Text>
          {focused.branchTraces.map((branch) => (
            <View key={branch.branchId} style={[styles.branchRow, branch.energized && styles.branchRowOn]}>
              <View style={[styles.branchBadge, branch.energized && styles.branchBadgeOn]}>
                <Text style={[styles.branchBadgeText, branch.energized && styles.branchBadgeTextOn]}>OR</Text>
              </View>
              <View style={styles.branchCopy}>
                <Text style={[styles.branchName, branch.energized && styles.branchNameOn]} numberOfLines={1}>{branch.branchId}</Text>
                <Text style={styles.branchRange}>ponte {branch.seriesIndex} → {branch.endIndex}</Text>
              </View>
              <Text style={[styles.branchState, branch.energized && styles.branchStateOn]}>{branch.energized ? 'FECHOU' : 'ABERTO'}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <Text style={styles.explanation}>
        {focused.energized
          ? 'O caminho lógico chegou até a bobina neste scan. Em verde estão os contatos/branches que permitiram a continuidade.'
          : 'A linha não fechou neste scan. Procure contatos FALSE em série ou branches paralelos abertos.'}
      </Text>
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
  cardOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  titleOn: {
    color: colors.green,
  },
  powerPill: {
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    backgroundColor: colors.surfaceElevated,
  },
  powerPillOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  powerPillText: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
  },
  powerPillTextOn: {
    color: colors.green,
  },
  pathBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.sm,
    backgroundColor: colors.codeBackground,
  },
  railStart: {
    width: 28,
    height: 54,
    borderLeftColor: colors.cyan,
    borderLeftWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  railText: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: '900',
  },
  seriesPath: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
  },
  contactGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  contactChip: {
    minWidth: 86,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: colors.surfaceElevated,
  },
  contactChipOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  contactMode: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  contactModeOn: {
    color: colors.green,
  },
  contactVariable: {
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  contactVariableOn: {
    color: colors.green,
  },
  contactState: {
    color: colors.textDim,
    fontSize: 9,
    fontWeight: '900',
    marginTop: 1,
  },
  contactStateOn: {
    color: colors.green,
  },
  connector: {
    width: 22,
    height: 3,
    borderRadius: 999,
    backgroundColor: colors.borderStrong,
  },
  connectorOn: {
    backgroundColor: colors.green,
  },
  outputCoil: {
    minWidth: 76,
    borderColor: colors.amber,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.sm,
    backgroundColor: colors.amberSoft,
    alignItems: 'center',
  },
  outputCoilOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  outputCoilLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  outputCoilValue: {
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  outputCoilValueOn: {
    color: colors.green,
  },
  branchBox: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    gap: spacing.xs,
  },
  branchTitle: {
    color: colors.amber,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  branchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  branchRowOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  branchBadge: {
    width: 34,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.borderStrong,
    borderWidth: 1,
    backgroundColor: colors.surfaceElevated,
  },
  branchBadgeOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  branchBadgeText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  branchBadgeTextOn: {
    color: colors.green,
  },
  branchCopy: {
    flex: 1,
    minWidth: 0,
  },
  branchName: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
  },
  branchNameOn: {
    color: colors.green,
  },
  branchRange: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  branchState: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  branchStateOn: {
    color: colors.green,
  },
  explanation: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
});
