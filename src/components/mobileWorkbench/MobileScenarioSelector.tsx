import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export type MobileScenarioId = 'conveyor' | 'tank' | 'motorStarter';

type ScenarioOption = {
  id: MobileScenarioId;
  icon: string;
  title: string;
  description: string;
  tags: string;
};

const scenarioOptions: ScenarioOption[] = [
  { id: 'conveyor', icon: '▤', title: 'Esteira', description: 'Movimentação com sensor fotoelétrico e torre de sinalização.', tags: 'MOTOR · SENSOR · TORRE' },
  { id: 'tank', icon: '⬢', title: 'Tanque', description: 'Controle de nível com bomba, válvula e alarme industrial.', tags: 'NÍVEL · BOMBA · VÁLVULA' },
  { id: 'motorStarter', icon: '⚙', title: 'Partida direta', description: 'Painel elétrico com START/STOP, térmico e lâmpada RUN.', tags: 'CONTATOR · MOTOR · PROTEÇÃO' },
];

type Props = { activeScenario: MobileScenarioId; onSelectScenario: (id: MobileScenarioId) => void };

export const MobileScenarioSelector = memo(function MobileScenarioSelector({ activeScenario, onSelectScenario }: Props) {
  return (
    <View style={styles.column}>
      {scenarioOptions.map((scenario) => {
        const active = scenario.id === activeScenario;
        return (
          <Pressable key={scenario.id} onPress={() => onSelectScenario(scenario.id)} style={[styles.card, active && styles.cardActive]}>
            <View style={styles.headerRow}>
              <Text style={[styles.icon, active && styles.iconActive]}>{scenario.icon}</Text>
              <View style={styles.meta}>
                <Text style={[styles.title, active && styles.titleActive]}>{scenario.title}</Text>
                <Text style={styles.description}>{scenario.description}</Text>
              </View>
              <View style={[styles.statusBadge, active ? styles.statusOn : styles.statusOff]}>
                <Text style={styles.statusText}>{active ? 'ATIVO' : 'PRONTO'}</Text>
              </View>
            </View>
            <Text style={styles.tags}>{scenario.tags}</Text>
          </Pressable>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  column: { gap: spacing.sm },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: colors.background,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 8,
  },
  cardActive: { borderColor: colors.cyan, backgroundColor: colors.cyanSoft },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: { color: colors.textMuted, fontSize: 26, width: 28, textAlign: 'center' },
  iconActive: { color: colors.cyanGlow },
  meta: { flex: 1, gap: 2 },
  title: { color: colors.text, fontWeight: '700', fontSize: 15 },
  titleActive: { color: colors.cyanGlow },
  description: { color: colors.textMuted, fontSize: 12 },
  statusBadge: { borderRadius: 999, borderWidth: 1, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  statusOn: { borderColor: colors.cyan, backgroundColor: colors.cyanSoft },
  statusOff: { borderColor: colors.borderStrong, backgroundColor: colors.surfaceElevated },
  statusText: { color: colors.text, fontSize: 10, fontWeight: '700' },
  tags: { marginTop: spacing.xs, color: colors.textDim, fontSize: 11, letterSpacing: 0.2 },
});
