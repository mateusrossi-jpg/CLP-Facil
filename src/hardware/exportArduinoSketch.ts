import {
  CompiledHardwareContact,
  CompiledHardwareOutput,
  CompiledHardwareProject,
  CompiledHardwareRung,
  HardwarePinMap,
} from './hardwareTypes';

function normalizeVariable(variable: string | undefined): string {
  return (variable ?? '').trim().toUpperCase();
}

function cppName(variable: string): string {
  return normalizeVariable(variable).replace(/[^A-Z0-9_]/g, '_').toLowerCase();
}

function pinConstName(variable: string): string {
  return `PIN_${cppName(variable).toUpperCase()}`;
}

function boolVar(variable: string): string {
  return cppName(variable);
}

function prevVar(variable: string): string {
  return `prev_${cppName(variable)}`;
}

function timerStructName(blockId: string): string {
  return `timer_${cppName(blockId)}`;
}

function counterStructName(blockId: string): string {
  return `counter_${cppName(blockId)}`;
}

function numericLiteral(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value.trim().replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

function readValue(source: string | undefined): string {
  const literal = numericLiteral(source);
  if (literal !== null) return String(literal);
  return boolVar(source ?? '0');
}

function pinFor(project: CompiledHardwareProject, variable: string): HardwarePinMap | undefined {
  const normalized = normalizeVariable(variable);
  return project.pinMap.find((pin) => normalizeVariable(pin.variable) === normalized);
}

function isInputMode(mode: HardwarePinMap['mode']): boolean {
  return mode === 'input_pullup' || mode === 'input_pulldown' || mode === 'input_floating';
}

function arduinoPinMode(mode: HardwarePinMap['mode']): string {
  if (mode === 'input_pullup') return 'INPUT_PULLUP';
  return mode === 'output' ? 'OUTPUT' : 'INPUT';
}

function readPinExpression(pin: HardwarePinMap): string {
  const pinRead = `digitalRead(${pinConstName(pin.variable)})`;
  if (pin.mode === 'input_pullup') return `${pinRead} == LOW`;
  return `${pinRead} == HIGH`;
}

function outputOnExpression(pin: HardwarePinMap): string {
  return pin.outputPolarity === 'active_low' ? 'LOW' : 'HIGH';
}

function outputOffExpression(pin: HardwarePinMap): string {
  return pin.outputPolarity === 'active_low' ? 'HIGH' : 'LOW';
}

function contactExpression(contact: CompiledHardwareContact): string {
  if (contact.compareMode) {
    const left = readValue(contact.sourceA);
    const right = readValue(contact.sourceB);
    switch (contact.compareMode) {
      case 'NEQ':
        return `(${left} != ${right})`;
      case 'GRT':
        return `(${left} > ${right})`;
      case 'LES':
        return `(${left} < ${right})`;
      case 'GEQ':
        return `(${left} >= ${right})`;
      case 'LEQ':
        return `(${left} <= ${right})`;
      case 'EQU':
      default:
        return `(${left} == ${right})`;
    }
  }

  const variable = boolVar(contact.variable);
  if (contact.mode === 'NC') return `(!${variable})`;
  if (contact.mode === 'RISING') return `(${variable} && !${prevVar(contact.variable)})`;
  if (contact.mode === 'FALLING') return `(!${variable} && ${prevVar(contact.variable)})`;
  return `(${variable})`;
}

function branchExpression(branchContacts: CompiledHardwareContact[]): string {
  if (branchContacts.length === 0) return 'false';
  return branchContacts.map(contactExpression).join(' && ');
}

function rungConditionExpression(rung: CompiledHardwareRung): string {
  const seriesContacts = rung.seriesContacts;
  const seriesLength = seriesContacts.length;

  if (seriesLength === 0 && rung.parallelBranches.length === 0) return 'false';
  if (seriesLength === 0) {
    return rung.parallelBranches.map((branch) => `(${branchExpression(branch.contacts)})`).join(' || ') || 'false';
  }

  const nodeExprs: string[][] = Array.from({ length: seriesLength + 1 }, () => []);
  nodeExprs[0].push('true');

  for (let nodeIndex = 0; nodeIndex < seriesLength; nodeIndex += 1) {
    const baseExpr = nodeExprs[nodeIndex].length > 0 ? `(${nodeExprs[nodeIndex].join(' || ')})` : 'false';
    const contactExpr = contactExpression(seriesContacts[nodeIndex]);
    nodeExprs[nodeIndex + 1].push(`(${baseExpr} && ${contactExpr})`);

    for (const branch of rung.parallelBranches) {
      if (branch.seriesIndex !== nodeIndex) continue;
      const span = Math.max(branch.contacts.length, 1);
      const endIndex = Math.min(nodeIndex + span, seriesLength);
      nodeExprs[endIndex].push(`(${baseExpr} && (${branchExpression(branch.contacts)}))`);
    }
  }

  return nodeExprs[seriesLength].length > 0 ? `(${nodeExprs[seriesLength].join(' || ')})` : 'false';
}

function applyOutputCode(output: CompiledHardwareOutput, conditionName: string): string[] {
  const variable = boolVar(output.variable);

  if (output.role === 'timer') {
    const timerName = timerStructName(output.id);
    const preset = Math.max(output.presetMs ?? 1000, 1);
    const mode = output.timerMode ?? 'TON';
    if (mode === 'TON') {
      return [
        `  ${timerName}.in = ${conditionName};`,
        `  if (${timerName}.in) {`,
        `    ${timerName}.elapsedMs = min(${timerName}.elapsedMs + SCAN_MS, ${preset}UL);`,
        `    ${timerName}.q = ${timerName}.elapsedMs >= ${preset}UL;`,
        `  } else {`,
        `    ${timerName}.elapsedMs = 0;`,
        `    ${timerName}.q = false;`,
        `  }`,
        `  ${variable} = ${timerName}.q;`,
      ];
    }
    if (mode === 'TOF') {
      return [
        `  ${timerName}.in = ${conditionName};`,
        `  if (${timerName}.in) {`,
        `    ${timerName}.elapsedMs = 0;`,
        `    ${timerName}.q = true;`,
        `  } else if (${timerName}.q) {`,
        `    ${timerName}.elapsedMs = min(${timerName}.elapsedMs + SCAN_MS, ${preset}UL);`,
        `    ${timerName}.q = ${timerName}.elapsedMs < ${preset}UL;`,
        `  } else {`,
        `    ${timerName}.elapsedMs = 0;`,
        `    ${timerName}.q = false;`,
        `  }`,
        `  ${variable} = ${timerName}.q;`,
      ];
    }
    return [
      `  bool ${timerName}_rise = ${conditionName} && !${timerName}.prevIn;`,
      `  if (${timerName}_rise) {`,
      `    ${timerName}.elapsedMs = 0;`,
      `    ${timerName}.q = true;`,
      `  } else if (${timerName}.q) {`,
      `    ${timerName}.elapsedMs = min(${timerName}.elapsedMs + SCAN_MS, ${preset}UL);`,
      `    ${timerName}.q = ${timerName}.elapsedMs < ${preset}UL;`,
      `  }`,
      `  ${timerName}.prevIn = ${conditionName};`,
      `  ${variable} = ${timerName}.q;`,
    ];
  }

  if (output.role === 'counter') {
    const counterName = counterStructName(output.id);
    const preset = Math.max(output.preset ?? 1, 1);
    const mode = output.counterMode ?? 'CTU';
    const downSource = readValue(output.downSource);
    const resetSource = readValue(output.resetSource);
    const lines = [
      `  bool ${counterName}_cuRise = ${conditionName} && !${counterName}.prevCu;`,
      `  bool ${counterName}_cd = ${mode === 'CTUD' ? downSource : 'false'};`,
      `  bool ${counterName}_cdRise = ${counterName}_cd && !${counterName}.prevCd;`,
      `  bool ${counterName}_reset = ${resetSource};`,
      `  bool ${counterName}_resetRise = ${counterName}_reset && !${counterName}.prevReset;`,
      `  if (${counterName}_resetRise) {`,
      `    ${counterName}.value = 0;`,
      `  }`,
    ];
    if (mode === 'CTD') {
      lines.push(
        `  if (${counterName}.value == 0 && !${counterName}.prevCu) ${counterName}.value = ${preset};`,
        `  if (!${counterName}_resetRise && ${counterName}_cuRise) ${counterName}.value = max(${counterName}.value - 1, 0);`,
        `  ${counterName}.q = ${counterName}.value <= 0;`,
      );
    } else {
      lines.push(
        `  if (!${counterName}_resetRise && ${counterName}_cuRise) ${counterName}.value = min(${counterName}.value + 1, ${preset});`,
      );
      if (mode === 'CTUD') {
        lines.push(`  if (!${counterName}_resetRise && ${counterName}_cdRise) ${counterName}.value = max(${counterName}.value - 1, 0);`);
      }
      lines.push(`  ${counterName}.q = ${counterName}.value >= ${preset};`);
    }
    lines.push(
      `  ${counterName}.prevCu = ${conditionName};`,
      `  ${counterName}.prevCd = ${counterName}_cd;`,
      `  ${counterName}.prevReset = ${counterName}_reset;`,
      `  ${variable} = ${counterName}.q;`,
    );
    return lines;
  }

  if (output.mathMode) {
    const destination = boolVar(output.destination || output.variable);
    const left = readValue(output.sourceA);
    const right = readValue(output.sourceB);
    const expr = output.mathMode === 'ADD'
      ? `${left} + ${right}`
      : output.mathMode === 'SUB'
        ? `${left} - ${right}`
        : output.mathMode === 'MUL'
          ? `${left} * ${right}`
          : output.mathMode === 'DIV'
            ? `(${right} == 0 ? 0 : ${left} / ${right})`
            : left;
    return [
      `  if (${conditionName}) {`,
      `    ${destination} = ${expr};`,
      `  }`,
    ];
  }

  switch (output.coilMode ?? 'NORMAL') {
    case 'SET':
      return [`  if (${conditionName}) ${variable} = true;`];
    case 'RESET':
      return [`  if (${conditionName}) ${variable} = false;`];
    case 'PULSE':
      return [`  ${variable} = ${conditionName} && !prev_rung_${cppName(output.id)};`, `  prev_rung_${cppName(output.id)} = ${conditionName};`];
    case 'NORMAL':
    default:
      return [`  ${variable} = ${conditionName};`];
  }
}

function renderWarnings(project: CompiledHardwareProject): string[] {
  const warnings = [
    'ATENCAO: este codigo e didatico e nao substitui protecoes eletricas fisicas.',
    'Use fusivel/disjuntor, rele termico, emergencia, intertravamento mecanico e isolamento adequado quando houver cargas reais.',
    'Durante boot/reset do microcontrolador podem ocorrer estados transitorios se o hardware nao for projetado corretamente.',
    ...project.warnings,
  ];

  return warnings.map((warning) => `// - ${warning}`);
}

export function exportArduinoSketch(project: CompiledHardwareProject): string {
  const pinMaps = project.pinMap;
  const inputPins = pinMaps.filter((pin) => isInputMode(pin.mode));
  const outputPins = pinMaps.filter((pin) => pin.mode === 'output');
  const booleanVariables = project.variables.filter((variable) => variable.dataType !== 'number');
  const numericVariables = project.variables.filter((variable) => variable.dataType === 'number');
  const timers = project.rungs.map((rung) => rung.output).filter((output): output is CompiledHardwareOutput => Boolean(output && output.role === 'timer'));
  const counters = project.rungs.map((rung) => rung.output).filter((output): output is CompiledHardwareOutput => Boolean(output && output.role === 'counter'));
  const pulseOutputs = project.rungs.map((rung) => rung.output).filter((output): output is CompiledHardwareOutput => Boolean(output && output.coilMode === 'PULSE'));

  const lines: string[] = [
    '// Codigo gerado pelo Easy-CLP / CLP Facil',
    `// Projeto: ${project.nodeName}`,
    ...renderWarnings(project),
    '',
    `const unsigned long SCAN_MS = ${project.scanMs}UL;`,
    '',
  ];

  for (const pin of pinMaps) {
    lines.push(`const int ${pinConstName(pin.variable)} = ${pin.pin};`);
  }

  if (pinMaps.length > 0) lines.push('');

  for (const variable of booleanVariables) {
    lines.push(`bool ${boolVar(variable.variable)} = false;`);
  }
  for (const variable of numericVariables) {
    lines.push(`float ${boolVar(variable.variable)} = 0;`);
  }
  for (const edgeVariable of project.edgeVariables) {
    lines.push(`bool ${prevVar(edgeVariable)} = false;`);
  }
  for (const output of pulseOutputs) {
    lines.push(`bool prev_rung_${cppName(output.id)} = false;`);
  }

  if (timers.length > 0) {
    lines.push('', 'struct TimerState {', '  unsigned long elapsedMs;', '  bool q;', '  bool in;', '  bool prevIn;', '};');
    for (const timer of timers) lines.push(`TimerState ${timerStructName(timer.id)} = {0, false, false, false};`);
  }

  if (counters.length > 0) {
    lines.push('', 'struct CounterState {', '  int value;', '  bool q;', '  bool prevCu;', '  bool prevCd;', '  bool prevReset;', '};');
    for (const counter of counters) lines.push(`CounterState ${counterStructName(counter.id)} = {0, false, false, false, false};`);
  }

  lines.push('', 'void setup() {');
  for (const pin of inputPins) {
    lines.push(`  pinMode(${pinConstName(pin.variable)}, ${arduinoPinMode(pin.mode)});`);
  }
  for (const pin of outputPins) {
    lines.push(`  pinMode(${pinConstName(pin.variable)}, OUTPUT);`);
    lines.push(`  digitalWrite(${pinConstName(pin.variable)}, ${pin.safeState ? outputOnExpression(pin) : outputOffExpression(pin)});`);
  }
  lines.push('}');

  lines.push('', 'void readInputs() {');
  for (const pin of inputPins) {
    lines.push(`  ${boolVar(pin.variable)} = ${readPinExpression(pin)};`);
  }
  lines.push('}');

  lines.push('', 'void executeLadder() {');
  project.rungs.forEach((rung, index) => {
    if (!rung.output) return;
    const condition = rungConditionExpression(rung);
    const conditionName = `rung_${index + 1}`;
    lines.push(`  // ${rung.label}`);
    lines.push(`  bool ${conditionName} = ${condition};`);
    lines.push(...applyOutputCode(rung.output, conditionName));
  });
  lines.push('}');

  lines.push('', 'void writeOutputs() {');
  for (const pin of outputPins) {
    lines.push(`  digitalWrite(${pinConstName(pin.variable)}, ${boolVar(pin.variable)} ? ${outputOnExpression(pin)} : ${outputOffExpression(pin)});`);
  }
  lines.push('}');

  lines.push('', 'void updatePreviousStates() {');
  for (const edgeVariable of project.edgeVariables) {
    lines.push(`  ${prevVar(edgeVariable)} = ${boolVar(edgeVariable)};`);
  }
  lines.push('}');

  lines.push('', 'void loop() {');
  lines.push('  readInputs();');
  lines.push('  executeLadder();');
  lines.push('  writeOutputs();');
  lines.push('  updatePreviousStates();');
  lines.push('  delay(SCAN_MS);');
  lines.push('}');

  return `${lines.join('\n')}\n`;
}
