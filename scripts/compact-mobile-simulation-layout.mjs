import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('App.tsx');
let source = fs.readFileSync(filePath, 'utf8');
const original = source;

const compactGuard = "compactSimulator && editorMode === 'simulate'";

function findSelfClosingTagEnd(text, startIndex) {
  let depth = 0;
  let quote = null;

  for (let index = startIndex; index < text.length - 1; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (quote) {
      if (char === quote && text[index - 1] !== '\\') quote = null;
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }

    if (char === '{') depth += 1;
    if (char === '}') depth = Math.max(depth - 1, 0);

    if (depth === 0 && char === '/' && next === '>') return index + 2;
  }

  return -1;
}

function replaceAllSimple(from, to, label) {
  if (!source.includes(from)) return false;
  source = source.split(from).join(to);
  console.log(`Aplicado: ${label}`);
  return true;
}

function wrapSelfClosingTag(componentName) {
  const tag = `<${componentName}`;
  const start = source.indexOf(tag);
  if (start < 0) {
    console.warn(`${componentName} não encontrado.`);
    return;
  }

  const before = source.slice(Math.max(0, start - 140), start);
  if (before.includes(`!(${compactGuard})`) || before.includes(`!compactSimulator`) || before.includes(`${compactGuard} ?`)) {
    console.log(`${componentName} já parece estar condicionado.`);
    return;
  }

  const end = findSelfClosingTagEnd(source, start);
  if (end < 0) throw new Error(`Não encontrei fechamento self-closing de ${componentName}.`);

  const block = source.slice(start, end);
  const wrapped = `{!(${compactGuard}) ? (\n              ${block}\n            ) : null}`;
  source = `${source.slice(0, start)}${wrapped}${source.slice(end)}`;
  console.log(`${componentName} condicionado para não duplicar no modo compacto de simulação.`);
}

replaceAllSimple(
  '{compactSimulator ? (\n              <SmartphoneSimulationPanel',
  `{${compactGuard} ? (\n              <SmartphoneSimulationPanel`,
  'SmartphoneSimulationPanel apenas durante simulação mobile',
);

wrapSelfClosingTag('SimulatorDialectPanel');
wrapSelfClosingTag('PlcWorkbench');

if (source !== original) {
  fs.writeFileSync(filePath, source);
  console.log('Layout mobile compacto aplicado: painel smartphone no modo Simular e bancada antiga oculta apenas nesse modo.');
} else {
  console.log('Nenhuma alteração necessária.');
}
