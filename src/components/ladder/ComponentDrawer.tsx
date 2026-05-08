import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BlockType } from '../../ladder/types';

export function ComponentDrawer({ visible, onPick }: { visible: boolean; onPick: (t: BlockType) => void }) {
  if (!visible) return null;
  return <View style={styles.drawer}>{['NO', 'NC', 'COIL'].map((t) => <Pressable key={t} onPress={() => onPick(t as BlockType)} style={styles.item}><Text style={styles.txt}>{t}</Text></Pressable>)}</View>;
}
const styles = StyleSheet.create({ drawer: { position: 'absolute', right: 16, bottom: 80, backgroundColor: '#0f172a', borderRadius: 12, borderWidth: 1, borderColor: '#1f2937' }, item: { padding: 12 }, txt: { color: '#e2e8f0', fontWeight: '700' } });
