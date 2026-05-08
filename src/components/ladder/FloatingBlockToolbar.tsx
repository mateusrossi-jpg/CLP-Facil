import { Pressable, StyleSheet, Text, View } from 'react-native';

export function FloatingBlockToolbar({ onToggle, onDup, onParallel, onDel }: { onToggle: () => void; onDup: () => void; onParallel: () => void; onDel: () => void }) {
  const Btn = ({ t, fn }: { t: string; fn: () => void }) => <Pressable style={styles.btn} onPress={fn}><Text style={styles.txt}>{t}</Text></Pressable>;
  return <View style={styles.wrap}><Btn t='NA/NF' fn={onToggle} /><Btn t='DUP' fn={onDup} /><Btn t='RAMO' fn={onParallel} /><Btn t='DEL' fn={onDel} /></View>;
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', bottom: 120, alignSelf: 'center', flexDirection: 'row', backgroundColor: '#0b1220ee', borderWidth: 1, borderColor: '#1f2937', borderRadius: 999, padding: 6, gap: 6 },
  btn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#111827' },
  txt: { color: '#d1d5db', fontSize: 11, fontWeight: '700' },
});
