import { getProjectLearningLinkSummary } from '../education/projectLearningLinks';
import type { TrainingProject } from './projectCatalog';
import { getBenchMappingForProject } from './projectBenchMappings';
import { getIoPointsForProject, getSafetyCriticalIoPoints } from './projectIoMaps';
import { getRungTemplatesForProject } from './projectLadderTemplates';

export type ProjectActionKind = 'study' | 'simulate' | 'edit' | 'bench' | 'export';
export type ProjectActionStatus = 'ready' | 'recommended' | 'attention' | 'locked';

export type ProjectActionPlanItem = {
  kind: ProjectActionKind;
  title: string;
  description: string;
  status: ProjectActionStatus;
  checklist: string[];
};

export type ProjectActionPlan = {
  projectId: TrainingProject['id'];
  readinessScore: number;
  items: ProjectActionPlanItem[];
  warnings: string[];
};

function hasRealLearning(project: TrainingProject): boolean {
  const learning = getProjectLearningLinkSummary(project.id);
  return learning.linkedLessons.length > 0 || learning.linkedPracticeCount > 0;
}

function getReadinessScore(project: TrainingProject): number {
  const learning = getProjectLearningLinkSummary(project.id);
  const hasRungs = getRungTemplatesForProject(project.id).length > 0;
  const hasIo = getIoPointsForProject(project.id).length > 0;
  const hasBench = Boolean(getBenchMappingForProject(project.id));
  const hasSafety = getSafetyCriticalIoPoints(project.id).length > 0;

  return Math.min(
    100,
    (learning.linkedLessons.length > 0 ? 20 : 0) +
      (learning.linkedPracticeCount > 0 ? 20 : 0) +
      (hasRungs ? 20 : 0) +
      (hasIo ? 20 : 0) +
      (hasBench ? 15 : 0) +
      (hasSafety ? 5 : 0),
  );
}

export function getProjectActionPlan(project: TrainingProject): ProjectActionPlan {
  const learning = getProjectLearningLinkSummary(project.id);
  const rungs = getRungTemplatesForProject(project.id);
  const ioPoints = getIoPointsForProject(project.id);
  const bench = getBenchMappingForProject(project.id);
  const safetyPoints = getSafetyCriticalIoPoints(project.id);

  const items: ProjectActionPlanItem[] = [
    {
      kind: 'study',
      title: 'Estudar antes de simular',
      description: hasRealLearning(project)
        ? 'Existe conteúdo didático vinculado para entender o conceito antes da prática.'
        : 'Projeto disponível, mas ainda sem trilha didática vinculada.',
      status: hasRealLearning(project) ? 'recommended' : 'attention',
      checklist: [
        `${learning.linkedLessons.length} lições vinculadas`,
        `${learning.linkedPracticeCount} práticas guiadas`,
        `Score didático ${learning.teachingScore}%`,
      ],
    },
    {
      kind: 'simulate',
      title: 'Simular no celular',
      description: rungs.length > 0
        ? 'A prévia Ladder compacta já permite entender a sequência antes de abrir a execução mobile.'
        : 'Ainda falta prévia Ladder para orientar a simulação.',
      status: rungs.length > 0 ? 'ready' : 'attention',
      checklist: [`${rungs.length} rungs de prévia`, 'Saída/carga visível', 'Diagnóstico compacto recomendado'],
    },
    {
      kind: 'edit',
      title: 'Editar Ladder',
      description: ioPoints.length > 0
        ? 'O mapa de I/O ajuda a criar tags e comentários do programa no editor.'
        : 'Ainda falta mapa de I/O para orientar tags do editor.',
      status: ioPoints.length > 0 ? 'ready' : 'attention',
      checklist: [`${ioPoints.length} pontos de I/O`, `${safetyPoints.length} pontos críticos`, 'Comentários por rung recomendados'],
    },
    {
      kind: 'bench',
      title: 'Montar bancada',
      description: bench
        ? 'Há sugestão de pinos Arduino/ESP32, mas saídas físicas exigem driver, proteção e teste com baixa tensão.'
        : 'Ainda não existe mapeamento de bancada para este projeto.',
      status: bench ? (safetyPoints.length > 0 ? 'attention' : 'ready') : 'locked',
      checklist: bench
        ? [`${bench.pins.length} pinos sugeridos`, `${bench.safetyNotes.length} notas de segurança`, `Placa: ${bench.recommendedTarget}`]
        : ['Criar mapa de pinos', 'Validar GPIOs', 'Adicionar notas de segurança'],
    },
    {
      kind: 'export',
      title: 'Exportar código',
      description: bench
        ? 'Com o mapeamento de bancada pronto, a exportação Arduino/ESP32/ESPHome fica mais objetiva.'
        : 'A exportação é possível, mas ficará melhor após mapear pinos de bancada.',
      status: bench ? 'ready' : 'attention',
      checklist: ['Arduino', 'ESP32', 'ESPHome'],
    },
  ];

  return {
    projectId: project.id,
    readinessScore: getReadinessScore(project),
    items,
    warnings: safetyPoints.length > 0
      ? ['Pontos críticos detectados: em hardware real, use proteção, isolamento e intertravamento físico quando aplicável.']
      : [],
  };
}
