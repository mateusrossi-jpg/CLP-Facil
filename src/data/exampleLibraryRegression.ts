import { educationalEditorExamples } from './editorExampleProjects';
import { professionalExampleCatalog, professionalExamplesByCategory } from './professionalExampleCatalog';

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

function catalogHas(pattern: RegExp): boolean {
  return professionalExampleCatalog.some((example) => pattern.test(`${example.id} ${example.title} ${example.goal} ${example.whyItMatters}`));
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

function runProfessionalCatalogRegression(): ExampleLibraryRegressionResult {
  const hasTrafficLight = catalogHas(/semáforo|semaforo|traffic/i);
  const hasGate = catalogHas(/portão|portao|gate/i);
  const hasReservoir = catalogHas(/reservatório|reservatorio|nível|nivel/i);
  const hasAlternatingPump = catalogHas(/alternad|bomba/i);
  const hasCoreCategories = professionalExamplesByCategory('comandos_eletricos').length >= 4 &&
    professionalExamplesByCategory('processos').length >= 2 &&
    professionalExamplesByCategory('temporizadores_contadores').length >= 2;
  const eachHasPractice = professionalExampleCatalog.every((example) => example.practiceChecklist.length >= 4 && example.expectedTags.length >= 3);

  return assertResult(
    'catalogo profissional cobre exemplos reais e checklist didatico',
    hasTrafficLight && hasGate && hasReservoir && hasAlternatingPump && hasCoreCategories && eachHasPractice,
    `traffic=${hasTrafficLight}, gate=${hasGate}, reservoir=${hasReservoir}, alternating=${hasAlternatingPump}, categories=${hasCoreCategories}, practice=${eachHasPractice}`,
  );
}

export function runExampleLibraryRegressionSuite(): ExampleLibraryRegressionResult[] {
  return [
    runExampleCoverageRegression(),
    runExampleVariablesRegression(),
    runProfessionalCatalogRegression(),
  ];
}
