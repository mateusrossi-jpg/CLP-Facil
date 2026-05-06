import { memo, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EditorProjectState } from '../../engine/editorTypes';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { collectHardwareTags, generateHardwareExportCode, HardwareExportFormat } from '../../simulation/hardwareExport';

type Props = { editorProject: EditorProjectState };

export const MobileHardwareExportPanel = memo(function MobileHardwareExportPanel({ editorProject }: Props) {
  const [format, setFormat] = useState<HardwareExportFormat>('esphome');
  const tags = useMemo(() => collectHardwareTags(editorProject), [editorProject]);
  const code = useMemo(() => generateHardwareExportCode(editorProject, format, tags), [editorProject, format, tags]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Exportar para Hardware</Text>
      <Text style={styles.description}>Gere uma base para testar esta lógica em ESPHome, Home Assistant, ESP32 ou Arduino.</Text>
      <Text style={styles.warning}>Revise GPIOs, cargas, relés, proteções e isolamento antes de ligar hardware real.</Text>

      <View style={styles.tableHeader}>
        <Text style={styles.headCell}>TAG</Text><Text style={styles.headCell}>Tipo</Text><Text style={styles.headCell}>GPIO sugerido</Text><Text style={styles.headCell}>Descrição</Text>
      </View>
      {tags.length === 0 ? <Text style={styles.empty}>Nenhuma lógica criada ainda</Text> : tags.map((row) => (
        <View key={row.tag} style={styles.row}>
          <Text style={styles.cell}>{row.tag}</Text><Text style={styles.cell}>{row.type}</Text><Text style={styles.cell}>GPIO{row.gpio}</Text><Text style={styles.cell}>{row.description}</Text>
        </View>
      ))}

      <View style={styles.actions}>
        <Action label="Gerar ESPHome" active={format === 'esphome'} onPress={() => setFormat('esphome')} />
        <Action label="Gerar Home Assistant" active={format === 'homeAssistant'} onPress={() => setFormat('homeAssistant')} />
        <Action label="Gerar Arduino ESP32" active={format === 'arduinoEsp32'} onPress={() => setFormat('arduinoEsp32')} />
        <Action label="Gerar JSON" active={format === 'json'} onPress={() => setFormat('json')} />
        <Action label="Copiar código" active={false} onPress={() => {}} />
      </View>

      <View style={styles.codeBox}><Text style={styles.code}>{code}</Text></View>
    </View>
  );
});

function Action({ label, onPress, active }: { label: string; onPress: () => void; active: boolean }) {
  return <Pressable onPress={onPress} style={[styles.button, active && styles.buttonActive]}><Text style={[styles.buttonText, active && styles.buttonTextActive]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({ card: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 14, padding: spacing.sm, gap: spacing.xs }, title: { color: colors.text, fontSize: 15, fontWeight: '900' }, description: { color: colors.textMuted, fontSize: 11, fontWeight: '700' }, warning: { color: colors.amber, fontSize: 11, fontWeight: '800' }, tableHeader: { flexDirection: 'row', gap: 6 }, headCell: { flex: 1, color: colors.cyan, fontSize: 10, fontWeight: '900' }, row: { flexDirection: 'row', gap: 6, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 4 }, cell: { flex: 1, color: colors.text, fontSize: 10, fontWeight: '700' }, empty: { color: colors.textMuted, fontSize: 11, fontWeight: '800' }, actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, button: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 6 }, buttonActive: { borderColor: colors.cyan, backgroundColor: colors.cyanSoft }, buttonText: { color: colors.textMuted, fontSize: 10, fontWeight: '900' }, buttonTextActive: { color: colors.cyan }, codeBox: { backgroundColor: '#020817', borderRadius: 10, padding: spacing.sm, maxHeight: 220 }, code: { color: '#F8FAFC', fontSize: 10, fontFamily: 'monospace' } });
