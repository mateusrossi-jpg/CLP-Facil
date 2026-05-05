import { ReactNode, memo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type PlcSimulationSectionTone = 'cyan' | 'green' | 'amber' | 'red' | 'purple' | 'neutral';

type PlcSimulationSectionProps = {
  title: string;
  subtitle: string;
  defaultOpen?: boolean;
  tone?: PlcSimulationSectionTone;
  children: ReactNode;
};

function toneColor(tone: PlcSimulationSectionTone): string {
  if (tone === 'green') return colors.green;
  if (tone === 'amber') return colors.amber;
  if (tone === 'red') return colors.red;
  if (tone === 'purple') return colors.cyan;
  if (tone === 'neutral') return colors.textMuted;
  return colors.cyan;
}

function toneBackground(tone: PlcSimulationSectionTone): string {
  if (tone === 'green') return colors.greenSoft;
  if (tone === 'amber') return colors.amberSoft;
  if (tone === 'red') return colors.redSoft;
  if (tone === 'purple') return colors.cyanSoft;
  if (tone === 'neutral') return colors.surfaceElevated;
  return colors.cyanSoft;
}

export const PlcSimulationSection = memo(function PlcSimulationSection({
  title,
  subtitle,
  defaultOpen = false,
  tone = 'cyan',
  children,
}: PlcSimulationSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const accent = toneColor(tone);

  return (
    <View style={[styles.wrapper, { borderColor: accent, backgroundColor: toneBackground(tone) }]}>
      <Pressable onPress={() => setOpen((current) => !current)} style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: accent }]}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={[styles.togglePill, { borderColor: accent }]}> 
          <Text style={[styles.toggleText, { color: accent }]}>{open ? 'Fechar' : 'Abrir'}</Text>
        </View>
      </Pressable>
      {open ? <View style={styles.content}>{children}</View> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    padding: spacing.md,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  subtitle: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
    marginTop: 2,
  },
  togglePill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    backgroundColor: colors.surface,
  },
  toggleText: {
    fontSize: 10,
    fontWeight: '900',
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
});
