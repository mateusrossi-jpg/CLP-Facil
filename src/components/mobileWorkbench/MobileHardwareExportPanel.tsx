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
  const [format, setFormat] = useState<HardwareExportFormat>('arduinoEsp32');
  const [board, setBoard] = useState<HardwareBoard>('esp32dev');
  const tags = useMemo(() => collectHardwareTags(editorProject), [editorProject]);
  const code = useMemo(() => generateHardwareExportCode(editorProject, format, tags, board), [editorProject, format, tags, board]);
  const copyCode = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code).catch(() => undefined);
      return;
    }
    if (typeof document === 'undefined') return;
    const hidden = document.createElement('textarea');
    hidden.value = code;
    hidden.setAttribute('readonly', 'true');
    hidden.style.position = 'fixed';
    hidden.style.opacity = '0';
    document.body.appendChild(hidden);
    hidden.select();
    try {
      document.execCommand('copy');
    } catch {
      // noop: fallback sem clipboard não pode quebrar UI
    }
    document.body.removeChild(hidden);
  };
  return <View style={styles.card}><Text style={styles.title}>Exportar para Hardware</Text><Text style={styles.description}>Gere uma base profissional para ESP32, OpenPLC e bancada maker sem cloud.</Text><Text style={styles.warning}>ATENÇÃO: Código base educacional/didático. Revise GPIOs, relés, cargas, proteção elétrica, isolamento, fonte, fail-safe e nível lógico antes de ligar hardware real.</Text><Text style={styles.warning}>Evite GPIO 0, 2, 12 e 15 em projetos iniciais. Saídas iniciam em LOW/fail-safe OFF.</Text>
    <Row title="Plataforma">{['arduinoEsp32','openPlcSt','espIdf','json'].map((f)=><Action key={f} label={labelOf(f as HardwareExportFormat)} active={format===f} onPress={()=>setFormat(f as HardwareExportFormat)} />)}</Row>
    <Row title="Placa">{boards.map((b)=><Action key={b.value} label={b.label} active={board===b.value} onPress={()=>setBoard(b.value)} />)}</Row>
    <View style={styles.tableHeader}><Text style={styles.headCell}>TAG</Text><Text style={styles.headCell}>GPIO</Text><Text style={styles.headCell}>OpenPLC</Text><Text style={styles.headCell}>Descrição</Text></View>
    {tags.length === 0 ? (
      <Text style={styles.emptyHint}>Nenhuma TAG de I/O detectada. O exportador irá gerar um template seguro de START/MOTOR.</Text>
    ) : tags.map((r)=><View key={r.tag} style={styles.row}><Text style={styles.cell}>{r.tag}</Text><Text style={styles.cell}>GPIO{r.gpio}</Text><Text style={styles.cell}>{r.scope === 'input' ? `%IX0.${tags.filter((x) => x.scope === 'input').findIndex((x) => x.tag === r.tag)}` : `%QX0.${tags.filter((x) => x.scope === 'output').findIndex((x) => x.tag === r.tag)}`}</Text><Text style={styles.cell}>{r.description}</Text></View>)}
    <View style={styles.actions}><Action label='Copiar código' active={false} onPress={copyCode} /></View>
    <View style={styles.codeBox}><Text style={styles.code}>{code}</Text></View></View>;
});

const labelOf = (f: HardwareExportFormat) => ({arduinoEsp32:'Arduino ESP32',openPlcSt:'OpenPLC ESP32',espIdf:'ESP32 Nativo / ESP-IDF',json:'JSON técnico'}[f]);
const Action = ({ label, onPress, active }: { label: string; onPress: () => void; active: boolean }) => <Pressable onPress={onPress} style={[styles.button, active && styles.buttonActive]}><Text style={[styles.buttonText, active && styles.buttonTextActive]}>{label}</Text></Pressable>;
const Row = ({ title, children }: { title: string; children: ReactNode }) => <View><Text style={styles.section}>{title}</Text><View style={styles.actions}>{children}</View></View>;

const styles = StyleSheet.create({ card: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 14, padding: spacing.sm, gap: spacing.xs }, title: { color: colors.text, fontSize: 15, fontWeight: '900' }, description: { color: colors.textMuted, fontSize: 11, fontWeight: '700' }, warning: { color: colors.amber, fontSize: 11, fontWeight: '800' }, section: { color: colors.cyan, fontSize: 11, fontWeight: '900' }, tableHeader: { flexDirection: 'row', gap: 6 }, headCell: { flex: 1, color: colors.cyan, fontSize: 10, fontWeight: '900' }, row: { flexDirection: 'row', gap: 6, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 4 }, cell: { flex: 1, color: colors.text, fontSize: 10, fontWeight: '700' }, actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, button: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 6 }, buttonActive: { borderColor: colors.cyan, backgroundColor: colors.cyanSoft }, buttonText: { color: colors.textMuted, fontSize: 10, fontWeight: '900' }, buttonTextActive: { color: colors.cyan }, codeBox: { backgroundColor: '#020817', borderRadius: 10, padding: spacing.sm, maxHeight: 220 }, code: { color: '#F8FAFC', fontSize: 10, fontFamily: 'monospace' }, emptyHint: { color: colors.textMuted, fontSize: 11, fontWeight: '700' } });
