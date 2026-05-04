import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { runEditorEvaluatorRegressionSuite } = require('/tmp/clp-facil-sim-test/engine/editorEvaluatorRegression.js');

const results = runEditorEvaluatorRegressionSuite();
const failed = results.filter((result) => !result.passed);

for (const result of results) {
  const prefix = result.passed ? 'PASS' : 'FAIL';
  console.log(`${prefix} ${result.name}${result.details ? ` - ${result.details}` : ''}`);
}

if (failed.length > 0) {
  process.exitCode = 1;
}
