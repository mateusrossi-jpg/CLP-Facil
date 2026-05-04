import { educationalEditorExamples } from './editorExampleProjects';

type ExampleLibraryRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, condition: boolean, details?: string): ExampleLibraryRegressionResult {
  return { name, passed: condition, details: condition ? undefined : details };
}

function hasExample(pattern: RegExp): boolean {
  return educationalEditorExamples.some((example) => pattern.test(`${example.id} ${example.title} ${example.description}`));
}

function runExampleCoverageRegression(): ExampleLibraryRegressionResult {
  const hasDirect = hasExample(/partida direta|direct/i);
  const hasSeal = hasExample(/selo|seal/i);
  const hasTimer = hasExample(/TON|TOF|tempor/i);
  const hasCounter = hasExample(/CTU|contador|counter/i);
  const hasMotor = hasExample(/revers|estrela|triângulo|triangulo|motor/i);
  const hasProcess = hasExample(/bomba|esteira|pump|conveyor|nível|nivel/i);

  return assertResult(
    'biblioteca cobre exemplos de divulgacao principais',
    hasDirect && hasSeal && hasTimer && hasCounter && hasMotor && hasProcess,
    `direct=${hasDirect}, seal=${hasSeal}, timer=${hasTimer}, counter=${hasCounter}, motor=${hasMotor}, process=${hasProcess}`,
  );
}

function runExampleVariablesRegression(): ExampleLibraryRegressionResult {
  const missingVariables = educationalEditorExamples.filter((example) => !example.project.projectVariables || example.project.projectVariables.length === 0);
  return assertResult(
    'todos exemplos declaram tabela de tags I/O',
    missingVariables.length === 0,
    `missing=${missingVariables.map((example) => example.id).join(',')}`,
  );
}

export function runExampleLibraryRegressionSuite(): ExampleLibraryRegressionResult[] {
  return [
    runExampleCoverageRegression(),
    runExampleVariablesRegression(),
  ];
}
