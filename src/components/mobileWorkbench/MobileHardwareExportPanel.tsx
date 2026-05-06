import { memo, type ReactNode, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EditorProjectState } from '../../engine/editorTypes';
import { collectHardwareTags, generateHardwareExportCode, HardwareBoard, HardwareExportFormat } from '../../simulation/hardwareExport';
import { spacing } from '../../theme/spacing';
import { useAppTheme } from '../../theme/theme';

type Props = { editorProject: EditorProjectState };

const boards: { value: HardwareBoard; label: string }[] = [
  { value: 'esp32dev', label: 'ESP32 Dev Module' },
  { value: 'esp32-wroom-32', label: 'ESP32-WROOM-32' },
  { value: 'esp32-devkit-v1', label: 'ESP32 DevKit V1' },
  { value: 'esp32-s3-devkit', label: 'ESP32-S3 DevKit' },
  { value: 'esp32-c3-devkit', label: 'ESP32-C3 DevKit' },
  { value: 'custom', label: 'Placa própria/customizada' },
];

const formats: HardwareExportFormat[] = ['arduinoEsp32', 'openPlcSt', 'espIdf', 'json'];

export const MobileHardwareExportPanel = memo(function MobileHardwareExportPanel({ editorProject }: Props) {
  const [format, setFormat] = useState<HardwareExportFormat>('arduinoEsp32');
  const [board, setBoard] = useState<HardwareBoard>('esp32dev');
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme.colors), [theme.colors]);
  const tags = useMemo(() => collectHardwareTags(editorProject), [editorProject]);
  const code = useMemo(() => generateHardwareExportCode(editorProject, format, tags, board), [editorProject, format, tags, board]);
  const inputTags = useMemo(() => tags.filter((tag) => tag.scope === 'input'), [tags]);
  const outputTags = useMemo(() => tags.filter((tag) => tag.scope === 'output'), [tags]);

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

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Exportar para Hardware</Text>
      <Text style={styles.description}>Gere uma base profissional para ESP32, OpenPLC e bancada maker sem cloud.</Text>
      <Text style={styles.warning}>ATENÇÃO: Código base educacional/didático. Revise GPIOs, relés, cargas, proteção elétrica, isolamento, fonte, fail-safe e nível lógico antes de ligar hardware real.</Text>

      <Row styles={styles} title="Plataforma">
        {formats.map((item) => (
          <Action key={item} styles={styles} label={labelOf(item)} active={format === item} onPress={() => setFormat(item)} />
        ))}
      </Row>
      <Row styles={styles} title="Placa">
        {boards.map((item) => (
          <Action key={item.value} styles={styles} label={item.label} active={board === item.value} onPress={() => setBoard(item.value)} />
        ))}
      </Row>

      <View style={styles.tableHeader}>
        <Text style={styles.headCell}>TAG</Text>
        <Text style={styles.headCell}>GPIO</Text>
        <Text style={styles.headCell}>OpenPLC</Text>
        <Text style={styles.headCell}>Descrição</Text>
      </View>

      {tags.length === 0 ? (
        <Text style={styles.emptyHint}>Nenhuma TAG de I/O detectada. O exportador irá gerar um template seguro de START/MOTOR.</Text>
      ) : tags.map((row) => {
        const address = row.scope === 'input'
          ? `%IX0.${inputTags.findIndex((item) => item.tag === row.tag)}`
          : `%QX0.${outputTags.findIndex((item) => item.tag === row.tag)}`;
        return (
          <View key={row.tag} style={styles.row}>
            <Text style={styles.cell}>{row.tag}</Text>
            <Text style={styles.cell}>GPIO{row.gpio}</Text>
            <Text style={styles.cell}>{address}</Text>
            <Text style={styles.cell}>{row.description}</Text>
          </View>
        );
      })}

      <View style={styles.actions}>
        <Action styles={styles} label="Copiar código" active={false} onPress={copyCode} />
      </View>
      <View style={styles.codeBox}>
        <Text style={styles.code}>{code}</Text>
      </View>
    </View>
  );
});

const labelOf = (format: HardwareExportFormat) => ({
  arduinoEsp32: 'Arduino ESP32',
  openPlcSt: 'OpenPLC ESP32',
  espIdf: 'ESP32 Nativo / ESP-IDF',
  json: 'JSON técnico',
}[format]);

type Styles = ReturnType<typeof createStyles>;

function Action({ label, onPress, active, styles }: { label: string; onPress: () => void; active: boolean; styles: Styles }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.button, active && styles.buttonActive, pressed && styles.pressed]}>
      <Text style={[styles.buttonText, active && styles.buttonTextActive]}>{label}</Text>
    </Pressable>
  );
}

function Row({ title, children, styles }: { title: string; children: ReactNode; styles: Styles }) {
  return (
    <View>
      <Text style={styles.section}>{title}</Text>
      <View style={styles.actions}>{children}</View>
    </View>
  );
}

function createStyles(c: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    card: { borderWidth: 1, borderColor: c.border, backgroundColor: c.surface, borderRadius: 14, padding: spacing.sm, gap: spacing.xs },
    title: { color: c.text, fontSize: 15, fontWeight: '900' },
    description: { color: c.textMuted, fontSize: 11, fontWeight: '700' },
    warning: { color: c.amber, fontSize: 11, fontWeight: '800' },
    section: { color: c.cyan, fontSize: 11, fontWeight: '900', marginBottom: 5 },
    tableHeader: { flexDirection: 'row', gap: 6 },
    headCell: { flex: 1, color: c.cyan, fontSize: 10, fontWeight: '900' },
    row: { flexDirection: 'row', gap: 6, borderTopWidth: 1, borderTopColor: c.border, paddingTop: 4 },
    cell: { flex: 1, color: c.text, fontSize: 10, fontWeight: '700' },
    actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    button: { borderWidth: 1, borderColor: c.border, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 6 },
    buttonActive: { borderColor: c.cyan, backgroundColor: c.cyanSoft },
    buttonText: { color: c.textMuted, fontSize: 10, fontWeight: '900' },
    buttonTextActive: { color: c.cyan },
    codeBox: { backgroundColor: '#020817', borderRadius: 10, padding: spacing.sm, maxHeight: 220 },
    code: { color: '#F8FAFC', fontSize: 10, fontFamily: 'monospace' },
    emptyHint: { color: c.textMuted, fontSize: 11, fontWeight: '700' },
    pressed: { opacity: 0.75 },
  });
}
