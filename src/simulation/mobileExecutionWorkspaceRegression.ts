import { createInitialEditorProject } from '../engine/editorTypes';
import { createProfessionalTagRows } from './professionalClpView';
import { activeCount, splitIoSections, valueLabel } from './mobileExecutionWorkspace';

type Regression = { name: string; passed: boolean; details?: string };

function runIoSectionsRegression(): Regression {
  const project = createInitialEditorProject();
  const rows = createProfessionalTagRows(project, { 'I0.0': true, 'Q0.0': false, M0: true, T1: 120, C1: 2 });
  const sections = splitIoSections(rows);
  const hasAll = ['overview', 'inputs', 'outputs', 'memories', 'timers', 'counters'].every((key) => sections.some((section) => section.key === key));
  return { name: 'workspace mobile separa IO em secoes esperadas', passed: hasAll, details: `sections=${sections.map((s) => s.key).join(',')}` };
}

function runValueLabelRegression(): Regression {
  const numeric = valueLabel({ tag: 'T1', description: 'timer', type: 'timer', scope: 'memory', value: 42, forced: 'normal', forcedLabel: 'Normal' });
  const boolean = valueLabel({ tag: 'Q0.0', description: 'coil', type: 'boolean', scope: 'output', value: true, forced: 'normal', forcedLabel: 'Normal' });
  return { name: 'workspace mobile formata valores ON OFF e numericos', passed: numeric === '42' && boolean === 'ON', details: `numeric=${numeric}, boolean=${boolean}` };
}

function runActiveCountRegression(): Regression {
  const rows = [
    { tag: 'I0.0', description: '', type: 'boolean' as const, scope: 'input' as const, value: true, forced: 'normal' as const, forcedLabel: 'Normal' as const },
    { tag: 'Q0.0', description: '', type: 'boolean' as const, scope: 'output' as const, value: false, forced: 'normal' as const, forcedLabel: 'Normal' as const },
    { tag: 'T1', description: '', type: 'timer' as const, scope: 'memory' as const, value: 11, forced: 'normal' as const, forcedLabel: 'Normal' as const },
  ];
  const active = activeCount(rows);
  return { name: 'workspace mobile conta sinais ativos com booleano e numerico', passed: active === 2, details: `active=${active}` };
}

export function runMobileExecutionWorkspaceRegressionSuite(): Regression[] {
  return [
    runIoSectionsRegression(),
    runValueLabelRegression(),
    runActiveCountRegression(),
  ];
}
