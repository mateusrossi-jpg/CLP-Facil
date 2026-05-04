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
  "import { HardwareExportPanel } from './src/components/HardwareExportPanel';",
  "import { ReferenceHubPanel } from './src/components/ReferenceHubPanel';",
);

function ensureReferenceModeType() {
  source = source.replace(
    "type Mode = 'home' | 'learn' | 'lesson' | 'simulate' | 'projects' | 'pro';",
    "type Mode = 'home' | 'learn' | 'lesson' | 'simulate' | 'reference' | 'projects' | 'pro';",
  );
}

function ensureActiveNavReference() {
  if (source.includes("mode === 'reference'\n        ? 'reference'")) return;

  const simulateBranch = `: mode === 'simulate'\n      ? 'simulate'`;
  const replacement = `: mode === 'simulate'\n      ? 'simulate'\n      : mode === 'reference'\n        ? 'reference'`;

  if (!source.includes(simulateBranch)) {
    console.warn('Não encontrei bloco activeNav de simulate; pulando ajuste activeNav.');
    return;
  }

  source = source.replace(simulateBranch, replacement);
}

function ensureHandleBottomNavReference() {
  if (source.includes("if (key === 'reference')")) return;

  const projectsBlock = `    if (key === 'projects') {
      setMode('projects');
      return;
    }`;

  if (!source.includes(projectsBlock)) {
    console.warn('Não encontrei bloco projects no handleBottomNav; pulando ajuste de clique Referência.');
    return;
  }

  source = source.replace(projectsBlock, `    if (key === 'reference') {
      setMode('reference');
      return;
    }

${projectsBlock}`);
}

function removeLooseReferencePanelsFromSimulator() {
  // Remove integrações antigas se foram colocadas diretamente na simulação.
  source = source.replace(/\n\s*<PlcProfilePanel[\s\S]*?\/>(?=\n)/g, '');
  source = source.replace(/\n\s*<CommunicationProtocolsPanel\s*\/>(?=\n)/g, '');
}

function insertReferenceRenderBranch() {
  if (source.includes('<ReferenceHubPanel')) return;

  const branchRegex = /\)\s*:\s*mode\s*===\s*'projects'\s*\?\s*\(/m;
  const match = branchRegex.exec(source);
  if (!match) {
    throw new Error('Não encontrei o bloco render de projects para inserir a aba Referência.');
  }

  const referenceBranch = `) : mode === 'reference' ? (
          <>
            <AppHeader
              title="Referência"
              subtitle="Compare dialetos de CLP, consulte protocolos e revise segurança, divulgação e loja."
              compact={compactSimulator}
            />
            <ReferenceHubPanel
              editorProject={editorProject}
              selectedPlcProfile={selectedPlcProfile}
              onSelectPlcProfile={setSelectedPlcProfile}
            />
          </>
        `;

  source = `${source.slice(0, match.index)}${referenceBranch}${source.slice(match.index)}`;
}

ensureReferenceModeType();
ensureActiveNavReference();
ensureHandleBottomNavReference();
removeLooseReferencePanelsFromSimulator();
insertReferenceRenderBranch();

if (source !== original) {
  fs.writeFileSync(filePath, source);
  console.log('Aba Referência corrigida: branch de render com ReferenceHubPanel inserido.');
} else {
  console.log('Nenhuma alteração necessária.');
}
