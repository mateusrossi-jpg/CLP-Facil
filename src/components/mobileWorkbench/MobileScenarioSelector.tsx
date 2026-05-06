import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export type MobileScenarioId = 'conveyor' | 'tank' | 'motorStarter';

type ScenarioOption = {
  id: MobileScenarioId;
  title: string;
  description: string;
  symbol: string;
  tags: string;
};

const scenarioOptions: ScenarioOption[] = [
  { id: 'conveyor', title: 'Esteira', symbol: '▰▰→', description: 'Motor + sensor + caixa', tags: 'I0.2 → Q0.0' },
  { id: 'tank', title: 'Tanque', symbol: '◔', description: 'Nível + bomba + válvula', tags: 'I0.0/I0.1 → Q0.0' },
  { id: 'motorStarter', title: 'Partida direta', symbol: '⚡', description: 'Comando + contator + motor', tags: 'I0.0/I0.1 → Q0.1' },
];

type Props = {
  activeScenario: MobileScenarioId;
  onSelectScenario: (id: MobileScenarioId) => void;
};

export const MobileScenarioSelector = memo(function MobileScenarioSelector({ activeScenario, onSelectScenario }: Props) {
  return (
    <View style={styles.row}>
      {scenarioOptions.map((scenario) => {
        const active = scenario.id === activeScenario;
        return (
          <Pressable key={scenario.id} onPress={() => onSelectScenario(scenario.id)} style={[styles.card, active && styles.cardActive]}>
            <Text style={styles.symbol}>{scenario.symbol}</Text>
            <View style={styles.textBlock}>
              <Text style={[styles.title, active && styles.titleActive]}>{scenario.title}</Text>
              <Text style={styles.description}>{scenario.description}</Text>
              <Text style={[styles.tagLine, active && styles.tagLineActive]}>{scenario.tags}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  row: { gap: spacing.sm },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  cardActive: { borderColor: colors.cyanGlow, backgroundColor: colors.cyanSoft, shadowColor: colors.cyan, shadowOpacity: 0.2, shadowRadius: 8 },
  symbol: { color: colors.textMuted, fontSize: 18, minWidth: 32, textAlign: 'center' },
  textBlock: { flex: 1, gap: 2 },
  title: { color: colors.text, fontWeight: '700', fontSize: 14 },
  titleActive: { color: colors.cyanGlow },
  description: { color: colors.textMuted, fontSize: 12 },
  tagLine: { color: colors.textDim, fontSize: 11, fontWeight: '600' },
  tagLineActive: { color: colors.green },
});
