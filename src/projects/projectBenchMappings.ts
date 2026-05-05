import type { TrainingProject } from './projectCatalog';

export type BenchBoardTarget = 'arduino_uno' | 'esp32_devkit';
export type BenchSignalDirection = 'input' | 'output';
export type BenchPinRisk = 'safe' | 'attention' | 'avoid';

export type ProjectBenchPin = {
  tag: string;
  label: string;
  direction: BenchSignalDirection;
  arduinoPin: string;
  esp32Pin: string;
  risk: BenchPinRisk;
  note: string;
};

export type ProjectBenchMapping = {
  projectId: TrainingProject['id'];
  title: string;
  summary: string;
  recommendedTarget: BenchBoardTarget;
  pins: ProjectBenchPin[];
  safetyNotes: string[];
};

export const projectBenchMappings: ProjectBenchMapping[] = [
  {
    projectId: 'partida-direta',
    title: 'Bancada: partida direta',
    summary: 'Mapeamento mínimo para testar botão de partida, parada e saída de contator/LED.',
    recommendedTarget: 'esp32_devkit',
    pins: [
      { tag: 'I0.0', label: 'Partida', direction: 'input', arduinoPin: 'D2', esp32Pin: 'GPIO18', risk: 'safe', note: 'Entrada com botão momentâneo e resistor/pull-up adequado.' },
      { tag: 'I0.1', label: 'Parada NF', direction: 'input', arduinoPin: 'D3', esp32Pin: 'GPIO19', risk: 'safe', note: 'Use lógica NF no app para simular falha segura.' },
      { tag: 'Q0.0', label: 'KM1/LED', direction: 'output', arduinoPin: 'D8', esp32Pin: 'GPIO23', risk: 'attention', note: 'Para relé real, usar módulo/driver isolado; não ligar carga direto no pino.' },
    ],
    safetyNotes: ['Teste primeiro com LED antes de relé.', 'Nunca acione contator real diretamente pelo microcontrolador.'],
  },
  {
    projectId: 'selo',
    title: 'Bancada: selo',
    summary: 'Mapeamento para estudar retenção com partida momentânea, parada NF e saída sustentada.',
    recommendedTarget: 'esp32_devkit',
    pins: [
      { tag: 'I0.0', label: 'Partida', direction: 'input', arduinoPin: 'D2', esp32Pin: 'GPIO18', risk: 'safe', note: 'Botão momentâneo NA.' },
      { tag: 'I0.1', label: 'Parada NF', direction: 'input', arduinoPin: 'D3', esp32Pin: 'GPIO19', risk: 'safe', note: 'Botão de parada em lógica normalmente fechada.' },
      { tag: 'Q0.0', label: 'KM1/LED', direction: 'output', arduinoPin: 'D8', esp32Pin: 'GPIO23', risk: 'attention', note: 'Usar LED ou módulo relé com fonte e proteção adequadas.' },
    ],
    safetyNotes: ['A saída sustentada deve desligar imediatamente quando a parada abrir.', 'Em bancada didática, prefira LED a relé energizando carga.'],
  },
  {
    projectId: 'reversao',
    title: 'Bancada: reversão',
    summary: 'Mapeamento para intertravamento didático entre avanço e reverso.',
    recommendedTarget: 'esp32_devkit',
    pins: [
      { tag: 'I0.0', label: 'Avanço', direction: 'input', arduinoPin: 'D2', esp32Pin: 'GPIO18', risk: 'safe', note: 'Comando de avanço NA.' },
      { tag: 'I0.1', label: 'Reverso', direction: 'input', arduinoPin: 'D3', esp32Pin: 'GPIO19', risk: 'safe', note: 'Comando de reverso NA.' },
      { tag: 'I0.2', label: 'Parada NF', direction: 'input', arduinoPin: 'D4', esp32Pin: 'GPIO21', risk: 'safe', note: 'Parada geral em lógica NF.' },
      { tag: 'Q0.0', label: 'K1 avanço', direction: 'output', arduinoPin: 'D8', esp32Pin: 'GPIO23', risk: 'attention', note: 'LED/relé representando o contator de avanço.' },
      { tag: 'Q0.1', label: 'K2 reverso', direction: 'output', arduinoPin: 'D9', esp32Pin: 'GPIO22', risk: 'attention', note: 'LED/relé representando o contator de reversão.' },
    ],
    safetyNotes: ['Nunca permita K1 e K2 ligados juntos em hardware real.', 'Use intertravamento elétrico físico além da lógica em aplicações reais.'],
  },
  {
    projectId: 'semaforo',
    title: 'Bancada: semáforo',
    summary: 'Mapeamento simples para três LEDs temporizados.',
    recommendedTarget: 'arduino_uno',
    pins: [
      { tag: 'I0.0', label: 'RUN', direction: 'input', arduinoPin: 'D2', esp32Pin: 'GPIO18', risk: 'safe', note: 'Botão ou chave de habilitação da sequência.' },
      { tag: 'Q0.0', label: 'Verde', direction: 'output', arduinoPin: 'D8', esp32Pin: 'GPIO23', risk: 'safe', note: 'LED verde com resistor.' },
      { tag: 'Q0.1', label: 'Amarelo', direction: 'output', arduinoPin: 'D9', esp32Pin: 'GPIO22', risk: 'safe', note: 'LED amarelo com resistor.' },
      { tag: 'Q0.2', label: 'Vermelho', direction: 'output', arduinoPin: 'D10', esp32Pin: 'GPIO21', risk: 'safe', note: 'LED vermelho com resistor.' },
    ],
    safetyNotes: ['Projeto indicado para primeiro teste físico com LEDs.', 'Use resistores adequados nos LEDs.'],
  },
  {
    projectId: 'esteira',
    title: 'Bancada: esteira',
    summary: 'Mapeamento para motor/LED da esteira e sensor de peça com contador.',
    recommendedTarget: 'esp32_devkit',
    pins: [
      { tag: 'I0.0', label: 'Start', direction: 'input', arduinoPin: 'D2', esp32Pin: 'GPIO18', risk: 'safe', note: 'Botão de partida.' },
      { tag: 'I0.1', label: 'Stop NF', direction: 'input', arduinoPin: 'D3', esp32Pin: 'GPIO19', risk: 'safe', note: 'Parada NF com contato de seguranca.' },
      { tag: 'I0.2', label: 'Sensor peça', direction: 'input', arduinoPin: 'D4', esp32Pin: 'GPIO21', risk: 'safe', note: 'Sensor digital ou botão simulando pulso.' },
      { tag: 'Q0.0', label: 'Motor esteira', direction: 'output', arduinoPin: 'D8', esp32Pin: 'GPIO23', risk: 'attention', note: 'Use LED, driver ou módulo isolado para motor.' },
    ],
    safetyNotes: ['Motores precisam de driver/fonte externa.', 'Sensor com ruído pode exigir debounce/filtro.'],
  },
  {
    projectId: 'portao-automatico',
    title: 'Bancada: portão automático',
    summary: 'Mapeamento com comandos, fins de curso e duas saídas intertravadas.',
    recommendedTarget: 'esp32_devkit',
    pins: [
      { tag: 'I0.0', label: 'Abrir', direction: 'input', arduinoPin: 'D2', esp32Pin: 'GPIO18', risk: 'safe', note: 'Comando de abertura.' },
      { tag: 'I0.1', label: 'Fechar', direction: 'input', arduinoPin: 'D3', esp32Pin: 'GPIO19', risk: 'safe', note: 'Comando de fechamento.' },
      { tag: 'I0.2', label: 'Fim aberto', direction: 'input', arduinoPin: 'D4', esp32Pin: 'GPIO21', risk: 'safe', note: 'Fim de curso aberto.' },
      { tag: 'I0.3', label: 'Fim fechado', direction: 'input', arduinoPin: 'D5', esp32Pin: 'GPIO32', risk: 'safe', note: 'Fim de curso fechado.' },
      { tag: 'Q0.0', label: 'Motor abrir', direction: 'output', arduinoPin: 'D8', esp32Pin: 'GPIO23', risk: 'attention', note: 'Saída de abertura com driver/relé isolado.' },
      { tag: 'Q0.1', label: 'Motor fechar', direction: 'output', arduinoPin: 'D9', esp32Pin: 'GPIO22', risk: 'attention', note: 'Saída de fechamento com intertravamento.' },
    ],
    safetyNotes: ['Em portão real, sensores de segurança e fotocélula são obrigatórios.', 'Nunca confie apenas no app para segurança física.'],
  },
];

export function getBenchMappingForProject(projectId: TrainingProject['id']): ProjectBenchMapping | undefined {
  return projectBenchMappings.find((mapping) => mapping.projectId === projectId);
}

export function getBenchPinRiskLabel(risk: BenchPinRisk): string {
  if (risk === 'safe') return 'Seguro';
  if (risk === 'attention') return 'Atenção';
  return 'Evitar';
}

export function getBenchBoardTargetLabel(target: BenchBoardTarget): string {
  if (target === 'arduino_uno') return 'Arduino Uno';
  return 'ESP32 DevKit';
}
