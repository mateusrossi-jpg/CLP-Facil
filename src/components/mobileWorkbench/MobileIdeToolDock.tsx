import { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

type MobileIdeToolDockProps = {
  mode?: 'edit' | 'simulate';
  onAddContact?: () => void;
  onAddCoil?: () => void;
  onAddTimer?: () => void;
  onAddCounter?: () => void;
  onAddBranch?: () => void;
  onRemoveBlock?: () => void;
  onRemoveRung?: () => void;
};

type ToolItem = {
  id: string;
  label: string;
  symbol: string;
  hint: string;
  danger?: boolean;
  onPress?: () => void;
};

function ToolButton({ item, disabled }: { item: ToolItem; disabled: boolean }) {
  return (
    <Pressable
      disabled={disabled || !item.onPress}
      onPress={item.onPress}
      style={({ pressed }) => [
        styles.toolButton,
        item.danger && styles.toolButtonDanger,
        disabled && styles.toolButtonDisabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[styles.symbol, item.danger && styles.symbolDanger]}>{item.symbol}</Text>
      <Text style={[styles.label, item.danger && styles.labelDanger]}>{item.label}</Text>
      <Text style={styles.hint}>{item.hint}</Text>
    </Pressable>
  );
}

export const MobileIdeToolDock = memo(function MobileIdeToolDock({
  mode = 'simulate',
  onAddContact,
  onAddCoil,
  onAddTimer,
  onAddCounter,
  onAddBranch,
  onRemoveBlock,
  onRemoveRung,
}: MobileIdeToolDockProps) {
  const editMode = mode === 'edit';
  const tools: ToolItem[] = [
    { id: 'contact', label: 'Contato', symbol: '| |', hint: 'serie', onPress: onAddContact },
    { id: 'coil', label: 'Bobina', symbol: '( )', hint: 'saida', onPress: onAddCoil },
    { id: 'timer', label: 'Timer', symbol: 'TON', hint: 'tempo', onPress: onAddTimer },
    { id: 'counter', label: 'Counter', symbol: 'CTU', hint: 'conta', onPress: onAddCounter },
    { id: 'branch', label: 'Branch', symbol: 'BR', hint: 'paralelo', onPress: onAddBranch },
    { id: 'delete-block', label: 'Bloco', symbol: 'DEL', hint: 'apagar', danger: true, onPress: onRemoveBlock },
    { id: 'delete-rung', label: 'Rung', symbol: 'X', hint: 'remover', danger: true, onPress: onRemoveRung },
  ];

  return (
    <View style={[styles.dock, editMode && styles.dockEdit]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>IDE PLC</Text>
          <Text style={styles.title}>Ferramentas rápidas</Text>
        </View>
        <View style={[styles.modePill, editMode && styles.modePillEdit]}>
          <Text style={[styles.modeText, editMode && styles.modeTextEdit]}>{editMode ? 'EDITAR' : 'TESTAR'}</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
        {tools.map((item) => (
          <ToolButton key={item.id} item={item} disabled={!editMode || !item.onPress} />
        ))}
      </ScrollView>

      {!editMode ? (
        <Text style={styles.footerHint}>Toque em EDITAR para liberar as peças do Ladder.</Text>
      ) : (
        <Text style={styles.footerHint}>Toque em uma peça para inserir na rung selecionada.</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  dock: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
  },
  dockEdit: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  eyebrow: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },
  modePill: {
    borderWidth: 1,
    borderColor: colors.green,
    borderRadius: 999,
    backgroundColor: colors.greenSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  modePillEdit: {
    borderColor: colors.amber,
    backgroundColor: colors.surface,
  },
  modeText: {
    color: colors.green,
    fontSize: 10,
    fontWeight: '900',
  },
  modeTextEdit: {
    color: colors.amber,
  },
  rail: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingRight: spacing.xs,
  },
  toolButton: {
    width: 86,
    minHeight: 82,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
    gap: 3,
  },
  toolButtonDanger: {
    borderColor: colors.red,
  },
  toolButtonDisabled: {
    opacity: 0.42,
  },
  symbol: {
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 18,
    fontWeight: '900',
  },
  symbolDanger: {
    color: colors.red,
  },
  label: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
  },
  labelDanger: {
    color: colors.red,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
  },
  footerHint: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.72,
  },
});
