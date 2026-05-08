import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LadderBlock as Block } from '../../ladder/types';

export function LadderBlock({ block, selected, energized, onPress }: { block: Block; selected?: boolean; energized?: boolean; onPress: () => void }) {
  const isCoil = block.type === 'COIL';
  return (
    <Pressable onPress={onPress} style={[styles.block, isCoil && styles.coil, selected && styles.sel, energized && styles.on]}>
      <Text style={[styles.type, energized && styles.textOn]}>{block.type}</Text>
      <Text style={[styles.addr, energized && styles.textOn]}>{block.address}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  block: { minWidth: 76, padding: 8, borderWidth: 1, borderColor: '#6b7280', borderRadius: 8, backgroundColor: '#111827', marginHorizontal: 6 },
  coil: { borderStyle: 'dashed' },
  sel: { borderColor: '#22c55e', shadowColor: '#22c55e', shadowOpacity: 0.4, shadowRadius: 8 },
  on: { borderColor: '#22c55e' },
  type: { color: '#cbd5e1', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  addr: { color: '#94a3b8', fontSize: 11, textAlign: 'center', marginTop: 2 },
  textOn: { color: '#4ade80' },
});
