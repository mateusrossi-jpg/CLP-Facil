import { educationalEditorExamples } from './editorExampleProjects';

type QuickStartRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, condition: boolean, details?: string): QuickStartRegressionResult {
  return { name, passed: condition, details: condition ? undefined : details };
}

function runQuickStartExamplesRegression(): QuickStartRegressionResult {
  const exampleText = educationalEditorExamples.map((example) => `${example.id} ${example.title} ${example.description}`).join('\n');
  const hasBeginner = /selo|partida/i.test(exampleText);
  const hasMotor = /motor|revers|estrela|triângulo|triangulo/i.test(exampleText);
  const hasProcess = /bomba|esteira|pump|conveyor|nível|nivel/i.test(exampleText);

  return assertResult(
    'quick start possui exemplos para fluxo de divulgacao',
    hasBeginner && hasMotor && hasProcess,
    `beginner=${hasBeginner}, motor=${hasMotor}, process=${hasProcess}`,
  );
}

export function runQuickStartRegressionSuite(): QuickStartRegressionResult[] {
  return [runQuickStartExamplesRegression()];
}
