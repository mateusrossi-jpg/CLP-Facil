import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BoardGpioCatalog, BoardPin, GpioUseScope } from '../hardware/gpioCatalog';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type BoardPinDiagramProps = {
  catalog: BoardGpioCatalog;
  selectedPin?: string;
  scope?: GpioUseScope;
  onSelectPin?: (pin: BoardPin) => void;
};

function normalize(value: string | undefined): string {
  return (value ?? '').trim().toUpperCase().replace(/^GPIO/, '');
}

function pinTone(pin: BoardPin, scope?: GpioUseScope) {
  if (pin.risk === 'blocked' || pin.reserved) return 'blocked';
  if (scope && !pin.capabilities.includes(scope)) return 'blocked';
  if (pin.risk === 'caution' || pin.bootSensitive || pin.serialPin) return 'caution';
  if (scope && pin.recommendedFor?.includes(scope)) return 'recommended';
  return 'neutral';
}

function PinButton({
  pin,
  selected,
  scope,
  onSelect,
}: {
  pin: BoardPin;
  selected: boolean;
  scope?: GpioUseScope;
  onSelect?: (pin: BoardPin) => void;
}) {
  const tone = pinTone(pin, scope);
  const disabled = tone === 'blocked';
  return (
    <Pressable
      onPress={() => !disabled && onSelect?.(pin)}
      style={({ pressed }) => [
        styles.pinButton,
        tone === 'recommended' && styles.pinRecommended,
        tone === 'caution' && styles.pinCaution,
        tone === 'blocked' && styles.pinBlocked,
        selected && styles.pinSelected,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[styles.pinLabel, selected && styles.pinLabelSelected, disabled && styles.pinLabelBlocked]}>{pin.label}</Text>
      <Text style={[styles.pinMeta, selected && styles.pinLabelSelected]}>{pin.recommendedFor?.join('/') || pin.capabilities.join('/') || 'evitar'}</Text>
    </Pressable>
  );
}

export function BoardPinDiagram({ catalog, selectedPin, scope, onSelectPin }: BoardPinDiagramProps) {
  const leftPins = [...catalog.pins].filter((pin) => pin.side === 'left').sort((a, b) => a.order - b.order);
  const rightPins = [...catalog.pins].filter((pin) => pin.side === 'right').sort((a, b) => a.order - b.order);
  const selectedNormalized = normalize(selectedPin);

  return (
    <View style={styles.container}>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}><View style={[styles.legendDot, styles.legendRecommended]} /><Text style={styles.legendText}>recomendado</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, styles.legendCaution]} /><Text style={styles.legendText}>atenção</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, styles.legendBlocked]} /><Text style={styles.legendText}>bloqueado</Text></View>
      </View>

      <View style={styles.boardRow}>
        <View style={styles.pinColumn}>
          {leftPins.map((pin) => (
            <PinButton
              key={pin.id}
              pin={pin}
              selected={normalize(pin.gpio) === selectedNormalized || normalize(pin.label) === selectedNormalized}
              scope={scope}
              onSelect={onSelectPin}
            />
          ))}
        </View>

        <View style={styles.boardBody}>
          <Text style={styles.boardTitle}>{catalog.chipLabel}</Text>
          <Text style={styles.boardSubtitle}>{catalog.label}</Text>
          <View style={styles.usbPort}>
            <Text style={styles.usbText}>USB</Text>
          </View>
          <Text style={styles.boardHint}>Toque em um pino válido para vincular ao I/O selecionado.</Text>
        </View>

        <View style={styles.pinColumn}>
          {rightPins.map((pin) => (
            <PinButton
              key={pin.id}
              pin={pin}
              selected={normalize(pin.gpio) === selectedNormalized || normalize(pin.label) === selectedNormalized}
              scope={scope}
              onSelect={onSelectPin}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    gap: spacing.sm,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
  },
  legendRecommended: { backgroundColor: colors.green },
  legendCaution: { backgroundColor: colors.amber },
  legendBlocked: { backgroundColor: colors.red },
  legendText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
  },
  boardRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
  },
  pinColumn: {
    flex: 1,
    gap: 4,
  },
  boardBody: {
    width: 116,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 18,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    gap: spacing.sm,
    minHeight: 250,
  },
  boardTitle: {
    color: colors.text,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
  },
  boardSubtitle: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
    fontWeight: '800',
  },
  usbPort: {
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    backgroundColor: colors.cyanSoft,
  },
  usbText: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
  },
  boardHint: {
    color: colors.inactive,
    fontSize: 9,
    lineHeight: 13,
    textAlign: 'center',
    fontWeight: '700',
  },
  pinButton: {
    minHeight: 37,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    justifyContent: 'center',
  },
  pinRecommended: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  pinCaution: {
    borderColor: colors.amber,
    backgroundColor: colors.goldSoft,
  },
  pinBlocked: {
    borderColor: colors.red,
    backgroundColor: colors.redSoft,
    opacity: 0.72,
  },
  pinSelected: {
    borderColor: colors.cyan,
    borderWidth: 2,
    backgroundColor: colors.cyanSoft,
  },
  pinLabel: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
  },
  pinLabelSelected: {
    color: colors.cyan,
  },
  pinLabelBlocked: {
    color: colors.red,
  },
  pinMeta: {
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '700',
    marginTop: 1,
  },
  pressed: {
    opacity: 0.72,
  },
});
