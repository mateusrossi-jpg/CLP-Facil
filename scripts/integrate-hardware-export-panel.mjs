import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('App.tsx');
let source = fs.readFileSync(filePath, 'utf8');
const original = source;

const importLine = "import { HardwareExportPanel } from './src/components/HardwareExportPanel';";

if (!source.includes(importLine)) {
  const anchor = "import { PlcWorkbench } from './src/components/PlcWorkbench';";
  if (!source.includes(anchor)) {
    throw new Error('Não encontrei o import de PlcWorkbench para posicionar o HardwareExportPanel.');
  }
  source = source.replace(anchor, `${anchor}\n${importLine}`);
}

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

const panelBlock = `\n              <HardwareExportPanel editorProject={editorProject} />`;

if (!source.includes('<HardwareExportPanel editorProject={editorProject} />')) {
  const plcStart = source.indexOf('<PlcWorkbench');
  if (plcStart < 0) {
    throw new Error('Não encontrei o componente PlcWorkbench no App.tsx.');
  }

  const plcEnd = findSelfClosingTagEnd(source, plcStart);
  if (plcEnd < 0) {
    throw new Error('Não encontrei o fechamento self-closing de PlcWorkbench.');
  }

  source = `${source.slice(0, plcEnd)}${panelBlock}${source.slice(plcEnd)}`;
}

if (source !== original) {
  fs.writeFileSync(filePath, source);
  console.log('HardwareExportPanel integrado ao App.tsx.');
} else {
  console.log('Nenhuma alteração necessária.');
}
