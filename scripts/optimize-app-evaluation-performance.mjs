import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('App.tsx');
let source = fs.readFileSync(filePath, 'utf8');
const original = source;

function replaceOnce(from, to, label) {
  if (!source.includes(from)) return false;
  source = source.replace(from, to);
  console.log(`Aplicado: ${label}`);
  return true;
}

replaceOnce(
  "import { useEffect, useMemo, useState } from 'react';",
  "import { useEffect, useMemo, useRef, useState } from 'react';",
  'import useRef',
);

replaceOnce(
  `  const evaluation = evaluateProject(project, plcState);
  const editorEvaluation = evaluateEditorProject(editorProject, editorState, editorScanNumber, editorRuntime);`,
  `  const evaluation = useMemo(() => evaluateProject(project, plcState), [project, plcState]);
  const editorEvaluation = useMemo(
    () => evaluateEditorProject(editorProject, editorState, editorScanNumber, editorRuntime),
    [editorProject, editorState, editorScanNumber, editorRuntime],
  );`,
  'memoizar avaliações do simulador',
);

const refsAnchor = `  const [plcState, setPlcState] = useState<PlcState>(initial);`;
const refsBlock = `  const [plcState, setPlcState] = useState<PlcState>(initial);
  const editorProjectRef = useRef(editorProject);
  const editorStateRef = useRef(editorState);
  const editorRuntimeRef = useRef(editorRuntime);
  const editorScanNumberRef = useRef(editorScanNumber);`;
if (!source.includes('const editorProjectRef = useRef(editorProject);')) {
  replaceOnce(refsAnchor, refsBlock, 'criar refs de estado do simulador');
}

const refSyncAnchor = `  const guidedDone = hydratedGuidedSteps.length > 0 && hydratedGuidedSteps.every((step) => step.passed);

  useEffect(() => {`;
const refSyncBlock = `  const guidedDone = hydratedGuidedSteps.length > 0 && hydratedGuidedSteps.every((step) => step.passed);

  useEffect(() => {
    editorProjectRef.current = editorProject;
  }, [editorProject]);

  useEffect(() => {
    editorStateRef.current = editorState;
  }, [editorState]);

  useEffect(() => {
    editorRuntimeRef.current = editorRuntime;
  }, [editorRuntime]);

  useEffect(() => {
    editorScanNumberRef.current = editorScanNumber;
  }, [editorScanNumber]);

  useEffect(() => {`;
if (!source.includes('editorProjectRef.current = editorProject;')) {
  replaceOnce(refSyncAnchor, refSyncBlock, 'sincronizar refs do simulador');
}

replaceOnce(
  `  useEffect(() => {
    if (!autoScan || editorMode !== 'simulate') return undefined;
    const interval = setInterval(() => {
      runEditorScan();
    }, 100);
    return () => clearInterval(interval);
  }, [autoScan, editorMode, editorProject, editorEvaluation.state, editorEvaluation.runtime, editorScanNumber]);`,
  `  useEffect(() => {
    if (!autoScan || editorMode !== 'simulate') return undefined;
    const interval = setInterval(() => {
      runEditorScanFromRefs();
    }, 100);
    return () => clearInterval(interval);
  }, [autoScan, editorMode]);`,
  'evitar recriar intervalo de auto-scan a cada scan',
);

const runScanFunctionAnchor = `  function runEditorScan() {
    if (editorMode !== 'simulate') return;
    const nextScan = editorScanNumber + 1;
    const result = evaluateEditorProject(editorProject, editorEvaluation.state, nextScan, editorEvaluation.runtime);
    setEditorScanNumber(nextScan);
    setEditorState(result.state);
    setEditorRuntime(result.runtime);
  }`;
const runScanFunctionReplacement = `  function commitEditorEvaluation(nextScan: number, result: ReturnType<typeof evaluateEditorProject>) {
    editorScanNumberRef.current = nextScan;
    editorStateRef.current = result.state;
    editorRuntimeRef.current = result.runtime;
    setEditorScanNumber(nextScan);
    setEditorState(result.state);
    setEditorRuntime(result.runtime);
  }

  function runEditorScanFromRefs() {
    const nextScan = editorScanNumberRef.current + 1;
    const result = evaluateEditorProject(
      editorProjectRef.current,
      editorStateRef.current,
      nextScan,
      editorRuntimeRef.current,
    );
    commitEditorEvaluation(nextScan, result);
  }

  function runEditorScan() {
    if (editorMode !== 'simulate') return;
    runEditorScanFromRefs();
  }`;
replaceOnce(runScanFunctionAnchor, runScanFunctionReplacement, 'usar refs no scan manual e automático');

replaceOnce(
  `  }, [practiceLesson?.id, editorEvaluation.state, editorEvaluation.runtime, editorEvaluation.scanNumber]);`,
  `  }, [practiceLesson?.id, editorEvaluation]);`,
  'simplificar dependências da prática guiada',
);

if (source !== original) {
  fs.writeFileSync(filePath, source);
  console.log('App.tsx otimizado com memoização e auto-scan mais estável.');
} else {
  console.log('Nenhuma alteração necessária.');
}
