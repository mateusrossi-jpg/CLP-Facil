import {
  getFeaturedTrainingProject,
  getProjectCategoryLabel,
  getProjectDifficultyLabel,
  getTrainingProjectById,
  trainingProjects,
} from './projectCatalog';

type ProjectCatalogRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, passed: boolean, details?: string): ProjectCatalogRegressionResult {
  return { name, passed, details: passed ? undefined : details };
}

export function runProjectCatalogRegressionSuite(): ProjectCatalogRegressionResult[] {
  const requiredProjectIds = [
    'partida-direta',
    'selo',
    'reversao',
    'estrela-triangulo',
    'semaforo',
    'bomba-alternada',
    'esteira',
    'portao-automatico',
    'reservatorio',
  ];

  const requiredProjectsExist = requiredProjectIds.every((id) => Boolean(getTrainingProjectById(id)));
  const allProjectsHaveLearningGoals = trainingProjects.every((project) => project.learningGoals.length >= 3);
  const allProjectsHaveValidIo = trainingProjects.every((project) =>
    project.ioSummary.inputs >= 0 &&
    project.ioSummary.outputs >= 0 &&
    project.ioSummary.memories >= 0 &&
    project.ioSummary.timers >= 0 &&
    project.ioSummary.counters >= 0,
  );
  const allProjectsHaveInstructions = trainingProjects.every((project) => project.instructions.length >= 3);
  const hasAllDifficultyLevels = ['Básico', 'Intermediário', 'Avançado'].every((label) =>
    trainingProjects.some((project) => getProjectDifficultyLabel(project.difficulty) === label),
  );
  const categoriesHaveLabels = trainingProjects.every((project) => getProjectCategoryLabel(project.category).length >= 5);
  const featuredProject = getFeaturedTrainingProject();

  return [
    assertResult(
      'catalogo de projetos contem exemplos obrigatorios',
      requiredProjectsExist,
      `missing=${requiredProjectIds.filter((id) => !getTrainingProjectById(id)).join(',')}`,
    ),
    assertResult(
      'projetos possuem objetivos, instrucoes e resumo de IO validos',
      allProjectsHaveLearningGoals && allProjectsHaveValidIo && allProjectsHaveInstructions,
      `projects=${trainingProjects.length}`,
    ),
    assertResult(
      'biblioteca cobre todos os niveis e categorias possuem rotulos',
      hasAllDifficultyLevels && categoriesHaveLabels,
      `difficulties=${trainingProjects.map((project) => getProjectDifficultyLabel(project.difficulty)).join(',')}`,
    ),
    assertResult(
      'projeto em destaque existe e e reutilizavel',
      Boolean(featuredProject.id && featuredProject.title && featuredProject.learningGoals.length >= 3),
      `featured=${featuredProject.id}`,
    ),
  ];
}
