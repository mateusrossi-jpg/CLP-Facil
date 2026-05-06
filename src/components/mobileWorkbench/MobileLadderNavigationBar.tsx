import { ComponentProps, memo, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { MobilePlcExperience } from '../MobilePlcExperience';

type MobileLadderNavigationBarProps = Pick<
  ComponentProps<typeof MobilePlcExperience>,
  'editorProject' | 'evaluation' | 'onSelectRungId'
>;

const ZOOM_LEVELS = [75, 100, 125, 150];

export const MobileLadderNavigationBar = memo(function MobileLadderNavigationBar({
  editorProject,
  evaluation,
  onSelectRungId,
}: MobileLadderNavigationBarProps) {
  const [zoomIndex, setZoomIndex] = useState(1);
  const visibleRungs = editorProject.rungs.slice(0, 8);
  const selectedRungId = editorProject.selectedRungId ?? visibleRungs[0]?.id;
  const selectedIndex = Math.max(0, visibleRungs.findIndex((rung) => rung.id === selectedRungId));
  const energizedRungs = useMemo(
    () => visibleRungs.filter((rung) => Boolean(evaluation.rungResults?.[rung.id])).length,
    [evaluation.rungResults, visibleRungs],
  );
  const zoom = ZOOM_LEVELS[zoomIndex];

  function selectRelative(offset: number) {
    if (visibleRungs.length === 0) return;
    const nextIndex = Math.min(Math.max(selectedIndex + offset, 0), visibleRungs.length - 1);
    onSelectRungId?.(visibleRungs[nextIndex].id);
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>Navegação Canvas</Text>
          <Text style={styles.title}>Zoom, foco e mini mapa</Text>
        </View>
        <View style={styles.zoomPill}>
          <Text style={styles.zoomText}>{zoom}%</Text>
        </View>
      </View>

      <View style={styles.controlsRow}>
        <Pressable onPress={() => setZoomIndex((current) => Math.max(0, current - 1))} style={({ pressed }) => [styles.controlButton, pressed && styles.pressed]}>
          <Text style={styles.controlIcon}>−</Text>
          <Text style={styles.controlLabel}>Zoom</Text>
        </Pressable>
        <Pressable onPress={() => setZoomIndex((current) => Math.min(ZOOM_LEVELS.length - 1, current + 1))} style={({ pressed }) => [styles.controlButton, pressed && styles.pressed]}>
          <Text style={styles.controlIcon}>＋</Text>
          <Text style={styles.controlLabel}>Zoom</Text>
        </Pressable>
        <Pressable onPress={() => selectRelative(-1)} style={({ pressed }) => [styles.controlButton, pressed && styles.pressed]}>
          <Text style={styles.controlIcon}>↑</Text>
          <Text style={styles.controlLabel}>Rung</Text>
        </Pressable>
        <Pressable onPress={() => selectRelative(1)} style={({ pressed }) => [styles.controlButton, pressed && styles.pressed]}>
          <Text style={styles.controlIcon}>↓</Text>
          <Text style={styles.controlLabel}>Rung</Text>
        </Pressable>
      </View>

      <View style={styles.mapRow}>
        <View style={styles.miniMap}>
          {visibleRungs.length === 0 ? (
            <Text style={styles.emptyMap}>sem rungs</Text>
          ) : visibleRungs.map((rung, index) => {
            const selected = rung.id === selectedRungId;
            const energized = Boolean(evaluation.rungResults?.[rung.id]);
            return (
              <Pressable
                key={rung.id}
                onPress={() => onSelectRungId?.(rung.id)}
                style={[styles.mapCell, selected && styles.mapCellSelected, energized && styles.mapCellOn]}
              >
                <Text style={[styles.mapIndex, selected && styles.mapIndexSelected, energized && styles.mapIndexOn]}>{index + 1}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.focusBox}>
          <Text style={styles.focusLabel}>FOCO</Text>
          <Text style={styles.focusValue}>Rung {selectedIndex + 1}/{visibleRungs.length || 1}</Text>
          <Text style={[styles.liveValue, energizedRungs > 0 && styles.liveValueOn]}>{energizedRungs} LIVE</Text>
        </View>
      </View>

      <Text style={styles.hint}>Primeira camada de navegação segura: pronta para ligar pinch/pan real sem refazer a UX.</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
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
    fontWeight: '900',
    marginTop: 2,
  },
  zoomPill: {
    borderWidth: 1,
    borderColor: colors.cyan,
    borderRadius: 999,
    backgroundColor: colors.cyanSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  zoomText: {
    color: colors.cyan,
    fontSize: 11,
    fontWeight: '900',
  },
  controlsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  controlButton: {
    flexGrow: 1,
    minWidth: 70,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: spacing.xs,
  },
  controlIcon: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  controlLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  mapRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
  },
  miniMap: {
    flex: 1,
    minHeight: 58,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.background,
    padding: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mapCell: {
    flex: 1,
    minWidth: 24,
    height: 38,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapCellSelected: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  mapCellOn: {
    borderColor: colors.green,
  },
  mapIndex: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  mapIndexSelected: {
    color: colors.cyan,
  },
  mapIndexOn: {
    color: colors.green,
  },
  focusBox: {
    width: 96,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.xs,
    justifyContent: 'center',
  },
  focusLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
  },
  focusValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  liveValue: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
    marginTop: 2,
  },
  liveValueOn: {
    color: colors.green,
  },
  emptyMap: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
  hint: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.72,
  },
});
