export type ReleaseChecklistStageId =
  | 'core_stability'
  | 'mobile_visual'
  | 'examples_flow'
  | 'hardware_export'
  | 'reference_content'
  | 'monetization'
  | 'store_listing'
  | 'beta_test'
  | 'feedback_loop';

export type ReleaseChecklistStatus = 'critical' | 'important' | 'polish';

export type ReleaseChecklistItem = {
  id: string;
  text: string;
};

export type ReleaseChecklistStage = {
  id: ReleaseChecklistStageId;
  title: string;
  status: ReleaseChecklistStatus;
  goal: string;
  readyDefinition: string;
  checklist: ReleaseChecklistItem[];
  evidence: string[];
};

export const releaseChecklistStages: ReleaseChecklistStage[] = [
  {
    id: 'core_stability',
    title: 'Estabilidade do simulador',
    status: 'critical',
    goal: 'Garantir que o editor Ladder, o ciclo de scan, bordas, timers, contadores, SET/RESET e a tabela de I/O funcionem sem regressões.',
    readyDefinition: 'Typecheck e regressões passam, e pelo menos cinco exemplos são testados manualmente no modo Simular.',
    checklist: [
      { id: 'typecheck', text: 'Rodar npm run typecheck sem erros.' },
      { id: 'regression', text: 'Rodar npm run test:simulator sem falhas.' },
      { id: 'edge', text: 'Testar borda positiva e negativa em scan manual e auto scan.' },
      { id: 'timers', text: 'Testar TON/TOF/TP em pelo menos um exemplo.' },
      { id: 'counters', text: 'Testar CTU/CTD e reset.' },
    ],
    evidence: ['EditorEvaluator regressions', 'Edge regressions', 'Example library regressions'],
  },
  {
    id: 'mobile_visual',
    title: 'Visual no celular',
    status: 'critical',
    goal: 'Deixar Home, Aprender, Simular, Referência, Hardware e Pro limpos no iPhone e em telas menores.',
    readyDefinition: 'Não há cards cortados, botões fora da tela, textos invisíveis ou seções poluindo a simulação.',
    checklist: [
      { id: 'home', text: 'Conferir Home e início rápido.' },
      { id: 'simulate', text: 'Conferir Simular sem exportação de hardware dentro da bancada.' },
      { id: 'run', text: 'Conferir Visualização RUN sem badge SCAN duplicado.' },
      { id: 'hardware', text: 'Conferir Hardware em fluxo 1 Placa / 2 Pinos / 3 Código.' },
      { id: 'code_preview', text: 'Conferir contraste do código gerado.' },
    ],
    evidence: ['Prints no iPhone', 'Ajuste manual de layout', 'Code preview contrast'],
  },
  {
    id: 'examples_flow',
    title: 'Exemplos prontos',
    status: 'critical',
    goal: 'Transformar a aba Aprender em uma vitrine prática com modelos que o usuário carrega e testa em poucos toques.',
    readyDefinition: 'Biblioteca cobre partida com selo, temporizador, contador, motor/comandos e processo/esteira/bomba.',
    checklist: [
      { id: 'seal', text: 'Carregar e testar partida com selo.' },
      { id: 'timer', text: 'Carregar e testar temporizador.' },
      { id: 'counter', text: 'Carregar e testar contador.' },
      { id: 'motor', text: 'Carregar e testar motor/intertravamento.' },
      { id: 'process', text: 'Carregar e testar processo didático.' },
    ],
    evidence: ['ExampleLibraryPanel', 'QuickStartPanel', 'Example library regressions'],
  },
  {
    id: 'hardware_export',
    title: 'Exportação para microcontrolador',
    status: 'critical',
    goal: 'Permitir que o usuário escolha a placa, vincule GPIOs válidos e gere Arduino/ESP32 C++ ou ESPHome YAML.',
    readyDefinition: 'ESP32, variantes ESP32, ESP8266, Arduino e ESPHome aparecem com validação de pinagem e código legível.',
    checklist: [
      { id: 'boards', text: 'Conferir perfis ESP32, ESP32-S3, ESP32-C3, ESP32-CAM, ESP8266, Uno/Nano/Mega.' },
      { id: 'pins', text: 'Conferir seleção de pino pelo diagrama.' },
      { id: 'validation', text: 'Validar erro em pino reservado, somente entrada e duplicado.' },
      { id: 'arduino', text: 'Gerar Arduino/ESP32 C++ para um exemplo.' },
      { id: 'esphome', text: 'Gerar ESPHome YAML para um exemplo.' },
    ],
    evidence: ['Hardware regressions', 'GPIO catalog', 'BoardPinDiagram', 'HardwareExportPanel'],
  },
  {
    id: 'reference_content',
    title: 'Referência técnica',
    status: 'important',
    goal: 'Dar valor educacional com dialetos CLP, protocolos e segurança sem dizer que é compatibilidade oficial.',
    readyDefinition: 'A aba Referência explica Rockwell-like, IEC-like, Modbus, MQTT, ESPHome e cuidados de segurança com linguagem clara.',
    checklist: [
      { id: 'dialects', text: 'Conferir Dialetos CLP e disclaimers.' },
      { id: 'protocols', text: 'Conferir protocolos e maturidade.' },
      { id: 'safety', text: 'Conferir checklist de segurança.' },
      { id: 'no_official_claim', text: 'Evitar promessa de compatibilidade oficial com fabricantes.' },
    ],
    evidence: ['PlcProfilePanel', 'CommunicationProtocolsPanel', 'SafetyReadinessPanel'],
  },
  {
    id: 'monetization',
    title: 'Monetização inicial',
    status: 'important',
    goal: 'Separar valor gratuito e Pro sem travar o aprendizado básico.',
    readyDefinition: 'O usuário entende o valor do app gratuito e vê claramente o que a versão Pro destrava.',
    checklist: [
      { id: 'free_value', text: 'Manter exemplos básicos e simulação simples disponíveis.' },
      { id: 'pro_value', text: 'Destacar exportação avançada, biblioteca extra, referência e recursos profissionais.' },
      { id: 'no_aggressive_ads', text: 'Evitar anúncios invasivos na bancada de simulação.' },
      { id: 'price_test', text: 'Preparar teste de preço baixo ou vitalício inicial.' },
    ],
    evidence: ['Pro screen', 'AdsAccess mock', 'ProAccess mock'],
  },
  {
    id: 'store_listing',
    title: 'Página da loja',
    status: 'important',
    goal: 'Preparar título, descrição, prints, ícone, política de privacidade e texto honesto para Play Store.',
    readyDefinition: 'A página comunica: simulador didático de CLP, comandos elétricos e exportação para ESP32/Arduino/ESPHome.',
    checklist: [
      { id: 'title', text: 'Definir nome final: Easy-CLP ou CLP Fácil.' },
      { id: 'description', text: 'Criar descrição curta e longa.' },
      { id: 'screenshots', text: 'Capturar prints de Home, Simular, Hardware e Referência.' },
      { id: 'privacy', text: 'Preparar política de privacidade simples.' },
      { id: 'disclaimer', text: 'Incluir aviso de uso didático e segurança.' },
    ],
    evidence: ['ReleaseReadinessPanel', 'Safety catalog'],
  },
  {
    id: 'beta_test',
    title: 'Teste fechado',
    status: 'critical',
    goal: 'Validar com testadores antes da divulgação pública.',
    readyDefinition: 'Pelo menos 14 testadores conseguem instalar, abrir, carregar exemplo, simular e enviar feedback.',
    checklist: [
      { id: 'testers', text: 'Recrutar testadores.' },
      { id: 'script', text: 'Criar roteiro de teste de 10 minutos.' },
      { id: 'feedback', text: 'Coletar bugs visuais e de simulação.' },
      { id: 'fixes', text: 'Corrigir bloqueadores antes de abrir público.' },
    ],
    evidence: ['Closed testing notes', 'Feedback forms'],
  },
  {
    id: 'feedback_loop',
    title: 'Pós-divulgação',
    status: 'polish',
    goal: 'Planejar evolução gradual sem quebrar o app.',
    readyDefinition: 'Há backlog organizado para exemplos, placas, protocolos, UI e recursos Pro.',
    checklist: [
      { id: 'backlog', text: 'Manter backlog de melhorias por módulo.' },
      { id: 'analytics', text: 'Definir métricas simples: abertura, exemplo carregado, simulação, hardware.' },
      { id: 'support', text: 'Criar canal de contato para bugs e sugestões.' },
    ],
    evidence: ['Roadmap', 'GitHub issues/future tasks'],
  },
];

export function releaseStatusLabel(status: ReleaseChecklistStatus): string {
  if (status === 'critical') return 'Crítico';
  if (status === 'important') return 'Importante';
  return 'Polimento';
}

export function criticalReleaseStages(): ReleaseChecklistStage[] {
  return releaseChecklistStages.filter((stage) => stage.status === 'critical');
}
