import { trainingProjects } from './projectCatalog';
import { getProjectLearningFocus } from './projectLearningFocus';

type ProjectLearningFocusRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, passed: boolean, details?: string): ProjectLearningFocusRegressionResult {
  return { name, passed, details: passed ? undefined : details };
}

export function runProjectLearningFocusRegressionSuite(): ProjectLearningFocusRegressionResult[] {
  const focuses = trainingProjects.map((project) => getProjectLearningFocus(project.id));
  const everyProjectHasFocus = focuses.every(Boolean);
  const countsMatch = focuses.every((focus) => Boolean(
    focus &&
      focus.lessonCount === focus.lessons.length &&
      focus.practiceCount === focus.practices.length &&
      focus.hasLearningPath === (focus.lessons.length > 0 || focus.practices.length > 0),
  ));
  const everyFocusHasHint = focuses.every((focus) => Boolean(focus && focus.focusHint.length > 20));
  const invalidProjectReturnsUndefined = getProjectLearningFocus('projeto-inexistente') === undefined;
  const seloFocus = getProjectLearningFocus('selo');
  const seloFocusIsUseful = Boolean(
    seloFocus &&
      seloFocus.project.id === 'selo' &&
      seloFocus.hasLearningPath &&
      seloFocus.lessonCount > 0 &&
      seloFocus.practiceCount > 0 &&
      seloFocus.focusHint.includes('prática'),
  );

  return [
    assertResult(
      'todos os projetos possuem foco educativo',
      everyProjectHasFocus,
      `focuses=${focuses.map((focus) => focus?.project.id ?? 'undefined').join(',')}`,
    ),
    assertResult(
      'contagens do foco educativo batem com licoes e praticas',
      countsMatch,
      'alguma contagem lesson/practice divergiu',
    ),
    assertResult(
      'foco educativo possui dica de sequencia',
      everyFocusHasHint,
      `hints=${focuses.map((focus) => focus ? `${focus.project.id}:${focus.focusHint}` : 'undefined').join('|')}`,
    ),
    assertResult(
      'projeto inexistente nao gera foco educativo',
      invalidProjectReturnsUndefined,
      'getProjectLearningFocus deveria retornar undefined para id invalido',
    ),
    assertResult(
      'foco educativo do selo permanece util',
      seloFocusIsUseful,
      `selo=${seloFocus ? JSON.stringify({ lessons: seloFocus.lessonCount, practices: seloFocus.practiceCount, hint: seloFocus.focusHint }) : 'undefined'}`,
    ),
  ];
}
