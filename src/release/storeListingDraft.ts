export type StoreScreenshotId =
  | 'home_flow'
  | 'learn_examples'
  | 'simulator_run'
  | 'hardware_gpio'
  | 'reference_protocols'
  | 'safety_release';

export type StoreScreenshotPlan = {
  id: StoreScreenshotId;
  title: string;
  subtitle: string;
  captureTarget: string;
  message: string;
};

export const storeListingDraft = {
  appNameCandidates: ['CLP Fácil', 'Easy-CLP', 'CLP Fácil: Ladder e ESP32'],
  shortDescription: 'Aprenda, simule e exporte lógica Ladder para ESP32, Arduino e ESPHome em bancada didática.',
  fullDescription: [
    'CLP Fácil é um simulador didático de lógica Ladder para estudantes, técnicos, eletricistas e professores que querem praticar comandos elétricos e automação de forma simples no celular.',
    'Monte linhas Ladder, teste entradas e saídas, acompanhe o ciclo de scan, use exemplos prontos e compare a mesma lógica em perfis educacionais como Easy-CLP, Rockwell-like, IEC/Siemens-like e comandos elétricos.',
    'Na área Hardware, escolha a placa, selecione GPIOs úteis com validação de pinagem e gere código inicial para ESP32, Arduino ou ESPHome YAML. A proposta é facilitar estudos, protótipos e bancadas didáticas.',
    'O app não substitui CLP certificado, projeto elétrico profissional ou dispositivos de segurança. Para cargas reais, use isolamento, proteção, relé/driver adequado, emergência física e validação técnica.',
  ],
  featureBullets: [
    'Editor Ladder didático com contatos, bobinas, bordas, timers e contadores.',
    'Simulação com entradas, saídas, ciclo de scan e diagnóstico.',
    'Biblioteca de exemplos prontos para carregar e testar.',
    'Referência de dialetos CLP e protocolos de comunicação.',
    'Exportação para Arduino/ESP32 C++ e ESPHome YAML.',
    'Seleção assistida de GPIOs por placa com avisos de segurança.',
  ],
  safetyDisclaimer: 'Uso educacional e de bancada. Não utilize como sistema de segurança, CLP certificado ou controle de cargas reais sem projeto e proteção adequados.',
  keywords: ['CLP', 'PLC', 'Ladder', 'comandos elétricos', 'ESP32', 'Arduino', 'ESPHome', 'automação', 'SENAI', 'curso técnico'],
};

export const storeScreenshotPlan: StoreScreenshotPlan[] = [
  {
    id: 'home_flow',
    title: 'Do exemplo ao hardware',
    subtitle: 'Mostre a Home com o fluxo Modelo → Simular → Exportar.',
    captureTarget: 'Home / Comece rápido',
    message: 'Comece com modelos prontos e avance até a exportação para microcontrolador.',
  },
  {
    id: 'learn_examples',
    title: 'Biblioteca de exemplos',
    subtitle: 'Mostre categorias como partida, timers, contadores, motores e processos.',
    captureTarget: 'Aprender / Biblioteca de exemplos',
    message: 'Carregue circuitos prontos para aprender e testar em poucos toques.',
  },
  {
    id: 'simulator_run',
    title: 'Simulação Ladder',
    subtitle: 'Mostre a tela Simular limpa, com I/O e Visualização RUN.',
    captureTarget: 'Simular / Visualização RUN',
    message: 'Acione entradas, veja saídas e entenda o ciclo de scan.',
  },
  {
    id: 'hardware_gpio',
    title: 'Exportação para ESP32/Arduino',
    subtitle: 'Mostre seleção de placa, diagrama de GPIO e código gerado.',
    captureTarget: 'Hardware / Pinos ou Código',
    message: 'Escolha GPIOs úteis e gere código para bancada didática.',
  },
  {
    id: 'reference_protocols',
    title: 'Referência técnica',
    subtitle: 'Mostre dialetos CLP ou protocolos.',
    captureTarget: 'Referência / Dialetos ou Protocolos',
    message: 'Compare nomes de instruções e planeje integrações futuras.',
  },
  {
    id: 'safety_release',
    title: 'Uso seguro e educacional',
    subtitle: 'Mostre a aba Segurança ou Divulgação.',
    captureTarget: 'Referência / Segurança',
    message: 'Checklist para bancada, validação e uso responsável.',
  },
];

export const privacyPolicyDraft = {
  summary: 'O CLP Fácil foi planejado para funcionar localmente na maior parte das funções. Projetos, simulações e exportações podem ser mantidos no próprio dispositivo conforme implementação final.',
  dataItems: [
    'Dados de projeto criados pelo usuário dentro do app.',
    'Preferências de uso, como placa selecionada e mapeamento de pinos, quando salvas localmente.',
    'Dados de compra/assinatura apenas se a versão Pro for ativada via loja.',
    'Dados de anúncios apenas se anúncios forem implementados futuramente por provedor externo.',
  ],
  promises: [
    'Não vender dados pessoais do usuário.',
    'Não prometer controle industrial certificado.',
    'Explicar claramente qualquer uso futuro de anúncios, analytics ou login.',
  ],
};
