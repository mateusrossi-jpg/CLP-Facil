import { StyleSheet, Text, View } from 'react-native';
import { AdPlacement, EASY_CLP_AD_UNITS, labelForAdPlacement } from '../commerce/adsAccess';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type AdPlaceholderProps = {
  placement: AdPlacement;
  visible: boolean;
};

export function AdPlaceholder({ placement, visible }: AdPlaceholderProps) {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{labelForAdPlacement(placement)}</Text>
      <Text style={styles.title}>Anúncio reservado</Text>
      <Text style={styles.description}>Provider beta mock: {EASY_CLP_AD_UNITS[placement]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  label: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
    marginTop: spacing.xs,
  },
  description: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
});
