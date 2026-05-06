import type { ReleaseChecklistStageId } from './releaseChecklist';

export type PlcSimulatorMarketRiskArea =
  | 'mobile_performance'
  | 'mobile_editor'
  | 'timer_counter_editing'
  | 'guided_help'
  | 'large_projects'
  | 'hardware_export'
  | 'monetization'
  | 'diagnostics';

export type PlcSimulatorMarketRisk = {
  id: string;
  competitor: string;
  sourceName: string;
  sourceUrl: string;
  sourceSignal: string;
  risk: string;
  guardrail: string;
  area: PlcSimulatorMarketRiskArea;
  releaseStageId: ReleaseChecklistStageId;
  acceptanceCriteria: string[];
};

export const plcSimulatorMarketRisks: PlcSimulatorMarketRisk[] = [
  {
    id: 'slow_long_session_input_response',
    competitor: 'PLC Ladder Simulator',
    sourceName: 'Google Play review, September 17, 2018',
    sourceUrl: 'https://play.google.com/store/apps/details?hl=en-US&id=com.casdata.plcladdersimulator',
    sourceSignal: 'Usuario relatou atraso crescente na resposta das entradas conforme a sessao ficava aberta.',
    risk: 'Projeto de estudo parecer travado ou cansativo quando o aluno testa varios scans seguidos no celular.',
    guardrail: 'Manter avaliacao memoizada, auto-scan estavel e regressao de performance antes de publicar.',
    area: 'mobile_performance',
    releaseStageId: 'core_stability',
    acceptanceCriteria: [
      'Auto-scan nao recria intervalo a cada ciclo.',
      'Alterar uma entrada nao recalcula areas avancadas que estao fechadas.',
      'npm run test:quality passa antes de gerar build de teste.',
    ],
  },
  {
    id: 'painful_simple_program_flow',
    competitor: 'PLC Ladder Simulator Pro',
    sourceName: 'Google Play review, October 26, 2023',
    sourceUrl: 'https://play.google.com/store/apps/details?hl=en&id=com.casdata.plcladdersimulatorpro',
    sourceSignal: 'Usuario criticou a interface por tornar ate programas simples trabalhosos.',
    risk: 'O estudante abandonar o app antes de entender entrada, rung e saida.',
    guardrail: 'Separar Simular e Editar no mobile, com I/O visivel, rung enxuta e configuracao por toque no bloco.',
    area: 'mobile_editor',
    releaseStageId: 'mobile_visual',
    acceptanceCriteria: [
      'Tela Simular mostra entradas, rung e saidas juntas.',
      'Tela Editar permite tocar no bloco para configurar detalhes.',
      'Funcoes avancadas ficam sob demanda, fora da bancada principal.',
    ],
  },
  {
    id: 'timer_counter_configuration_friction',
    competitor: 'PLC Ladder Simulator Pro',
    sourceName: 'Google Play review, January 18, 2020',
    sourceUrl: 'https://play.google.com/store/apps/details?hl=en&id=com.casdata.plcladdersimulatorpro',
    sourceSignal: 'Usuario relatou dificuldade ao adicionar timers/contadores e configurar valores.',
    risk: 'Blocos avancados virarem ponto de quebra no curso tecnico, justamente quando o aluno sobe de nivel.',
    guardrail: 'Editar TON, TOF, TP, CTU e CTD por inspetor compacto, com preset legivel e fallback seguro.',
    area: 'timer_counter_editing',
    releaseStageId: 'core_stability',
    acceptanceCriteria: [
      'Timer e contador aparecem na pinca de montagem.',
      'Preset, acumulado e estado sao visiveis sem abrir tela gigante.',
      'Valor invalido nao derruba o simulador e mostra estado seguro.',
    ],
  },
  {
    id: 'tutorial_required_before_use',
    competitor: 'PLC Ladder Simulator e PLC Ladder Simulator 2',
    sourceName: 'Google Play listings',
    sourceUrl: 'https://play.google.com/store/apps/details?hl=en&id=com.casdata.plcladdersimulator2',
    sourceSignal: 'Listagens pedem que o usuario consulte tutorial ou ajuda antes de usar recursos essenciais.',
    risk: 'O app parecer ferramenta para quem ja sabe, nao tutor pratico para aprender CLP.',
    guardrail: 'Ensino guiado deve conduzir por missoes curtas com objetivo, pratica, feedback e dominio.',
    area: 'guided_help',
    releaseStageId: 'guided_learning',
    acceptanceCriteria: [
      'Cada licao tem conceito, importancia, pratica e checagem de dominio.',
      'A tela principal explica o que apertar, o que aconteceu e por que aconteceu.',
      'Ajuda contextual aparece sob demanda, sem bloquear a simulacao.',
    ],
  },
  {
    id: 'blocking_readme_or_locked_access',
    competitor: 'PLC Ladder Simulator 2',
    sourceName: 'Google Play review, July 19, 2020',
    sourceUrl: 'https://play.google.com/store/apps/details?hl=en&id=com.casdata.plcladdersimulator2',
    sourceSignal: 'Usuario relatou mensagem de README persistente e dificuldade para acessar codigo de desktop comprado.',
    risk: 'Modal, paywall ou aviso impedir uso basico e quebrar confianca.',
    guardrail: 'Avisos e recursos Pro nao podem bloquear simulacao basica, exemplos iniciais ou aprendizado essencial.',
    area: 'monetization',
    releaseStageId: 'monetization',
    acceptanceCriteria: [
      'Simulacao basica e missoes iniciais funcionam sem compra.',
      'Avisos fechaveis nao reaparecem em loop na mesma sessao.',
      'Recursos pagos devem explicar valor sem esconder a bancada didatica.',
    ],
  },
  {
    id: 'too_limited_or_missing_memory_bits',
    competitor: 'PLC Ladder Simulator 2',
    sourceName: 'AppBrain comments and Google Play metadata',
    sourceUrl: 'https://www.appbrain.com/app/plc-ladder-simulator-2/com.casdata.plcladdersimulator2',
    sourceSignal: 'Comentarios publicos citam recursos bloqueados, ausencia de bit de memoria e limitacao frente ao uso real.',
    risk: 'Usuarios mais tecnicos sentirem que o simulador nao cresce com projetos maiores.',
    guardrail: 'Coletar I/O, memorias, timers e contadores a partir do projeto real, sem limite fixo artificial.',
    area: 'large_projects',
    releaseStageId: 'professional_plc_features',
    acceptanceCriteria: [
      'I/O flutuante lista todos os pontos inseridos no projeto, nao apenas uma amostra fixa.',
      'Programa Ladder suporta muitas rungs com zoom e arraste horizontal.',
      'Memorias e tags numericas ficam disponiveis nas areas corretas, sem duplicar entradas/saidas.',
    ],
  },
  {
    id: 'arduino_upload_and_compatibility_confusion',
    competitor: 'PLC Ladder Simulator Pro',
    sourceName: 'Google Play listing and review, September 20, 2022',
    sourceUrl: 'https://play.google.com/store/apps/details?hl=en&id=com.casdata.plcladdersimulatorpro',
    sourceSignal: 'Listagem destaca compatibilidade de placas e um usuario relatou dificuldade para carregar no Arduino.',
    risk: 'Exportacao virar promessa maior que a experiencia real de bancada.',
    guardrail: 'Hardware deve ficar em aba separada, com placa, GPIO, codigo e avisos de compatibilidade claros.',
    area: 'hardware_export',
    releaseStageId: 'hardware_export',
    acceptanceCriteria: [
      'Aba Hardware valida pino reservado, duplicado e somente entrada.',
      'Codigo gerado usa fundo escuro legivel e estados seguros.',
      'A tela Simular nao mistura exportacao com o treino de Ladder.',
    ],
  },
  {
    id: 'realism_gap_without_diagnostics',
    competitor: 'PLC Ladder Simulator 2',
    sourceName: 'AppBrain comment, April 25, 2026',
    sourceUrl: 'https://www.appbrain.com/app/plc-ladder-simulator-2/com.casdata.plcladdersimulator2',
    sourceSignal: 'Comentario publico diz que a programacao nao se comporta como uso real e parece limitada.',
    risk: 'O aluno montar algo que acende, mas nao entender scan, selo, Stop, seguranca e diagnostico.',
    guardrail: 'Manter diagnostico tecnico sob demanda: scan, imagem de processo, trace, coach, relatorio e rubrica.',
    area: 'diagnostics',
    releaseStageId: 'professional_plc_features',
    acceptanceCriteria: [
      'Analises avancadas ficam em PIP ou secoes recolhiveis, sem poluir a tela principal.',
      'Rubrica evita nota alta se faltar saida, Stop ou diagnostico revisado.',
      'Coach explica causa e proximo teste com linguagem de curso tecnico.',
    ],
  },
];

export const criticalMarketRiskAreas: PlcSimulatorMarketRiskArea[] = [
  'mobile_performance',
  'mobile_editor',
  'timer_counter_editing',
  'guided_help',
  'large_projects',
  'hardware_export',
  'monetization',
  'diagnostics',
];

export function marketRisksForStage(stageId: ReleaseChecklistStageId): PlcSimulatorMarketRisk[] {
  return plcSimulatorMarketRisks.filter((risk) => risk.releaseStageId === stageId);
}

export function marketRiskCoverageByArea(): Record<PlcSimulatorMarketRiskArea, number> {
  return plcSimulatorMarketRisks.reduce(
    (coverage, risk) => ({
      ...coverage,
      [risk.area]: (coverage[risk.area] ?? 0) + 1,
    }),
    {} as Record<PlcSimulatorMarketRiskArea, number>,
  );
}

export function criticalMarketRisks(): PlcSimulatorMarketRisk[] {
  return plcSimulatorMarketRisks.filter((risk) => criticalMarketRiskAreas.includes(risk.area));
}
