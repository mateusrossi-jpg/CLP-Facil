import { CompiledHardwareProject, HardwarePinMap } from './hardwareTypes';

function normalizeVariable(variable: string | undefined): string {
  return (variable ?? '').trim().toUpperCase();
}

function idName(variable: string): string {
  return normalizeVariable(variable).replace(/[^A-Z0-9_]/g, '_').toLowerCase();
}

function pinFor(project: CompiledHardwareProject, variable: string): HardwarePinMap | undefined {
  const normalized = normalizeVariable(variable);
  return project.pinMap.find((pin) => normalizeVariable(pin.variable) === normalized);
}

function isInput(pin: HardwarePinMap): boolean {
  return pin.mode === 'input_pullup' || pin.mode === 'input_pulldown' || pin.mode === 'input_floating';
}

function yamlPin(pin: HardwarePinMap): string[] {
  if (pin.mode === 'input_floating') {
    return [`      number: ${pin.pin}`];
  }

  return [
    `      number: ${pin.pin}`,
    `      mode: ${pin.mode === 'input_pullup' ? 'INPUT_PULLUP' : pin.mode === 'input_pulldown' ? 'INPUT_PULLDOWN' : 'OUTPUT'}`,
  ];
}

export function exportEspHomeYaml(project: CompiledHardwareProject): string {
  const lines: string[] = [
    '# YAML gerado pelo Easy-CLP / CLP Facil',
    '# ATENCAO: exportacao ESPHome inicial. A logica Ladder completa deve ser validada em bancada antes de acionar cargas reais.',
    'esphome:',
    `  name: ${project.nodeName.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase() || 'easy-clp-node'}`,
    '',
    'esp32:',
    '  board: esp32dev',
    '',
    'logger:',
    '',
    'api:',
    '',
    'ota:',
    '',
  ];

  const inputPins = project.pinMap.filter(isInput);
  const outputPins = project.pinMap.filter((pin) => pin.mode === 'output');

  if (inputPins.length > 0) {
    lines.push('binary_sensor:');
    for (const pin of inputPins) {
      lines.push('  - platform: gpio');
      lines.push('    pin:');
      lines.push(...yamlPin(pin));
      if (pin.mode === 'input_pullup') lines.push('      inverted: true');
      lines.push(`    id: ${idName(pin.variable)}`);
      lines.push(`    name: "${pin.label || pin.variable}"`);
      if (pin.debounceMs && pin.debounceMs > 0) {
        lines.push('    filters:');
        lines.push(`      - delayed_on: ${pin.debounceMs}ms`);
        lines.push(`      - delayed_off: ${pin.debounceMs}ms`);
      }
    }
    lines.push('');
  }

  if (outputPins.length > 0) {
    lines.push('switch:');
    for (const pin of outputPins) {
      lines.push('  - platform: gpio');
      lines.push('    pin:');
      lines.push(`      number: ${pin.pin}`);
      if (pin.outputPolarity === 'active_low') lines.push('      inverted: true');
      lines.push(`    id: ${idName(pin.variable)}`);
      lines.push(`    name: "${pin.label || pin.variable}"`);
      lines.push(`    restore_mode: ${pin.safeState ? 'RESTORE_DEFAULT_ON' : 'RESTORE_DEFAULT_OFF'}`);
    }
    lines.push('');
  }

  lines.push('# Observacao: esta primeira exportacao cria os pontos de I/O no ESPHome.');
  lines.push('# A execucao completa de Ladder com scan, bordas, timers e contadores fica mais fiel no exportador Arduino C++ ou em firmware proprio.');

  const missing = project.variables
    .filter((variable) => (variable.scope === 'input' || variable.scope === 'output') && !pinFor(project, variable.variable))
    .map((variable) => variable.variable);

  if (missing.length > 0) {
    lines.push('# Variaveis sem pino mapeado:');
    for (const variable of missing) lines.push(`# - ${variable}`);
  }

  return `${lines.join('\n')}\n`;
}
