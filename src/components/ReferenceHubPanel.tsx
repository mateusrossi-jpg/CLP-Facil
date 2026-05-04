import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CommunicationProtocolsPanel } from './CommunicationProtocolsPanel';
import { PlcProfilePanel } from './PlcProfilePanel';
import { ReleaseReadinessPanel } from './ReleaseReadinessPanel';
import { SafetyReadinessPanel } from './SafetyReadinessPanel';
import { EditorProjectState } from '../engine/editorTypes';
import { PlcProfileId } from '../plcProfiles/plcProfiles';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type ReferenceTab = 'dialects' | 'protocols' | 'safety' | 'release';

type ReferenceHubPanelProps = {
  editorProject: EditorProjectState;
  selectedPlcProfile: PlcProfileId;
  onSelectPlcProfile: (profile: PlcProfileId) => void;
};

export function ReferenceHubPanel({ editorProject, selectedPlcProfile, onSelectPlcProfile }: ReferenceHubPanelProps) {
  const [tab, setTab] = useState<ReferenceTab>('dialects');

  return (
    <View style={styles.wrapper}>
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View style={styles.heroText}>
            <Text style={styles.eyebrow}>Referência técnica</Text>
            <Text style={styles.title}>Dialetos, protocolos, segurança e divulgação</Text>
            <Text style={styles.subtitle}>Área separada para consulta, comparação, checklist de bancada e preparação para lançamento sem poluir a simulação.</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>REF</Text>
          </View>
        </View>

        <View style={styles.tabRow}>
          <Pressable onPress={() => setTab('dialects')} style={[styles.tabButton, tab === 'dialects' && styles.tabButtonActive]}>
            <Text style={[styles.tabText, tab === 'dialects' && styles.tabTextActive]}>Dialetos</Text>
          </Pressable>
          <Pressable onPress={() => setTab('protocols')} style={[styles.tabButton, tab === 'protocols' && styles.tabButtonActive]}>
            <Text style={[styles.tabText, tab === 'protocols' && styles.tabTextActive]}>Protocolos</Text>
          </Pressable>
          <Pressable onPress={() => setTab('safety')} style={[styles.tabButton, tab === 'safety' && styles.tabButtonActive]}>
            <Text style={[styles.tabText, tab === 'safety' && styles.tabTextActive]}>Segurança</Text>
          </Pressable>
          <Pressable onPress={() => setTab('release')} style={[styles.tabButton, tab === 'release' && styles.tabButtonActive]}>
            <Text style={[styles.tabText, tab === 'release' && styles.tabTextActive]}>Divulgação</Text>
          </Pressable>
        </View>
      </View>

      {tab === 'dialects' ? (
        <PlcProfilePanel
          editorProject={editorProject}
          selectedProfile={selectedPlcProfile}
          onSelectProfile={onSelectPlcProfile}
        />
      ) : tab === 'protocols' ? (
        <CommunicationProtocolsPanel />
      ) : tab === 'safety' ? (
        <SafetyReadinessPanel />
      ) : (
        <ReleaseReadinessPanel />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.md,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 18,
    padding: spacing.lg,
    gap: spacing.md,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  heroText: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
    marginTop: 2,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
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
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    backgroundColor: colors.backgroundSoft,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.xs,
  },
  tabButton: {
    flex: 1,
    minWidth: 94,
    borderRadius: 10,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: colors.surface,
    borderColor: colors.cyan,
    borderWidth: 1,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
  },
  tabTextActive: {
    color: colors.cyan,
  },
});
