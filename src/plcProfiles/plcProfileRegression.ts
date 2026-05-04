import { createInitialEditorProject } from '../engine/editorTypes';
import { createPlcProfileProjectView, getPlcProfile } from './plcProfiles';

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

function runCommandsProfileRegression(): PlcProfileRegressionResult {
  const profile = getPlcProfile('commands_like');
  const hasCommandNames = profile.instructions.coil.NORMAL.includes('Contator') &&
    profile.instructions.coil.SET.includes('Retenção') &&
    profile.instructions.coil.RESET.includes('Desarme') &&
    profile.instructions.timer.TON.includes('Relé tempo');

  return assertResult(
    'perfil Comandos usa linguagem de comandos eletricos',
    hasCommandNames,
    `normal=${profile.instructions.coil.NORMAL}, set=${profile.instructions.coil.SET}, reset=${profile.instructions.coil.RESET}`,
  );
}

function runProfileInstructionCoverageRegression(): PlcProfileRegressionResult {
  const rockwell = getPlcProfile('rockwell_like');
  const iec = getPlcProfile('iec_like');
  const hasRockwellSymbols = rockwell.instructions.contact.NO === 'XIC' &&
    rockwell.instructions.contact.NC === 'XIO' &&
    rockwell.instructions.coil.NORMAL === 'OTE' &&
    rockwell.instructions.coil.SET === 'OTL' &&
    rockwell.instructions.coil.RESET === 'OTU' &&
    rockwell.instructions.contact.RISING === 'ONS' &&
    rockwell.instructions.contact.FALLING === 'OSF';
  const hasIecSymbols = iec.instructions.contact.RISING === 'P_TRIG' &&
    iec.instructions.contact.FALLING === 'N_TRIG' &&
    iec.instructions.coil.SET === 'S' &&
    iec.instructions.coil.RESET === 'R';

  return assertResult(
    'perfis possuem simbolos Rockwell e IEC essenciais',
    hasRockwellSymbols && hasIecSymbols,
    `rockwell=${hasRockwellSymbols}, iec=${hasIecSymbols}`,
  );
}

export function runPlcProfileRegressionSuite(): PlcProfileRegressionResult[] {
  return [
    runRockwellProfileRegression(),
    runIecProfileRegression(),
    runCommandsProfileRegression(),
    runProfileInstructionCoverageRegression(),
  ];
}
