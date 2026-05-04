import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CommunicationProtocolsPanel } from './CommunicationProtocolsPanel';
import { PlcProfilePanel } from './PlcProfilePanel';
import { ProfessionalClpPanel } from './ProfessionalClpPanel';
import { ProfessionalRoutinePanel } from './ProfessionalRoutinePanel';
import { ReleaseReadinessPanel } from './ReleaseReadinessPanel';
import { SafetyReadinessPanel } from './SafetyReadinessPanel';
import { StoreListingPanel } from './StoreListingPanel';
import { EditorProjectState } from '../engine/editorTypes';
import { PlcState } from '../engine/projectTypes';
import { PlcProfileId } from '../plcProfiles/plcProfiles';
import { EducationalForceMap, EducationalForceMode } from '../simulation/professionalClpView';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type ReferenceTab = 'dialects' | 'tags' | 'routines' | 'protocols' | 'safety' | 'release' | 'store';

type ReferenceHubPanelProps = {
  editorProject: EditorProjectState;
  selectedPlcProfile: PlcProfileId;
  onSelectPlcProfile: (profile: PlcProfileId) => void;
};

function initialReferenceState(project: EditorProjectState): PlcState {
  const state: PlcState = {};
  for (const variable of project.projectVariables ?? []) {
    state[variable.address || variable.id] = variable.dataType === 'number' ? 0 : false;
  }
  for (const rung of project.rungs) {
    const blocks = [
      ...rung.seriesBlocks,
      ...rung.parallelBlocks,
      ...(rung.parallelBranches ?? []).flatMap((branch) => branch.blocks),
      ...(rung.coilBlock ? [rung.coilBlock] : []),
    ];
    for (const block of blocks) {
      for (const variable of [block.variable, block.sourceA, block.sourceB, block.destination, block.downSource, block.resetSource]) {
        const address = variable?.trim().toUpperCase();
        if (!address || Number.isFinite(Number(address.replace(',', '.')))) continue;
        if (!(address in state)) state[address] = false;
      }
    }
  }
  return state;
}

export function ReferenceHubPanel({ editorProject, selectedPlcProfile, onSelectPlcProfile }: ReferenceHubPanelProps) {
  const [tab, setTab] = useState<ReferenceTab>('dialects');
  const [educationalForces, setEducationalForces] = useState<EducationalForceMap>({});
  const [rungComments, setRungComments] = useState<Record<string, string>>({});
  const referenceState = useMemo(() => initialReferenceState(editorProject), [editorProject]);

  function setEducationalForce(tag: string, force: EducationalForceMode) {
    setEducationalForces((current) => {
      const next = { ...current };
      if (force === 'normal') delete next[tag];
      else next[tag] = force;
      return next;
    });
  }

  function setRungComment(rungId: string, comment: string) {
    setRungComments((current) => {
      const next = { ...current };
      const cleaned = comment.trimStart();
      if (!cleaned.trim()) delete next[rungId];
      else next[rungId] = cleaned;
      return next;
    });
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View style={styles.heroText}>
            <Text style={styles.eyebrow}>Referência técnica</Text>
            <Text style={styles.title}>Dialetos, tags, rotinas, protocolos, segurança e lançamento</Text>
            <Text style={styles.subtitle}>Área separada para consulta, comparação, checklist de bancada, loja e preparação para lançamento sem poluir a simulação.</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>REF</Text>
          </View>
        </View>

        <View style={styles.tabRow}>
          <Pressable onPress={() => setTab('dialects')} style={[styles.tabButton, tab === 'dialects' && styles.tabButtonActive]}>
            <Text style={[styles.tabText, tab === 'dialects' && styles.tabTextActive]}>Dialetos</Text>
          </Pressable>
          <Pressable onPress={() => setTab('tags')} style={[styles.tabButton, tab === 'tags' && styles.tabButtonActive]}>
            <Text style={[styles.tabText, tab === 'tags' && styles.tabTextActive]}>Tags</Text>
          </Pressable>
          <Pressable onPress={() => setTab('routines')} style={[styles.tabButton, tab === 'routines' && styles.tabButtonActive]}>
            <Text style={[styles.tabText, tab === 'routines' && styles.tabTextActive]}>Rotinas</Text>
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
          <Pressable onPress={() => setTab('store')} style={[styles.tabButton, tab === 'store' && styles.tabButtonActive]}>
            <Text style={[styles.tabText, tab === 'store' && styles.tabTextActive]}>Loja</Text>
          </Pressable>
        </View>
      </View>

      {tab === 'dialects' ? (
        <PlcProfilePanel
          editorProject={editorProject}
          selectedProfile={selectedPlcProfile}
          onSelectProfile={onSelectPlcProfile}
        />
      ) : tab === 'tags' ? (
        <ProfessionalClpPanel
          editorProject={editorProject}
          plcState={referenceState}
          forces={educationalForces}
          rungComments={rungComments}
          onSetForce={setEducationalForce}
          onSetRungComment={setRungComment}
        />
      ) : tab === 'routines' ? (
        <ProfessionalRoutinePanel editorProject={editorProject} />
      ) : tab === 'protocols' ? (
        <CommunicationProtocolsPanel />
      ) : tab === 'safety' ? (
        <SafetyReadinessPanel />
      ) : tab === 'release' ? (
        <ReleaseReadinessPanel />
      ) : (
        <StoreListingPanel />
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
    minWidth: 82,
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
    fontSize: 11,
    fontWeight: '900',
  },
  tabTextActive: {
    color: colors.cyan,
  },
});
