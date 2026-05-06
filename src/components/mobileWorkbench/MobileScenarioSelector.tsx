import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export type MobileScenarioId = 'conveyor' | 'tank' | 'motorStarter';

type ScenarioOption = { id: MobileScenarioId; title: string; description: string };

const scenarioOptions: ScenarioOption[] = [
  { id: 'conveyor', title: 'Esteira', description: 'Sensor de peça, motor e torre luminosa.' },
  { id: 'tank', title: 'Tanque', description: 'Nível, bomba, válvula e alarme visual.' },
  { id: 'motorStarter', title: 'Partida direta', description: 'Start/stop, contator, térmico e RUN.' },
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
            <Text style={[styles.title, active && styles.titleActive]}>{scenario.title}</Text>
            <Text style={styles.description}>{scenario.description}</Text>
          </Pressable>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  row: { gap: spacing.sm },
  card: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md },
  cardActive: { borderColor: colors.cyan, backgroundColor: colors.cyanSoft },
  title: { color: colors.text, fontWeight: '700', fontSize: 14 },
  titleActive: { color: colors.cyanGlow },
  description: { color: colors.textMuted, marginTop: spacing.xs, fontSize: 12 },
});
