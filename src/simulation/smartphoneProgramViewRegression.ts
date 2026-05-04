import { createInitialEditorProject } from '../engine/editorTypes';
import { createPlcProfileProjectView } from '../plcProfiles/plcProfiles';
import { runCodeContrastRegressionSuite } from '../theme/codeContrastRegression';
import { createProfessionalTagRows, createRungCommentRows } from './professionalClpView';
import { createProfessionalRoutinePlan, routineCompletionHint } from './professionalRoutineModel';
import { createRungOutputSummary } from './rungOutputSummary';
import { createSmartphoneProgramSummary } from './smartphoneProgramView';
import { getSmartphoneViewScale, nextSmartphoneViewScale, shouldPreferFlowView, smartphoneViewGuidance } from './smartphoneViewScale';

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

function runRungOutputSummaryRegression(): SmartphoneProgramRegressionResult {
  const project = createInitialEditorProject();
  const rung = project.rungs[0];
  const variable = rung.coilBlock?.variable ?? 'Q0.0';
  const off = createRungOutputSummary(rung, { [variable]: false });
  const on = createRungOutputSummary(rung, { [variable]: true });

  return assertResult(
    'resumo fixo da saida do rung preserva endereco e estado',
    off.isDefined && off.outputAddress === variable && off.stateLabel === 'OFF' && on.stateLabel === 'ON',
    `address=${off.outputAddress}, off=${off.stateLabel}, on=${on.stateLabel}`,
  );
}

function runSmartphoneViewScaleRegression(): SmartphoneProgramRegressionResult {
  const compact = getSmartphoneViewScale('compact');
  const fit = getSmartphoneViewScale('fit');
  const wide = getSmartphoneViewScale('wide');
  const hasScaleOrder = compact.blockWidth < fit.blockWidth && fit.blockWidth < wide.blockWidth;
  const wrapsScale = nextSmartphoneViewScale('wide') === 'compact';
  const keepsOutputVisible = [compact, fit, wide].every((option) => option.outputAlwaysVisible);
  const recommendsFlow = shouldPreferFlowView(4, 0) && shouldPreferFlowView(2, 2) && !shouldPreferFlowView(2, 0);
  const guidance = smartphoneViewGuidance(5, 0);

  return assertResult(
    'modelo mobile possui zoom enquadramento e recomendacao de fluxo',
    fit.label === 'Enquadrar' && hasScaleOrder && wrapsScale && keepsOutputVisible && recommendsFlow && guidance.includes('Fluxo'),
    `compact=${compact.blockWidth}, fit=${fit.blockWidth}, wide=${wide.blockWidth}, guidance=${guidance}`,
  );
}

function runProfessionalTagTableRegression(): SmartphoneProgramRegressionResult {
  const project = createInitialEditorProject();
  const rows = createProfessionalTagRows(project, { 'I0.0': false, 'Q0.0': false }, { 'Q0.0': 'force_on' });
  const start = rows.find((row) => row.tag === 'I0.0');
  const motor = rows.find((row) => row.tag === 'Q0.0');

  return assertResult(
    'tabela de tags profissional inclui escopo valor descricao e force',
    Boolean(start && motor && start.scope === 'input' && motor.scope === 'output' && motor.value === true && motor.forcedLabel === 'Force ON' && motor.safetyWarning),
    `rows=${rows.length}`,
  );
}

function runProfessionalForceOffRegression(): SmartphoneProgramRegressionResult {
  const project = createInitialEditorProject();
  const rows = createProfessionalTagRows(project, { 'Q0.0': true }, { 'Q0.0': 'force_off' });
  const motor = rows.find((row) => row.tag === 'Q0.0');

  return assertResult(
    'force didatico OFF sobrepoe valor booleano com alerta',
    Boolean(motor && motor.value === false && motor.forcedLabel === 'Force OFF' && motor.safetyWarning?.includes('Force didático')),
    `motor=${motor?.value}, forced=${motor?.forcedLabel}`,
  );
}

function runRungCommentsRegression(): SmartphoneProgramRegressionResult {
  const project = createInitialEditorProject();
  const automatic = createRungCommentRows(project)[0];
  const custom = createRungCommentRows(project, { [project.rungs[0].id]: 'Partida direta com selo do motor.' })[0];

  return assertResult(
    'comentarios por rung suportam automatico e personalizado',
    automatic.hasCustomComment === false && custom.hasCustomComment === true && custom.comment.includes('selo'),
    `auto=${automatic.comment}, custom=${custom.comment}`,
  );
}

function runProfessionalRoutineRegression(): SmartphoneProgramRegressionResult {
  const project = createInitialEditorProject();
  const routines = createProfessionalRoutinePlan(project);
  const ids = routines.map((routine) => routine.id);
  const hasMain = ids.includes('MainRoutine');
  const hasMotor = ids.includes('MotorControl');
  const hasSafety = ids.includes('SafetyLogic');
  const hasSequencer = ids.includes('Sequencer');
  const motorRoutine = routines.find((routine) => routine.id === 'MotorControl');
  const motorHint = motorRoutine ? routineCompletionHint(motorRoutine) : '';

  return assertResult(
    'rotinas profissionais base estao disponiveis',
    hasMain && hasMotor && hasSafety && hasSequencer && motorHint.length > 0,
    `ids=${ids.join(',')}`,
  );
}

export function runSmartphoneProgramViewRegressionSuite(): SmartphoneProgramRegressionResult[] {
  return [
    runRockwellProgramSummaryRegression(),
    runFlowProgramSummaryRegression(),
    runRungOutputSummaryRegression(),
    runSmartphoneViewScaleRegression(),
    runProfessionalTagTableRegression(),
    runProfessionalForceOffRegression(),
    runRungCommentsRegression(),
    runProfessionalRoutineRegression(),
    ...runCodeContrastRegressionSuite(),
  ];
}
