import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type MobileSimulationEntryCardProps = {
  onOpenMobileExecution: () => void;
  onContinueClassic?: () => void;
};

export const MobileSimulationEntryCard = memo(function MobileSimulationEntryCard({
  onOpenMobileExecution,
  onContinueClassic,
}: MobileSimulationEntryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleBox}>
          <Text style={styles.eyebrow}>Execução mobile</Text>
          <Text style={styles.title}>Abrir simulador otimizado para celular?</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Novo</Text>
        </View>
      </View>

      <Text style={styles.description}>
        Esta tela foi desenhada para uso no aparelho: I/Os no topo, execução compacta, Lista, Fluxo e Rung compacto com saída/carga sempre visível.
      </Text>

      <View style={styles.featureGrid}>
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>I/Os horizontais</Text>
          <Text style={styles.featureText}>Entradas, saídas, memórias, timers e contadores em abas rápidas.</Text>
        </View>
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>Rung compacto</Text>
          <Text style={styles.featureText}>Linha Ladder pensada para caber no display sem perder a saída.</Text>
        </View>
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>Diagnóstico rápido</Text>
          <Text style={styles.featureText}>Linha ativa, saída ON/OFF e último scan sempre à vista.</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={onOpenMobileExecution} style={styles.primaryButton}>
          <Text style={styles.primaryText}>Abrir execução mobile</Text>
        </Pressable>
        {onContinueClassic ? (
          <Pressable onPress={onContinueClassic} style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>Continuar modo clássico</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 18,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  titleBox: {
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
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '900',
    marginTop: 2,
  },
  badge: {
    borderColor: colors.green,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.greenSoft,
  },
  badgeText: {
    color: colors.green,
    fontSize: 10,
    fontWeight: '900',
  },
  description: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  featureGrid: {
    gap: spacing.sm,
  },
  featureCard: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
  },
  featureTitle: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: '900',
  },
  featureText: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  actions: {
    gap: spacing.sm,
  },
  primaryButton: {
    borderColor: colors.green,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.greenSoft,
  },
  primaryText: {
    color: colors.green,
    fontSize: 13,
    fontWeight: '900',
  },
  secondaryButton: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  secondaryText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '900',
  },
});
