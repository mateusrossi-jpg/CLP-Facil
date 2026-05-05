import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PlcMission, PlcMissionTrack } from '../lessons/missionTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type PlcMissionPathPanelProps = {
  tracks: PlcMissionTrack[];
  activeMissionId?: string | null;
  onOpenMission?: (mission: PlcMission) => void;
};

export const PlcMissionPathPanel = memo(function PlcMissionPathPanel({
  tracks,
  activeMissionId,
  onOpenMission,
}: PlcMissionPathPanelProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Missões práticas</Text>
          <Text style={styles.title}>Aprender → montar → simular</Text>
          <Text style={styles.subtitle}>Trilhas curtas para praticar no celular e receber feedback imediato no rung.</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{tracks.length} trilhas</Text>
        </View>
      </View>

      <View style={styles.trackStack}>
        {tracks.map((track, trackIndex) => (
          <View key={track.id} style={styles.trackCard}>
            <View style={styles.trackHeader}>
              <View style={styles.trackIndex}>
                <Text style={styles.trackIndexText}>{trackIndex + 1}</Text>
              </View>
              <View style={styles.trackCopy}>
                <Text style={styles.trackTitle}>{track.title.replace(/^Trilha \d+\s+[—-]\s+/, '')}</Text>
                <Text style={styles.trackDescription}>{track.description}</Text>
              </View>
            </View>

            <View style={styles.missionStack}>
              {track.missions.slice(0, 3).map((mission, missionIndex) => {
                const active = activeMissionId === mission.id;
                return (
                  <Pressable
                    key={mission.id}
                    onPress={() => onOpenMission?.(mission)}
                    style={({ pressed }) => [styles.missionRow, active && styles.missionRowActive, pressed && styles.pressed]}
                  >
                    <View style={[styles.missionDot, active && styles.missionDotActive]}>
                      <Text style={[styles.missionDotText, active && styles.missionDotTextActive]}>{missionIndex + 1}</Text>
                    </View>
                    <View style={styles.missionCopy}>
                      <Text style={styles.missionTitle}>{mission.title}</Text>
                      <Text style={styles.missionObjective} numberOfLines={2}>{mission.objective}</Text>
                    </View>
                    <Text style={[styles.openText, active && styles.openTextActive]}>{active ? 'Ativa' : 'Abrir'}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </View>
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
  trackStack: {
    gap: spacing.sm,
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
  pressed: {
    opacity: 0.72,
  },
});
