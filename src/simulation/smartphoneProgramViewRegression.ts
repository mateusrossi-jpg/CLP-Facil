import { createInitialEditorProject } from '../engine/editorTypes';
import { createPlcProfileProjectView } from '../plcProfiles/plcProfiles';
import { createSmartphoneProgramSummary } from './smartphoneProgramView';

type SmartphoneProgramRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, condition: boolean, details?: string): SmartphoneProgramRegressionResult {
  return { name, passed: condition, details: condition ? undefined : details };
}

function runRockwellProgramSummaryRegression(): SmartphoneProgramRegressionResult {
  const project = createInitialEditorProject();
  const view = createPlcProfileProjectView(project, 'rockwell_like');
  const summary = createSmartphoneProgramSummary(view, { [project.rungs[0].id]: true }, project.rungs[0].id, null, 'list');
  const firstLine = summary.lines[0];
  const hasRockwell = firstLine.text.includes('XIC') && firstLine.text.includes('XIO') && firstLine.text.includes('OTE');
  const explainsScan = /scan/.test(firstLine.explanation);
  const focusOk = summary.focusedLine?.rungId === project.rungs[0].id;

  return assertResult(
    'resumo mobile do programa destaca Rockwell e linha ativa',
    summary.dialectShortName === 'Rockwell' && hasRockwell && explainsScan && focusOk && summary.activeCount === 1,
    `dialect=${summary.dialectShortName}, line=${firstLine.text}, explanation=${firstLine.explanation}`,
  );
}

function runFlowProgramSummaryRegression(): SmartphoneProgramRegressionResult {
  const project = createInitialEditorProject();
  const view = createPlcProfileProjectView(project, 'iec_like');
  const summary = createSmartphoneProgramSummary(view, {}, project.rungs[0].id, project.rungs[0].id, 'flow');
  const firstLine = summary.lines[0];

  return assertResult(
    'resumo mobile do programa suporta modo fluxo IEC',
    summary.dialectShortName === 'IEC' && firstLine.text.includes('▶') && /IEC/.test(firstLine.explanation),
    `line=${firstLine.text}`,
  );
}

export function runSmartphoneProgramViewRegressionSuite(): SmartphoneProgramRegressionResult[] {
  return [
    runRockwellProgramSummaryRegression(),
    runFlowProgramSummaryRegression(),
  ];
}
