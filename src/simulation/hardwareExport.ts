import { EditorBlock, EditorProjectState } from '../engine/editorTypes';

export type HardwareTagRow = { tag: string; type: 'Entrada' | 'Saída'; scope: 'input' | 'output'; gpio: number; description: string };
export type HardwareBoard = 'esp32dev' | 'esp32-wroom-32' | 'esp32-devkit-v1' | 'esp32-s3-devkit' | 'esp32-c3-devkit' | 'custom';
export type HardwareExportFormat = 'esphome' | 'homeAssistant' | 'arduinoEsp32' | 'openPlcSt' | 'espIdf' | 'json';

const SAFE_INPUT_GPIOS = [32, 33, 25, 26, 27] as const;
const SAFE_OUTPUT_GPIOS = [16, 17, 18, 19, 21, 22, 23] as const;
const WARN = 'Revise GPIOs, cargas, relés, proteções, fonte, isolamento, optoacopladores e nível lógico antes de ligar hardware real.';

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
  if (format === 'openPlcSt') return `(* OpenPLC ST base - ${board} *)\n(* ${WARN} *)\nVAR\n${ins.map((r) => `  ${toConst(r.tag)} AT %IX0.${ins.indexOf(r)} : BOOL;`).join('\n')}\n${outs.map((r) => `  ${toConst(r.tag)} AT %QX0.${outs.indexOf(r)} : BOOL := FALSE;`).join('\n')}\nEND_VAR\n\n(* Lógica didática: ajuste conforme seus rungs *)\n${outs[0] && ins[0] ? `${toConst(outs[0].tag)} := ${toConst(ins[0].tag)};` : '// sem I/O detectado'}\n`;
  if (format === 'espIdf') return `// ESP-IDF base (${board})\n// ${WARN}\n// Atenção: relés podem ser active_low/active_high\n#include \"driver/gpio.h\"\n\nvoid app_main(void) {\n${outs.map((r) => `  gpio_reset_pin(GPIO_NUM_${r.gpio});\n  gpio_set_direction(GPIO_NUM_${r.gpio}, GPIO_MODE_OUTPUT);\n  gpio_set_level(GPIO_NUM_${r.gpio}, 0);`).join('\n')}\n}\n`;
  if (format === 'esphome') return `# ESPHome (${board})\n# ${WARN}\n# Atenção: relés podem exigir inverted: true (active_low).\nesp32:\n  board: ${board === 'custom' ? 'esp32dev' : board}\n  framework:\n    type: arduino\n\nbinary_sensor:\n${ins.map((r) => `  - platform: gpio\n    pin:\n      number: GPIO${r.gpio}\n      mode: INPUT_PULLUP\n    id: ${toId(r.tag)}`).join('\n') || '  # sem entradas'}\nswitch:\n${outs.map((r) => `  - platform: gpio\n    pin: GPIO${r.gpio}\n    id: ${toId(r.tag)}\n    restore_mode: ALWAYS_OFF`).join('\n') || '  # sem saídas'}\n`;
  if (format === 'homeAssistant') return `# Home Assistant base\n# ${WARN}\ninput_boolean:\n${ins.map((r) => `  ${toId(r.tag)}:\n    name: ${r.tag}`).join('\n') || '  entrada_exemplo:\n    name: I0_0'}\n`;
  if (format === 'arduinoEsp32') return `// Arduino ESP32 (${board})\n// ${WARN}\n// Atenção: relés podem ser active_low/active_high\n${ins.map((r) => `const int ${toConst(r.tag)} = ${r.gpio};`).join('\n')}\n${outs.map((r) => `const int ${toConst(r.tag)} = ${r.gpio};`).join('\n')}\nvoid setup(){\n${ins.map((r) => `  pinMode(${toConst(r.tag)}, INPUT_PULLUP);`).join('\n')}\n${outs.map((r) => `  pinMode(${toConst(r.tag)}, OUTPUT);\n  digitalWrite(${toConst(r.tag)}, LOW);`).join('\n')}\n}\nvoid loop(){\n  delay(20);\n}\n`;
  return JSON.stringify({ board, warning: WARN, tags, rungs: project.rungs }, null, 2);
}
