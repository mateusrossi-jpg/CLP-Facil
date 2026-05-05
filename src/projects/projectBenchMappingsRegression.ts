import { trainingProjects } from './projectCatalog';
import { getBenchMappingForProject, projectBenchMappings } from './projectBenchMappings';

type ProjectBenchMappingsRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, passed: boolean, details?: string): ProjectBenchMappingsRegressionResult {
  return { name, passed, details: passed ? undefined : details };
}

export function runProjectBenchMappingsRegressionSuite(): ProjectBenchMappingsRegressionResult[] {
  const everyMappingHasProject = projectBenchMappings.every((mapping) => trainingProjects.some((project) => project.id === mapping.projectId));
  const everyMappingHasPins = projectBenchMappings.every((mapping) => mapping.pins.length >= 3);
  const everyPinHasBoards = projectBenchMappings.every((mapping) =>
    mapping.pins.every((pin) => pin.tag && pin.label && pin.arduinoPin && pin.esp32Pin && pin.note.length > 10),
  );
  const everyMappingHasSafetyNotes = projectBenchMappings.every((mapping) => mapping.safetyNotes.length >= 2);
  const requiredMappings = ['partida-direta', 'selo', 'reversao', 'semaforo', 'esteira', 'portao-automatico'];
  const requiredMappingsExist = requiredMappings.every((projectId) => Boolean(getBenchMappingForProject(projectId)));
  const riskyProjectsHaveAttentionOutputs = ['partida-direta', 'selo', 'reversao', 'esteira', 'portao-automatico'].every((projectId) =>
    getBenchMappingForProject(projectId)?.pins.some((pin) => pin.direction === 'output' && pin.risk === 'attention'),
  );

  return [
    assertResult(
      'mapeamentos de bancada apontam para projetos existentes',
      everyMappingHasProject,
      `mappings=${projectBenchMappings.map((mapping) => mapping.projectId).join(',')}`,
    ),
    assertResult(
      'mapeamentos de bancada possuem pinos Arduino e ESP32',
      everyMappingHasPins && everyPinHasBoards,
      `mappings=${projectBenchMappings.length}`,
    ),
    assertResult(
      'mapeamentos de bancada possuem notas de seguranca',
      everyMappingHasSafetyNotes,
      `notes=${projectBenchMappings.map((mapping) => `${mapping.projectId}:${mapping.safetyNotes.length}`).join(',')}`,
    ),
    assertResult(
      'projetos principais possuem bancada sugerida',
      requiredMappingsExist,
      `missing=${requiredMappings.filter((projectId) => !getBenchMappingForProject(projectId)).join(',')}`,
    ),
    assertResult(
      'projetos com saida fisica possuem alerta de atencao',
      riskyProjectsHaveAttentionOutputs,
      'algum projeto com saida fisica ficou sem risk=attention',
    ),
  ];
}
