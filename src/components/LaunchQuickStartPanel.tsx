import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EditorExampleProject } from '../data/editorExampleProjects';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type LaunchQuickStartPanelProps = {
  examples: EditorExampleProject[];
  onOpenExample: (example: EditorExampleProject) => void;
  onOpenLearn: () => void;
  onOpenHardware: () => void;
  onOpenReference: () => void;
};

function findExample(examples: EditorExampleProject[], pattern: RegExp) {
  return examples.find((example) => pattern.test(`${example.id} ${example.title} ${example.description}`));
}

export function LaunchQuickStartPanel({
  examples,
  onOpenExample,
  onOpenLearn,
  onOpenHardware,
  onOpenReference,
}: LaunchQuickStartPanelProps) {
  const sealExample = findExample(examples, /selo|seal/i) ?? examples[0];
  const motorExample = findExample(examples, /revers|estrela|triângulo|triangulo|motor/i) ?? examples[1] ?? examples[0];
  const processExample = findExample(examples, /bomba|esteira|pump|conveyor|nível|nivel/i) ?? examples[2] ?? examples[0];

  const quickExamples = [sealExample, motorExample, processExample]
    .filter((example): example is EditorExampleProject => Boolean(example))
    .filter((example, index, list) => list.findIndex((item) => item.id === example.id) === index);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Comece rápido</Text>
          <Text style={styles.title}>Do modelo pronto ao microcontrolador</Text>
          <Text style={styles.subtitle}>Escolha um circuito, simule o comportamento, consulte a referência e depois gere código para ESP32, Arduino ou ESPHome.</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>MVP+</Text>
        </View>
      </View>

      <View style={styles.flowRow}>
        <View style={styles.flowStep}>
          <Text style={styles.flowIndex}>1</Text>
          <Text style={styles.flowTitle}>Modelo</Text>
          <Text style={styles.flowText}>Carregue uma aplicação pronta.</Text>
        </View>
        <View style={styles.flowStep}>
          <Text style={styles.flowIndex}>2</Text>
          <Text style={styles.flowTitle}>Simule</Text>
          <Text style={styles.flowText}>Acione entradas e veja as saídas.</Text>
        </View>
        <View style={styles.flowStep}>
          <Text style={styles.flowIndex}>3</Text>
          <Text style={styles.flowTitle}>Exporte</Text>
          <Text style={styles.flowText}>Mapeie GPIOs e gere código.</Text>
        </View>
      </View>

      <View style={styles.exampleRow}>
        {quickExamples.map((example) => (
          <Pressable key={example.id} onPress={() => onOpenExample(example)} style={styles.exampleButton}>
            <Text style={styles.exampleTitle} numberOfLines={2}>{example.title}</Text>
            <Text style={styles.exampleMeta}>{example.difficulty}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.actionRow}>
        <Pressable onPress={onOpenLearn} style={styles.actionButton}>
          <Text style={styles.actionText}>Aprender guiado</Text>
        </Pressable>
        <Pressable onPress={onOpenReference} style={styles.actionButton}>
          <Text style={styles.actionText}>Referência CLP</Text>
        </Pressable>
        <Pressable onPress={onOpenHardware} style={[styles.actionButton, styles.actionButtonStrong]}>
          <Text style={[styles.actionText, styles.actionTextStrong]}>Hardware</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 18,
    padding: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerText: {
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
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
    marginTop: 2,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
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
  flowRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  flowStep: {
    flex: 1,
    minWidth: 140,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
  },
  flowIndex: {
    color: colors.cyan,
    fontSize: 20,
    fontWeight: '900',
  },
  flowTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
  },
  flowText: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  exampleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  exampleButton: {
    flexGrow: 1,
    flexBasis: 160,
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    backgroundColor: colors.cyanSoft,
  },
  exampleTitle: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
  },
  exampleMeta: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
    marginTop: 5,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    minWidth: 110,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  actionButtonStrong: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  actionText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
  },
  actionTextStrong: {
    color: colors.green,
  },
});
