import { EditorBlock, EditorProjectState } from '../engine/editorTypes';
import { collectMobileIoPoints, isMobileIoActive, mobileIoValueLabel } from './mobileIoPoints';

type MobileIoPointsRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, condition: boolean, details?: string): MobileIoPointsRegressionResult {
  return { name, passed: condition, details: condition ? undefined : details };
}

const LARGE_PROJECT_RUNG_COUNT = 18;

function contact(id: string, variable: string): EditorBlock {
  return {
    id: `${id}-contact`,
    componentId: 'contact-no',
    name: `Entrada ${variable}`,
    description: 'Contato de entrada para teste mobile.',
    isPro: false,
    zone: 'series',
    variable,
    role: 'contact',
    contactMode: 'NO',
    category: 'input',
  };
}

function coil(id: string, variable: string): EditorBlock {
  return {
    id: `${id}-coil`,
    componentId: 'coil-q',
    name: `Saida ${variable}`,
    description: 'Bobina de saida para teste mobile.',
    isPro: false,
    zone: 'coil',
    variable,
    role: 'coil',
    coilMode: 'NORMAL',
    category: 'output',
  };
}

function makeLargeMobileProject(): EditorProjectState {
  return {
    selectedRungId: 'rung-0',
    selectedBlockId: null,
    selectedZone: 'series',
    selectedSeriesIndex: 0,
    projectVariables: [
      { id: 'I0.0', address: 'I0.0', name: 'Start duplicado', scope: 'input', dataType: 'boolean' },
      { id: 'Q0.0', address: 'Q0.0', name: 'Saida duplicada', scope: 'output', dataType: 'boolean' },
    ],
    rungs: Array.from({ length: LARGE_PROJECT_RUNG_COUNT }, (_, index) => ({
      id: `rung-${index}`,
      label: `Linha ${index + 1} - Teste mobile ${index + 1}`,
      seriesBlocks: [
        contact(`r${index}`, `I0.${index}`),
        {
          ...contact(`r${index}-ignored`, 'M0.0'),
          sourceA: index === 0 ? '10' : undefined,
        },
      ],
      parallelBlocks: [],
      coilBlock: coil(`r${index}`, `Q0.${index}`),
    })),
  };
}

function runLargeProjectIoRegression(): MobileIoPointsRegressionResult {
  const project = makeLargeMobileProject();
  const points = collectMobileIoPoints(project, {
    'I0.0': true,
    [`I0.${LARGE_PROJECT_RUNG_COUNT - 1}`]: true,
    'Q0.0': true,
    [`Q0.${LARGE_PROJECT_RUNG_COUNT - 1}`]: false,
    'M0.0': true,
  });
  const inputs = points.filter((point) => point.kind === 'input');
  const outputs = points.filter((point) => point.kind === 'output');
  const uniqueAddresses = new Set(points.map((point) => point.address));
  const expectedLastInput = `I0.${LARGE_PROJECT_RUNG_COUNT - 1}`;
  const expectedLastOutput = `Q0.${LARGE_PROJECT_RUNG_COUNT - 1}`;
  const hasLastInput = inputs.some((point) => point.address === expectedLastInput && point.value === true);
  const hasLastOutput = outputs.some((point) => point.address === expectedLastOutput && point.value === false);
  const ignoresMemoryAndNumeric = !uniqueAddresses.has('M0.0') && !uniqueAddresses.has('10');

  return assertResult(
    'I/O mobile flutuante coleta todos os pontos inseridos sem limite fixo',
    inputs.length === LARGE_PROJECT_RUNG_COUNT &&
      outputs.length === LARGE_PROJECT_RUNG_COUNT &&
      uniqueAddresses.size === LARGE_PROJECT_RUNG_COUNT * 2 &&
      hasLastInput &&
      hasLastOutput &&
      ignoresMemoryAndNumeric,
    `expected=${LARGE_PROJECT_RUNG_COUNT}, inputs=${inputs.length}, outputs=${outputs.length}, total=${points.length}, addresses=${Array.from(uniqueAddresses).join(',')}`,
  );
}

function runValueLabelRegression(): MobileIoPointsRegressionResult {
  return assertResult(
    'I/O mobile rotula booleanos e numericos para popup flutuante',
    isMobileIoActive(true) &&
      !isMobileIoActive(false) &&
      isMobileIoActive(3) &&
      !isMobileIoActive(0) &&
      mobileIoValueLabel(true) === 'ON' &&
      mobileIoValueLabel(false) === 'OFF' &&
      mobileIoValueLabel(7) === '7',
    `true=${mobileIoValueLabel(true)}, false=${mobileIoValueLabel(false)}, numeric=${mobileIoValueLabel(7)}`,
  );
}

export function runMobileIoPointsRegressionSuite(): MobileIoPointsRegressionResult[] {
  return [
    runLargeProjectIoRegression(),
    runValueLabelRegression(),
  ];
}
