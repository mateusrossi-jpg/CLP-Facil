import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ProjectNavigationIntent } from '../../projects/projectNavigationIntent';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { PremiumBadge } from './PremiumCards';

type PremiumProjectIntentBannerProps = {
  intent?: ProjectNavigationIntent;
};

function actionLabel(action: ProjectNavigationIntent['action']): string {
  if (action === 'study') return 'Estudar';
  if (action === 'simulate') return 'Simular';
  if (action === 'technical') return 'Técnico';
  if (action === 'bench') return 'Bancada';
  return 'Código';
}

function routeHint(intent: ProjectNavigationIntent): string {
  if (intent.targetRoute === 'learn') {
    return 'Continue pela lição vinculada e depois volte ao projeto para praticar.';
  }
  if (intent.targetRoute === 'simulate') {
    return 'Abra a execução mobile para testar I/Os, rungs compactos e diagnóstico.';
  }
  return 'Continue o fluxo do projeto usando as abas do app.';
}

export const PremiumProjectIntentBanner = memo(function PremiumProjectIntentBanner({ intent }: PremiumProjectIntentBannerProps) {
  if (!intent) return null;

  return (
    <View style={styles.banner}>
      <View style={styles.iconBox}>
        <Text style={styles.iconText}>CLP</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>Fluxo vindo de Projetos</Text>
        <Text style={styles.title}>{intent.projectTitle}</Text>
        <Text style={styles.description}>{routeHint(intent)}</Text>
      </View>
      <PremiumBadge label={actionLabel(intent.action)} tone={intent.action === 'simulate' ? 'cyan' : 'green'} />
    </View>
  );
});

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderColor: colors.green,
    borderWidth: 1,
    borderRadius: 20,
    padding: spacing.md,
    backgroundColor: colors.greenSoft,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderColor: colors.green,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  iconText: { color: colors.green, fontSize: 11, fontWeight: '900' },
  copy: { flex: 1, minWidth: 0 },
  eyebrow: { color: colors.green, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.8 },
  title: { color: colors.text, fontSize: 13, lineHeight: 18, fontWeight: '900', marginTop: 2 },
  description: { color: colors.textMuted, fontSize: 11, lineHeight: 16, fontWeight: '800', marginTop: 2 },
});
