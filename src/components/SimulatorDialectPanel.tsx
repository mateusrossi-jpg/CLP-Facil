import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EditorProjectState } from '../engine/editorTypes';
import { createPlcProfileProjectView, PlcProfileBlockView, PlcProfileId, plcProfiles } from '../plcProfiles/plcProfiles';
import { colors } from '../theme/colors';
import { codeContrast } from '../theme/codeContrast';
import { spacing } from '../theme/spacing';

type SimulatorDialectPanelProps = {
  editorProject: EditorProjectState;
  selectedProfile: PlcProfileId;
  onSelectProfile: (profile: PlcProfileId) => void;
  compact?: boolean;
};

function instructionIcon(profileId: PlcProfileId, block: PlcProfileBlockView) {
  const instruction = block.instruction.toUpperCase();

  if (profileId === 'rockwell_like') {
    if (instruction.includes('XIC')) return 'XIC';
    if (instruction.includes('XIO')) return 'XIO';
    if (instruction.includes('OTE')) return 'OTE';
    if (instruction.includes('OTL')) return 'OTL';
    if (instruction.includes('OTU')) return 'OTU';
    return instruction.slice(0, 5);
  }

  if (profileId === 'iec_like') {
    if (instruction.includes('CONTATO NA')) return 'NA';
    if (instruction.includes('CONTATO NF')) return 'NF';
    if (instruction.includes('COIL')) return 'COIL';
    if (instruction === 'S' || instruction === 'R') return instruction;
    return instruction.slice(0, 5);
  }

  if (profileId === 'commands_like') {
    if (instruction.includes('CONTATO NA')) return 'NA';
    if (instruction.includes('CONTATO NF')) return 'NF';
    if (instruction.includes('BOBINA') || instruction.includes('CONTATOR')) return 'K';
    if (instruction.includes('DESARME')) return 'OFF';
    if (instruction.includes('RETEN')) return 'SELO';
    return instruction.slice(0, 5);
  }

  if (instruction.includes('NA')) return 'NA';
  if (instruction.includes('NF')) return 'NF';
  if (instruction.includes('BOBINA')) return 'Q';
  return instruction.slice(0, 5);
}

function flattenBlocks(rung: ReturnType<typeof createPlcProfileProjectView>['rungs'][number]) {
  return [...rung.series, ...rung.parallelBranches.flat(), ...(rung.output ? [rung.output] : [])];
}

export const SimulatorDialectPanel = memo(function SimulatorDialectPanel({ editorProject, selectedProfile, onSelectProfile, compact }: SimulatorDialectPanelProps) {
  const profileView = useMemo(() => createPlcProfileProjectView(editorProject, selectedProfile), [editorProject, selectedProfile]);
  const firstRungs = useMemo(() => profileView.rungs.slice(0, compact ? 1 : 3), [compact, profileView.rungs]);

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Visualização didática</Text>
          <Text style={styles.title}>Simulador em modo {profileView.profile.shortName}</Text>
          <Text style={styles.subtitle}>A lógica executada não muda. Esta opção altera nomes, leitura, símbolos e demonstração das instruções.</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{profileView.profile.shortName}</Text>
        </View>
      </View>

      <View style={styles.profileRow}>
        {plcProfiles.map((profile) => {
          const selected = profile.id === selectedProfile;
          return (
            <Pressable key={profile.id} onPress={() => onSelectProfile(profile.id)} style={[styles.profileChip, selected && styles.profileChipActive]}>
              <Text style={[styles.profileChipText, selected && styles.profileChipTextActive]}>{profile.shortName}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.logicList}>
        {firstRungs.map((rung, index) => (
          <View key={rung.rungId} style={styles.logicCard}>
            <View style={styles.logicHeader}>
              <Text style={styles.logicIndex}>Linha {index + 1}</Text>
              <Text style={styles.logicTitle} numberOfLines={1}>{rung.label.replace(/^Linha \d+\s+[—-]\s+/, '')}</Text>
            </View>
            <Text style={styles.logicLine}>{rung.textLine}</Text>
            <View style={styles.instructionGrid}>
              {flattenBlocks(rung).map((block) => (
                <View key={block.blockId} style={styles.instructionCard}>
                  <Text style={styles.instructionIcon}>{instructionIcon(selectedProfile, block)}</Text>
                  <View style={styles.instructionTextBox}>
                    <Text style={styles.instructionName} numberOfLines={1}>{block.instruction}</Text>
                    <Text style={styles.instructionOperand} numberOfLines={1}>{block.operand}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.safeBox}>
        <Text style={styles.safeTitle}>Modo demonstrável</Text>
        <Text style={styles.safeText}>Use Rockwell-like para explicar XIC/XIO/OTE, IEC-like para comparar com blocos IEC, e Comandos para aproximar de botoeiras, contatos e contatores.</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 18,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  cardCompact: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900',
    marginTop: 2,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  badge: {
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.cyanSoft,
  },
  badgeText: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
  },
  profileRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  profileChip: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: colors.surfaceElevated,
  },
  profileChipActive: {
    borderColor: colors.gold,
    backgroundColor: colors.goldSoft,
  },
  profileChipText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
  },
  profileChipTextActive: {
    color: colors.amber,
  },
  logicList: {
    gap: spacing.sm,
  },
  logicCard: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    gap: spacing.sm,
  },
  logicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logicIndex: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  logicTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    flex: 1,
  },
  logicLine: {
    color: codeContrast.text,
    backgroundColor: codeContrast.background,
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.sm,
    fontFamily: 'monospace',
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '700',
  },
  instructionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  instructionCard: {
    flexGrow: 1,
    flexBasis: 118,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  instructionIcon: {
    minWidth: 42,
    textAlign: 'center',
    color: colors.green,
    borderColor: colors.green,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    backgroundColor: colors.greenSoft,
    fontSize: 11,
    fontWeight: '900',
  },
  instructionTextBox: {
    flex: 1,
    minWidth: 0,
  },
  instructionName: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
  },
  instructionOperand: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  safeBox: {
    borderColor: colors.green,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.greenSoft,
  },
  safeTitle: {
    color: colors.green,
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 3,
  },
  safeText: {
    color: colors.text,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
});
