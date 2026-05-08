import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PlcState } from '../../ladder/types';

export function IOPanel({ open, toggleOpen, state, toggleInput }: { open: boolean; toggleOpen: () => void; state: PlcState; toggleInput: (a: string) => void }) {
  return <View style={styles.wrap}><Pressable onPress={toggleOpen}><Text style={styles.title}>I/O {open ? '▾' : '▴'}</Text></Pressable>{open && <View><Text style={styles.sec}>Entradas</Text>{['I0.0','I0.1','I0.2','I0.3'].map((a)=><Pressable key={a} onPress={()=>toggleInput(a)}><Text style={styles.row}>{a}: {Boolean(state[a]) ? 'ON':'OFF'}</Text></Pressable>)}<Text style={styles.sec}>Saídas</Text>{['Q0.0','Q0.1','M0.0'].map((a)=><Text key={a} style={styles.row}>{a}: {Boolean(state[a]) ? 'ON':'OFF'}</Text>)}</View>}</View>;
}
const styles = StyleSheet.create({ wrap:{backgroundColor:'#0b1220',borderTopWidth:1,borderColor:'#1f2937',padding:10}, title:{color:'#cbd5e1',fontWeight:'700'}, sec:{color:'#94a3b8',marginTop:6}, row:{color:'#e2e8f0',paddingVertical:2} });
