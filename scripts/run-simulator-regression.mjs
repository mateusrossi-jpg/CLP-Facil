import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const { runEditorEvaluatorRegressionSuite } = require('/tmp/easy-clp-sim-test/engine/editorEvaluatorRegression.js');
const { runEditorScanTraceRegressionSuite } = require('/tmp/easy-clp-sim-test/engine/editorScanTraceRegression.js');
const { runPlcScanCycleRegressionSuite } = require('/tmp/easy-clp-sim-test/engine/plcScanCycleRegression.js');
const { runPlcForceTableRegressionSuite } = require('/tmp/easy-clp-sim-test/engine/plcForceTableRegression.js');
const { runEdgeContactRegressionSuite } = require('/tmp/easy-clp-sim-test/engine/edgeRegression.js');
const { runHardwareRegressionSuite } = require('/tmp/easy-clp-sim-test/hardware/hardwareRegression.js');
const { runPlcProfileRegressionSuite } = require('/tmp/easy-clp-sim-test/plcProfiles/plcProfileRegression.js');
const { runSimulatorDialectRegressionSuite } = require('/tmp/easy-clp-sim-test/plcProfiles/simulatorDialectRegression.js');
const { runSmartphoneProgramViewRegressionSuite } = require('/tmp/easy-clp-sim-test/simulation/smartphoneProgramViewRegression.js');
const { runSmartphoneIoViewRegressionSuite } = require('/tmp/easy-clp-sim-test/simulation/smartphoneIoViewRegression.js');
const { runMobileScanTraceSummaryRegressionSuite } = require('/tmp/easy-clp-sim-test/simulation/mobileScanTraceSummaryRegression.js');
const { runProtocolRegressionSuite } = require('/tmp/easy-clp-sim-test/communication/protocolRegression.js');
const { runExampleLibraryRegressionSuite } = require('/tmp/easy-clp-sim-test/data/exampleLibraryRegression.js');
const { runQuickStartRegressionSuite } = require('/tmp/easy-clp-sim-test/data/quickStartRegression.js');
const { runSafetyRegressionSuite } = require('/tmp/easy-clp-sim-test/safety/safetyRegression.js');
const { runReleaseRegressionSuite } = require('/tmp/easy-clp-sim-test/release/releaseRegression.js');
const { runStoreListingRegressionSuite } = require('/tmp/easy-clp-sim-test/release/storeListingRegression.js');
const { runChangeTestingScheduleRegressionSuite } = require('/tmp/easy-clp-sim-test/release/changeTestingScheduleRegression.js');
const { runPerformanceRegressionSuite } = require('/tmp/easy-clp-sim-test/performance/performanceRegression.js');
const { runCodeContrastRegressionSuite } = require('/tmp/easy-clp-sim-test/theme/codeContrastRegression.js');
const { runMissionValidationRegressionSuite } = require('/tmp/easy-clp-sim-test/lessons/missionValidationRegression.js');
const { runEducationRegressionSuite } = require('/tmp/easy-clp-sim-test/education/educationRegression.js');
const { runProjectLearningLinksRegressionSuite } = require('/tmp/easy-clp-sim-test/education/projectLearningLinksRegression.js');
const { runProjectCatalogRegressionSuite } = require('/tmp/easy-clp-sim-test/projects/projectCatalogRegression.js');
const { runProjectLadderTemplatesRegressionSuite } = require('/tmp/easy-clp-sim-test/projects/projectLadderTemplatesRegression.js');
const { runProjectIoMapsRegressionSuite } = require('/tmp/easy-clp-sim-test/projects/projectIoMapsRegression.js');
const { runProjectSearchRegressionSuite } = require('/tmp/easy-clp-sim-test/projects/projectSearchRegression.js');
const { runProjectBenchMappingsRegressionSuite } = require('/tmp/easy-clp-sim-test/projects/projectBenchMappingsRegression.js');
const { runProjectActionPlansRegressionSuite } = require('/tmp/easy-clp-sim-test/projects/projectActionPlansRegression.js');
const { runProjectExportPlansRegressionSuite } = require('/tmp/easy-clp-sim-test/projects/projectExportPlansRegression.js');
const { runProjectExportCodePreviewsRegressionSuite } = require('/tmp/easy-clp-sim-test/projects/projectExportCodePreviewsRegression.js');
const { runProjectWorkspaceSummaryRegressionSuite } = require('/tmp/easy-clp-sim-test/projects/projectWorkspaceSummaryRegression.js');
const { runProjectQuickActionsRegressionSuite } = require('/tmp/easy-clp-sim-test/projects/projectQuickActionsRegression.js');
const { runProjectQuickActionNavigationRegressionSuite } = require('/tmp/easy-clp-sim-test/projects/projectQuickActionNavigationRegression.js');
const { runProjectNavigationIntentRegressionSuite } = require('/tmp/easy-clp-sim-test/projects/projectNavigationIntentRegression.js');
const { runProjectSimulationFocusRegressionSuite } = require('/tmp/easy-clp-sim-test/projects/projectSimulationFocusRegression.js');
const { runProjectLearningFocusRegressionSuite } = require('/tmp/easy-clp-sim-test/projects/projectLearningFocusRegression.js');
const { runProjectEditorAdapterRegressionSuite } = require('/tmp/easy-clp-sim-test/projects/projectEditorAdapterRegression.js');

const results = [
  ...runEditorEvaluatorRegressionSuite(),
  ...runEditorScanTraceRegressionSuite(),
  ...runPlcScanCycleRegressionSuite(),
  ...runPlcForceTableRegressionSuite(),
  ...runEdgeContactRegressionSuite(),
  ...runHardwareRegressionSuite(),
  ...runPlcProfileRegressionSuite(),
  ...runSimulatorDialectRegressionSuite(),
  ...runSmartphoneProgramViewRegressionSuite(),
  ...runSmartphoneIoViewRegressionSuite(),
  ...runMobileScanTraceSummaryRegressionSuite(),
  ...runProtocolRegressionSuite(),
  ...runExampleLibraryRegressionSuite(),
  ...runQuickStartRegressionSuite(),
  ...runSafetyRegressionSuite(),
  ...runReleaseRegressionSuite(),
  ...runStoreListingRegressionSuite(),
  ...runChangeTestingScheduleRegressionSuite(),
  ...runPerformanceRegressionSuite(),
  ...runCodeContrastRegressionSuite(),
  ...runMissionValidationRegressionSuite(),
  ...runEducationRegressionSuite(),
  ...runProjectLearningLinksRegressionSuite(),
  ...runProjectCatalogRegressionSuite(),
  ...runProjectLadderTemplatesRegressionSuite(),
  ...runProjectIoMapsRegressionSuite(),
  ...runProjectSearchRegressionSuite(),
  ...runProjectBenchMappingsRegressionSuite(),
  ...runProjectActionPlansRegressionSuite(),
  ...runProjectExportPlansRegressionSuite(),
  ...runProjectExportCodePreviewsRegressionSuite(),
  ...runProjectWorkspaceSummaryRegressionSuite(),
  ...runProjectQuickActionsRegressionSuite(),
  ...runProjectQuickActionNavigationRegressionSuite(),
  ...runProjectNavigationIntentRegressionSuite(),
  ...runProjectSimulationFocusRegressionSuite(),
  ...runProjectLearningFocusRegressionSuite(),
  ...runProjectEditorAdapterRegressionSuite(),
];
const failed = results.filter((result) => !result.passed);

for (const result of results) {
  const prefix = result.passed ? 'PASS' : 'FAIL';
  console.log(`${prefix} ${result.name}${result.details ? ` - ${result.details}` : ''}`);
}

if (failed.length > 0) {
  process.exitCode = 1;
}
