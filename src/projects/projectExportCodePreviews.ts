import { getBenchMappingForProject, type ProjectBenchPin } from './projectBenchMappings';
import type { TrainingProject } from './projectCatalog';
import type { ProjectExportTarget } from './projectExportPlans';

export type ProjectExportCodePreview = {
  projectId: TrainingProject['id'];
  target: ProjectExportTarget;
  label: string;
  language: 'cpp' | 'yaml';
  fileName: string;
  code: string;
  warnings: string[];
};

function normalizeTag(tag: string): string {
  return tag.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
}

function arduinoDigitalPin(pin: ProjectBenchPin): string {
  return pin.arduinoPin.replace(/^D/i, '');
}

function esp32DigitalPin(pin: ProjectBenchPin): string {
  return pin.esp32Pin.replace(/^GPIO/i, '');
}

function buildArduinoPreview(project: TrainingProject, pins: ProjectBenchPin[]): ProjectExportCodePreview {
  const constants = pins.map((pin) => `const int PIN_${normalizeTag(pin.tag)} = ${arduinoDigitalPin(pin)}; // ${pin.label}`).join('\n');
  const setup = pins
    .map((pin) => `  pinMode(PIN_${normalizeTag(pin.tag)}, ${pin.direction === 'input' ? 'INPUT_PULLUP' : 'OUTPUT'});`)
    .join('\n');
  const inputs = pins
    .filter((pin) => pin.direction === 'input')
    .map((pin) => `  bool ${normalizeTag(pin.tag).toLowerCase()} = digitalRead(PIN_${normalizeTag(pin.tag)}) == LOW;`)
    .join('\n');
  const outputs = pins
    .filter((pin) => pin.direction === 'output')
    .map((pin) => `  digitalWrite(PIN_${normalizeTag(pin.tag)}, LOW); // TODO: aplicar lógica Ladder para ${pin.label}`)
    .join('\n');

  return {
    projectId: project.id,
    target: 'arduino',
    label: 'Arduino',
    language: 'cpp',
    fileName: `${project.id}.ino`,
    code: [
      `// Easy-PLC / CLP Fácil - ${project.title}`,
      '// Prévia didática gerada a partir do mapa de bancada.',
      constants,
      '',
      'void setup() {',
      setup,
      '}',
      '',
      'void loop() {',
      inputs || '  // Sem entradas mapeadas.',
      outputs || '  // Sem saídas mapeadas.',
      '}',
    ].join('\n'),
    warnings: ['Prévia didática: revise a lógica antes de usar em carga real.', 'Saídas físicas exigem driver/proteção quando acionarem relé, contator ou motor.'],
  };
}

function buildEsp32Preview(project: TrainingProject, pins: ProjectBenchPin[]): ProjectExportCodePreview {
  const constants = pins.map((pin) => `constexpr int PIN_${normalizeTag(pin.tag)} = ${esp32DigitalPin(pin)}; // ${pin.label}`).join('\n');
  const setup = pins
    .map((pin) => `  pinMode(PIN_${normalizeTag(pin.tag)}, ${pin.direction === 'input' ? 'INPUT_PULLUP' : 'OUTPUT'});`)
    .join('\n');
  const inputs = pins
    .filter((pin) => pin.direction === 'input')
    .map((pin) => `  const bool ${normalizeTag(pin.tag).toLowerCase()} = digitalRead(PIN_${normalizeTag(pin.tag)}) == LOW;`)
    .join('\n');
  const outputs = pins
    .filter((pin) => pin.direction === 'output')
    .map((pin) => `  digitalWrite(PIN_${normalizeTag(pin.tag)}, LOW); // TODO: aplicar lógica Ladder para ${pin.label}`)
    .join('\n');

  return {
    projectId: project.id,
    target: 'esp32',
    label: 'ESP32',
    language: 'cpp',
    fileName: `${project.id}-esp32.ino`,
    code: [
      `// Easy-PLC / CLP Fácil - ${project.title}`,
      '// Prévia ESP32 didática. Evite GPIOs de boot/flash em versões futuras da exportação.',
      constants,
      '',
      'void setup() {',
      '  Serial.begin(115200);',
      setup,
      '}',
      '',
      'void loop() {',
      inputs || '  // Sem entradas mapeadas.',
      outputs || '  // Sem saídas mapeadas.',
      '  delay(10);',
      '}',
    ].join('\n'),
    warnings: ['Validar GPIOs conforme a placa ESP32 real usada.', 'Use fonte externa e isolação para relés, contatores e motores.'],
  };
}

function buildEspHomePreview(project: TrainingProject, pins: ProjectBenchPin[]): ProjectExportCodePreview {
  const binarySensors = pins
    .filter((pin) => pin.direction === 'input')
    .map((pin) => [
      '  - platform: gpio',
      `    name: "${project.title} ${pin.label}"`,
      `    pin: ${pin.esp32Pin}`,
      `    id: ${normalizeTag(pin.tag).toLowerCase()}`,
    ].join('\n'))
    .join('\n');
  const switches = pins
    .filter((pin) => pin.direction === 'output')
    .map((pin) => [
      '  - platform: gpio',
      `    name: "${project.title} ${pin.label}"`,
      `    pin: ${pin.esp32Pin}`,
      `    id: ${normalizeTag(pin.tag).toLowerCase()}`,
      '    restore_mode: ALWAYS_OFF',
    ].join('\n'))
    .join('\n');

  return {
    projectId: project.id,
    target: 'esphome',
    label: 'ESPHome',
    language: 'yaml',
    fileName: `${project.id}.yaml`,
    code: [
      `# Easy-PLC / CLP Fácil - ${project.title}`,
      'esphome:',
      `  name: ${project.id.replace(/[^a-z0-9-]/gi, '-').toLowerCase()}`,
      '',
      'esp32:',
      '  board: esp32dev',
      '',
      'binary_sensor:',
      binarySensors || '  # Sem entradas mapeadas.',
      '',
      'switch:',
      switches || '  # Sem saídas mapeadas.',
    ].join('\n'),
    warnings: ['ESPHome é indicado para bancada e automação leve.', 'Para comandos críticos, mantenha proteção física independente.'],
  };
}

export function getProjectExportCodePreviews(project: TrainingProject): ProjectExportCodePreview[] {
  const mapping = getBenchMappingForProject(project.id);
  if (!mapping) return [];

  return [
    buildArduinoPreview(project, mapping.pins),
    buildEsp32Preview(project, mapping.pins),
    buildEspHomePreview(project, mapping.pins),
  ];
}
