import { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ComponentDrawer } from '../components/ladder/ComponentDrawer';
import { FloatingBlockToolbar } from '../components/ladder/FloatingBlockToolbar';
import { IOPanel } from '../components/ladder/IOPanel';
import { LadderBlock } from '../components/ladder/LadderBlock';
import { evaluateRungs } from '../ladder/evaluator';
import { LadderRung, PlcState, SelectedBlock, BlockType } from '../ladder/types';

const id = () => Math.random().toString(36).slice(2, 9);

const initialRungs = (): LadderRung[] => [
  { id: 'r1', series: [{ id: 'b1', type: 'NO', address: 'I0.0' }, { id: 'b2', type: 'NC', address: 'I0.1' }], coil: { id: 'c1', type: 'COIL', address: 'Q0.0' } },
  { id: 'r2', series: [{ id: 'b3', type: 'NO', address: 'I0.2' }], coil: { id: 'c2', type: 'COIL', address: 'Q0.1' } },
];

export function LadderSimulatorScreen() {
  const [rungs, setRungs] = useState(initialRungs);
  const [state, setState] = useState<PlcState>({ 'I0.0': false, 'I0.1': false, 'I0.2': false, 'I0.3': false, 'Q0.0': false, 'Q0.1': false, 'M0.0': false });
  const [sim, setSim] = useState(false);
  const [selected, setSelected] = useState<SelectedBlock>(null);
  const [drawer, setDrawer] = useState(false);
  const [insertType, setInsertType] = useState<BlockType | null>(null);
  const [ioOpen, setIoOpen] = useState(true);

  const evalRes = useMemo(() => evaluateRungs(rungs, state), [rungs, state]);
  if (sim && evalRes.next !== state) setState(evalRes.next);

  const mutate = (fn: (draft: LadderRung[]) => void) => setRungs((prev) => { const n = JSON.parse(JSON.stringify(prev)); fn(n); return n; });

  const addAtEnd = (rungId: string) => { if (!insertType) return; mutate((d) => { const r = d.find((x) => x.id === rungId); if (!r) return; if (insertType === 'COIL') r.coil = { id: id(), type: 'COIL', address: 'Q0.0' }; else r.series.push({ id: id(), type: insertType, address: 'I0.0' }); }); setInsertType(null); };

  return <SafeAreaView style={s.root}><View style={s.top}><Text style={s.title}>CLP Fácil</Text><View style={s.topBtns}><Pressable style={s.btn} onPress={() => setSim((v) => !v)}><Text style={s.btnt}>{sim ? 'Parar' : 'Simular'}</Text></Pressable><Pressable style={s.btn} onPress={() => mutate((d)=>d.push({id:id(),series:[],coil:{id:id(),type:'COIL',address:'Q0.0'}}))}><Text style={s.btnt}>Novo</Text></Pressable><Pressable style={s.btn} onPress={() => setDrawer((v) => !v)}><Text style={s.btnt}>Componentes</Text></Pressable></View></View>

  <ScrollView horizontal style={s.canvas}><View style={s.rails} />
  {rungs.map((r) => <View key={r.id} style={[s.rung, evalRes.rungPower[r.id] && s.rungOn]}><View style={s.line} />{r.series.map((b)=> <LadderBlock key={b.id} block={b} energized={evalRes.energized[b.id]} selected={selected?.blockId===b.id} onPress={()=>setSelected({rungId:r.id,lane:'series',blockId:b.id})} />)}{r.parallel?.length ? <View style={s.parallel}>{r.parallel.map((b)=><LadderBlock key={b.id} block={b} energized={evalRes.energized[b.id]} selected={selected?.blockId===b.id} onPress={()=>setSelected({rungId:r.id,lane:'parallel',blockId:b.id})}/>)}</View>:null}{r.coil ? <LadderBlock block={r.coil} energized={evalRes.energized[r.coil.id]} selected={selected?.blockId===r.coil.id} onPress={()=>setSelected({rungId:r.id,lane:'coil',blockId:r.coil!.id})} />:null}
  {insertType && !sim ? <Pressable style={s.zone} onPress={() => addAtEnd(r.id)}><Text style={s.zoneT}>+</Text></Pressable> : null}
  </View>)}</ScrollView>

  {!sim && selected ? <FloatingBlockToolbar onToggle={() => mutate((d)=>{const r=d.find((x)=>x.id===selected.rungId); const a=selected.lane==='parallel'?r?.parallel:r?.series; const b=a?.find((x)=>x.id===selected.blockId); if(b&&(b.type==='NO'||b.type==='NC')) b.type=b.type==='NO'?'NC':'NO';})} onDup={() => mutate((d)=>{const r=d.find((x)=>x.id===selected.rungId); const a=selected.lane==='parallel'?r?.parallel:r?.series; const i=a?.findIndex((x)=>x.id===selected.blockId)??-1; if(a&&i>=0)a.splice(i+1,0,{...a[i],id:id()});})} onParallel={() => mutate((d)=>{const r=d.find((x)=>x.id===selected.rungId); const b=r?.series.find((x)=>x.id===selected.blockId); if(r&&b) r.parallel=[{...b,id:id()}];})} onDel={() => mutate((d)=>{const r=d.find((x)=>x.id===selected.rungId); if(!r)return; if(selected.lane==='coil') r.coil=undefined; else {const key=selected.lane==='series'?'series':'parallel'; r[key]=(r[key]||[]).filter((x)=>x.id!==selected.blockId);} })} />:null}

  <Pressable style={s.fab} onPress={() => setDrawer((v) => !v)}><Text style={s.fabT}>+</Text></Pressable>
  <ComponentDrawer visible={drawer && !sim} onPick={(t) => { setInsertType(t); setDrawer(false); }} />
  <IOPanel open={ioOpen} toggleOpen={() => setIoOpen((v) => !v)} state={state} toggleInput={(a) => sim && setState((p) => ({ ...p, [a]: !Boolean(p[a]) }))} />
  </SafeAreaView>;
}

const s = StyleSheet.create({ root:{flex:1,backgroundColor:'#0a0f1a'}, top:{padding:12,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}, title:{color:'#f8fafc',fontSize:18,fontWeight:'800'}, topBtns:{flexDirection:'row',gap:8}, btn:{backgroundColor:'#111827',paddingHorizontal:10,paddingVertical:7,borderRadius:8,borderWidth:1,borderColor:'#1f2937'}, btnt:{color:'#cbd5e1',fontSize:12}, canvas:{flex:1}, rails:{position:'absolute',left:20,top:10,bottom:10,width:2,backgroundColor:'#e5e7eb'}, rung:{minHeight:94,marginVertical:8,marginLeft:34,marginRight:12,borderBottomWidth:1,borderColor:'#1f2937',paddingVertical:14,paddingRight:20,flexDirection:'row',alignItems:'center'}, line:{position:'absolute',left:0,right:20,height:2,backgroundColor:'#6b7280'}, rungOn:{shadowColor:'#22c55e',shadowOpacity:0.25,shadowRadius:8}, parallel:{position:'absolute',left:140,top:8,flexDirection:'row'}, zone:{marginLeft:8,borderWidth:1,borderColor:'#22c55e',borderRadius:8,paddingHorizontal:10,paddingVertical:6,backgroundColor:'#052e16'}, zoneT:{color:'#4ade80',fontWeight:'800'}, fab:{position:'absolute',right:16,bottom:94,width:48,height:48,borderRadius:24,backgroundColor:'#15803d',alignItems:'center',justifyContent:'center'}, fabT:{color:'#fff',fontSize:28,lineHeight:30} });
