import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EditorProjectState } from '../engine/editorTypes';
import { createPlcProfileProjectView, PlcProfileId, plcProfiles } from '../plcProfiles/plcProfiles';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type SimulatorDialectPanelProps = {
  editorProject: EditorProjectState;
  selectedProfile: PlcProfileId;
  onSelectProfile: (profile: PlcProfileId) => void;
  compact?: boolean;
};

export function SimulatorDialectPanel({ editorProject, selectedProfile, onSelectProfile, compact }: SimulatorDialectPanelProps) {
  const profileView = createPlcProfileProjectView(editorProject, selectedProfile);
  const firstRungs = profileView.rungs.slice(0, compact ? 1 : 3);

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Visualização didática</Text>
          <Text style={styles.title}>Simulador em modo {profileView.profile.shortName}</Text>
          <Text style={styles.subtitle}>A lógica executada não muda. Esta opção altera apenas nomes, leitura e demonstração das instruções.</Text>
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
          </View>
        ))}
      </View>

      <View style={styles.safeBox}>
        <Text style={styles.safeTitle}>Modo demonstrável</Text>
        <Text style={styles.safeText}>Use Rockwell-like para explicar XIC/XIO/OTE, IEC-like para comparar com blocos IEC, e Comandos para aproximar de botoeiras, contatos e contatores.</Text>
      </View>
    </View>
  );
}

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
  },
  logicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 5,
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
    color: colors.text,
    backgroundColor: colors.black,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.sm,
    fontFamily: 'monospace',
    fontSize: 10,
    lineHeight: 15,
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
