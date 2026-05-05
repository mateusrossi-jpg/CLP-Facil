import { searchTrainingProjects } from './projectSearch';

type ProjectSearchRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, passed: boolean, details?: string): ProjectSearchRegressionResult {
  return { name, passed, details: passed ? undefined : details };
}

export function runProjectSearchRegressionSuite(): ProjectSearchRegressionResult[] {
  const km1 = searchTrainingProjects({ search: 'KM1' });
  const q00 = searchTrainingProjects({ search: 'Q0.0' });
  const fimCurso = searchTrainingProjects({ search: 'fim de curso' });
  const critico = searchTrainingProjects({ search: 'critico' });
  const favoritePortao = searchTrainingProjects({ filter: 'favorites', search: 'fim de curso' });
  const advancedTimer = searchTrainingProjects({ filter: 'advanced', search: 'T1' });

  return [
    assertResult(
      'busca enriquecida encontra tags de saida e labels do mapa de IO',
      km1.some((project) => project.id === 'partida-direta') && q00.length > 0,
      `km1=${km1.map((project) => project.id).join(',')}; q00=${q00.map((project) => project.id).join(',')}`,
    ),
    assertResult(
      'busca enriquecida encontra descricoes de sensores e fim de curso',
      fimCurso.some((project) => project.id === 'portao-automatico'),
      `fimCurso=${fimCurso.map((project) => project.id).join(',')}`,
    ),
    assertResult(
      'busca enriquecida encontra pontos criticos de seguranca sem acento',
      critico.length > 0,
      `critico=${critico.map((project) => project.id).join(',')}`,
    ),
    assertResult(
      'busca enriquecida respeita filtro favoritos',
      favoritePortao.length > 0 && favoritePortao.every((project) => project.favorite),
      `favoritePortao=${favoritePortao.map((project) => project.id).join(',')}`,
    ),
    assertResult(
      'busca enriquecida respeita filtro de dificuldade',
      advancedTimer.length > 0 && advancedTimer.every((project) => project.difficulty === 'advanced'),
      `advancedTimer=${advancedTimer.map((project) => project.id).join(',')}`,
    ),
  ];
}
