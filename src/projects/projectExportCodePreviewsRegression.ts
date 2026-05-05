import { trainingProjects } from './projectCatalog';
import { getProjectExportCodePreviews } from './projectExportCodePreviews';

type ProjectExportCodePreviewsRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, passed: boolean, details?: string): ProjectExportCodePreviewsRegressionResult {
  return { name, passed, details: passed ? undefined : details };
}

export function runProjectExportCodePreviewsRegressionSuite(): ProjectExportCodePreviewsRegressionResult[] {
  const projectsWithPreviews = trainingProjects
    .map((project) => ({ project, previews: getProjectExportCodePreviews(project) }))
    .filter((entry) => entry.previews.length > 0);

  const everyPreviewHasThreeTargets = projectsWithPreviews.every((entry) => entry.previews.length === 3);
  const everyPreviewHasCode = projectsWithPreviews.every((entry) =>
    entry.previews.every((preview) => preview.code.length > 120 && preview.fileName.length > 4 && preview.warnings.length >= 1),
  );
  const everyPreviewHasValidLanguage = projectsWithPreviews.every((entry) =>
    entry.previews.every((preview) => preview.language === 'cpp' || preview.language === 'yaml'),
  );
  const seloPreviews = getProjectExportCodePreviews(trainingProjects.find((project) => project.id === 'selo') ?? trainingProjects[0]);
  const seloHasArduinoEsp32Esphome =
    seloPreviews.some((preview) => preview.target === 'arduino' && preview.code.includes('pinMode')) &&
    seloPreviews.some((preview) => preview.target === 'esp32' && preview.code.includes('Serial.begin')) &&
    seloPreviews.some((preview) => preview.target === 'esphome' && preview.code.includes('restore_mode: ALWAYS_OFF'));
  const codeUsesMappedPins = seloPreviews.some((preview) => preview.code.includes('GPIO23') || preview.code.includes('PIN_I0_0'));

  return [
    assertResult(
      'projetos com bancada possuem tres previews de codigo',
      projectsWithPreviews.length > 0 && everyPreviewHasThreeTargets,
      `projects=${projectsWithPreviews.map((entry) => `${entry.project.id}:${entry.previews.length}`).join(',')}`,
    ),
    assertResult(
      'previews de codigo possuem conteudo, arquivo e avisos',
      everyPreviewHasCode,
      'algum preview ficou sem codigo, filename ou aviso',
    ),
    assertResult(
      'previews de codigo usam linguagens esperadas',
      everyPreviewHasValidLanguage,
      `languages=${projectsWithPreviews.flatMap((entry) => entry.previews.map((preview) => preview.language)).join(',')}`,
    ),
    assertResult(
      'projeto selo gera Arduino ESP32 e ESPHome com trechos esperados',
      seloHasArduinoEsp32Esphome,
      `selo=${seloPreviews.map((preview) => `${preview.target}:${preview.language}`).join(',')}`,
    ),
    assertResult(
      'previews de codigo usam pinos do mapa de bancada',
      codeUsesMappedPins,
      `seloFiles=${seloPreviews.map((preview) => preview.fileName).join(',')}`,
    ),
  ];
}
