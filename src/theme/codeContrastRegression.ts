import { codeContrast, codeContrastMeetsReadableThreshold, contrastRatio } from './codeContrast';

type CodeContrastRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, condition: boolean, details?: string): CodeContrastRegressionResult {
  return { name, passed: condition, details: condition ? undefined : details };
}

export function runCodeContrastRegressionSuite(): CodeContrastRegressionResult[] {
  return [
    assertResult(
      'contraste dos blocos de codigo usa fundo escuro e texto claro',
      codeContrast.background === '#020817' &&
        codeContrast.backgroundAlt === '#0B1220' &&
        codeContrast.text === '#F8FAFC' &&
        codeContrastMeetsReadableThreshold(),
      `ratio=${contrastRatio(codeContrast.text, codeContrast.background).toFixed(2)}`,
    ),
  ];
}
