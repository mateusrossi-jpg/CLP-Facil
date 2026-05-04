export type PerformanceChecklistItem = {
  id: string;
  title: string;
  goal: string;
  implemented: boolean;
  notes: string[];
};

export const performanceChecklist: PerformanceChecklistItem[] = [
  {
    id: 'memoized_evaluations',
    title: 'Memoizar avaliações pesadas',
    goal: 'Evitar recalcular evaluateProject/evaluateEditorProject em renders que não alteram estado lógico.',
    implemented: true,
    notes: [
      'Usar useMemo no App para evaluation e editorEvaluation.',
      'Mantém comportamento lógico intacto.',
    ],
  },
  {
    id: 'stable_auto_scan',
    title: 'Auto-scan estável',
    goal: 'Evitar recriação do intervalo de scan a cada ciclo, reduzindo jitter e consumo.',
    implemented: true,
    notes: [
      'Usar refs para estado atual do simulador durante o intervalo.',
      'Intervalo depende apenas de autoScan e modo de edição.',
    ],
  },
  {
    id: 'isolated_reference',
    title: 'Referência isolada da simulação',
    goal: 'Manter painéis longos fora da bancada para reduzir poluição visual e render pesado na tela principal.',
    implemented: true,
    notes: [
      'Aba Ref concentra dialetos, protocolos, segurança, divulgação e loja.',
    ],
  },
  {
    id: 'compact_mobile_nav',
    title: 'Navegação compacta no celular',
    goal: 'Evitar quebra visual e medições caras de layout por textos longos no menu inferior.',
    implemented: true,
    notes: [
      'Labels curtos: Aula, Sim, Ref, HW.',
    ],
  },
  {
    id: 'future_virtualization',
    title: 'Virtualização futura de listas longas',
    goal: 'Quando exemplos/protocolos crescerem muito, migrar listas grandes para FlatList/SectionList.',
    implemented: false,
    notes: [
      'Não é obrigatório agora, mas deve entrar se a biblioteca ficar muito grande.',
    ],
  },
];

export function implementedPerformanceItems() {
  return performanceChecklist.filter((item) => item.implemented);
}
