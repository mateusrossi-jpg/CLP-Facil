import fs from 'node:fs';
import path from 'node:path';

function read(file) {
  return fs.readFileSync(path.resolve(file), 'utf8');
}

function write(file, content) {
  fs.writeFileSync(path.resolve(file), content);
}

function replaceOnce(file, from, to, label) {
  let source = read(file);
  if (!source.includes(from)) {
    console.log(`Ignorado ${label}: padrão não encontrado em ${file}.`);
    return false;
  }
  source = source.replace(from, to);
  write(file, source);
  console.log(`Aplicado ${label} em ${file}.`);
  return true;
}

function optimizePlcWorkbench() {
  const file = 'src/components/PlcWorkbench.tsx';
  replaceOnce(
    file,
    "import { useEffect, useRef, useState } from 'react';",
    "import { memo, useEffect, useMemo, useRef, useState } from 'react';",
    'imports memo/useMemo',
  );

  replaceOnce(
    file,
    'function CircuitBlock({',
    'const CircuitBlock = memo(function CircuitBlock({',
    'memo CircuitBlock inicio',
  );
  replaceOnce(
    file,
    '\n}\n\nfunction DropZone({',
    '\n});\n\nconst DropZone = memo(function DropZone({',
    'memo CircuitBlock fim e DropZone inicio',
  );
  replaceOnce(
    file,
    '\n}\n\nfunction SignalRow({',
    '\n});\n\nconst SignalRow = memo(function SignalRow({',
    'memo DropZone fim e SignalRow inicio',
  );
  replaceOnce(
    file,
    '\n}\n\nfunction FunctionVariableCard({',
    '\n});\n\nconst FunctionVariableCard = memo(function FunctionVariableCard({',
    'memo SignalRow fim e FunctionVariableCard inicio',
  );
  replaceOnce(
    file,
    '\n}\n\nfunction DeclaredFunctionVariableCard({',
    '\n});\n\nconst DeclaredFunctionVariableCard = memo(function DeclaredFunctionVariableCard({',
    'memo FunctionVariableCard fim e DeclaredFunctionVariableCard inicio',
  );
  replaceOnce(
    file,
    '\n}\n\nexport function PlcWorkbench({',
    '\n});\n\nexport function PlcWorkbench({',
    'memo DeclaredFunctionVariableCard fim',
  );

  replaceOnce(
    file,
    "  const components = simulatorComponents.filter((component) => component.category === category);",
    "  const components = useMemo(() => simulatorComponents.filter((component) => component.category === category), [category]);",
    'memoizar lista de componentes por categoria',
  );
}

function optimizeSimulatorDialectPanel() {
  const file = 'src/components/SimulatorDialectPanel.tsx';
  let source = read(file);
  const original = source;
  source = source.replace("import { Pressable, StyleSheet, Text, View } from 'react-native';", "import { memo, useMemo } from 'react';\nimport { Pressable, StyleSheet, Text, View } from 'react-native';");
  source = source.replace('export function SimulatorDialectPanel({ editorProject, selectedProfile, onSelectProfile, compact }: SimulatorDialectPanelProps) {', 'export const SimulatorDialectPanel = memo(function SimulatorDialectPanel({ editorProject, selectedProfile, onSelectProfile, compact }: SimulatorDialectPanelProps) {');
  source = source.replace('  const profileView = createPlcProfileProjectView(editorProject, selectedProfile);\n  const firstRungs = profileView.rungs.slice(0, compact ? 1 : 3);', '  const profileView = useMemo(() => createPlcProfileProjectView(editorProject, selectedProfile), [editorProject, selectedProfile]);\n  const firstRungs = useMemo(() => profileView.rungs.slice(0, compact ? 1 : 3), [compact, profileView.rungs]);');
  source = source.replace('\n}\n\nconst styles = StyleSheet.create({', '\n});\n\nconst styles = StyleSheet.create({');
  if (source !== original) {
    write(file, source);
    console.log('Otimizado SimulatorDialectPanel.');
  }
}

function optimizeExampleLibraryPanel() {
  const file = 'src/components/ExampleLibraryPanel.tsx';
  let source = read(file);
  const original = source;
  source = source.replace("import { Pressable, StyleSheet, Text, View } from 'react-native';", "import { memo, useMemo } from 'react';\nimport { Pressable, StyleSheet, Text, View } from 'react-native';");
  source = source.replace('export function ExampleLibraryPanel({ examples, onOpenExample }: ExampleLibraryPanelProps) {', 'export const ExampleLibraryPanel = memo(function ExampleLibraryPanel({ examples, onOpenExample }: ExampleLibraryPanelProps) {');
  source = source.replace(`  const coveredIds = new Set<string>();
  const categoryGroups = categories
    .map((category) => {
      const grouped = examplesForCategory(examples, category).filter((example) => {
        if (coveredIds.has(example.id)) return false;
        coveredIds.add(example.id);
        return true;
      });
      return { category, examples: grouped };
    })
    .filter((group) => group.examples.length > 0);

  const remainingExamples = examples.filter((example) => !coveredIds.has(example.id)).slice(0, 8);`, `  const { categoryGroups, remainingExamples } = useMemo(() => {
    const coveredIds = new Set<string>();
    const groups = categories
      .map((category) => {
        const grouped = examplesForCategory(examples, category).filter((example) => {
          if (coveredIds.has(example.id)) return false;
          coveredIds.add(example.id);
          return true;
        });
        return { category, examples: grouped };
      })
      .filter((group) => group.examples.length > 0);

    return {
      categoryGroups: groups,
      remainingExamples: examples.filter((example) => !coveredIds.has(example.id)).slice(0, 8),
    };
  }, [examples]);`);
  source = source.replace('\n}\n\nconst styles = StyleSheet.create({', '\n});\n\nconst styles = StyleSheet.create({');
  if (source !== original) {
    write(file, source);
    console.log('Otimizado ExampleLibraryPanel.');
  }
}

function memoizeStaticPanel(file, exportName) {
  let source = read(file);
  const original = source;
  source = source.replace("import { StyleSheet, Text, View } from 'react-native';", "import { memo } from 'react';\nimport { StyleSheet, Text, View } from 'react-native';");
  source = source.replace(`export function ${exportName}() {`, `export const ${exportName} = memo(function ${exportName}() {`);
  source = source.replace('\n}\n\nconst styles = StyleSheet.create({', '\n});\n\nconst styles = StyleSheet.create({');
  if (source !== original) {
    write(file, source);
    console.log(`Memoizado ${exportName}.`);
  }
}

optimizePlcWorkbench();
optimizeSimulatorDialectPanel();
optimizeExampleLibraryPanel();
memoizeStaticPanel('src/components/CommunicationProtocolsPanel.tsx', 'CommunicationProtocolsPanel');
memoizeStaticPanel('src/components/SafetyReadinessPanel.tsx', 'SafetyReadinessPanel');
memoizeStaticPanel('src/components/ReleaseReadinessPanel.tsx', 'ReleaseReadinessPanel');
memoizeStaticPanel('src/components/StoreListingPanel.tsx', 'StoreListingPanel');
