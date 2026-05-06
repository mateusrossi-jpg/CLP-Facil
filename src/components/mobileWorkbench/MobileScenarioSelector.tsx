import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { spacing } from '../../theme/spacing';
import { useAppTheme } from '../../theme/theme';

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
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme.colors), [theme.colors]);

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

function createStyles(c: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
  column: { gap: spacing.sm },
  card: {
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: c.background,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 8,
  },
  cardActive: { borderColor: c.cyan, backgroundColor: c.cyanSoft },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: { color: c.textMuted, fontSize: 26, width: 28, textAlign: 'center' },
  iconActive: { color: c.cyanGlow },
  meta: { flex: 1, gap: 2 },
  title: { color: c.text, fontWeight: '700', fontSize: 15 },
  titleActive: { color: c.cyanGlow },
  description: { color: c.textMuted, fontSize: 12 },
  statusBadge: { borderRadius: 999, borderWidth: 1, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  statusOn: { borderColor: c.cyan, backgroundColor: c.cyanSoft },
  statusOff: { borderColor: c.borderStrong, backgroundColor: c.surfaceElevated },
  statusText: { color: c.text, fontSize: 10, fontWeight: '700' },
  tags: { marginTop: spacing.xs, color: c.textDim, fontSize: 11, letterSpacing: 0.2 },
  });
}
