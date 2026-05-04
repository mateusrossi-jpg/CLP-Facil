export type SafetyCategoryId =
  | 'didactic_scope'
  | 'power_isolation'
  | 'relay_outputs'
  | 'boot_states'
  | 'emergency_stop'
  | 'field_wiring'
  | 'protocol_writes'
  | 'validation';

export type SafetyLevel = 'mandatory' | 'recommended' | 'attention';

export type SafetyChecklistItem = {
  id: string;
  text: string;
};

export type SafetyCategory = {
  id: SafetyCategoryId;
  title: string;
  level: SafetyLevel;
  summary: string;
  checklist: SafetyChecklistItem[];
  appSupport: string[];
  warning: string;
};

export const safetyCategories: SafetyCategory[] = [
  {
    id: 'didactic_scope',
    title: 'Escopo didático e bancada',
    level: 'mandatory',
    summary: 'O Easy-CLP deve ser apresentado como ferramenta educacional, de simulação e prototipagem. Ele não substitui CLP certificado, projeto elétrico, NR, NBR ou validação profissional.',
    checklist: [
      { id: 'didactic_label', text: 'Informar que a exportação para ESP32/Arduino/ESPHome é didática e para bancada controlada.' },
      { id: 'no_safety_plc', text: 'Não vender a saída gerada como CLP de segurança ou solução certificada.' },
      { id: 'user_confirmation', text: 'Exigir leitura dos avisos antes de usar saídas em hardware real.' },
    ],
    appSupport: [
      'Cards de aviso na aba Hardware.',
      'Referência técnica separada da simulação.',
      'Mensagens de cuidado em exportação de código.',
    ],
    warning: 'Nunca usar lógica didática como único meio de proteção de pessoas, máquinas ou cargas perigosas.',
  },
  {
    id: 'power_isolation',
    title: 'Isolamento, alimentação e cargas',
    level: 'mandatory',
    summary: 'Microcontrolador não deve acionar carga diretamente. Saídas precisam de driver, relé/módulo adequado, optoacoplamento quando necessário, fonte dimensionada e proteção elétrica.',
    checklist: [
      { id: 'no_direct_load', text: 'Não ligar motores, solenóides, lâmpadas ou cargas AC diretamente no GPIO.' },
      { id: 'power_supply', text: 'Separar alimentação lógica da alimentação de carga quando necessário.' },
      { id: 'protection', text: 'Usar fusível/disjuntor, proteção contra surtos e dimensionamento correto.' },
      { id: 'common_ground', text: 'Avaliar GND comum apenas quando o circuito permitir e for seguro.' },
    ],
    appSupport: [
      'Avisos permanentes no painel de Hardware.',
      'Roadmap para perfis de módulos de relé/driver.',
    ],
    warning: 'GPIO é sinal lógico, não ponto de potência.',
  },
  {
    id: 'relay_outputs',
    title: 'Relé ativo HIGH/LOW',
    level: 'mandatory',
    summary: 'Módulos de relé podem ser ativos em HIGH ou LOW. Configuração errada pode inverter a lógica e acionar uma saída quando deveria ficar desligada.',
    checklist: [
      { id: 'polarity_check', text: 'Confirmar se o módulo de relé é ativo em HIGH ou ativo em LOW.' },
      { id: 'safe_state_off', text: 'Definir estado seguro de boot normalmente como OFF.' },
      { id: 'bench_test', text: 'Testar primeiro sem carga de potência conectada.' },
    ],
    appSupport: [
      'Campo ativo HIGH/LOW por saída.',
      'Boot OFF/ON por saída.',
      'Código gerado inicializa saídas antes do loop principal.',
    ],
    warning: 'Relé ativo LOW configurado como HIGH pode gerar acionamento inesperado.',
  },
  {
    id: 'boot_states',
    title: 'Boot, reset e pinos sensíveis',
    level: 'mandatory',
    summary: 'Alguns GPIOs mudam estado no boot, participam do strapping ou estão ligados a flash/USB/serial. Esses pinos devem ser bloqueados ou sinalizados.',
    checklist: [
      { id: 'avoid_flash', text: 'Bloquear pinos de flash e memória interna.' },
      { id: 'warn_boot', text: 'Alertar sobre pinos BOOT/strapping.' },
      { id: 'avoid_serial', text: 'Evitar TX/RX quando prejudicar upload ou monitoramento.' },
      { id: 'no_pulse', text: 'Evitar qualquer pulso de saída durante boot/reset.' },
    ],
    appSupport: [
      'Catálogo GPIO por placa.',
      'Validação de pino somente entrada, reservado, boot e serial.',
      'Sugestão de pinos recomendados para entrada/saída.',
    ],
    warning: 'Pino errado pode impedir boot do ESP ou acionar relé durante reinício.',
  },
  {
    id: 'emergency_stop',
    title: 'Emergência e intertravamento físico',
    level: 'mandatory',
    summary: 'Parada de emergência, proteção de porta, relé térmico e intertravamentos críticos devem existir em hardware físico quando houver risco real.',
    checklist: [
      { id: 'external_stop', text: 'Usar emergência física fora do software para cargas reais.' },
      { id: 'interlock', text: 'Intertravamento de reversão deve ser físico e lógico quando aplicado a motor.' },
      { id: 'thermal', text: 'Motores precisam de proteção térmica/contator conforme o caso.' },
    ],
    appSupport: [
      'Modelos didáticos com Stop, selo e intertravamento.',
      'Referência de comandos elétricos.',
    ],
    warning: 'Software didático não substitui cadeia de segurança física.',
  },
  {
    id: 'field_wiring',
    title: 'Fiação de campo e entradas',
    level: 'recommended',
    summary: 'Entradas precisam de pull-up/pull-down coerente, filtragem/debounce e proteção contra ruído, especialmente com cabos longos.',
    checklist: [
      { id: 'debounce', text: 'Aplicar debounce em botoeiras e contatos mecânicos.' },
      { id: 'shielding', text: 'Planejar blindagem/aterramento para cabos longos quando necessário.' },
      { id: 'voltage_levels', text: 'Não aplicar 12/24V direto em GPIO 3,3V/5V sem interface.' },
    ],
    appSupport: [
      'Debounce por entrada no mapeamento.',
      'Modo INPUT_PULLUP nos códigos gerados.',
    ],
    warning: 'Entrada mal condicionada pode oscilar e gerar comandos falsos.',
  },
  {
    id: 'protocol_writes',
    title: 'Escrita por protocolo',
    level: 'attention',
    summary: 'Modbus, MQTT, ESPHome API e protocolos industriais devem ter confirmação, autenticação e modo somente leitura quando houver risco.',
    checklist: [
      { id: 'read_only_first', text: 'Começar com modo somente leitura em protocolos industriais.' },
      { id: 'confirm_write', text: 'Confirmar escrita de saída/registrador antes de enviar comando real.' },
      { id: 'auth', text: 'Usar senha, chave ou rede isolada quando houver comando remoto.' },
    ],
    appSupport: [
      'Catálogo de protocolos com maturidade e dificuldade.',
      'Roadmap priorizando Modbus/MQTT antes de protocolos avançados.',
    ],
    warning: 'Escrita remota sem controle pode acionar equipamento indevidamente.',
  },
  {
    id: 'validation',
    title: 'Validação antes de divulgar',
    level: 'recommended',
    summary: 'Antes de publicar, cada exemplo deve passar por simulação, teste de borda, timer/contador, exportação de código e revisão visual em celular.',
    checklist: [
      { id: 'typecheck', text: 'Rodar typecheck.' },
      { id: 'regression', text: 'Rodar regressões do simulador.' },
      { id: 'mobile_visual', text: 'Conferir telas no iPhone: Home, Aprender, Simular, Referência, Hardware e Pro.' },
      { id: 'example_test', text: 'Testar pelo menos partida com selo, timer, contador, motor e processo.' },
    ],
    appSupport: [
      'Suites de regressão para editor, bordas, hardware, protocolos, referência e exemplos.',
      'Fluxo de início rápido para exercitar o app.',
    ],
    warning: 'Não divulgar antes de validar o fluxo completo em dispositivo real.',
  },
];

export function safetyLevelLabel(level: SafetyLevel): string {
  if (level === 'mandatory') return 'Obrigatório';
  if (level === 'recommended') return 'Recomendado';
  return 'Atenção';
}

export function mandatorySafetyItems(): SafetyCategory[] {
  return safetyCategories.filter((category) => category.level === 'mandatory');
}
