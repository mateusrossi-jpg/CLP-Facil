import { EditorBlock, EditorProjectState } from '../engine/editorTypes';

export type HardwareTagRow = {
  tag: string;
  type: 'Entrada' | 'Saída';
  scope: 'input' | 'output';
  gpio: number;
  description: string;
};

export type HardwareExportFormat = 'esphome' | 'homeAssistant' | 'arduinoEsp32' | 'json';

const SAFE_INPUT_GPIOS = [32, 33, 25, 26, 27] as const;
const SAFE_OUTPUT_GPIOS = [16, 17, 18, 19, 21, 22, 23] as const;

function normalizeTag(value: string | undefined): string {
  return (value ?? '').trim().toUpperCase();
}

function isNumeric(value: string): boolean {
  return /^[-+]?\d+(?:[.,]\d+)?$/.test(value);
}

function inferScope(tag: string): 'input' | 'output' | 'memory' {
  if (tag.startsWith('I')) return 'input';
  if (tag.startsWith('Q') || tag.startsWith('O')) return 'output';
  return 'memory';
}

function allBlocks(project: EditorProjectState): EditorBlock[] {
  return project.rungs.flatMap((rung) => [
    ...rung.seriesBlocks,
    ...rung.parallelBlocks,
    ...(rung.parallelBranches ?? []).flatMap((branch) => branch.blocks),
    ...(rung.coilBlock ? [rung.coilBlock] : []),
  ]);
}

export function collectHardwareTags(project: EditorProjectState): HardwareTagRow[] {
  const rows = new Map<string, HardwareTagRow>();
  const addTag = (rawTag: string | undefined, description: string | undefined) => {
    const tag = normalizeTag(rawTag);
    if (!tag || isNumeric(tag)) return;
    const scope = inferScope(tag);
    if (scope === 'memory') return;
    if (rows.has(tag)) return;
    const list = scope === 'input' ? SAFE_INPUT_GPIOS : SAFE_OUTPUT_GPIOS;
    const currentCount = Array.from(rows.values()).filter((row) => row.scope === scope).length;
    rows.set(tag, {
      tag,
      type: scope === 'input' ? 'Entrada' : 'Saída',
      scope,
      gpio: list[currentCount % list.length],
      description: description?.trim() || `Tag ${scope === 'input' ? 'de entrada' : 'de saída'}`,
    });
  };

  for (const variable of project.projectVariables ?? []) {
    addTag(variable.id || variable.address, variable.name);
  }

  for (const block of allBlocks(project)) {
    [block.variable, block.destination, block.sourceA, block.sourceB, block.downSource, block.resetSource].forEach((candidate) => {
      addTag(candidate, block.name);
    });
  }

  return Array.from(rows.values()).sort((a, b) => a.tag.localeCompare(b.tag));
}

export function generateHardwareExportCode(project: EditorProjectState, format: HardwareExportFormat, tags: HardwareTagRow[]): string {
  const generatedAt = new Date().toISOString();
  if (format === 'esphome') {
    const inputs = tags.filter((row) => row.scope === 'input');
    const outputs = tags.filter((row) => row.scope === 'output');
    return `# Base didática gerada pelo CLP Fácil\n# Revise GPIOs, cargas, relés, proteções e isolamento antes de ligar hardware real.\n# Relés podem exigir active_low em vez de active_high.\n\nesphome:\n  name: clp-facil-node\n\nesp32:\n  board: esp32dev\n  framework:\n    type: arduino\n\n# wifi:\n#   ssid: \"SEU_WIFI\"\n#   password: \"SUA_SENHA\"\n\nlogger:\napi:\nota:\n\nbinary_sensor:\n${inputs.map((row) => `  - platform: gpio\n    pin:\n      number: GPIO${row.gpio}\n      mode: INPUT_PULLUP\n    id: ${row.tag.toLowerCase().replace(/[^a-z0-9]/g, '_')}\n    name: \"${row.tag}\"`).join('\n') || '  # Nenhuma entrada detectada'}\n\nswitch:\n${outputs.map((row) => `  - platform: gpio\n    pin: GPIO${row.gpio}\n    id: ${row.tag.toLowerCase().replace(/[^a-z0-9]/g, '_')}\n    name: \"${row.tag}\"\n    restore_mode: ALWAYS_OFF`).join('\n') || '  # Nenhuma saída detectada'}\n`;
  }

  if (format === 'homeAssistant') {
    return `# Base para Home Assistant (helpers + automations)\n# Revise GPIOs, cargas, relés, proteções e isolamento antes de ligar hardware real.\n\ninput_boolean:\n${tags.filter((row) => row.scope === 'input').map((row) => `  ${row.tag.toLowerCase().replace(/[^a-z0-9]/g, '_')}:\n    name: ${row.tag}`).join('\n') || '  entrada_exemplo:\n    name: I0.0'}\n\nautomation:\n  - alias: \"CLP Facil - exemplo simples\"\n    trigger:\n      - platform: state\n        entity_id: input_boolean.${tags.find((row) => row.scope === 'input')?.tag.toLowerCase().replace(/[^a-z0-9]/g, '_') ?? 'entrada_exemplo'}\n    action:\n      - service: logbook.log\n        data:\n          name: \"CLP Facil\"\n          message: \"Troca de estado detectada (base didática).\"\n`;
  }

  if (format === 'arduinoEsp32') {
    const inputs = tags.filter((row) => row.scope === 'input');
    const outputs = tags.filter((row) => row.scope === 'output');
    return `// Base didática Arduino/ESP32\n// Revise GPIOs, cargas, relés, proteções e isolamento antes de ligar hardware real.\n// Alguns módulos de relé podem ser active_low (nível LOW liga).\n\n${inputs.map((row) => `const int ${row.tag.replace(/[^A-Z0-9]/g, '_')} = ${row.gpio};`).join('\n')}\n${outputs.map((row) => `const int ${row.tag.replace(/[^A-Z0-9]/g, '_')} = ${row.gpio};`).join('\n')}\n\nvoid setup() {\n  Serial.begin(115200);\n${inputs.map((row) => `  pinMode(${row.tag.replace(/[^A-Z0-9]/g, '_')}, INPUT_PULLUP);`).join('\n')}\n${outputs.map((row) => `  pinMode(${row.tag.replace(/[^A-Z0-9]/g, '_')}, OUTPUT);\n  digitalWrite(${row.tag.replace(/[^A-Z0-9]/g, '_')}, LOW);`).join('\n')}\n}\n\nvoid loop() {\n${inputs[0] && outputs[0] ? `  bool inputState = digitalRead(${inputs[0].tag.replace(/[^A-Z0-9]/g, '_')}) == LOW;\n  digitalWrite(${outputs[0].tag.replace(/[^A-Z0-9]/g, '_')}, inputState ? HIGH : LOW);` : '  // Adicione sua lógica de ladder aqui (placeholder por TAG).'}\n  delay(20);\n}\n`;
  }

  return JSON.stringify({
    projectName: 'CLP Facil',
    inputs: tags.filter((row) => row.scope === 'input'),
    outputs: tags.filter((row) => row.scope === 'output'),
    rungs: project.rungs,
    blocks: allBlocks(project),
    generatedAt,
  }, null, 2);
}
