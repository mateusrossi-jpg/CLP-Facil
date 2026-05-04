import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { EditorBlock, EditorCoilMode, EditorCompareMode, EditorContactMode, EditorCounterMode, EditorMathMode, EditorTimerMode, EditorVariable } from '../engine/editorTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const contactModes: EditorContactMode[] = ['NO', 'NC', 'RISING', 'FALLING'];
const coilModes: EditorCoilMode[] = ['NORMAL', 'SET', 'RESET', 'PULSE'];
const timerModes: EditorTimerMode[] = ['TON', 'TOF', 'TP'];
const counterModes: EditorCounterMode[] = ['CTU', 'CTD', 'CTUD'];
const compareModes: EditorCompareMode[] = ['EQU', 'NEQ', 'GRT', 'LES', 'GEQ', 'LEQ'];
const mathModes: EditorMathMode[] = ['MOV', 'ADD', 'SUB', 'MUL', 'DIV'];
const timerPresetOptions = [500, 1000, 3000, 5000, 10000];
const counterPresetOptions = [1, 3, 5, 10, 20];

type SelectedBlockEditorProps = {
  block: EditorBlock | null;
  variables?: EditorVariable[];
  onChangeVariable: (variable: string) => void;
  onChangeName: (name: string) => void;
  onChangeDescription: (description: string) => void;
  onChangeContactMode: (mode: EditorContactMode) => void;
  onChangeCoilMode: (mode: EditorCoilMode) => void;
  onChangeTimerMode: (mode: EditorTimerMode) => void;
  onChangeCounterMode: (mode: EditorCounterMode) => void;
  onChangeCompareMode: (mode: EditorCompareMode) => void;
  onChangeMathMode: (mode: EditorMathMode) => void;
  onChangeSourceA: (value: string) => void;
  onChangeSourceB: (value: string) => void;
  onChangeDestination: (value: string) => void;
  onChangeDownSource: (value: string) => void;
  onChangeResetSource: (value: string) => void;
  onChangePresetMs: (presetMs: number) => void;
  onChangePreset: (preset: number) => void;
  onRemove: () => void;
};

function variableCompatibleWithBlock(block: EditorBlock, variable: EditorVariable) {
  if (block.role === 'timer') return variable.dataType === 'timer';
  if (block.role === 'counter') return variable.dataType === 'counter';
  if (block.compareMode || block.mathMode) return variable.dataType === 'number';
  if (block.role === 'coil') return variable.scope !== 'input' && variable.dataType === 'boolean';
  return variable.dataType === 'boolean';
}

function TagSuggestions({
  variables,
  onSelect,
}: {
  variables: EditorVariable[];
  onSelect: (address: string) => void;
}) {
  if (variables.length === 0) return null;
  return (
    <View style={styles.tagRail}>
      {variables.slice(0, 12).map((variable) => (
        <Pressable key={variable.id} onPress={() => onSelect(variable.address)} style={({ pressed }) => [styles.tagChip, pressed && styles.pressed]}>
          <Text style={styles.tagChipText}>{variable.address}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function SelectedBlockEditor({
  block,
  variables = [],
  onChangeVariable,
  onChangeName,
  onChangeDescription,
  onChangeContactMode,
  onChangeCoilMode,
  onChangeTimerMode,
  onChangeCounterMode,
  onChangeCompareMode,
  onChangeMathMode,
  onChangeSourceA,
  onChangeSourceB,
  onChangeDestination,
  onChangeDownSource,
  onChangeResetSource,
  onChangePresetMs,
  onChangePreset,
  onRemove,
}: SelectedBlockEditorProps) {
  if (!block) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Configuração do bloco</Text>
        <Text style={styles.text}>Selecione um bloco inserido no editor para alterar variável, tipo de contato, modo de bobina, tempo, contagem ou remover.</Text>
      </View>
    );
  }

  const compatibleVariables = variables.filter((variable) => variableCompatibleWithBlock(block, variable));
  const numericVariables = variables.filter((variable) => variable.dataType === 'number');
  const booleanVariables = variables.filter((variable) => variable.dataType === 'boolean');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{block.name}</Text>
          <Text style={styles.text}>{block.description}</Text>
        </View>
        <Text style={styles.badge}>LIBERADO</Text>
      </View>

      <Text style={styles.sectionTitle}>Identificação</Text>
      <TextInput
        value={block.name}
        onChangeText={onChangeName}
        placeholder="Nome do bloco"
        placeholderTextColor={colors.textDim}
        style={styles.variableInput}
      />
      <TextInput
        value={block.description}
        onChangeText={onChangeDescription}
        placeholder="Comentário/descrição"
        placeholderTextColor={colors.textDim}
        multiline
        style={[styles.variableInput, styles.descriptionInput]}
      />

      <Text style={styles.sectionTitle}>Variável associada</Text>
      <TextInput
        value={block.variable}
        onChangeText={(value) => onChangeVariable(value.toUpperCase().replace(/\s/g, ''))}
        placeholder="Ex: I0.0, Q0.1, M10.0, T3, C7"
        placeholderTextColor={colors.textDim}
        autoCapitalize="characters"
        autoCorrect={false}
        style={styles.variableInput}
      />
      <Text style={styles.helperText}>Escreva o endereço/tag usado no projeto. A Tabela de I/O será criada automaticamente conforme os blocos usam variáveis.</Text>
      <TagSuggestions variables={compatibleVariables} onSelect={onChangeVariable} />

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
                <Text style={[styles.optionText, block.contactMode === mode && styles.optionTextSelected]}>
                  {mode === 'NO' ? 'NA' : mode === 'NC' ? 'NF' : mode === 'RISING' ? 'ONS ↑' : 'OSF ↓'}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      {block.compareMode ? (
        <>
          <Text style={styles.sectionTitle}>Comparador</Text>
          <View style={styles.optionsGrid}>
            {compareModes.map((mode) => (
              <Pressable
                key={mode}
                onPress={() => onChangeCompareMode(mode)}
                style={({ pressed }) => [styles.option, block.compareMode === mode && styles.optionSelected, pressed && styles.pressed]}
              >
                <Text style={[styles.optionText, block.compareMode === mode && styles.optionTextSelected]}>{mode}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.inlineFields}>
            <TextInput value={block.sourceA ?? ''} onChangeText={onChangeSourceA} placeholder="A: N0 ou 10" placeholderTextColor={colors.textDim} autoCapitalize="characters" style={[styles.variableInput, styles.inlineInput]} />
            <TextInput value={block.sourceB ?? ''} onChangeText={onChangeSourceB} placeholder="B: N1 ou 20" placeholderTextColor={colors.textDim} autoCapitalize="characters" style={[styles.variableInput, styles.inlineInput]} />
          </View>
          <TagSuggestions variables={numericVariables} onSelect={onChangeSourceA} />
        </>
      ) : null}

      {block.role === 'coil' ? (
        <>
          <Text style={styles.sectionTitle}>Modo da bobina</Text>
          <View style={styles.optionsGrid}>
            {coilModes.map((mode) => {
              return (
                <Pressable
                  key={mode}
                  onPress={() => onChangeCoilMode(mode)}
                  style={({ pressed }) => [styles.option, block.coilMode === mode && styles.optionSelected, pressed && styles.pressed]}
                >
                  <Text style={[styles.optionText, block.coilMode === mode && styles.optionTextSelected]}>{mode}</Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}

      {block.mathMode ? (
        <>
          <Text style={styles.sectionTitle}>Operação matemática</Text>
          <View style={styles.optionsGrid}>
            {mathModes.map((mode) => (
              <Pressable
                key={mode}
                onPress={() => onChangeMathMode(mode)}
                style={({ pressed }) => [styles.option, block.mathMode === mode && styles.optionSelected, pressed && styles.pressed]}
              >
                <Text style={[styles.optionText, block.mathMode === mode && styles.optionTextSelected]}>{mode}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.inlineFields}>
            <TextInput value={block.sourceA ?? ''} onChangeText={onChangeSourceA} placeholder="A" placeholderTextColor={colors.textDim} autoCapitalize="characters" style={[styles.variableInput, styles.inlineInput]} />
            <TextInput value={block.sourceB ?? ''} onChangeText={onChangeSourceB} placeholder="B" placeholderTextColor={colors.textDim} autoCapitalize="characters" style={[styles.variableInput, styles.inlineInput]} />
          </View>
          <TextInput value={block.destination ?? ''} onChangeText={onChangeDestination} placeholder="Destino: N1" placeholderTextColor={colors.textDim} autoCapitalize="characters" style={styles.variableInput} />
          <Text style={styles.helperText}>Toque em uma tag para preencher A. Edite B/destino se precisar.</Text>
          <TagSuggestions variables={numericVariables} onSelect={onChangeSourceA} />
        </>
      ) : null}

      {block.role === 'timer' ? (
        <>
          <Text style={styles.sectionTitle}>Tipo de temporizador</Text>
          <View style={styles.optionsGrid}>
            {timerModes.map((mode) => (
              <Pressable
                key={mode}
                onPress={() => onChangeTimerMode(mode)}
                style={({ pressed }) => [styles.option, block.timerMode === mode && styles.optionSelected, pressed && styles.pressed]}
              >
                <Text style={[styles.optionText, block.timerMode === mode && styles.optionTextSelected]}>{mode}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.sectionTitle}>Tempo preset</Text>
          <TextInput
            value={String(block.presetMs ?? '')}
            onChangeText={(value) => onChangePresetMs(Number(value.replace(/\D/g, '')) || 0)}
            placeholder="Tempo em ms"
            placeholderTextColor={colors.textDim}
            keyboardType="numeric"
            style={styles.variableInput}
          />
          <View style={styles.optionsGrid}>
            {timerPresetOptions.map((preset) => (
              <Pressable
                key={preset}
                onPress={() => onChangePresetMs(preset)}
                style={({ pressed }) => [styles.option, block.presetMs === preset && styles.optionSelected, pressed && styles.pressed]}
              >
                <Text style={[styles.optionText, block.presetMs === preset && styles.optionTextSelected]}>{preset >= 1000 ? `${preset / 1000}s` : `${preset}ms`}</Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      {block.role === 'counter' ? (
        <>
          <Text style={styles.sectionTitle}>Tipo de contador</Text>
          <View style={styles.optionsGrid}>
            {counterModes.map((mode) => (
              <Pressable
                key={mode}
                onPress={() => onChangeCounterMode(mode)}
                style={({ pressed }) => [styles.option, block.counterMode === mode && styles.optionSelected, pressed && styles.pressed]}
              >
                <Text style={[styles.optionText, block.counterMode === mode && styles.optionTextSelected]}>{mode}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.sectionTitle}>Preset de contagem</Text>
          {block.counterMode === 'CTUD' ? (
            <>
              <Text style={styles.sectionTitle}>Entradas do CTUD</Text>
              <View style={styles.inlineFields}>
                <TextInput value={block.downSource ?? ''} onChangeText={onChangeDownSource} placeholder="CD: I0.1" placeholderTextColor={colors.textDim} autoCapitalize="characters" style={[styles.variableInput, styles.inlineInput]} />
                <TextInput value={block.resetSource ?? ''} onChangeText={onChangeResetSource} placeholder="RES: M0.0" placeholderTextColor={colors.textDim} autoCapitalize="characters" style={[styles.variableInput, styles.inlineInput]} />
              </View>
              <Text style={styles.helperText}>CU é a própria energia da linha. CD e RES podem ser entradas, memórias ou saídas booleanas.</Text>
              <TagSuggestions variables={booleanVariables} onSelect={onChangeDownSource} />
            </>
          ) : null}
          {block.counterMode !== 'CTUD' ? (
            <>
              <Text style={styles.sectionTitle}>Reset externo</Text>
              <TextInput value={block.resetSource ?? ''} onChangeText={onChangeResetSource} placeholder="RES: M0.0" placeholderTextColor={colors.textDim} autoCapitalize="characters" style={styles.variableInput} />
              <TagSuggestions variables={booleanVariables} onSelect={onChangeResetSource} />
            </>
          ) : null}
          <TextInput
            value={String(block.preset ?? '')}
            onChangeText={(value) => onChangePreset(Number(value.replace(/\D/g, '')) || 0)}
            placeholder="Preset"
            placeholderTextColor={colors.textDim}
            keyboardType="numeric"
            style={styles.variableInput}
          />
          <View style={styles.optionsGrid}>
            {counterPresetOptions.map((preset) => (
              <Pressable
                key={preset}
                onPress={() => onChangePreset(preset)}
                style={({ pressed }) => [styles.option, block.preset === preset && styles.optionSelected, pressed && styles.pressed]}
              >
                <Text style={[styles.optionText, block.preset === preset && styles.optionTextSelected]}>{preset}</Text>
              </Pressable>
            ))}
          </View>
        </>
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
  variableInput: {
    minHeight: 48,
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: colors.background,
    color: colors.text,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    fontWeight: '900',
  },
  helperText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: spacing.sm,
  },
  descriptionInput: {
    minHeight: 72,
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
  inlineFields: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  inlineInput: {
    flex: 1,
  },
  tagRail: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  tagChip: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.background,
  },
  tagChipText: {
    color: colors.cyan,
    fontSize: 11,
    fontWeight: '900',
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
    backgroundColor: colors.greenSoft,
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
