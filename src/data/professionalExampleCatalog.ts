export type ProfessionalExampleId =
  | 'direct_start'
  | 'seal_start'
  | 'reversing_motor'
  | 'star_delta'
  | 'alternating_pumps'
  | 'traffic_light'
  | 'conveyor_batch'
  | 'automatic_gate'
  | 'reservoir_control';

export type ProfessionalExampleCategory =
  | 'comandos_eletricos'
  | 'processos'
  | 'seguranca'
  | 'temporizadores_contadores';

export type ProfessionalExampleCatalogItem = {
  id: ProfessionalExampleId;
  title: string;
  category: ProfessionalExampleCategory;
  difficulty: 'Básico' | 'Intermediário' | 'Avançado';
  goal: string;
  whyItMatters: string;
  practiceChecklist: string[];
  expectedTags: string[];
  expectedConcepts: string[];
};

export const professionalExampleCatalog: ProfessionalExampleCatalogItem[] = [
  {
    id: 'direct_start',
    title: 'Partida direta',
    category: 'comandos_eletricos',
    difficulty: 'Básico',
    goal: 'Ligar e desligar um motor com Start, Stop e bobina de saída.',
    whyItMatters: 'É o primeiro circuito que conecta lógica Ladder com comando elétrico real.',
    practiceChecklist: ['Acionar Start', 'Confirmar saída do motor', 'Acionar Stop', 'Confirmar desligamento seguro'],
    expectedTags: ['I0.0', 'I0.1', 'Q0.0'],
    expectedConcepts: ['Contato NA', 'Contato NF', 'Bobina'],
  },
  {
    id: 'seal_start',
    title: 'Partida com selo',
    category: 'comandos_eletricos',
    difficulty: 'Básico',
    goal: 'Manter a saída ligada após soltar o botão Start usando contato auxiliar.',
    whyItMatters: 'O selo é base para comandos de motores, contatores e retenção de estado.',
    practiceChecklist: ['Pressionar Start', 'Soltar Start', 'Verificar retenção por Q0.0', 'Pressionar Stop'],
    expectedTags: ['I0.0', 'I0.1', 'Q0.0'],
    expectedConcepts: ['Selo', 'Contato auxiliar', 'Scan'],
  },
  {
    id: 'reversing_motor',
    title: 'Reversão de motor',
    category: 'comandos_eletricos',
    difficulty: 'Intermediário',
    goal: 'Controlar avanço e reverso com intertravamento para impedir duas direções simultâneas.',
    whyItMatters: 'Ensina intertravamento lógico, uma prática essencial para evitar curto e falha mecânica.',
    practiceChecklist: ['Ligar avanço', 'Tentar ligar reverso com avanço ativo', 'Desligar', 'Ligar reverso'],
    expectedTags: ['I0.0', 'I0.1', 'I0.2', 'Q0.0', 'Q0.1'],
    expectedConcepts: ['Intertravamento', 'Selo', 'Contato NF oposto'],
  },
  {
    id: 'star_delta',
    title: 'Estrela-triângulo',
    category: 'comandos_eletricos',
    difficulty: 'Avançado',
    goal: 'Simular partida com K1 principal, K2 estrela, K3 triângulo e temporizador de transição.',
    whyItMatters: 'É um comando clássico que une temporização, sequência e intertravamento.',
    practiceChecklist: ['Ligar K1', 'Ver K2 estrela ativo antes do tempo', 'Aguardar T1', 'Ver K3 triângulo ativo'],
    expectedTags: ['I0.0', 'I0.1', 'I0.2', 'Q0.0', 'Q0.1', 'Q0.2', 'T1'],
    expectedConcepts: ['TON', 'Intertravamento', 'Sequência'],
  },
  {
    id: 'alternating_pumps',
    title: 'Bomba alternada',
    category: 'processos',
    difficulty: 'Avançado',
    goal: 'Alternar bomba 1 e bomba 2 a cada ciclo de demanda para equilibrar desgaste.',
    whyItMatters: 'Aparece em reservatórios, recalque, poços e sistemas prediais com redundância.',
    practiceChecklist: ['Gerar pedido de nível baixo', 'Ligar bomba principal', 'Encerrar ciclo', 'Confirmar alternância no próximo pedido'],
    expectedTags: ['I0.0', 'I0.1', 'I0.2', 'Q0.0', 'Q0.1', 'M0.0'],
    expectedConcepts: ['Memória auxiliar', 'Alternância', 'Proteção por falha'],
  },
  {
    id: 'traffic_light',
    title: 'Semáforo didático',
    category: 'temporizadores_contadores',
    difficulty: 'Intermediário',
    goal: 'Sequenciar verde, amarelo e vermelho usando temporizadores.',
    whyItMatters: 'É ótimo para aprender sequência, tempo e leitura de estados no scan.',
    practiceChecklist: ['Iniciar ciclo', 'Observar verde', 'Aguardar amarelo', 'Confirmar vermelho e retorno'],
    expectedTags: ['I0.0', 'Q0.0', 'Q0.1', 'Q0.2', 'T1', 'T2', 'T3'],
    expectedConcepts: ['Sequenciador', 'TON', 'Estado atual'],
  },
  {
    id: 'conveyor_batch',
    title: 'Esteira com lote',
    category: 'temporizadores_contadores',
    difficulty: 'Avançado',
    goal: 'Contar peças no sensor, parar ao atingir o lote e liberar reset de produção.',
    whyItMatters: 'Mostra uso real de contador em automação de produção.',
    practiceChecklist: ['Ligar esteira', 'Pulsar sensor de peça', 'Atingir preset', 'Resetar lote'],
    expectedTags: ['I0.0', 'I0.1', 'I0.2', 'Q0.0', 'Q0.1', 'C0'],
    expectedConcepts: ['CTU', 'Preset', 'Reset'],
  },
  {
    id: 'automatic_gate',
    title: 'Portão automático',
    category: 'seguranca',
    difficulty: 'Intermediário',
    goal: 'Controlar abrir/fechar com fins de curso e intertravamento de motores.',
    whyItMatters: 'Une lógica de campo com segurança básica e evita comandos opostos simultâneos.',
    practiceChecklist: ['Comandar abrir', 'Acionar fim de curso aberto', 'Comandar fechar', 'Acionar fim de curso fechado'],
    expectedTags: ['I0.0', 'I0.1', 'I0.2', 'I0.3', 'Q0.0', 'Q0.1'],
    expectedConcepts: ['Fim de curso', 'Intertravamento', 'Comando reversível'],
  },
  {
    id: 'reservoir_control',
    title: 'Reservatório com nível alto/baixo',
    category: 'processos',
    difficulty: 'Intermediário',
    goal: 'Ligar bomba em nível baixo e desligar ao atingir nível alto.',
    whyItMatters: 'É uma aplicação comum para técnicos, predial e automação simples.',
    practiceChecklist: ['Simular nível baixo', 'Confirmar bomba ligada', 'Simular nível alto', 'Confirmar bomba desligada'],
    expectedTags: ['I0.0', 'I0.1', 'I0.2', 'Q0.0', 'M0.0'],
    expectedConcepts: ['SET/RESET', 'Proteção', 'Nível'],
  },
];

export function findProfessionalExample(id: ProfessionalExampleId): ProfessionalExampleCatalogItem | undefined {
  return professionalExampleCatalog.find((example) => example.id === id);
}

export function professionalExamplesByCategory(category: ProfessionalExampleCategory): ProfessionalExampleCatalogItem[] {
  return professionalExampleCatalog.filter((example) => example.category === category);
}
