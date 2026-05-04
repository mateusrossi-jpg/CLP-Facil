import { implementedPerformanceItems, performanceChecklist } from './performanceChecklist';

type PerformanceRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, condition: boolean, details?: string): PerformanceRegressionResult {
  return { name, passed: condition, details: condition ? undefined : details };
}

function runPerformanceChecklistRegression(): PerformanceRegressionResult {
  const ids = performanceChecklist.map((item) => item.id);
  const hasMemo = ids.includes('memoized_evaluations');
  const hasAutoScan = ids.includes('stable_auto_scan');
  const hasMobileNav = ids.includes('compact_mobile_nav');
  const implemented = implementedPerformanceItems().length;

  return assertResult(
    'checklist de performance cobre pontos principais',
    hasMemo && hasAutoScan && hasMobileNav && implemented >= 3,
    `ids=${ids.join(',')}, implemented=${implemented}`,
  );
}

export function runPerformanceRegressionSuite(): PerformanceRegressionResult[] {
  return [runPerformanceChecklistRegression()];
}
