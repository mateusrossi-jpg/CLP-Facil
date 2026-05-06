import { memo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PlcMission, PlcMissionTrack } from '../lessons/missionTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type PlcMissionPathPanelProps = {
  tracks: PlcMissionTrack[];
  activeMissionId?: string | null;
  completedMissionIds?: Record<string, boolean>;
  onOpenMission?: (mission: PlcMission) => void;
};

export const PlcMissionPathPanel = memo(function PlcMissionPathPanel({
  tracks,
  activeMissionId,
  completedMissionIds = {},
  onOpenMission,
}: PlcMissionPathPanelProps) {
  const totalMissions = tracks.reduce((total, track) => total + track.missions.length, 0);
  const completedCount = tracks.reduce(
    (total, track) => total + track.missions.filter((mission) => completedMissionIds[mission.id]).length,
    0,
  );
  const nextMission = tracks
    .flatMap((track) => track.missions)
    .find((mission) => !completedMissionIds[mission.id]);
  const nextMissionTrack = tracks.find((track) => track.missions.some((mission) => mission.id === nextMission?.id)) ?? tracks[0];
  const [selectedTrackId, setSelectedTrackId] = useState(nextMissionTrack?.id);
  const selectedTrack = tracks.find((track) => track.id === selectedTrackId) ?? nextMissionTrack;
  const selectedTrackCompleted = selectedTrack?.missions.filter((mission) => completedMissionIds[mission.id]).length ?? 0;
  const selectedTrackTotal = selectedTrack?.missions.length ?? 0;
  const progressPercent = totalMissions > 0 ? Math.round((completedCount / totalMissions) * 100) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Jornada guiada</Text>
          <Text style={styles.title}>Aprenda sem decorar tela</Text>
          <Text style={styles.subtitle}>Faça uma missão curta por vez: objetivo claro, simulação na mesma tela e feedback imediato.</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{progressPercent}%</Text>
        </View>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>

      {nextMission ? (
        <Pressable onPress={() => onOpenMission?.(nextMission)} style={({ pressed }) => [styles.continueCard, pressed && styles.pressed]}>
          <View style={styles.continueCopy}>
            <Text style={styles.continueLabel}>Próximo passo</Text>
            <Text style={styles.continueTitle}>{nextMission.title}</Text>
            <Text style={styles.continueText} numberOfLines={2}>{nextMission.objective}</Text>
            <View style={styles.microSteps}>
              <Text style={styles.microStep}>1. Leia</Text>
              <Text style={styles.microStep}>2. Toque</Text>
              <Text style={styles.microStep}>3. Rode Scan</Text>
            </View>
          </View>
          <Text style={styles.continueAction}>Começar</Text>
        </Pressable>
      ) : (
        <View style={styles.continueCardDone}>
          <Text style={styles.continueLabelDone}>Trilha concluída</Text>
          <Text style={styles.continueTextDone}>Todas as missões disponíveis foram concluídas nesta sessão.</Text>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trackTabs}>
        {tracks.map((track, trackIndex) => {
          const selected = track.id === selectedTrack?.id;
          const completed = track.missions.every((mission) => completedMissionIds[mission.id]);
          const available = trackIndex === 0 || tracks[trackIndex - 1]?.missions.some((mission) => completedMissionIds[mission.id]) || selected;
          return (
            <Pressable
              key={track.id}
              onPress={() => setSelectedTrackId(track.id)}
              style={({ pressed }) => [styles.trackTab, selected && styles.trackTabSelected, completed && styles.trackTabDone, pressed && styles.pressed]}
            >
              <Text style={[styles.trackTabIndex, selected && styles.trackTabIndexSelected]}>{completed ? '✓' : trackIndex + 1}</Text>
              <Text style={[styles.trackTabText, selected && styles.trackTabTextSelected]}>{track.title.replace(/^Trilha \d+\s+[—-]\s+/, '')}</Text>
              {!available ? <Text style={styles.trackTabHint}>Depois</Text> : null}
            </Pressable>
          );
        })}
      </ScrollView>

      {selectedTrack ? (
        <View style={styles.trackCard}>
          <View style={styles.trackHeader}>
            <View style={styles.trackIndex}>
              <Text style={styles.trackIndexText}>{selectedTrackCompleted}/{selectedTrackTotal}</Text>
            </View>
            <View style={styles.trackCopy}>
              <Text style={styles.trackTitle}>{selectedTrack.title.replace(/^Trilha \d+\s+[—-]\s+/, '')}</Text>
              <Text style={styles.trackDescription}>{selectedTrack.description}</Text>
            </View>
          </View>

          <View style={styles.missionStack}>
            {selectedTrack.missions.map((mission, missionIndex) => {
              const active = activeMissionId === mission.id;
              const completed = Boolean(completedMissionIds[mission.id]);
              const recommended = mission.id === nextMission?.id;
              return (
                <Pressable
                  key={mission.id}
                  onPress={() => onOpenMission?.(mission)}
                  style={({ pressed }) => [styles.missionRow, completed && styles.missionRowDone, active && styles.missionRowActive, recommended && styles.missionRowRecommended, pressed && styles.pressed]}
                >
                  <View style={[styles.missionDot, completed && styles.missionDotDone, active && styles.missionDotActive, recommended && styles.missionDotRecommended]}>
                    <Text style={[styles.missionDotText, (completed || active || recommended) && styles.missionDotTextActive]}>{completed ? '✓' : missionIndex + 1}</Text>
                  </View>
                  <View style={styles.missionCopy}>
                    <Text style={styles.missionTitle}>{mission.title}</Text>
                    <Text style={styles.missionObjective} numberOfLines={2}>{mission.objective}</Text>
                  </View>
                  <Text style={[styles.openText, completed && styles.openTextDone, active && styles.openTextActive, recommended && styles.openTextRecommended]}>
                    {active ? 'Ativa' : completed ? 'Feita' : recommended ? 'Agora' : 'Abrir'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: colors.green,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '900',
    marginTop: 2,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  badge: {
    borderColor: colors.green,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    backgroundColor: colors.greenSoft,
  },
  badgeText: {
    color: colors.green,
    fontSize: 10,
    fontWeight: '900',
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderWidth: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.green,
  },
  continueCard: {
    minHeight: 74,
    borderColor: colors.green,
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: colors.greenSoft,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  continueCardDone: {
    borderColor: colors.green,
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: colors.greenSoft,
    padding: spacing.sm,
    gap: 2,
  },
  continueCopy: {
    flex: 1,
    minWidth: 0,
  },
  continueLabel: {
    color: colors.green,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  continueLabelDone: {
    color: colors.green,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  continueTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
  },
  continueText: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  microSteps: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  microStep: {
    color: colors.green,
    fontSize: 10,
    fontWeight: '900',
    borderColor: colors.green,
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  continueTextDone: {
    color: colors.text,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800',
  },
  continueAction: {
    color: colors.green,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  trackTabs: {
    gap: spacing.xs,
    paddingVertical: 2,
  },
  trackTab: {
    minWidth: 132,
    minHeight: 52,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: colors.background,
    padding: spacing.sm,
    gap: 3,
  },
  trackTabSelected: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  trackTabDone: {
    borderColor: colors.green,
  },
  trackTabIndex: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  trackTabIndexSelected: {
    color: colors.cyan,
  },
  trackTabText: {
    color: colors.text,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '900',
  },
  trackTabTextSelected: {
    color: colors.cyan,
  },
  trackTabHint: {
    color: colors.textDim,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  trackCard: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  trackHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  trackIndex: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.cyan,
    borderWidth: 1,
    backgroundColor: colors.cyanSoft,
  },
  trackIndexText: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: '900',
  },
  trackCopy: {
    flex: 1,
    minWidth: 0,
  },
  trackTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  trackDescription: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  missionStack: {
    gap: spacing.xs,
  },
  missionRow: {
    minHeight: 58,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: colors.background,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  missionRowActive: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  missionRowDone: {
    borderColor: colors.cyanLine,
  },
  missionRowRecommended: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  missionDot: {
    width: 26,
    height: 26,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.borderStrong,
    borderWidth: 1,
    backgroundColor: colors.surfaceElevated,
  },
  missionDotActive: {
    borderColor: colors.green,
    backgroundColor: colors.green,
  },
  missionDotDone: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  missionDotRecommended: {
    borderColor: colors.green,
    backgroundColor: colors.green,
  },
  missionDotText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
  },
  missionDotTextActive: {
    color: colors.background,
  },
  missionCopy: {
    flex: 1,
    minWidth: 0,
  },
  missionTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  missionObjective: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  openText: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  openTextActive: {
    color: colors.green,
  },
  openTextDone: {
    color: colors.green,
  },
  openTextRecommended: {
    color: colors.green,
  },
  pressed: {
    opacity: 0.72,
  },
});
