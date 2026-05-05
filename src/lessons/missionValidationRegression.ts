import { evaluateEditorProject } from '../engine/editorEvaluator';
import { createInitialEditorProject } from '../engine/editorTypes';
import { createInitialRuntimeState } from '../engine/runtimeTypes';
import { getFirstPlcMissionTrack, plcMissionTracks } from './plcMissions';
import { evaluateMissionAttempt, validateMissionRule } from './missionValidation';

type MissionValidationRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, condition: boolean, details?: string): MissionValidationRegressionResult {
  return { name, passed: condition, details: condition ? undefined : details };
}

function runMissionCatalogRegression(): MissionValidationRegressionResult {
  const tracksHaveMissions = plcMissionTracks.every((track) => track.missions.length >= 4);
  const missionsHaveFeedback = plcMissionTracks.every((track) =>
    track.missions.every((mission) =>
      mission.story.length > 20 &&
      mission.objective.length > 12 &&
      mission.validation.length > 0 &&
      mission.validation.every((rule) => rule.feedback.length > 10) &&
      mission.finalExplanation.length > 20,
    ),
  );
  const hasStarterMission = Boolean(getFirstPlcMissionTrack().missions.find((mission) => mission.id === 'primeiro-contato-na'));

  return assertResult(
    'missoes PLC possuem historia objetivo validacao e feedback',
    tracksHaveMissions && missionsHaveFeedback && hasStarterMission,
    `tracks=${plcMissionTracks.length}`,
  );
}

function runStarterMissionValidationRegression(): MissionValidationRegressionResult {
  const project = createInitialEditorProject();
  const mission = getFirstPlcMissionTrack().missions.find((item) => item.id === 'primeiro-contato-na');
  if (!mission) return assertResult('missao starter valida saida apos start', false, 'mission missing');

  const evaluation = evaluateEditorProject(
    project,
    { I0: true, I1: false, Q0: false, 'I0.0': true, 'I0.1': false, 'Q0.0': false },
    1,
    createInitialRuntimeState(),
  );
  const attempt = evaluateMissionAttempt(mission, evaluation.state, evaluation);

  return assertResult(
    'missao starter valida saida apos start',
    attempt.passed && attempt.feedback === mission.finalExplanation,
    `passed=${attempt.passed}, feedback=${attempt.feedback}, q=${String(evaluation.state['Q0.0'] ?? evaluation.state.Q0)}`,
  );
}

function runStopMissionValidationRegression(): MissionValidationRegressionResult {
  const stopRule = { type: 'stop_blocks_output' as const, stopInput: 'I0.1', output: 'Q0.0', feedback: 'STOP bloqueou a saída.' };
  const blocked = validateMissionRule(stopRule, { 'I0.1': true, 'Q0.0': false });
  const unsafe = validateMissionRule(stopRule, { 'I0.1': true, 'Q0.0': true });

  return assertResult(
    'validacao de stop exige saida desligada',
    blocked.passed && !unsafe.passed && unsafe.feedback.includes('ainda não caiu'),
    `blocked=${blocked.passed}, unsafe=${unsafe.feedback}`,
  );
}

function runAddressCompatibilityRegression(): MissionValidationRegressionResult {
  const rule = { type: 'output_on_when_input_on' as const, input: 'I0.0', output: 'Q0.0', feedback: 'Ligou.' };
  const compactState = validateMissionRule(rule, { I0: true, Q0: true });
  const dottedState = validateMissionRule(rule, { 'I0.0': true, 'Q0.0': true });

  return assertResult(
    'validacao aceita tags compactas e enderecos pontuados',
    compactState.passed && dottedState.passed,
    `compact=${compactState.passed}, dotted=${dottedState.passed}`,
  );
}

export function runMissionValidationRegressionSuite(): MissionValidationRegressionResult[] {
  return [
    runMissionCatalogRegression(),
    runStarterMissionValidationRegression(),
    runStopMissionValidationRegression(),
    runAddressCompatibilityRegression(),
  ];
}
