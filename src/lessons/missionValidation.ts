import { EditorEvaluationResult } from '../engine/editorEvaluator';
import { PlcState } from '../engine/projectTypes';
import { PlcMission, PlcMissionAttempt, PlcMissionValidation } from './missionTypes';

export type PlcMissionRuleResult = {
  type: PlcMissionValidation['type'];
  passed: boolean;
  feedback: string;
};

export type PlcMissionValidationSummary = PlcMissionAttempt & {
  totalRules: number;
  passedRules: number;
  ruleResults: PlcMissionRuleResult[];
};

function normalizeAddress(address: string | undefined): string {
  return (address ?? '').trim().toUpperCase();
}

function compactAddress(address: string): string {
  return address.replace('.0', '');
}

function readPoint(state: PlcState, address: string | undefined): boolean | number | undefined {
  const normalized = normalizeAddress(address);
  if (!normalized) return undefined;
  if (Object.prototype.hasOwnProperty.call(state, normalized)) return state[normalized];

  const compact = compactAddress(normalized);
  if (Object.prototype.hasOwnProperty.call(state, compact)) return state[compact];

  if (!normalized.includes('.') && Object.prototype.hasOwnProperty.call(state, `${normalized}.0`)) {
    return state[`${normalized}.0`];
  }

  return undefined;
}

function isActive(value: boolean | number | undefined): boolean {
  if (typeof value === 'number') return value !== 0;
  return Boolean(value);
}

function matchesExpected(value: boolean | number | undefined, expected: boolean | number | undefined): boolean {
  if (expected === undefined) return isActive(value);
  if (typeof expected === 'number') return Number(value ?? 0) === expected;
  return isActive(value) === expected;
}

function offLabel(address: string | undefined): string {
  return address ? `${normalizeAddress(address)} OFF` : 'saída OFF';
}

export function validateMissionRule(
  rule: PlcMissionValidation,
  state: PlcState,
  evaluation?: EditorEvaluationResult,
): PlcMissionRuleResult {
  const currentState = evaluation?.state ?? state;
  const inputValue = readPoint(currentState, rule.input);
  const outputValue = readPoint(currentState, rule.output);
  const stopValue = readPoint(currentState, rule.stopInput);
  const scanNumber = evaluation?.scanNumber ?? 0;

  if (rule.type === 'output_on_when_input_on') {
    const passed = isActive(inputValue) && isActive(outputValue);
    return {
      type: rule.type,
      passed,
      feedback: passed
        ? rule.feedback
        : `Acione ${normalizeAddress(rule.input)} e rode Scan até ${normalizeAddress(rule.output)} ficar ON.`,
    };
  }

  if (rule.type === 'output_off_when_input_off') {
    const inputOff = rule.input ? !isActive(inputValue) : true;
    const outputOff = !isActive(outputValue);
    const passed = inputOff && outputOff;
    return {
      type: rule.type,
      passed,
      feedback: passed
        ? rule.feedback
        : `Com ${rule.input ? offLabel(rule.input) : 'a condição desligada'}, ${normalizeAddress(rule.output)} deve ficar OFF.`,
    };
  }

  if (rule.type === 'stop_blocks_output') {
    const stopPressed = isActive(stopValue);
    const outputBlocked = !isActive(outputValue);
    const passed = stopPressed && outputBlocked;
    return {
      type: rule.type,
      passed,
      feedback: passed
        ? rule.feedback
        : stopPressed
          ? `${normalizeAddress(rule.stopInput)} foi acionado, mas ${normalizeAddress(rule.output)} ainda não caiu. Revise o caminho do selo.`
          : `Acione ${normalizeAddress(rule.stopInput)} e confirme ${normalizeAddress(rule.output)} OFF.`,
    };
  }

  if (rule.type === 'scan_concept') {
    const sawInput = rule.input ? isActive(inputValue) : true;
    const sawOutput = rule.output ? isActive(outputValue) : true;
    const passed = scanNumber > 0 ? (sawInput || sawOutput) : sawInput;
    return {
      type: rule.type,
      passed,
      feedback: passed ? rule.feedback : 'Acione a entrada, rode um Scan e observe entrada, rung e saída juntos.',
    };
  }

  const measuredValue = rule.output ? outputValue : rule.input ? inputValue : undefined;
  const passed = rule.expected !== undefined || rule.output || rule.input
    ? matchesExpected(measuredValue, rule.expected)
    : true;

  return {
    type: rule.type,
    passed,
    feedback: passed ? rule.feedback : 'A missão ainda não atingiu a condição esperada. Revise a lógica e tente outro Scan.',
  };
}

export function evaluateMissionAttempt(
  mission: PlcMission,
  state: PlcState,
  evaluation?: EditorEvaluationResult,
): PlcMissionValidationSummary {
  const ruleResults = mission.validation.map((rule) => validateMissionRule(rule, state, evaluation));
  const passedRules = ruleResults.filter((result) => result.passed).length;
  const passed = ruleResults.length > 0 && passedRules === ruleResults.length;
  const firstOpenRule = ruleResults.find((result) => !result.passed);

  return {
    missionId: mission.id,
    state: evaluation?.state ?? state,
    passed,
    feedback: passed ? mission.finalExplanation : firstOpenRule?.feedback ?? 'Continue testando a missão.',
    totalRules: ruleResults.length,
    passedRules,
    ruleResults,
  };
}
