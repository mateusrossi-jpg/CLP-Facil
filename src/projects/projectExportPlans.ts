import type { TrainingProject } from './projectCatalog';
import { getBenchBoardTargetLabel, getBenchMappingForProject } from './projectBenchMappings';
import { getIoPointsForProject, getSafetyCriticalIoPoints } from './projectIoMaps';
import { getRungTemplatesForProject } from './projectLadderTemplates';

export type ProjectExportTarget = 'arduino' | 'esp32' | 'esphome';
export type ProjectExportStatus = 'ready' | 'attention' | 'blocked';

export type ProjectExportTargetPlan = {
  target: ProjectExportTarget;
  label: string;
  status: ProjectExportStatus;
  pinSummary: string;
  checklist: string[];
  warnings: string[];
};

export type ProjectExportPlan = {
  projectId: TrainingProject['id'];
  readyTargetCount: number;
  targets: ProjectExportTargetPlan[];
};

function getTargetLabel(target: ProjectExportTarget): string {
  if (target === 'arduino') return 'Arduino';
  if (target === 'esp32') return 'ESP32';
  return 'ESPHome';
}

function getStatusForTarget(project: TrainingProject, target: ProjectExportTarget): ProjectExportStatus {
  const bench = getBenchMappingForProject(project.id);
  const rungs = getRungTemplatesForProject(project.id);
  const ioPoints = getIoPointsForProject(project.id);

  if (!bench || rungs.length === 0 || ioPoints.length === 0) {
    return 'blocked';
  }

  const hasAttentionOutput = bench.pins.some((pin) => pin.direction === 'output' && pin.risk !== 'safe');
  if (target === 'esphome' || hasAttentionOutput || getSafetyCriticalIoPoints(project.id).length > 0) {
    return 'attention';
  }

  return 'ready';
}

function getChecklist(project: TrainingProject, target: ProjectExportTarget): string[] {
  const bench = getBenchMappingForProject(project.id);
  const rungs = getRungTemplatesForProject(project.id);
  const ioPoints = getIoPointsForProject(project.id);
  const safetyPoints = getSafetyCriticalIoPoints(project.id);

  if (!bench) {
    return ['Criar mapeamento de pinos', 'Validar placa alvo', 'Adicionar notas de segurança'];
  }

  const base = [
    `${rungs.length} rungs de referência`,
    `${ioPoints.length} pontos de I/O`,
    `${bench.pins.length} pinos de bancada`,
  ];

  if (target === 'esp32') {
    base.push(`Placa sugerida: ${getBenchBoardTargetLabel(bench.recommendedTarget)}`);
  }
  if (target === 'arduino') {
    base.push('Pinos Arduino definidos');
  }
  if (target === 'esphome') {
    base.push('Revisar YAML e nomes das entidades');
  }
  if (safetyPoints.length > 0) {
    base.push(`${safetyPoints.length} pontos críticos para revisar`);
  }

  return base;
}

function getWarnings(project: TrainingProject, target: ProjectExportTarget): string[] {
  const bench = getBenchMappingForProject(project.id);
  const safetyPoints = getSafetyCriticalIoPoints(project.id);
  const warnings: string[] = [];

  if (!bench) {
    warnings.push('Exportação limitada: este projeto ainda não possui mapeamento de bancada.');
    return warnings;
  }

  const attentionOutputs = bench.pins.filter((pin) => pin.direction === 'output' && pin.risk !== 'safe');
  if (attentionOutputs.length > 0) {
    warnings.push('Saídas físicas exigem driver, isolamento e fonte adequada antes de acionar relé, contator ou motor.');
  }
  if (safetyPoints.length > 0) {
    warnings.push('Há pontos críticos de segurança: valide intertravamento físico e comportamento de falha antes de usar em carga real.');
  }
  if (target === 'esphome') {
    warnings.push('ESPHome é ótimo para bancada e automação leve, mas comandos críticos devem manter proteção física independente.');
  }

  return warnings;
}

export function getProjectExportPlan(project: TrainingProject): ProjectExportPlan {
  const targets: ProjectExportTarget[] = ['arduino', 'esp32', 'esphome'];
  const plans = targets.map((target): ProjectExportTargetPlan => {
    const bench = getBenchMappingForProject(project.id);
    const pinSummary = bench
      ? `${bench.pins.filter((pin) => pin.direction === 'input').length} entradas • ${bench.pins.filter((pin) => pin.direction === 'output').length} saídas`
      : 'Sem pinos definidos';

    return {
      target,
      label: getTargetLabel(target),
      status: getStatusForTarget(project, target),
      pinSummary,
      checklist: getChecklist(project, target),
      warnings: getWarnings(project, target),
    };
  });

  return {
    projectId: project.id,
    readyTargetCount: plans.filter((plan) => plan.status === 'ready' || plan.status === 'attention').length,
    targets: plans,
  };
}
