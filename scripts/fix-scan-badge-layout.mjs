import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('src/components/PlcWorkbench.tsx');
let source = fs.readFileSync(filePath, 'utf8');
const original = source;

function findMatchingBrace(text, openBraceIndex) {
  let depth = 0;
  for (let index = openBraceIndex; index < text.length; index += 1) {
    const char = text[index];
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function styleExists(key) {
  return new RegExp(`\\n\\s*${key}:\\s*\\{`).test(source);
}

function replaceStyleObject(key, body) {
  const pattern = new RegExp(`\\n(\\s*)${key}:\\s*\\{`);
  const match = pattern.exec(source);
  const formatted = `\n  ${key}: {\n${body.trimEnd()}\n  },`;

  if (!match) {
    const insertAt = source.lastIndexOf('\n});');
    if (insertAt < 0) throw new Error('Não encontrei o fechamento de StyleSheet.create.');
    source = `${source.slice(0, insertAt)}${formatted}${source.slice(insertAt)}`;
    return;
  }

  const openBraceIndex = match.index + match[0].lastIndexOf('{');
  const closeBraceIndex = findMatchingBrace(source, openBraceIndex);
  if (closeBraceIndex < 0) throw new Error(`Não encontrei o fim do estilo ${key}.`);

  let endIndex = closeBraceIndex + 1;
  while (source[endIndex] === ' ' || source[endIndex] === '\n' || source[endIndex] === '\r' || source[endIndex] === '\t') endIndex += 1;
  if (source[endIndex] === ',') endIndex += 1;

  source = `${source.slice(0, match.index)}${formatted}${source.slice(endIndex)}`;
}

function addRunHeaderTextToNearestView(titleIndex) {
  const innerViewStart = source.lastIndexOf('<View', titleIndex);
  if (innerViewStart < 0) throw new Error('Não encontrei o View interno do cabeçalho RUN.');
  const viewEnd = source.indexOf('>', innerViewStart);
  if (viewEnd < 0 || viewEnd > titleIndex) throw new Error('View interno do cabeçalho RUN inválido.');
  const viewOpen = source.slice(innerViewStart, viewEnd + 1);

  if (viewOpen.includes('runHeaderText')) return;

  let replacement = viewOpen;
  if (/style=\{styles\.[A-Za-z0-9_]+\}/.test(viewOpen)) {
    replacement = viewOpen.replace(/style=\{styles\.([A-Za-z0-9_]+)\}/, 'style={[styles.$1, styles.runHeaderText]}');
  } else if (/style=\{\[/.test(viewOpen)) {
    replacement = viewOpen.replace(/style=\{\[/, 'style={[styles.runHeaderText, ');
  } else {
    replacement = viewOpen.replace('<View', '<View style={styles.runHeaderText}');
  }

  source = `${source.slice(0, innerViewStart)}${replacement}${source.slice(viewEnd + 1)}`;
}

function inferParentHeaderStyle(titleIndex) {
  const innerViewStart = source.lastIndexOf('<View', titleIndex);
  const beforeInnerView = source.slice(0, Math.max(0, innerViewStart));
  const viewMatches = Array.from(beforeInnerView.matchAll(/<View\s+style=\{styles\.([A-Za-z0-9_]+)\}/g));
  const parent = viewMatches[viewMatches.length - 1]?.[1];
  if (!parent) throw new Error('Não encontrei o estilo do cabeçalho RUN.');
  return parent;
}

function inferBadgeStyle(titleIndex) {
  const scanIndex = source.indexOf('>SCAN<', titleIndex);
  if (scanIndex < 0) throw new Error('Não encontrei o texto SCAN no cabeçalho RUN.');
  const beforeScan = source.slice(Math.max(0, titleIndex), scanIndex);
  const viewMatches = Array.from(beforeScan.matchAll(/<View\s+style=\{styles\.([A-Za-z0-9_]+)\}/g));
  const badge = viewMatches[viewMatches.length - 1]?.[1];
  if (!badge) throw new Error('Não encontrei o estilo do badge SCAN.');
  return badge;
}

function inferTextStyle(regex, fallbackName) {
  const match = regex.exec(source);
  return match?.[1] ?? fallbackName;
}

const titleMatch = /<Text\s+style=\{styles\.[A-Za-z0-9_]+\}>Visualização RUN<\/Text>/.exec(source);
if (!titleMatch) {
  throw new Error('Não encontrei o título "Visualização RUN" para aplicar o ajuste.');
}

const titleIndex = titleMatch.index;
const headerStyleKey = inferParentHeaderStyle(titleIndex);
const badgeStyleKey = inferBadgeStyle(titleIndex);
const badgeLabelStyleKey = inferTextStyle(/<Text\s+style=\{styles\.([A-Za-z0-9_]+)\}>SCAN<\/Text>/, 'scanMiniLabel');
const badgeValueStyleKey = inferTextStyle(/<Text\s+style=\{styles\.([A-Za-z0-9_]+)\}>\{evaluation\.scanNumber\}<\/Text>/, 'scanMiniValue');

addRunHeaderTextToNearestView(titleIndex);

replaceStyleObject(headerStyleKey, `    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    width: '100%',`);

replaceStyleObject('runHeaderText', `    flex: 1,
    minWidth: 0,
    paddingRight: spacing.xs,`);

replaceStyleObject(badgeStyleKey, `    width: 58,
    minHeight: 48,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,`);

replaceStyleObject(badgeLabelStyleKey, `    color: colors.green,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '900',
    textAlign: 'center',`);

replaceStyleObject(badgeValueStyleKey, `    color: colors.green,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '900',
    textAlign: 'center',`);

if (source !== original) {
  fs.writeFileSync(filePath, source);
  console.log(`Badge SCAN ajustado. Estilos afetados: ${headerStyleKey}, ${badgeStyleKey}, ${badgeLabelStyleKey}, ${badgeValueStyleKey}.`);
} else {
  console.log('Nenhuma alteração necessária.');
}
