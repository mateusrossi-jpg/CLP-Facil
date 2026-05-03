import { EvaluationResult, LadderBranch, LadderContact, LadderProject, LadderRung, PlcState } from './projectTypes';

function readContact(contact: LadderContact, state: PlcState): boolean {
  const value = Boolean(state[contact.variableId]);
  return contact.type === 'NO' ? value : !value;
}

function evaluateSeries(contacts: LadderContact[], state: PlcState): boolean {
  if (contacts.length === 0) return true;
  return contacts.every((contact) => readContact(contact, state));
}

function evaluateBranch(branch: LadderBranch, state: PlcState): boolean {
  return evaluateSeries(branch.contacts, state);
}

function evaluateRung(rung: LadderRung, state: PlcState): boolean {
  const seriesOk = evaluateSeries(rung.seriesContacts, state);
  const hasParallel = rung.parallelBranches.length > 0;
  const parallelOk = hasParallel ? rung.parallelBranches.some((branch) => evaluateBranch(branch, state)) : true;
  return seriesOk && parallelOk;
}

export function createInitialState(project: LadderProject): PlcState {
  return project.variables.reduce<PlcState>((acc, variable) => {
    acc[variable.id] = Boolean(variable.defaultValue);
    return acc;
  }, {});
}

export function evaluateProject(project: LadderProject, currentState: PlcState): EvaluationResult {
  const nextState: PlcState = { ...currentState };
  const energizedRungs: Record<string, boolean> = {};

  for (const rung of project.rungs) {
    const energized = evaluateRung(rung, nextState);
    energizedRungs[rung.id] = energized;
    nextState[rung.coilVariableId] = energized;
  }

  Object.entries(project.actuatorLinks).forEach(([actuatorId, outputId]) => {
    nextState[actuatorId] = Boolean(nextState[outputId]);
  });

  return {
    state: nextState,
    energizedRungs,
    explanation: buildExplanation(project, nextState),
  };
}

export function setInput(project: LadderProject, state: PlcState, inputId: string, value: boolean): EvaluationResult {
  const variable = project.variables.find((item) => item.id === inputId);
  if (!variable || variable.type !== 'input') {
    return evaluateProject(project, state);
  }

  return evaluateProject(project, {
    ...state,
    [inputId]: value,
  });
}

function buildExplanation(project: LadderProject, state: PlcState): string {
  const emergency = state.I2 === false;
  const overload = state.I3 === false;
  const stopOpen = state.I1 === false;
  const motorOn = Boolean(state.MTR1);

  if (emergency) return 'A emergência está acionada. O contato NF abriu e cortou a alimentação lógica do contator.';
  if (overload) return 'A sobrecarga está acionada. A proteção abriu o circuito e desligou o motor.';
  if (stopOpen) return 'O botão Desliga foi pressionado. O contato NF abriu e removeu o selo do contator.';
  if (motorOn) return 'O contator K1 está energizado. O contato auxiliar de selo mantém o motor ligado mesmo após soltar o botão Liga.';
  return 'O circuito está pronto. Pressione Liga para energizar o contator K1 e acionar o motor.';
}
