export type ChangeTestStageId =
  | 'before_change'
  | 'code_change'
  | 'automated_gate'
  | 'feature_regression'
  | 'mobile_review'
  | 'human_education_review'
  | 'release_note';

export type ChangeSize = 'small' | 'medium' | 'large' | 'release';

export type ChangeTestStage = {
  id: ChangeTestStageId;
  title: string;
  when: string;
  owner: 'assistant_ci' | 'mateus_manual' | 'both';
  requiredFor: ChangeSize[];
  checklist: string[];
  doneDefinition: string;
};

export type ChangeTestProtocol = {
  changeType: string;
  examples: string[];
  requiredStages: ChangeTestStageId[];
  extraChecks: string[];
};

export const changeTestStages: ChangeTestStage[] = [
  {
    id: 'before_change',
    title: 'Antes da mudança',
    when: 'Antes de alterar uma área grande do app.',
    owner: 'both',
    requiredFor: ['medium', 'large', 'release'],
    checklist: [
      'Definir qual tela/módulo será alterado.',
      'Anotar o comportamento esperado antes de mexer.',
      'Criar ou confirmar regressão automática quando a mudança afetar lógica.',
    ],
    doneDefinition: 'A mudança tem objetivo claro e pelo menos um teste ou checklist correspondente.',
  },
  {
    id: 'code_change',
    title: 'Implementação controlada',
    when: 'Durante a alteração de código.',
    owner: 'assistant_ci',
    requiredFor: ['small', 'medium', 'large', 'release'],
    checklist: [
      'Preferir mudanças pequenas e rastreáveis por commit.',
      'Evitar misturar visual, lógica e monetização no mesmo bloco quando possível.',
      'Adicionar scripts de integração apenas quando o arquivo final exigir transformação automática.',
    ],
    doneDefinition: 'Commit criado com escopo claro e sem mudança desnecessária fora da frente atual.',
  },
  {
    id: 'automated_gate',
    title: 'Quality gate automático',
    when: 'Após cada grande mudança ou antes de seguir para outra frente.',
    owner: 'assistant_ci',
    requiredFor: ['small', 'medium', 'large', 'release'],
    checklist: [
      'Rodar typecheck.',
      'Rodar test:simulator.',
      'Consultar logs do GitHub Actions quando o teste for disparado via PR/branch.',
      'Corrigir falhas antes de avançar se a falha for bloqueadora.',
    ],
    doneDefinition: 'npm run test:quality passa ou a falha fica registrada com plano de correção.',
  },
  {
    id: 'feature_regression',
    title: 'Regressão por módulo',
    when: 'Quando a mudança mexe em simulador, Hardware, Referência, exemplos, aulas ou loja.',
    owner: 'assistant_ci',
    requiredFor: ['medium', 'large', 'release'],
    checklist: [
      'Simulador: selo, borda, timer, contador e matemática.',
      'Hardware: exportação Arduino/ESP32 e ESPHome, GPIO bloqueado e GPIO recomendado.',
      'Referência: Rockwell-like, IEC-like, protocolos, segurança, divulgação e loja.',
      'Educação: lições guiadas e sequência de passos.',
    ],
    doneDefinition: 'A regressão do módulo alterado passa e aparece no quality gate.',
  },
  {
    id: 'mobile_review',
    title: 'Revisão visual no celular',
    when: 'Depois que a mudança passa nos testes automáticos.',
    owner: 'mateus_manual',
    requiredFor: ['medium', 'large', 'release'],
    checklist: [
      'Abrir no iPhone e conferir menu inferior.',
      'Verificar se não há cards cortados ou textos invisíveis.',
      'Testar Home, Aprender, Simular, Ref, HW e Pro quando a mudança for global.',
      'Enviar print quando algo ficar estranho.',
    ],
    doneDefinition: 'A tela funciona no iPhone sem poluição visual ou quebra de layout.',
  },
  {
    id: 'human_education_review',
    title: 'Revisão humana e educativa',
    when: 'Após a função ficar tecnicamente estável.',
    owner: 'both',
    requiredFor: ['large', 'release'],
    checklist: [
      'Perguntar se um aluno iniciante entende o que fazer.',
      'Explicar por que cada contato, bobina, timer ou intertravamento existe.',
      'Evitar jargão sem explicação.',
      'Planejar lições guiadas estilo trilha, passo a passo e com feedback.',
    ],
    doneDefinition: 'A função não apenas funciona: ela ensina o usuário a entender a lógica.',
  },
  {
    id: 'release_note',
    title: 'Resumo final da mudança',
    when: 'No fechamento de cada bloco de trabalho.',
    owner: 'assistant_ci',
    requiredFor: ['medium', 'large', 'release'],
    checklist: [
      'Listar commits relevantes.',
      'Listar testes executados e resultado.',
      'Listar pendências visuais/manuais.',
    ],
    doneDefinition: 'A mudança fica documentada e pronta para próxima etapa.',
  },
];

export const changeTestProtocols: ChangeTestProtocol[] = [
  {
    changeType: 'Simulador / Ladder',
    examples: ['borda ONS/OSF', 'timer TON/TOF/TP', 'contador CTU/CTD/CTUD', 'selo', 'intertravamento'],
    requiredStages: ['before_change', 'code_change', 'automated_gate', 'feature_regression', 'mobile_review', 'human_education_review', 'release_note'],
    extraChecks: [
      'Auto Scan por alguns segundos.',
      'Scan manual em sequência.',
      'Troca de dialeto sem alterar comportamento lógico.',
    ],
  },
  {
    changeType: 'Hardware / GPIO / Exportação',
    examples: ['nova placa', 'diagrama de pinos', 'ESPHome YAML', 'Arduino C++'],
    requiredStages: ['before_change', 'code_change', 'automated_gate', 'feature_regression', 'mobile_review', 'release_note'],
    extraChecks: [
      'GPIO somente entrada não pode virar saída.',
      'Pino reservado precisa bloquear.',
      'Código gerado precisa manter saída segura no boot.',
    ],
  },
  {
    changeType: 'Visual / Navegação',
    examples: ['menu inferior', 'cards da Home', 'aba Ref', 'aba Hardware'],
    requiredStages: ['code_change', 'automated_gate', 'mobile_review', 'human_education_review', 'release_note'],
    extraChecks: [
      'Testar no iPhone em modo retrato.',
      'Garantir que textos longos usam labels curtos ou quebram corretamente.',
    ],
  },
  {
    changeType: 'Educação / Lições guiadas',
    examples: ['trilha estilo Duolingo', 'lição de selo', 'lição de timer', 'lição de reversão'],
    requiredStages: ['before_change', 'code_change', 'automated_gate', 'feature_regression', 'mobile_review', 'human_education_review', 'release_note'],
    extraChecks: [
      'Cada lição precisa ter objetivo, explicação, prática e feedback.',
      'Cada etapa precisa ter condição de conclusão testável.',
      'Evitar que o aluno avance sem entender o porquê.',
    ],
  },
  {
    changeType: 'Loja / Divulgação / Pro',
    examples: ['texto da loja', 'plano de prints', 'Pro', 'teste fechado'],
    requiredStages: ['code_change', 'automated_gate', 'mobile_review', 'human_education_review', 'release_note'],
    extraChecks: [
      'Não prometer compatibilidade oficial com fabricantes.',
      'Manter aviso de uso didático e segurança.',
      'Separar valor gratuito e Pro sem travar aprendizado básico.',
    ],
  },
];

export function stagesForChangeSize(size: ChangeSize) {
  return changeTestStages.filter((stage) => stage.requiredFor.includes(size));
}
