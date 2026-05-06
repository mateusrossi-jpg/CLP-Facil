import { EditorBlock, EditorProjectState } from '../engine/editorTypes';

export type HardwarePlatform = 'esphome' | 'homeAssistant' | 'arduinoEsp32' | 'openPlcEsp32' | 'espIdf' | 'json';
export type EspBoardProfile = 'esp32dev' | 'esp32-wroom-32' | 'esp32-devkit-v1' | 'esp32-s3-devkit' | 'esp32-c3-devkit' | 'custom';

export type HardwareTagRow = {
  tag: string;
  type: 'Entrada' | 'Saída';
  scope: 'input' | 'output';
  gpio: number;
  description: string;
};

export type HardwareExportOptions = {
  platform: HardwarePlatform;
  boardProfile: EspBoardProfile;
};

const SAFE_INPUT_GPIOS = [32, 33, 25, 26, 27] as const;
const SAFE_OUTPUT_GPIOS = [16, 17, 18, 19, 21, 22, 23] as const;
const RESERVED_BOOT_GPIOS = [0, 2, 12, 15] as const;

const BOARD_LABELS: Record<EspBoardProfile, string> = {
  esp32dev: 'ESP32 Dev Module',
  'esp32-wroom-32': 'ESP32-WROOM-32',
  'esp32-devkit-v1': 'ESP32 DevKit V1',
  'esp32-s3-devkit': 'ESP32-S3 DevKit',
  'esp32-c3-devkit': 'ESP32-C3 DevKit',
  custom: 'Placa própria / customizada',
};

function normalizeTag(value: string | undefined): string {
  return (value ?? '').trim().toUpperCase();
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/^_+|_+$/g, '') || 'tag';
}

function cIdentifier(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/^_+|_+$/g, '') || 'TAG';
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
    if (scope === 'memory' || rows.has(tag)) return;
    const gpioList = scope === 'input' ? SAFE_INPUT_GPIOS : SAFE_OUTPUT_GPIOS;
    const usedOfSameScope = Array.from(rows.values()).filter((row) => row.scope === scope).length;
    rows.set(tag, {
      tag,
      type: scope === 'input' ? 'Entrada' : 'Saída',
      scope,
      gpio: gpioList[usedOfSameScope % gpioList.length],
      description: description?.trim() || `Tag ${scope === 'input' ? 'de entrada' : 'de saída'}`,
    });
  };

  for (const variable of project.projectVariables ?? []) {
    addTag(variable.id || variable.address, variable.name);
  }
  for (const block of allBlocks(project)) {
    [block.variable, block.destination, block.sourceA, block.sourceB, block.downSource, block.resetSource].forEach((candidate) => addTag(candidate, block.name));
  }
  return Array.from(rows.values()).sort((a, b) => a.tag.localeCompare(b.tag));
}

export function boardLabel(profile: EspBoardProfile): string {
  return BOARD_LABELS[profile];
}

export function hardwareSafetyNotice(): string {
  return [
    'ATENÇÃO: código base didático. Revise GPIOs, cargas, relés, proteções, fonte, isolamento, optoacopladores e nível lógico antes de ligar hardware real.',
    `GPIOs não sugeridos por padrão por risco de boot/strap: ${RESERVED_BOOT_GPIOS.map((pin) => `GPIO${pin}`).join(', ')}.`,
    'Módulos de relé podem ser active_low; confirme se HIGH liga ou desliga antes de energizar cargas.',
  ].join('\n');
}

function esphomeBoard(profile: EspBoardProfile): string {
  if (profile === 'esp32-s3-devkit') return 'esp32-s3-devkitc-1';
  if (profile === 'esp32-c3-devkit') return 'esp32-c3-devkitm-1';
  return 'esp32dev';
}

export function generateHardwareExportCode(project: EditorProjectState, tags: HardwareTagRow[], options: HardwareExportOptions): string {
  const inputs = tags.filter((row) => row.scope === 'input');
  const outputs = tags.filter((row) => row.scope === 'output');
  const generatedAt = new Date().toISOString();
  const board = boardLabel(options.boardProfile);
  const safetyComment = hardwareSafetyNotice().replace(/\n/g, '\n# ');
  const safetyCpp = hardwareSafetyNotice().replace(/\n/g, '\n// ');

  if (options.platform === 'esphome') {
    return `# CLP Fácil → ESPHome\n# Placa alvo: ${board}\n# ${safetyComment}\n\nesphome:\n  name: clp-facil-node\n  friendly_name: CLP Facil Node\n\nesp32:\n  board: ${esphomeBoard(options.boardProfile)}\n  framework:\n    type: arduino\n\n# wifi:\n#   ssid: "SUA_REDE"\n#   password: "SUA_SENHA"\n\nlogger:\napi:\nota:\n\nbinary_sensor:\n${inputs.map((row) => `  - platform: gpio\n    pin:\n      number: GPIO${row.gpio}\n      mode: INPUT_PULLUP\n      inverted: true\n    id: ${slug(row.tag)}\n    name: "${row.tag} - ${row.description}"`).join('\n') || '  # Nenhuma entrada I detectada'}\n\nswitch:\n${outputs.map((row) => `  - platform: gpio\n    pin: GPIO${row.gpio}\n    id: ${slug(row.tag)}\n    name: "${row.tag} - ${row.description}"\n    restore_mode: ALWAYS_OFF\n    # Se seu módulo de relé for active_low, use inverted: true no pin.`).join('\n') || '  # Nenhuma saída Q/O detectada'}\n`;
  }

  if (options.platform === 'homeAssistant') {
    return `# CLP Fácil → Home Assistant\n# ${safetyComment}\n\ninput_boolean:\n${inputs.map((row) => `  ${slug(row.tag)}:\n    name: ${row.tag} - ${row.description}`).join('\n') || '  entrada_exemplo:\n    name: I0.0 START'}\n\nautomation:\n  - alias: "CLP Fácil - exemplo de scan lógico"\n    mode: single\n    trigger:\n${inputs.map((row) => `      - platform: state\n        entity_id: input_boolean.${slug(row.tag)}`).join('\n') || '      - platform: state\n        entity_id: input_boolean.entrada_exemplo'}\n    action:\n      - service: logbook.log\n        data:\n          name: "CLP Fácil"\n          message: "Entrada alterada; use esta base para ligar helpers, ESPHome ou automações reais."\n`;
  }

  if (options.platform === 'arduinoEsp32') {
    return `// CLP Fácil → Arduino ESP32\n// Placa alvo: ${board}\n// ${safetyCpp}\n\n${inputs.map((row) => `const int PIN_${cIdentifier(row.tag)} = ${row.gpio};`).join('\n')}\n${outputs.map((row) => `const int PIN_${cIdentifier(row.tag)} = ${row.gpio};`).join('\n')}\n\nvoid setup() {\n  Serial.begin(115200);\n${inputs.map((row) => `  pinMode(PIN_${cIdentifier(row.tag)}, INPUT_PULLUP);`).join('\n')}\n${outputs.map((row) => `  pinMode(PIN_${cIdentifier(row.tag)}, OUTPUT);\n  digitalWrite(PIN_${cIdentifier(row.tag)}, LOW);`).join('\n')}\n}\n\nvoid loop() {\n${inputs[0] && outputs[0] ? `  bool ${cIdentifier(inputs[0].tag).toLowerCase()} = digitalRead(PIN_${cIdentifier(inputs[0].tag)}) == LOW;\n  digitalWrite(PIN_${cIdentifier(outputs[0].tag)}, ${cIdentifier(inputs[0].tag).toLowerCase()} ? HIGH : LOW);` : '  // Placeholder: adicione a lógica validada no simulador aqui.'}\n  delay(20);\n}\n`;
  }

  if (options.platform === 'openPlcEsp32') {
    return `/* CLP Fácil → OpenPLC ESP32\n * Placa alvo: ${board}\n * ${hardwareSafetyNotice().replace(/\n/g, '\n * ')}\n */\n\n// Mapa sugerido de entradas OpenPLC\n${inputs.map((row, index) => `// %IX0.${index}  ${row.tag}  GPIO${row.gpio}  ${row.description}`).join('\n') || '// Nenhuma entrada I detectada'}\n\n// Mapa sugerido de saídas OpenPLC\n${outputs.map((row, index) => `// %QX0.${index}  ${row.tag}  GPIO${row.gpio}  ${row.description}`).join('\n') || '// Nenhuma saída Q/O detectada'}\n\nPROGRAM CLP_FACIL\n  VAR\n${inputs.map((row, index) => `    ${cIdentifier(row.tag)} AT %IX0.${index} : BOOL;`).join('\n')}\n${outputs.map((row, index) => `    ${cIdentifier(row.tag)} AT %QX0.${index} : BOOL;`).join('\n')}\n  END_VAR\n\n  // TODO: replique aqui a lógica Ladder validada no simulador.\n${inputs[0] && outputs[0] ? `  ${cIdentifier(outputs[0].tag)} := ${cIdentifier(inputs[0].tag)};` : '  // Exemplo: Q0_0 := I0_0;'}\nEND_PROGRAM\n`;
  }

  if (options.platform === 'espIdf') {
    return `// CLP Fácil → ESP-IDF / placa própria\n// Placa alvo: ${board}\n// ${safetyCpp}\n\n#include "driver/gpio.h"\n#include "freertos/FreeRTOS.h"\n#include "freertos/task.h"\n\n${inputs.map((row) => `#define PIN_${cIdentifier(row.tag)} GPIO_NUM_${row.gpio}`).join('\n')}\n${outputs.map((row) => `#define PIN_${cIdentifier(row.tag)} GPIO_NUM_${row.gpio}`).join('\n')}\n\nvoid app_main(void) {\n${inputs.map((row) => `  gpio_set_direction(PIN_${cIdentifier(row.tag)}, GPIO_MODE_INPUT);\n  gpio_pullup_en(PIN_${cIdentifier(row.tag)});`).join('\n')}\n${outputs.map((row) => `  gpio_set_direction(PIN_${cIdentifier(row.tag)}, GPIO_MODE_OUTPUT);\n  gpio_set_level(PIN_${cIdentifier(row.tag)}, 0);`).join('\n')}\n  while (true) {\n${inputs[0] && outputs[0] ? `    int input_state = gpio_get_level(PIN_${cIdentifier(inputs[0].tag)}) == 0;\n    gpio_set_level(PIN_${cIdentifier(outputs[0].tag)}, input_state);` : '    // Placeholder: implemente a lógica validada no simulador.'}\n    vTaskDelay(pdMS_TO_TICKS(20));\n  }\n}\n`;
  }

  return JSON.stringify({ source: 'CLP Fácil', generatedAt, boardProfile: options.boardProfile, board, safety: hardwareSafetyNotice(), inputs, outputs, rungs: project.rungs, blocks: allBlocks(project) }, null, 2);
}
