import fs from 'node:fs';
import path from 'node:path';

function replaceOnce(source, from, to, label) {
  if (!source.includes(from)) {
    console.warn(`Não encontrei: ${label}`);
    return source;
  }
  console.log(`Aplicado: ${label}`);
  return source.replace(from, to);
}

function insertBeforeLastStyleEnd(source, styleName, styleBlock) {
  if (source.includes(`${styleName}: {`)) return source;
  const marker = '\n});\n';
  const index = source.lastIndexOf(marker);
  if (index < 0) throw new Error(`Não encontrei fim do StyleSheet para ${styleName}.`);
  return `${source.slice(0, index)}\n  ${styleName}: ${styleBlock},${source.slice(index)}`;
}

function patchApp() {
  const filePath = path.resolve('App.tsx');
  let source = fs.readFileSync(filePath, 'utf8');
  const original = source;

  if (!source.includes('<ReferenceHubPanel')) {
    const referenceBlock = `\n          {mode === 'reference' ? (\n            <ReferenceHubPanel\n              editorProject={editorProject}\n              selectedPlcProfile={selectedPlcProfile}\n              onSelectPlcProfile={setSelectedPlcProfile}\n            />\n          ) : null}\n`;
    const anchors = ["          {mode === 'projects' ? (", "          {mode === 'pro' ? (", '        </ScrollView>'];
    const anchor = anchors.find((item) => source.includes(item));
    if (!anchor) throw new Error('Não encontrei ponto seguro para inserir a aba Referência.');
    source = source.replace(anchor, `${referenceBlock}${anchor}`);
    console.log('ReferenceHubPanel inserido no render da aba Ref.');
  }

  if (source.includes('<PlcWorkbench') && !source.includes('selectedProfile={selectedPlcProfile}')) {
    source = replaceOnce(
      source,
      '              evaluation={editorEvaluation}\n',
      '              evaluation={editorEvaluation}\n              selectedProfile={selectedPlcProfile}\n',
      'passar perfil selecionado para PlcWorkbench',
    );
  }

  if (source !== original) fs.writeFileSync(filePath, source);
}

function patchPlcWorkbench() {
  const filePath = path.resolve('src/components/PlcWorkbench.tsx');
  let source = fs.readFileSync(filePath, 'utf8');
  const original = source;

  source = replaceOnce(
    source,
    "import { colors } from '../theme/colors';",
    "import { getPlcProfile, PlcProfileId } from '../plcProfiles/plcProfiles';\nimport { colors } from '../theme/colors';",
    'importar perfil CLP no PlcWorkbench',
  );

  if (!source.includes('selectedProfile?: PlcProfileId;')) {
    source = replaceOnce(
      source,
      '  evaluation: EditorEvaluationResult;\n',
      '  evaluation: EditorEvaluationResult;\n  selectedProfile?: PlcProfileId;\n',
      'adicionar prop selectedProfile',
    );
  }

  source = replaceOnce(
    source,
    `function contactSymbol(block: EditorBlock) {
  if (block.compareMode) return \`[\${block.compareMode}]\`;
  if (block.contactMode === 'RISING') return '--|↑|--';
  if (block.contactMode === 'FALLING') return '--|↓|--';
  return block.contactMode === 'NC' ? '--|/|--' : '--| |--';
}`,
    `function contactSymbol(block: EditorBlock, profileId: PlcProfileId = 'easy_clp') {
  const profile = getPlcProfile(profileId);
  if (block.compareMode) return profile.instructions.compare[block.compareMode];
  if (block.contactMode === 'RISING') return profile.instructions.contact.RISING;
  if (block.contactMode === 'FALLING') return profile.instructions.contact.FALLING;
  return profile.instructions.contact[block.contactMode ?? 'NO'];
}`,
    'trocar símbolo de contato conforme perfil',
  );

  source = replaceOnce(
    source,
    `function coilSymbol(block: EditorBlock) {
  if (block.role === 'timer') return \`[\${block.timerMode ?? 'TON'}]\`;
  if (block.role === 'counter') return \`[\${block.counterMode ?? 'CTU'}]\`;
  if (block.mathMode) return \`[\${block.mathMode}]\`;
  if (block.coilMode && block.coilMode !== 'NORMAL') return \`(\${block.coilMode})\`;
  return '--( )--';
}`,
    `function coilSymbol(block: EditorBlock, profileId: PlcProfileId = 'easy_clp') {
  const profile = getPlcProfile(profileId);
  if (block.role === 'timer') return profile.instructions.timer[block.timerMode ?? 'TON'];
  if (block.role === 'counter') return profile.instructions.counter[block.counterMode ?? 'CTU'];
  if (block.mathMode) return profile.instructions.math[block.mathMode];
  return profile.instructions.coil[block.coilMode ?? 'NORMAL'];
}`,
    'trocar símbolo de bobina conforme perfil',
  );

  source = replaceOnce(
    source,
    `function componentSymbol(component: SimulatorComponent) {
  if (component.category === 'timer') return '[TON]';
  if (component.category === 'counter') return \`[\${component.id.replace('counter-', '').toUpperCase()}]\`;
  if (component.category === 'compare') return component.id.replace('cmp-', '').toUpperCase();
  if (component.category === 'math') return component.id.replace('math-', '').toUpperCase();
  if (component.category === 'output' || component.category === 'motor') return '--( )--';
  if (component.id.includes('ons')) return '--|↑|--';
  if (component.id.includes('osf')) return '--|↓|--';
  if (component.id.includes('nc')) return '--|/|--';
  return '--| |--';
}`,
    `function componentSymbol(component: SimulatorComponent, profileId: PlcProfileId = 'easy_clp') {
  const profile = getPlcProfile(profileId);
  if (component.category === 'timer') return profile.instructions.timer.TON;
  if (component.category === 'counter') return profile.instructions.counter[(component.id.replace('counter-', '').toUpperCase() as 'CTU' | 'CTD' | 'CTUD')];
  if (component.category === 'compare') return component.id.replace('cmp-', '').toUpperCase();
  if (component.category === 'math') return component.id.replace('math-', '').toUpperCase();
  if (component.category === 'output' || component.category === 'motor') return profile.instructions.coil.NORMAL;
  if (component.id.includes('ons')) return profile.instructions.contact.RISING;
  if (component.id.includes('osf')) return profile.instructions.contact.FALLING;
  if (component.id.includes('nc')) return profile.instructions.contact.NC;
  return profile.instructions.contact.NO;
}`,
    'trocar ícone da paleta conforme perfil',
  );

  if (!source.includes("  selectedProfile = 'easy_clp',")) {
    source = replaceOnce(
      source,
      '  evaluation,\n  mode,',
      "  evaluation,\n  selectedProfile = 'easy_clp',\n  mode,",
      'desestruturar selectedProfile com padrão',
    );
  }

  source = source.split('{outputLike || functionLike ? coilSymbol(block) : contactSymbol(block)}').join('{outputLike || functionLike ? coilSymbol(block, selectedProfile) : contactSymbol(block, selectedProfile)}');
  source = source.split('{componentSymbol(component)}').join('{componentSymbol(component, selectedProfile)}');

  if (!source.includes('mobileRungOutputCard')) {
    source = replaceOnce(
      source,
      '        {complexityHint ? (',
      `        {isMobile && targetRung.coilBlock ? (
          <View style={styles.mobileRungOutputCard}>
            <View style={styles.mobileRungOutputTextBox}>
              <Text style={styles.mobileRungOutputLabel}>Carga / saída da linha</Text>
              <Text style={styles.mobileRungOutputAddress}>{blockAddress(targetRung.coilBlock)}</Text>
            </View>
            <Text style={styles.mobileRungOutputSymbol}>{coilSymbol(targetRung.coilBlock, selectedProfile)}</Text>
          </View>
        ) : null}
        {isMobile ? (
          <View style={styles.mobileDragHintBox}>
            <Text style={styles.mobileDragHintText}>Arraste lateralmente para navegar no Ladder. A carga aparece resumida acima para não se perder no smartphone.</Text>
          </View>
        ) : null}
        {complexityHint ? (`,
      'adicionar carga fixa e dica de arraste no rung mobile',
    );
  }

  if (!source.includes('nestedScrollEnabled')) {
    source = source.split('<ScrollView horizontal').join('<ScrollView horizontal nestedScrollEnabled directionalLockEnabled={false}');
    console.log('ScrollViews horizontais receberam nestedScrollEnabled/directionalLockEnabled.');
  }

  source = insertBeforeLastStyleEnd(source, 'mobileRungOutputCard', `{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderColor: colors.green,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.greenSoft,
    marginBottom: spacing.sm,
  }`);
  source = insertBeforeLastStyleEnd(source, 'mobileRungOutputTextBox', `{
    flex: 1,
    minWidth: 0,
  }`);
  source = insertBeforeLastStyleEnd(source, 'mobileRungOutputLabel', `{
    color: colors.green,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  }`);
  source = insertBeforeLastStyleEnd(source, 'mobileRungOutputAddress', `{
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
    marginTop: 2,
  }`);
  source = insertBeforeLastStyleEnd(source, 'mobileRungOutputSymbol', `{
    color: colors.green,
    borderColor: colors.green,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.surface,
    fontSize: 11,
    fontWeight: '900',
  }`);
  source = insertBeforeLastStyleEnd(source, 'mobileDragHintBox', `{
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.cyanSoft,
    marginBottom: spacing.sm,
  }`);
  source = insertBeforeLastStyleEnd(source, 'mobileDragHintText', `{
    color: colors.cyan,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800',
  }`);

  if (source !== original) fs.writeFileSync(filePath, source);
}

function patchCodeContrast() {
  const files = [
    'src/components/PlcProfilePanel.tsx',
    'src/components/SimulatorDialectPanel.tsx',
  ];

  for (const file of files) {
    const filePath = path.resolve(file);
    let source = fs.readFileSync(filePath, 'utf8');
    const original = source;
    source = source.split('color: colors.text,\n    backgroundColor: colors.black,\n    borderColor: colors.borderStrong,').join("color: '#F8FAFC',\n    backgroundColor: '#020817',\n    borderColor: colors.cyan,");
    if (!source.includes("fontWeight: '700',") && source.includes("fontFamily: 'monospace'")) {
      source = source.replace("fontFamily: 'monospace',\n    fontSize:", "fontFamily: 'monospace',\n    fontWeight: '700',\n    fontSize:");
    }
    if (source !== original) {
      fs.writeFileSync(filePath, source);
      console.log(`Contraste de código ajustado em ${file}`);
    }
  }
}

patchApp();
patchPlcWorkbench();
patchCodeContrast();
console.log('Reference tab, profile symbols, mobile rung load and code contrast patch ready.');
