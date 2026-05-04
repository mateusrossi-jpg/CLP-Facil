import { createInitialEditorProject } from '../engine/editorTypes';
import { createPlcProfileProjectView } from './plcProfiles';

type SimulatorDialectRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, condition: boolean, details?: string): SimulatorDialectRegressionResult {
  return { name, passed: condition, details: condition ? undefined : details };
}

function runSimulatorDialectRockwellRegression(): SimulatorDialectRegressionResult {
  const view = createPlcProfileProjectView(createInitialEditorProject(), 'rockwell_like');
  const line = view.rungs[0]?.textLine ?? '';
  const keepsVariables = line.includes('I0.0') && line.includes('I0.1') && line.includes('Q0.0');
  const usesRockwellNames = line.includes('XIC') && line.includes('XIO') && line.includes('OTE');

  return assertResult(
    'simulador pode demonstrar dialeto Rockwell-like sem alterar tags',
    keepsVariables && usesRockwellNames,
    `line=${line}`,
  );
}

function runSimulatorDialectCommandsRegression(): SimulatorDialectRegressionResult {
  const view = createPlcProfileProjectView(createInitialEditorProject(), 'commands_like');
  const line = view.rungs[0]?.textLine ?? '';
  const usesCommands = /Contato NA|Contato NF|Bobina\/Contator/.test(line);

  return assertResult(
    'simulador pode demonstrar leitura de comandos eletricos',
    usesCommands,
    `line=${line}`,
  );
}

export function runSimulatorDialectRegressionSuite(): SimulatorDialectRegressionResult[] {
  return [
    runSimulatorDialectRockwellRegression(),
    runSimulatorDialectCommandsRegression(),
  ];
}
