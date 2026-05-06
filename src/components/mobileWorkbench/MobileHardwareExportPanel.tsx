import { memo, type ReactNode, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EditorProjectState } from '../../engine/editorTypes';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { collectHardwareTags, generateHardwareExportCode, HardwareBoard, HardwareExportFormat } from '../../simulation/hardwareExport';

type Props = { editorProject: EditorProjectState };
const boards: { value: HardwareBoard; label: string }[] = [
  { value: 'esp32dev', label: 'ESP32 Dev Module' }, { value: 'esp32-wroom-32', label: 'ESP32-WROOM-32' }, { value: 'esp32-devkit-v1', label: 'ESP32 DevKit V1' },
  { value: 'esp32-s3-devkit', label: 'ESP32-S3 DevKit' }, { value: 'esp32-c3-devkit', label: 'ESP32-C3 DevKit' }, { value: 'custom', label: 'Placa própria/customizada' },
];

export const MobileHardwareExportPanel = memo(function MobileHardwareExportPanel({ editorProject }: Props) {
  const [format, setFormat] = useState<HardwareExportFormat>('esphome');
  const [board, setBoard] = useState<HardwareBoard>('esp32dev');
  const tags = useMemo(() => collectHardwareTags(editorProject), [editorProject]);
  const code = useMemo(() => generateHardwareExportCode(editorProject, format, tags, board), [editorProject, format, tags, board]);
  return <View style={styles.card}><Text style={styles.title}>Exportar para Hardware</Text><Text style={styles.description}>Gere uma base para testar esta lógica em ESPHome, Home Assistant, ESP32, Arduino, OpenPLC ou placa própria.</Text><Text style={styles.warning}>Revise GPIOs, cargas, relés, proteções, fonte, isolamento, optoacopladores e nível lógico antes de ligar hardware real.</Text><Text style={styles.warning}>Relés podem operar como active_low ou active_high. Nenhum deploy automático é executado.</Text>
    <Row title="Plataforma">{['esphome','homeAssistant','arduinoEsp32','openPlcSt','espIdf','json'].map((f)=><Action key={f} label={labelOf(f as HardwareExportFormat)} active={format===f} onPress={()=>setFormat(f as HardwareExportFormat)} />)}</Row>
    <Row title="Placa">{boards.map((b)=><Action key={b.value} label={b.label} active={board===b.value} onPress={()=>setBoard(b.value)} />)}</Row>
    <View style={styles.tableHeader}><Text style={styles.headCell}>TAG</Text><Text style={styles.headCell}>Tipo</Text><Text style={styles.headCell}>GPIO sugerido</Text><Text style={styles.headCell}>Descrição</Text></View>
    {tags.map((r)=><View key={r.tag} style={styles.row}><Text style={styles.cell}>{r.tag}</Text><Text style={styles.cell}>{r.type}</Text><Text style={styles.cell}>GPIO{r.gpio}</Text><Text style={styles.cell}>{r.description}</Text></View>)}
    <View style={styles.actions}><Action label='Gerar ESPHome' active={format==='esphome'} onPress={()=>setFormat('esphome')} /><Action label='Gerar Home Assistant' active={format==='homeAssistant'} onPress={()=>setFormat('homeAssistant')} /><Action label='Gerar Arduino ESP32' active={format==='arduinoEsp32'} onPress={()=>setFormat('arduinoEsp32')} /><Action label='Gerar OpenPLC' active={format==='openPlcSt'} onPress={()=>setFormat('openPlcSt')} /><Action label='Gerar ESP-IDF' active={format==='espIdf'} onPress={()=>setFormat('espIdf')} /><Action label='Gerar JSON' active={format==='json'} onPress={()=>setFormat('json')} /><Action label='Copiar código' active={false} onPress={() => {}} /></View>
    <View style={styles.codeBox}><Text style={styles.code}>{code}</Text></View></View>;
});

const labelOf = (f: HardwareExportFormat) => ({esphome:'ESPHome YAML',homeAssistant:'Home Assistant YAML',arduinoEsp32:'Arduino ESP32',openPlcSt:'OpenPLC ST',espIdf:'ESP-IDF',json:'JSON genérico'}[f]);
const Action = ({ label, onPress, active }: { label: string; onPress: () => void; active: boolean }) => <Pressable onPress={onPress} style={[styles.button, active && styles.buttonActive]}><Text style={[styles.buttonText, active && styles.buttonTextActive]}>{label}</Text></Pressable>;
const Row = ({ title, children }: { title: string; children: ReactNode }) => <View><Text style={styles.section}>{title}</Text><View style={styles.actions}>{children}</View></View>;

const styles = StyleSheet.create({ card: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 14, padding: spacing.sm, gap: spacing.xs }, title: { color: colors.text, fontSize: 15, fontWeight: '900' }, description: { color: colors.textMuted, fontSize: 11, fontWeight: '700' }, warning: { color: colors.amber, fontSize: 11, fontWeight: '800' }, section: { color: colors.cyan, fontSize: 11, fontWeight: '900' }, tableHeader: { flexDirection: 'row', gap: 6 }, headCell: { flex: 1, color: colors.cyan, fontSize: 10, fontWeight: '900' }, row: { flexDirection: 'row', gap: 6, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 4 }, cell: { flex: 1, color: colors.text, fontSize: 10, fontWeight: '700' }, actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, button: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 6 }, buttonActive: { borderColor: colors.cyan, backgroundColor: colors.cyanSoft }, buttonText: { color: colors.textMuted, fontSize: 10, fontWeight: '900' }, buttonTextActive: { color: colors.cyan }, codeBox: { backgroundColor: '#020817', borderRadius: 10, padding: spacing.sm, maxHeight: 220 }, code: { color: '#F8FAFC', fontSize: 10, fontFamily: 'monospace' } });
