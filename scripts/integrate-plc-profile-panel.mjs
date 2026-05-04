import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('App.tsx');
let source = fs.readFileSync(filePath, 'utf8');
const original = source;

function addImport(anchor, importLine) {
  if (source.includes(importLine)) return;
  if (!source.includes(anchor)) throw new Error(`Não encontrei âncora de import: ${anchor}`);
  source = source.replace(anchor, `${anchor}\n${importLine}`);
}

addImport(
  "import { PlcWorkbench } from './src/components/PlcWorkbench';",
  "import { PlcProfilePanel } from './src/components/PlcProfilePanel';",
);
addImport(
  "import { colors } from './src/theme/colors';",
  "import { PlcProfileId } from './src/plcProfiles/plcProfiles';",
);

if (!source.includes("const [selectedPlcProfile, setSelectedPlcProfile] = useState<PlcProfileId>('easy_clp');")) {
  const anchor = "const [editorProject, setEditorProject] = useState<EditorProjectState>(() => createInitialEditorProject());";
  if (!source.includes(anchor)) throw new Error('Não encontrei o estado editorProject.');
  source = source.replace(anchor, `${anchor}\n  const [selectedPlcProfile, setSelectedPlcProfile] = useState<PlcProfileId>('easy_clp');`);
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

const panelBlock = `\n            <PlcProfilePanel\n              editorProject={editorProject}\n              selectedProfile={selectedPlcProfile}\n              onSelectProfile={setSelectedPlcProfile}\n            />`;

if (!source.includes('<PlcProfilePanel')) {
  const plcStart = source.indexOf('<PlcWorkbench');
  if (plcStart < 0) throw new Error('Não encontrei PlcWorkbench no App.tsx.');
  const plcEnd = findSelfClosingTagEnd(source, plcStart);
  if (plcEnd < 0) throw new Error('Não encontrei o fechamento do PlcWorkbench.');
  source = `${source.slice(0, plcEnd)}${panelBlock}${source.slice(plcEnd)}`;
}

if (source !== original) {
  fs.writeFileSync(filePath, source);
  console.log('PlcProfilePanel integrado ao simulador como painel educacional de dialetos CLP.');
} else {
  console.log('Nenhuma alteração necessária.');
}
