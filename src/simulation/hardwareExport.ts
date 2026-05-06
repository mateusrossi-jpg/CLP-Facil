import { EditorBlock, EditorProjectState } from '../engine/editorTypes';

export type HardwareTagRow = { tag: string; type: 'Entrada' | 'Saída'; scope: 'input' | 'output'; gpio: number; description: string };
export type HardwareBoard = 'esp32dev' | 'esp32-wroom-32' | 'esp32-devkit-v1' | 'esp32-s3-devkit' | 'esp32-c3-devkit' | 'custom';
export type HardwareExportFormat = 'arduinoEsp32' | 'openPlcSt' | 'espIdf' | 'json';

const SAFE_INPUT_GPIOS = [32, 33, 25, 26, 27] as const;
const SAFE_OUTPUT_GPIOS = [16, 17, 18, 19, 21, 22, 23] as const;
const WARN = 'ATENÇÃO: Código base educacional/didático. Revise GPIOs, relés, cargas, proteção elétrica, isolamento, fonte, fail-safe e nível lógico antes de ligar hardware real.';

const normalize = (v?: string) => (v ?? '').trim().toUpperCase();
const isNum = (v: string) => /^[-+]?\d+(?:[.,]\d+)?$/.test(v);
const toId = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, '_');
const toConst = (v: string) => v.replace(/[^A-Z0-9]/g, '_');
const scopeOf = (t: string) => t.startsWith('I') ? 'input' : (t.startsWith('Q') || t.startsWith('O')) ? 'output' : 'memory';
const blocks = (p: EditorProjectState): EditorBlock[] => p.rungs.flatMap((r) => [...r.seriesBlocks, ...r.parallelBlocks, ...(r.parallelBranches ?? []).flatMap((b) => b.blocks), ...(r.coilBlock ? [r.coilBlock] : [])]);

export function collectHardwareTags(project: EditorProjectState): HardwareTagRow[] {
  const rows = new Map<string, HardwareTagRow>();
  const add = (raw?: string, desc?: string) => {
    const tag = normalize(raw); if (!tag || isNum(tag) || rows.has(tag)) return;
    const scope = scopeOf(tag); if (scope === 'memory') return;
    const pool = scope === 'input' ? SAFE_INPUT_GPIOS : SAFE_OUTPUT_GPIOS;
    const index = [...rows.values()].filter((r) => r.scope === scope).length;
    rows.set(tag, { tag, type: scope === 'input' ? 'Entrada' : 'Saída', scope, gpio: pool[index % pool.length], description: desc?.trim() || `Tag de ${scope === 'input' ? 'entrada' : 'saída'}` });
  };
  (project.projectVariables ?? []).forEach((v) => add(v.id || v.address, v.name));
  blocks(project).forEach((b) => [b.variable, b.destination, b.sourceA, b.sourceB, b.downSource, b.resetSource].forEach((t) => add(t, b.name)));
  return [...rows.values()].sort((a, b) => a.tag.localeCompare(b.tag));
}

export function generateHardwareExportCode(project: EditorProjectState, format: HardwareExportFormat, tags: HardwareTagRow[], board: HardwareBoard): string {
  const ins = tags.filter((t) => t.scope === 'input'); const outs = tags.filter((t) => t.scope === 'output');
  if (format === 'openPlcSt') return `(* OpenPLC ESP32 - ${board} *)\n(* ${WARN} *)\nPROGRAM CLP_FACIL\nVAR\n${ins.map((r, idx) => `  ${toConst(r.tag)} AT %IX0.${idx} : BOOL; (* GPIO${r.gpio} *)`).join('\n') || '  START AT %IX0.0 : BOOL; (* GPIO32 *)'}\n${outs.map((r, idx) => `  ${toConst(r.tag)} AT %QX0.${idx} : BOOL := FALSE; (* GPIO${r.gpio} *)`).join('\n') || '  MOTOR AT %QX0.0 : BOOL := FALSE; (* GPIO16 *)'}\nEND_VAR\n\n(* TAG | GPIO | OpenPLC Address *)\n${[...ins.map((r, i) => `(* ${r.tag} | GPIO${r.gpio} | %IX0.${i} *)`), ...outs.map((r, i) => `(* ${r.tag} | GPIO${r.gpio} | %QX0.${i} *)`)].join('\n')}\n\n(* Lógica didática base *)\n${outs[0] && ins[0] ? `${toConst(outs[0].tag)} := ${toConst(ins[0].tag)};` : 'MOTOR := START;'}\nEND_PROGRAM\n`;
  if (format === 'espIdf') return `// ESP-IDF base (${board})\n// ${WARN}\n// Relé pode ser active_low: inverter nível lógico se necessário.\n#include \"driver/gpio.h\"\n#include \"freertos/FreeRTOS.h\"\n#include \"freertos/task.h\"\n\n${ins.map((r) => `#define ${toConst(r.tag)} GPIO_NUM_${r.gpio}`).join('\n')}\n${outs.map((r) => `#define ${toConst(r.tag)} GPIO_NUM_${r.gpio}`).join('\n')}\n\nvoid app_main(void) {\n${ins.map((r) => `  gpio_reset_pin(${toConst(r.tag)});\n  gpio_set_direction(${toConst(r.tag)}, GPIO_MODE_INPUT);`).join('\n')}\n${outs.map((r) => `  gpio_reset_pin(${toConst(r.tag)});\n  gpio_set_direction(${toConst(r.tag)}, GPIO_MODE_OUTPUT);\n  gpio_set_level(${toConst(r.tag)}, 0); // fail-safe OFF`).join('\n')}\n\n  while (1) {\n${outs[0] && ins[0] ? `    gpio_set_level(${toConst(outs[0].tag)}, gpio_get_level(${toConst(ins[0].tag)}));` : '    // mapear lógica Ladder aqui'}\n    vTaskDelay(pdMS_TO_TICKS(20));\n  }\n}\n`;
  if (format === 'arduinoEsp32') return `// Arduino ESP32 (${board})\n// ${WARN}\n// Segurança: use driver de relé/optoacoplador e fonte isolada para cargas externas.\n// Relé pode ser active_low; ajuste digitalWrite conforme a sua placa.\n${ins.map((r) => `const int ${toConst(r.tag)} = ${r.gpio};`).join('\n')}\n${outs.map((r) => `const int ${toConst(r.tag)} = ${r.gpio};`).join('\n')}\n\nvoid setup(){\n${ins.map((r) => `  pinMode(${toConst(r.tag)}, INPUT_PULLUP);`).join('\n')}\n${outs.map((r) => `  pinMode(${toConst(r.tag)}, OUTPUT);\n  digitalWrite(${toConst(r.tag)}, LOW); // fail-safe OFF`).join('\n')}\n}\n\nvoid loop(){\n${outs[0] && ins[0] ? `  const bool start = digitalRead(${toConst(ins[0].tag)}) == LOW; // INPUT_PULLUP + active_low\n  digitalWrite(${toConst(outs[0].tag)}, start ? HIGH : LOW);` : '  // aplique aqui a lógica do rung principal'}\n  delay(20);\n}\n`;
  return JSON.stringify({ board, warning: WARN, tags, rungs: project.rungs }, null, 2);
}
