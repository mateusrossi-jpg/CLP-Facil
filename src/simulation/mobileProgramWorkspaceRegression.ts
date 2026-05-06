import { outputText, compactText, rungTitle, visibleProgramLines } from './mobileProgramWorkspace';

type Regression = { name: string; passed: boolean; details?: string };

function runCompactTextRegression(): Regression {
  const compact = compactText('Linha 1 — XIC I0.0  →  OTE Q0.0');
  return { name: 'workspace programa compacta linha ladder para leitura mobile', passed: compact === 'XIC I0.0 • OTE Q0.0', details: compact };
}

function runRungTitleRegression(): Regression {
  const title = rungTitle({ rungId: '1', label: 'Linha 2 — Partida motor', series: [], parallelBranches: [], output: null, textLine: '' });
  return { name: 'workspace programa remove prefixo de linha no titulo', passed: title === 'Partida motor', details: title };
}

function runOutputTextRegression(): Regression {
  const output = outputText({ rungId: '1', label: '', series: [], parallelBranches: [], output: { blockId: 'c1', variable: 'Q0.0', label: 'Motor', instruction: 'OTE', operand: 'Q0.0', description: 'Contator do motor' }, textLine: '' });
  return { name: 'workspace programa descreve instrucao e saida', passed: output === 'OTE Q0.0', details: output };
}

export function runMobileProgramWorkspaceRegressionSuite(): Regression[] {
  return [runCompactTextRegression(), runRungTitleRegression(), runOutputTextRegression(), runVisibleProgramLinesRegression()];
}

function runVisibleProgramLinesRegression(): Regression {
  const lines = ['r1', 'r2', 'r3', 'r4', 'r5'];
  const visible = visibleProgramLines(lines);
  return {
    name: 'workspace programa nao impõe limite fixo de linhas',
    passed: visible.length === lines.length,
    details: `visible=${visible.length}, total=${lines.length}`,
  };
}
