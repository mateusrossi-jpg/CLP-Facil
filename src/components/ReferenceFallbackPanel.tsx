import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export function ReferenceFallbackPanel() {
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>Referência técnica</Text>
      <Text style={styles.title}>Conteúdo Ref carregado</Text>
      <Text style={styles.subtitle}>
        Esta área garante que a aba Ref nunca fique vazia. Use as seções de Dialetos, Mobile, Tags, Rotinas, Protocolos, Segurança, Divulgação e Loja para consultar o pacote técnico do app.
      </Text>
      <View style={styles.grid}>
        {['Dialetos CLP', 'Mobile', 'Tags profissionais', 'Rotinas', 'Protocolos', 'Segurança', 'Divulgação', 'Loja'].map((item) => (
          <View key={item} style={styles.item}>
            <Text style={styles.itemText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 18,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  eyebrow: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  item: {
    flexGrow: 1,
    flexBasis: 130,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.surfaceElevated,
  },
  itemText: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: '900',
  },
});
