import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('App.tsx');
let source = fs.readFileSync(filePath, 'utf8');
const original = source;

const oldEvaluationBlock = `  const evaluation = evaluateProject(project, plcState);
  const editorEvaluation = evaluateEditorProject(editorProject, editorState, editorScanNumber, editorRuntime);`;
const newEvaluationBlock = `  const evaluation = useMemo(() => evaluateProject(project, plcState), [project, plcState]);
  const editorEvaluation = useMemo(
    () => evaluateEditorProject(editorProject, editorState, editorScanNumber, editorRuntime),
    [editorProject, editorState, editorScanNumber, editorRuntime],
  );`;

if (source.includes(oldEvaluationBlock)) {
  source = source.replace(oldEvaluationBlock, newEvaluationBlock);
}

const oldAutoScanEffect = `  useEffect(() => {
    if (!autoScan || editorMode !== 'simulate') return undefined;
    const interval = setInterval(() => {
      runEditorScan();
    }, 100);
    return () => clearInterval(interval);
  }, [autoScan, editorMode, editorProject, editorEvaluation.state, editorEvaluation.runtime, editorScanNumber]);`;
const newAutoScanEffect = `  useEffect(() => {
    if (!autoScan || editorMode !== 'simulate') return undefined;
    const interval = setInterval(() => {
      setEditorScanNumber((currentScan) => {
        const nextScan = currentScan + 1;
        setEditorState((currentState) => {
          setEditorRuntime((currentRuntime) => {
            const result = evaluateEditorProject(editorProject, currentState, nextScan, currentRuntime);
            setEditorState(result.state);
            return result.runtime;
          });
          return currentState;
        });
        return nextScan;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [autoScan, editorMode, editorProject]);`;

if (source.includes(oldAutoScanEffect)) {
  source = source.replace(oldAutoScanEffect, newAutoScanEffect);
}

const oldGuidedEffectDeps = `  }, [practiceLesson?.id, editorEvaluation.state, editorEvaluation.runtime, editorEvaluation.scanNumber]);`;
const newGuidedEffectDeps = `  }, [practiceLesson?.id, editorEvaluation]);`;
if (source.includes(oldGuidedEffectDeps)) {
  source = source.replace(oldGuidedEffectDeps, newGuidedEffectDeps);
}

if (source !== original) {
  fs.writeFileSync(filePath, source);
  console.log('App.tsx otimizado: avaliações memorizadas e auto-scan com menos recriação de intervalo.');
} else {
  console.log('Nenhuma alteração necessária.');
}
