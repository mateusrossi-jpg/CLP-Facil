import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EditorBlock, EditorCoilMode, EditorContactMode } from '../engine/editorTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const variableOptions = ['I0', 'I1', 'I2', 'I3', 'Q0', 'Q1', 'M0', 'M1'];
const contactModes: EditorContactMode[] = ['NO', 'NC'];
const coilModes: EditorCoilMode[] = ['NORMAL', 'SET', 'RESET', 'PULSE'];

type SelectedBlockEditorProps = {
  block: EditorBlock | null;
  onChangeVariable: (variable: string) => void;
  onChangeContactMode: (mode: EditorContactMode) => void;
  onChangeCoilMode: (mode: EditorCoilMode) => void;
  onRemove: () => void;
};

export function SelectedBlockEditor({ block, onChangeVariable, onChangeContactMode, onChangeCoilMode, onRemove }: SelectedBlockEditorProps) {
  if (!block) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Configuração do bloco</Text>
        <Text style={styles.text}>Selecione um bloco inserido no editor para alterar variável, tipo de contato, modo de bobina ou remover.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, block.isPro && styles.proContainer]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{block.name}</Text>
          <Text style={styles.text}>{block.description}</Text>
        </View>
        <Text style={[styles.badge, block.isPro ? styles.proBadge : styles.freeBadge]}>{block.isPro ? 'PRO' : 'FREE'}</Text>
      </View>

      <Text style={styles.sectionTitle}>Variável associada</Text>
      <View style={styles.optionsGrid}>
        {variableOptions.map((variable) => (
          <Pressable
            key={variable}
            onPress={() => onChangeVariable(variable)}
            style={({ pressed }) => [
              styles.option,
              block.variable === variable && styles.optionSelected,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.optionText, block.variable === variable && styles.optionTextSelected]}>{variable}</Text>
          </Pressable>
        ))}
      </View>

      {block.role === 'contact' ? (
        <>
          <Text style={styles.sectionTitle}>Tipo de contato</Text>
          <View style={styles.optionsGrid}>
            {contactModes.map((mode) => (
              <Pressable
                key={mode}
                onPress={() => onChangeContactMode(mode)}
                style={({ pressed }) => [styles.option, block.contactMode === mode && styles.optionSelected, pressed && styles.pressed]}
              >
                <Text style={[styles.optionText, block.contactMode === mode && styles.optionTextSelected]}>{mode === 'NO' ? 'NA' : 'NF'}</Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      {block.role === 'coil' ? (
        <>
          <Text style={styles.sectionTitle}>Modo da bobina</Text>
          <View style={styles.optionsGrid}>
            {coilModes.map((mode) => {
              const proMode = mode !== 'NORMAL';
              return (
                <Pressable
                  key={mode}
                  onPress={() => onChangeCoilMode(mode)}
                  style={({ pressed }) => [styles.option, block.coilMode === mode && styles.optionSelected, proMode && styles.proOption, pressed && styles.pressed]}
                >
                  <Text style={[styles.optionText, block.coilMode === mode && styles.optionTextSelected]}>{mode}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.proText}>SET, RESET e PULSE são recursos Pro para uso em projetos próprios, mas podem aparecer no modo educativo.</Text>
        </>
      ) : null}

      {block.isPro ? (
        <Text style={styles.proText}>Este bloco fica visível para estudo, mas o uso em projetos próprios será liberado no CLP Fácil Pro.</Text>
      ) : null}

      <Pressable onPress={onRemove} style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}>
        <Text style={styles.removeText}>Remover bloco</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  proContainer: {
    borderColor: colors.amber,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  text: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  badge: {
    fontSize: 11,
    fontWeight: '900',
  },
  freeBadge: {
    color: colors.green,
  },
  proBadge: {
    color: colors.amber,
  },
  sectionTitle: {
    color: colors.cyan,
    fontSize: 13,
    fontWeight: '900',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    minWidth: 58,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  proOption: {
    borderColor: colors.amber,
  },
  optionSelected: {
    borderColor: colors.green,
    backgroundColor: '#143822',
  },
  optionText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '900',
  },
  optionTextSelected: {
    color: colors.green,
  },
  proText: {
    color: colors.amber,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.md,
  },
  removeButton: {
    borderColor: colors.red,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  removeText: {
    color: colors.red,
    fontSize: 13,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.75,
  },
});
