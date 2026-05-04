import { createInitialEditorProject } from '../engine/editorTypes';
import { createPlcProfileProjectView } from './plcProfiles';

type PlcProfileRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, condition: boolean, details?: string): PlcProfileRegressionResult {
  return { name, passed: condition, details: condition ? undefined : details };
}

function runRockwellProfileRegression(): PlcProfileRegressionResult {
  const view = createPlcProfileProjectView(createInitialEditorProject(), 'rockwell_like');
  const line = view.rungs[0]?.textLine ?? '';
  const hasXic = line.includes('XIC(I0.0)');
  const hasXio = line.includes('XIO(I0.1)');
  const hasOte = line.includes('OTE(Q0.0)');

  return assertResult(
    'perfil Rockwell-like traduz partida com selo',
    hasXic && hasXio && hasOte,
    `line=${line}`,
  );
}

function runIecProfileRegression(): PlcProfileRegressionResult {
  const view = createPlcProfileProjectView(createInitialEditorProject(), 'iec_like');
  const line = view.rungs[0]?.textLine ?? '';
  const hasNo = line.includes('Contato NA(I0.0)');
  const hasNf = line.includes('Contato NF(I0.1)');
  const hasCoil = line.includes('Coil(Q0.0)');

  return assertResult(
    'perfil IEC-like traduz partida com selo',
    hasNo && hasNf && hasCoil,
    `line=${line}`,
  );
}

export function runPlcProfileRegressionSuite(): PlcProfileRegressionResult[] {
  return [
    runRockwellProfileRegression(),
    runIecProfileRegression(),
  ];
}
