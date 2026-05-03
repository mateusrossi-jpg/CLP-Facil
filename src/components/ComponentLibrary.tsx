import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ComponentCategory, simulatorComponents, SimulatorComponent } from '../data/componentLibrary';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const categoryLabels: Record<ComponentCategory, string> = {
  input: 'Entradas',
  logic: 'Lógica',
  output: 'Saídas',
  timer: 'Temporizadores',
  counter: 'Contadores',
  motor: 'Motores',
};

type ComponentLibraryProps = {
  selectedComponentId?: string;
  onSelectComponent?: (component: SimulatorComponent) => void;
};

export function ComponentLibrary({ selectedComponentId, onSelectComponent }: ComponentLibraryProps) {
  const categories = Object.keys(categoryLabels) as ComponentCategory[];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Biblioteca de componentes</Text>
      <Text style={styles.subtitle}>Toque em um componente para inserir/editar. Componentes Pro ficam bloqueados para projetos próprios na versão gratuita.</Text>
      {categories.map((category) => {
        const components = simulatorComponents.filter((component) => component.category === category);
        return (
          <View key={category} style={styles.categoryBlock}>
            <Text style={styles.categoryTitle}>{categoryLabels[category]}</Text>
            <View style={styles.grid}>
              {components.map((component) => {
                const selected = component.id === selectedComponentId;
                return (
                  <Pressable
                    key={component.id}
                    onPress={() => onSelectComponent?.(component)}
                    style={({ pressed }) => [
                      styles.componentCard,
                      component.isPro && styles.proCard,
                      selected && styles.selectedCard,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.componentHeader}>
                      <Text style={styles.componentName}>{component.name}</Text>
                      <Text style={[styles.badge, component.isPro ? styles.proBadge : styles.freeBadge]}>{component.isPro ? 'PRO' : 'FREE'}</Text>
                    </View>
                    <Text style={styles.componentDescription}>{component.description}</Text>
                    <Text style={styles.status}>{component.status === 'available' ? 'Disponível' : component.status === 'visual-only' ? 'Visual agora' : 'Planejado'}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  categoryBlock: {
    marginBottom: spacing.lg,
  },
  categoryTitle: {
    color: colors.cyan,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  componentCard: {
    width: '48%',
    minHeight: 132,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.md,
    margin: spacing.xs,
  },
  proCard: {
    borderColor: colors.amber,
  },
  selectedCard: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  pressed: {
    opacity: 0.75,
  },
  componentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  componentName: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  badge: {
    fontSize: 10,
    fontWeight: '900',
  },
  freeBadge: {
    color: colors.green,
  },
  proBadge: {
    color: colors.amber,
  },
  componentDescription: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: spacing.sm,
  },
  status: {
    color: colors.inactive,
    fontSize: 11,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
});
