import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { runEditorEvaluatorRegressionSuite } = require('/tmp/easy-clp-sim-test/engine/editorEvaluatorRegression.js');
const { runEdgeContactRegressionSuite } = require('/tmp/easy-clp-sim-test/engine/edgeRegression.js');
const { runHardwareRegressionSuite } = require('/tmp/easy-clp-sim-test/hardware/hardwareRegression.js');

const results = [
  ...runEditorEvaluatorRegressionSuite(),
  ...runEdgeContactRegressionSuite(),
  ...runHardwareRegressionSuite(),
];
const failed = results.filter((result) => !result.passed);

for (const result of results) {
  const prefix = result.passed ? 'PASS' : 'FAIL';
  console.log(`${prefix} ${result.name}${result.details ? ` - ${result.details}` : ''}`);
}

if (failed.length > 0) {
  process.exitCode = 1;
}
