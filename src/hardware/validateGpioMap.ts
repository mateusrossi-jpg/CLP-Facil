import { HardwarePinMap, HardwareTarget } from './hardwareTypes';
import { getBoardPin, getGpioBoardCatalog } from './gpioCatalog';

export type GpioValidationSeverity = 'info' | 'warning' | 'error';

export type GpioValidationIssue = {
  variable: string;
  pin: string;
  severity: GpioValidationSeverity;
  message: string;
};

function isInputMode(mode: HardwarePinMap['mode']): boolean {
  return mode === 'input_pullup' || mode === 'input_pulldown' || mode === 'input_floating';
}

export function validateGpioMap(target: HardwareTarget, pinMap: HardwarePinMap[]): GpioValidationIssue[] {
  const catalog = getGpioBoardCatalog(target);
  const issues: GpioValidationIssue[] = [];
  const usedPins = new Map<string, string>();

  for (const item of pinMap) {
    if (!item.pin.trim()) {
      issues.push({
        variable: item.variable,
        pin: item.pin,
        severity: 'error',
        message: `${item.variable}: selecione um pino da placa ${catalog.label}.`,
      });
      continue;
    }

    const pin = getBoardPin(catalog, item.pin);
    if (!pin) {
      issues.push({
        variable: item.variable,
        pin: item.pin,
        severity: 'error',
        message: `${item.variable}: pino ${item.pin} não existe no perfil ${catalog.label}.`,
      });
      continue;
    }

    const pinKey = pin.gpio.toUpperCase();
    const alreadyUsedBy = usedPins.get(pinKey);
    if (alreadyUsedBy && alreadyUsedBy !== item.variable) {
      issues.push({
        variable: item.variable,
        pin: pin.label,
        severity: 'error',
        message: `${pin.label} já está vinculado a ${alreadyUsedBy}. Cada I/O deve usar um pino exclusivo.`,
      });
    } else {
      usedPins.set(pinKey, item.variable);
    }

    if (pin.reserved || pin.risk === 'blocked') {
      issues.push({
        variable: item.variable,
        pin: pin.label,
        severity: 'error',
        message: `${item.variable}: ${pin.label} é reservado/bloqueado. ${pin.note ?? ''}`.trim(),
      });
    }

    if (isInputMode(item.mode) && !pin.capabilities.includes('input')) {
      issues.push({
        variable: item.variable,
        pin: pin.label,
        severity: 'error',
        message: `${item.variable}: ${pin.label} não está marcado como entrada neste perfil.`,
      });
    }

    if (item.mode === 'output' && !pin.capabilities.includes('output')) {
      issues.push({
        variable: item.variable,
        pin: pin.label,
        severity: 'error',
        message: `${item.variable}: ${pin.label} não pode ser usado como saída. ${pin.inputOnly ? 'Ele é somente entrada.' : ''}`.trim(),
      });
    }

    if (item.mode === 'output' && pin.inputOnly) {
      issues.push({
        variable: item.variable,
        pin: pin.label,
        severity: 'error',
        message: `${item.variable}: ${pin.label} é somente entrada e não pode acionar saída/relé.`,
      });
    }

    if (pin.bootSensitive) {
      issues.push({
        variable: item.variable,
        pin: pin.label,
        severity: 'warning',
        message: `${item.variable}: ${pin.label} é sensível no boot. ${pin.note ?? 'Use com cuidado.'}`,
      });
    }

    if (pin.serialPin) {
      issues.push({
        variable: item.variable,
        pin: pin.label,
        severity: 'warning',
        message: `${item.variable}: ${pin.label} usa serial/USB. Pode interferir no upload ou no monitor serial.`,
      });
    }

    if (!pin.recommendedFor?.includes(item.mode === 'output' ? 'output' : 'input') && pin.risk === 'recommended') {
      issues.push({
        variable: item.variable,
        pin: pin.label,
        severity: 'info',
        message: `${item.variable}: ${pin.label} é utilizável, mas não é o pino mais recomendado para ${item.mode === 'output' ? 'saída' : 'entrada'} neste perfil.`,
      });
    }
  }

  return issues;
}

export function hasBlockingGpioIssues(issues: GpioValidationIssue[]): boolean {
  return issues.some((issue) => issue.severity === 'error');
}
