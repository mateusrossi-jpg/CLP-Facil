import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const premium = {
  colors,
  spacing,
  radius: {
    sm: 12,
    md: 16,
    lg: 22,
    xl: 28,
    pill: 999,
  },
  border: {
    thin: 1,
    thick: 2,
  },
  type: {
    eyebrow: 11,
    small: 12,
    body: 13,
    title: 18,
    hero: 26,
  },
};

export type PremiumTone = 'neutral' | 'cyan' | 'green' | 'amber' | 'purple' | 'red';

export function premiumToneColor(tone: PremiumTone = 'cyan'): string {
  if (tone === 'green') return colors.green;
  if (tone === 'amber') return colors.amber;
  if (tone === 'purple') return colors.purple;
  if (tone === 'red') return colors.red;
  if (tone === 'neutral') return colors.textMuted;
  return colors.cyan;
}

export function premiumToneSoft(tone: PremiumTone = 'cyan'): string {
  if (tone === 'green') return colors.greenSoft;
  if (tone === 'amber') return colors.amberSoft;
  if (tone === 'purple') return colors.purpleSoft;
  if (tone === 'red') return colors.redSoft;
  if (tone === 'neutral') return colors.surfaceElevated;
  return colors.cyanSoft;
}
