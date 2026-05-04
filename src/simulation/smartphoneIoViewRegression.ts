import { createSmartphoneIoSummary, SmartphoneSignalSnapshot } from './smartphoneIoView';

type SmartphoneIoRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, condition: boolean, details?: string): SmartphoneIoRegressionResult {
  return { name, passed: condition, details: condition ? undefined : details };
}

const sampleSignals: SmartphoneSignalSnapshot[] = [
  { address: 'I0.0', name: 'Start', type: 'input', value: true },
  { address: 'I0.1', name: 'Stop', type: 'input', value: false },
  { address: 'Q0.0', name: 'Motor', type: 'output', value: true },
  { address: 'M0.0', name: 'Selo', type: 'memory', value: true },
  { address: 'T0', name: 'Tempo', type: 'function', value: false },
];

function runInputSummaryRegression(): SmartphoneIoRegressionResult {
  const summary = createSmartphoneIoSummary(sampleSignals, 'inputs');
  return assertResult(
    'resumo mobile de entradas mostra ativos e orientação',
    summary.label === 'Entradas' && summary.totalCount === 2 && summary.activeCount === 1 && summary.activeAddresses.includes('I0.0') && /botoeiras|sensores/.test(summary.guidance),
    JSON.stringify(summary),
  );
}

function runOutputSummaryRegression(): SmartphoneIoRegressionResult {
  const summary = createSmartphoneIoSummary(sampleSignals, 'outputs');
  return assertResult(
    'resumo mobile de saídas explica bobinas e contatores',
    summary.totalCount === 1 && summary.activeCount === 1 && /bobinas|contatores|relés/.test(summary.guidance),
    JSON.stringify(summary),
  );
}

function runFunctionSummaryRegression(): SmartphoneIoRegressionResult {
  const summary = createSmartphoneIoSummary(sampleSignals, 'functions');
  return assertResult(
    'resumo mobile de timers e contadores orienta PRE ACC DN',
    summary.totalCount === 1 && summary.activeCount === 0 && /temporização|contagem/.test(summary.guidance),
    JSON.stringify(summary),
  );
}

export function runSmartphoneIoViewRegressionSuite(): SmartphoneIoRegressionResult[] {
  return [
    runInputSummaryRegression(),
    runOutputSummaryRegression(),
    runFunctionSummaryRegression(),
  ];
}
