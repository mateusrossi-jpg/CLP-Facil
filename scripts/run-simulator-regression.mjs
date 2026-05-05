import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { runEditorEvaluatorRegressionSuite } = require('/tmp/easy-clp-sim-test/engine/editorEvaluatorRegression.js');
const { runEdgeContactRegressionSuite } = require('/tmp/easy-clp-sim-test/engine/edgeRegression.js');
const { runHardwareRegressionSuite } = require('/tmp/easy-clp-sim-test/hardware/hardwareRegression.js');
const { runPlcProfileRegressionSuite } = require('/tmp/easy-clp-sim-test/plcProfiles/plcProfileRegression.js');
const { runSimulatorDialectRegressionSuite } = require('/tmp/easy-clp-sim-test/plcProfiles/simulatorDialectRegression.js');
const { runSmartphoneProgramViewRegressionSuite } = require('/tmp/easy-clp-sim-test/simulation/smartphoneProgramViewRegression.js');
const { runSmartphoneIoViewRegressionSuite } = require('/tmp/easy-clp-sim-test/simulation/smartphoneIoViewRegression.js');
const { runProtocolRegressionSuite } = require('/tmp/easy-clp-sim-test/communication/protocolRegression.js');
const { runExampleLibraryRegressionSuite } = require('/tmp/easy-clp-sim-test/data/exampleLibraryRegression.js');
const { runQuickStartRegressionSuite } = require('/tmp/easy-clp-sim-test/data/quickStartRegression.js');
const { runSafetyRegressionSuite } = require('/tmp/easy-clp-sim-test/safety/safetyRegression.js');
const { runReleaseRegressionSuite } = require('/tmp/easy-clp-sim-test/release/releaseRegression.js');
const { runStoreListingRegressionSuite } = require('/tmp/easy-clp-sim-test/release/storeListingRegression.js');
const { runChangeTestingScheduleRegressionSuite } = require('/tmp/easy-clp-sim-test/release/changeTestingScheduleRegression.js');
const { runPerformanceRegressionSuite } = require('/tmp/easy-clp-sim-test/performance/performanceRegression.js');
const { runCodeContrastRegressionSuite } = require('/tmp/easy-clp-sim-test/theme/codeContrastRegression.js');
const { runEducationRegressionSuite } = require('/tmp/easy-clp-sim-test/education/educationRegression.js');
const { runProjectLearningLinksRegressionSuite } = require('/tmp/easy-clp-sim-test/education/projectLearningLinksRegression.js');
const { runProjectCatalogRegressionSuite } = require('/tmp/easy-clp-sim-test/projects/projectCatalogRegression.js');
const { runProjectLadderTemplatesRegressionSuite } = require('/tmp/easy-clp-sim-test/projects/projectLadderTemplatesRegression.js');
const { runProjectIoMapsRegressionSuite } = require('/tmp/easy-clp-sim-test/projects/projectIoMapsRegression.js');
const { runProjectSearchRegressionSuite } = require('/tmp/easy-clp-sim-test/projects/projectSearchRegression.js');
const { runProjectBenchMappingsRegressionSuite } = require('/tmp/easy-clp-sim-test/projects/projectBenchMappingsRegression.js');
const { runProjectActionPlansRegressionSuite } = require('/tmp/easy-clp-sim-test/projects/projectActionPlansRegression.js');
const { runProjectExportPlansRegressionSuite } = require('/tmp/easy-clp-sim-test/projects/projectExportPlansRegression.js');

const results = [
  ...runEditorEvaluatorRegressionSuite(),
  ...runEdgeContactRegressionSuite(),
  ...runHardwareRegressionSuite(),
  ...runPlcProfileRegressionSuite(),
  ...runSimulatorDialectRegressionSuite(),
  ...runSmartphoneProgramViewRegressionSuite(),
  ...runSmartphoneIoViewRegressionSuite(),
  ...runProtocolRegressionSuite(),
  ...runExampleLibraryRegressionSuite(),
  ...runQuickStartRegressionSuite(),
  ...runSafetyRegressionSuite(),
  ...runReleaseRegressionSuite(),
  ...runStoreListingRegressionSuite(),
  ...runChangeTestingScheduleRegressionSuite(),
  ...runPerformanceRegressionSuite(),
  ...runCodeContrastRegressionSuite(),
  ...runEducationRegressionSuite(),
  ...runProjectLearningLinksRegressionSuite(),
  ...runProjectCatalogRegressionSuite(),
  ...runProjectLadderTemplatesRegressionSuite(),
  ...runProjectIoMapsRegressionSuite(),
  ...runProjectSearchRegressionSuite(),
  ...runProjectBenchMappingsRegressionSuite(),
  ...runProjectActionPlansRegressionSuite(),
  ...runProjectExportPlansRegressionSuite(),
];
const failed = results.filter((result) => !result.passed);

for (const result of results) {
  const prefix = result.passed ? 'PASS' : 'FAIL';
  console.log(`${prefix} ${result.name}${result.details ? ` - ${result.details}` : ''}`);
}

if (failed.length > 0) {
  process.exitCode = 1;
}
