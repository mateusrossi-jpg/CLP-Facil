import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export function HomeHero() {
  return (
    <View style={styles.container}>
      <View style={styles.logoBox}>
        <Text style={styles.logoIcon}>⚙</Text>
      </View>
      <View style={styles.textBox}>
        <Text style={styles.brand}>CLP <Text style={styles.brandAccent}>Fácil</Text></Text>
        <Text style={styles.subtitle}>Simulador Ladder Educativo</Text>
        <View style={styles.separator} />
        <Text style={styles.description}>Aprenda, simule e domine lógica Ladder de forma prática e interativa.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceGlass,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 28,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  logoBox: {
    width: 74,
    height: 74,
    borderRadius: 22,
    borderColor: colors.cyan,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cyanSoft,
    marginBottom: spacing.lg,
  },
  logoIcon: {
    color: colors.cyan,
    fontSize: 34,
    fontWeight: '900',
  },
  textBox: {
    gap: spacing.xs,
  },
  brand: {
    color: colors.text,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1.2,
  },
  brandAccent: {
    color: colors.cyan,
  },
  subtitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  description: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 23,
  },
});
