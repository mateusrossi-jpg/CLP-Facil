import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('src/components/HardwareExportPanel.tsx');
let source = fs.readFileSync(filePath, 'utf8');
const original = source;

function ensureStepState() {
  if (!source.includes("type HardwareStep = 'board' | 'pins' | 'code';")) {
    source = source.replace("type ExportFormat = 'arduino' | 'esphome';", "type ExportFormat = 'arduino' | 'esphome';\ntype HardwareStep = 'board' | 'pins' | 'code';");
  }
  if (!source.includes("const [step, setStep] = useState<HardwareStep>('board');")) {
    source = source.replace("const [format, setFormat] = useState<ExportFormat>('arduino');", "const [format, setFormat] = useState<ExportFormat>('arduino');\n  const [step, setStep] = useState<HardwareStep>('board');");
  }
}

function insertStepTabs() {
  if (source.includes('styles.hardwareStepRow')) return;
  const badgeEnd = `        <View style={styles.badge}>
          <Text style={styles.badgeText}>BETA</Text>
        </View>
      </View>`;
  const replacement = `${badgeEnd}

      <View style={styles.hardwareStepRow}>
        {(['board', 'pins', 'code'] as HardwareStep[]).map((item) => (
          <Pressable key={item} onPress={() => setStep(item)} style={[styles.hardwareStepButton, step === item && styles.hardwareStepButtonActive]}>
            <Text style={[styles.hardwareStepText, step === item && styles.hardwareStepTextActive]}>
              {item === 'board' ? '1 Placa' : item === 'pins' ? '2 Pinos' : '3 Código'}
            </Text>
          </Pressable>
        ))}
      </View>`;
  if (!source.includes(badgeEnd)) throw new Error('Não encontrei o cabeçalho do HardwareExportPanel.');
  source = source.replace(badgeEnd, replacement);
}

function addSectionConditionMarkers() {
  if (source.includes('{step === \'board\' ? (')) return;

  const boardStart = "      <Text style={styles.sectionLabel}>Placa alvo</Text>";
  const pinsStart = "      <Text style={styles.sectionLabel}>Mapeamento de I/O</Text>";
  const formatStart = "      <Text style={styles.sectionLabel}>Formato de saída</Text>";
  const endBeforeCodeHeader = "      <View style={styles.codeHeader}>";

  const boardIndex = source.indexOf(boardStart);
  const pinsIndex = source.indexOf(pinsStart);
  const formatIndex = source.indexOf(formatStart);
  const codeIndex = source.indexOf(endBeforeCodeHeader);
  if (boardIndex < 0 || pinsIndex < 0 || formatIndex < 0 || codeIndex < 0) {
    throw new Error('Não encontrei os blocos principais para compactar o painel de hardware.');
  }

  source = `${source.slice(0, boardIndex)}      {step === 'board' ? (\n        <>\n${source.slice(boardIndex, pinsIndex)}\n          <Pressable onPress={() => setStep('pins')} style={styles.hardwarePrimaryButton}>\n            <Text style={styles.hardwarePrimaryButtonText}>Avançar para seleção de pinos</Text>\n          </Pressable>\n        </>\n      ) : null}\n\n      {step === 'pins' ? (\n        <>\n${source.slice(pinsIndex, formatIndex)}\n          <Pressable onPress={() => setStep('code')} style={styles.hardwarePrimaryButton}>\n            <Text style={styles.hardwarePrimaryButtonText}>Gerar código</Text>\n          </Pressable>\n        </>\n      ) : null}\n\n      {step === 'code' ? (\n        <>\n${source.slice(formatIndex, codeIndex)}${source.slice(codeIndex)}`;

  const closePreview = `      <ScrollView style={styles.codeBox} contentContainerStyle={styles.codeContent}>
        <Text selectable style={styles.codeText}>{generatedCode}</Text>
      </ScrollView>`;
  const closePreviewOld = `      <TextInput
        value={generatedCode}
        editable={false}
        multiline
        scrollEnabled
        style={styles.codeBox}
      />`;

  if (source.includes(closePreview)) {
    source = source.replace(closePreview, `${closePreview}\n        </>\n      ) : null}`);
  } else if (source.includes(closePreviewOld)) {
    source = source.replace(closePreviewOld, `${closePreviewOld}\n        </>\n      ) : null}`);
  } else {
    throw new Error('Não encontrei o preview final de código para fechar a etapa Código.');
  }
}

function addStyles() {
  if (source.includes('hardwareStepRow:')) return;
  const insertAt = source.lastIndexOf('\n});');
  if (insertAt < 0) throw new Error('Não encontrei o fechamento do StyleSheet.');
  const styles = `
  hardwareStepRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    backgroundColor: colors.backgroundSoft,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.xs,
  },
  hardwareStepButton: {
    flex: 1,
    minWidth: 86,
    borderRadius: 10,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  hardwareStepButtonActive: {
    backgroundColor: colors.surface,
    borderColor: colors.cyan,
    borderWidth: 1,
  },
  hardwareStepText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
  },
  hardwareStepTextActive: {
    color: colors.cyan,
  },
  hardwarePrimaryButton: {
    borderColor: colors.green,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: spacing.md,
    backgroundColor: colors.greenSoft,
    alignItems: 'center',
  },
  hardwarePrimaryButtonText: {
    color: colors.green,
    fontSize: 13,
    fontWeight: '900',
  },`;
  source = `${source.slice(0, insertAt)}${styles}${source.slice(insertAt)}`;
}

ensureStepState();
insertStepTabs();
addSectionConditionMarkers();
addStyles();

if (source !== original) {
  fs.writeFileSync(filePath, source);
  console.log('HardwareExportPanel compactado em etapas: Placa, Pinos e Código.');
} else {
  console.log('Nenhuma alteração necessária.');
}
