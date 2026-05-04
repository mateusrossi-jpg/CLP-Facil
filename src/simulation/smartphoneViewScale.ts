export type SmartphoneViewScaleId = 'compact' | 'fit' | 'wide';

export type SmartphoneViewScaleOption = {
  id: SmartphoneViewScaleId;
  label: string;
  description: string;
  blockWidth: number;
  minPathWidth: number;
  outputAlwaysVisible: boolean;
};

export const smartphoneViewScaleOptions: SmartphoneViewScaleOption[] = [
  {
    id: 'compact',
    label: 'Compacto',
    description: 'Reduz largura dos blocos para leitura rápida em celulares estreitos.',
    blockWidth: 112,
    minPathWidth: 520,
    outputAlwaysVisible: true,
  },
  {
    id: 'fit',
    label: 'Enquadrar',
    description: 'Equilibra leitura e espaço, mantendo a saída fixa no resumo do rung.',
    blockWidth: 132,
    minPathWidth: 620,
    outputAlwaysVisible: true,
  },
  {
    id: 'wide',
    label: 'Amplo',
    description: 'Aumenta blocos para apresentação em aula, tablet ou celular na horizontal.',
    blockWidth: 156,
    minPathWidth: 760,
    outputAlwaysVisible: true,
  },
];

export function getSmartphoneViewScale(id: SmartphoneViewScaleId): SmartphoneViewScaleOption {
  return smartphoneViewScaleOptions.find((option) => option.id === id) ?? smartphoneViewScaleOptions[1];
}

export function nextSmartphoneViewScale(id: SmartphoneViewScaleId): SmartphoneViewScaleId {
  const index = smartphoneViewScaleOptions.findIndex((option) => option.id === id);
  const next = smartphoneViewScaleOptions[(index + 1) % smartphoneViewScaleOptions.length];
  return next.id;
}

export function shouldPreferFlowView(conditionCount: number, parallelBranchCount: number): boolean {
  return conditionCount >= 4 || parallelBranchCount >= 2;
}

export function smartphoneViewGuidance(conditionCount: number, parallelBranchCount: number): string {
  if (shouldPreferFlowView(conditionCount, parallelBranchCount)) {
    return 'Rung grande detectado: use Fluxo com arraste lateral e saída/carga fixa no resumo.';
  }
  return 'Rung curto: a visualização em Lista é suficiente, mas Fluxo continua disponível.';
}
