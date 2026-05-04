import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('src/components/HardwareExportPanel.tsx');
let source = fs.readFileSync(filePath, 'utf8');
const original = source;

const oldCodePreview = `      <TextInput
        value={generatedCode}
        editable={false}
        multiline
        scrollEnabled
        style={styles.codeBox}
      />`;

const newCodePreview = `      <ScrollView style={styles.codeBox} contentContainerStyle={styles.codeContent}>
        <Text selectable style={styles.codeText}>{generatedCode}</Text>
      </ScrollView>`;

if (source.includes(oldCodePreview)) {
  source = source.replace(oldCodePreview, newCodePreview);
} else if (!source.includes('style={styles.codeText}>{generatedCode}</Text>')) {
  throw new Error('Não encontrei o preview de código antigo nem o novo.');
}

function findMatchingBrace(text, openBraceIndex) {
  let depth = 0;
  for (let index = openBraceIndex; index < text.length; index += 1) {
    if (text[index] === '{') depth += 1;
    if (text[index] === '}') {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function replaceStyleObject(key, body) {
  const pattern = new RegExp(`\\n(\\s*)${key}:\\s*\\{`);
  const match = pattern.exec(source);
  const formatted = `\n  ${key}: {\n${body.trimEnd()}\n  },`;

  if (!match) {
    const insertAt = source.lastIndexOf('\n});');
    if (insertAt < 0) throw new Error('Não encontrei o fechamento do StyleSheet.');
    source = `${source.slice(0, insertAt)}${formatted}${source.slice(insertAt)}`;
    return;
  }

  const openBraceIndex = match.index + match[0].lastIndexOf('{');
  const closeBraceIndex = findMatchingBrace(source, openBraceIndex);
  if (closeBraceIndex < 0) throw new Error(`Não encontrei o fechamento do estilo ${key}.`);

  let endIndex = closeBraceIndex + 1;
  while (/\s/.test(source[endIndex] ?? '')) endIndex += 1;
  if (source[endIndex] === ',') endIndex += 1;

  source = `${source.slice(0, match.index)}${formatted}${source.slice(endIndex)}`;
}

replaceStyleObject('codeBox', `    minHeight: 300,
    maxHeight: 460,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: '#071629',`);

replaceStyleObject('codeContent', `    padding: spacing.md,`);

replaceStyleObject('codeText', `    color: '#EAF2FF',
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,`);

if (source !== original) {
  fs.writeFileSync(filePath, source);
  console.log('Preview de código trocado para ScrollView + Text com contraste alto.');
} else {
  console.log('Nenhuma alteração necessária.');
}
