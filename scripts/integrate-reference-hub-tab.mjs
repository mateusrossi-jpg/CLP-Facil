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
  "import { CommunicationProtocolsPanel } from './src/components/CommunicationProtocolsPanel';",
  "import { ReferenceHubPanel } from './src/components/ReferenceHubPanel';",
);

source = source.replace(
  "type Mode = 'home' | 'learn' | 'lesson' | 'simulate' | 'projects' | 'pro';",
  "type Mode = 'home' | 'learn' | 'lesson' | 'simulate' | 'reference' | 'projects' | 'pro';",
);

source = source.replace(
  `: mode === 'projects'\n        ? 'projects'`,
  `: mode === 'reference'\n        ? 'reference'\n        : mode === 'projects'\n          ? 'projects'`,
);

if (!source.includes("if (key === 'reference')")) {
  const anchor = `    if (key === 'projects') {
      setMode('projects');
      return;
    }`;
  const replacement = `    if (key === 'reference') {
      setMode('reference');
      return;
    }

${anchor}`;
  if (!source.includes(anchor)) throw new Error('Não encontrei bloco projects no handleBottomNav.');
  source = source.replace(anchor, replacement);
}

function removePanelsFromSimulator() {
  source = source.replace(/\n\s*<PlcProfilePanel[\s\S]*?\/>(?=\n)/g, '');
  source = source.replace(/\n\s*<CommunicationProtocolsPanel\s*\/>(?=\n)/g, '');
}

function insertReferenceBranch() {
  if (source.includes("mode === 'reference'")) return;

  const hardwareCondition = `) : mode === 'projects' ? (`;
  const index = source.indexOf(hardwareCondition);
  if (index < 0) throw new Error('Não encontrei bloco projects para inserir reference antes dele.');

  const referenceBranch = `) : mode === 'reference' ? (
          <>
            <AppHeader
              title="Referência"
              subtitle="Compare dialetos de CLP e consulte protocolos de comunicação para planejar bancada, microcontroladores e integrações industriais."
              compact={compactSimulator}
            />
            <ReferenceHubPanel
              editorProject={editorProject}
              selectedPlcProfile={selectedPlcProfile}
              onSelectPlcProfile={setSelectedPlcProfile}
            />
          </>
        `;

  source = `${source.slice(0, index)}${referenceBranch}${source.slice(index)}`;
}

removePanelsFromSimulator();
insertReferenceBranch();

if (source !== original) {
  fs.writeFileSync(filePath, source);
  console.log('Aba Referência integrada e painéis removidos da simulação.');
} else {
  console.log('Nenhuma alteração necessária.');
}
