import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BoardPinDiagram } from './BoardPinDiagram';
import { BoardPin, getSelectablePins, GpioUseScope, BoardGpioCatalog } from '../hardware/gpioCatalog';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type GpioPinPickerProps = {
  catalog: BoardGpioCatalog;
  variable: string;
  label: string;
  scope: GpioUseScope;
  selectedPin?: string;
  onSelectPin: (pin: BoardPin) => void;
};

function pinSubtitle(pin: BoardPin) {
  if (pin.note) return pin.note;
  if (pin.recommendedFor?.length) return `Recomendado para ${pin.recommendedFor.join(' e ')}`;
  return pin.capabilities.length > 0 ? pin.capabilities.join(' / ') : 'Evitar';
}

export function GpioPinPicker({ catalog, variable, label, scope, selectedPin, onSelectPin }: GpioPinPickerProps) {
  const selectablePins = getSelectablePins(catalog, scope);
  const recommendedPins = selectablePins.filter((pin) => pin.risk === 'recommended' && pin.recommendedFor?.includes(scope));
  const cautionPins = selectablePins.filter((pin) => pin.risk !== 'recommended' || !pin.recommendedFor?.includes(scope));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Selecionar pino</Text>
          <Text style={styles.title}>{variable} · {label}</Text>
          <Text style={styles.subtitle}>{scope === 'input' ? 'Entrada Ladder' : 'Saída Ladder'} na placa {catalog.label}</Text>
        </View>
        <Text style={styles.selectedBadge}>{selectedPin ? `GPIO ${selectedPin}` : 'SEM PINO'}</Text>
      </View>

      <BoardPinDiagram catalog={catalog} selectedPin={selectedPin} scope={scope} onSelectPin={onSelectPin} />

      <Text style={styles.sectionTitle}>Pinos recomendados</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pinChipRow}>
        {recommendedPins.map((pin) => (
          <Pressable key={pin.id} onPress={() => onSelectPin(pin)} style={[styles.pinChip, selectedPin === pin.gpio && styles.pinChipSelected]}>
            <Text style={[styles.pinChipTitle, selectedPin === pin.gpio && styles.pinChipTitleSelected]}>{pin.label}</Text>
            <Text style={styles.pinChipSubtitle}>{pinSubtitle(pin)}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {cautionPins.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Usar com atenção</Text>
          <View style={styles.cautionList}>
            {cautionPins.map((pin) => (
              <Pressable key={pin.id} onPress={() => onSelectPin(pin)} style={[styles.cautionRow, selectedPin === pin.gpio && styles.cautionRowSelected]}>
                <View style={styles.cautionInfo}>
                  <Text style={[styles.cautionTitle, selectedPin === pin.gpio && styles.cautionTitleSelected]}>{pin.label}</Text>
                  <Text style={styles.cautionText}>{pinSubtitle(pin)}</Text>
                </View>
                <Text style={styles.cautionBadge}>{pin.risk === 'caution' ? 'ATENÇÃO' : 'OK'}</Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 2,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  selectedBadge: {
    color: colors.cyan,
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: colors.cyanSoft,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    fontSize: 10,
    fontWeight: '900',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  pinChipRow: {
    gap: spacing.sm,
    paddingBottom: 2,
  },
  pinChip: {
    minWidth: 106,
    borderColor: colors.green,
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: colors.greenSoft,
    padding: spacing.sm,
  },
  pinChipSelected: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
    borderWidth: 2,
  },
  pinChipTitle: {
    color: colors.green,
    fontSize: 13,
    fontWeight: '900',
  },
  pinChipTitleSelected: {
    color: colors.cyan,
  },
  pinChipSubtitle: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },
  cautionList: {
    gap: spacing.xs,
  },
  cautionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.sm,
  },
  cautionRowSelected: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  cautionInfo: {
    flex: 1,
    minWidth: 0,
  },
  cautionTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  cautionTitleSelected: {
    color: colors.cyan,
  },
  cautionText: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },
  cautionBadge: {
    color: colors.amber,
    fontSize: 9,
    fontWeight: '900',
  },
});
