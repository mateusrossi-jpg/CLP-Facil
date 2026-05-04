import fs from 'node:fs';
import path from 'node:path';

function read(file) {
  return fs.readFileSync(path.resolve(file), 'utf8');
}

function write(file, content) {
  fs.writeFileSync(path.resolve(file), content);
}

function removeRunScanBadge() {
  const file = 'src/components/PlcWorkbench.tsx';
  let source = read(file);
  const original = source;

  const scanBadgeRegex = /\n\s*<View\s+style=\{styles\.[A-Za-z0-9_]+\}>\s*\n\s*<Text\s+style=\{styles\.[A-Za-z0-9_]+\}>SCAN<\/Text>\s*\n\s*<Text\s+style=\{styles\.[A-Za-z0-9_]+\}>\{evaluation\.scanNumber\}<\/Text>\s*\n\s*<\/View>/g;
  source = source.replace(scanBadgeRegex, '');

  if (source !== original) {
    write(file, source);
    console.log('Removi o badge SCAN duplicado da Visualização RUN.');
  } else {
    console.log('Badge SCAN duplicado não encontrado ou já removido.');
  }
}

function moveHardwarePanelToOwnTab() {
  const file = 'App.tsx';
  let source = read(file);
  const original = source;

  source = source.replace(/\n\s*<HardwareExportPanel editorProject=\{editorProject\} \/>/g, '');

  const projectsCondition = `) : mode === 'projects' ? (`;
  const proCondition = `) : mode === 'pro' ? (`;
  const start = source.indexOf(projectsCondition);
  const end = start >= 0 ? source.indexOf(proCondition, start + projectsCondition.length) : -1;

  if (start < 0 || end < 0) {
    throw new Error('Não encontrei o bloco mode === projects para transformar em aba Hardware.');
  }

  const hardwareScreen = `) : mode === 'projects' ? (
          <>
            <AppHeader
              title="Hardware"
              subtitle="Escolha a placa, vincule os pinos e gere o código para ESP32, Arduino ou ESPHome sem poluir a bancada de simulação."
              compact={compactSimulator}
            />
            <HardwareExportPanel editorProject={editorProject} />
          </>
        `;

  source = `${source.slice(0, start)}${hardwareScreen}${source.slice(end)}`;

  if (source !== original) {
    write(file, source);
    console.log('Movi o painel de Hardware para a aba própria do menu inferior.');
  } else {
    console.log('App.tsx já estava organizado.');
  }
}

removeRunScanBadge();
moveHardwarePanelToOwnTab();
