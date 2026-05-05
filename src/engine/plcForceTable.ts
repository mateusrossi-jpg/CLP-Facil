import { PlcState } from './projectTypes';

export type PlcForceMode = 'force_on' | 'force_off';

export type PlcForceEntry = {
  address: string;
  mode: PlcForceMode;
  enabled: boolean;
  reason?: string;
};

export type PlcForcePolicy = {
  allowInputForces: boolean;
  allowMemoryForces: boolean;
  allowOutputForces: boolean;
  blockOutputForceWhenOn: boolean;
};

export type PlcForceDiagnostic = {
  address: string;
  severity: 'info' | 'warn' | 'blocked';
  message: string;
};

export type PlcForceApplyResult = {
  state: PlcState;
  appliedForces: PlcForceEntry[];
  blockedForces: PlcForceEntry[];
  diagnostics: PlcForceDiagnostic[];
};

export const defaultPlcForcePolicy: PlcForcePolicy = {
  allowInputForces: true,
  allowMemoryForces: true,
  allowOutputForces: false,
  blockOutputForceWhenOn: true,
};

function normalizeAddress(address: string): string {
  return address.trim().toUpperCase();
}

function isInputAddress(address: string): boolean {
  return normalizeAddress(address).startsWith('I');
}

function isOutputAddress(address: string): boolean {
  const normalized = normalizeAddress(address);
  return normalized.startsWith('Q') || normalized.startsWith('O');
}

function isMemoryAddress(address: string): boolean {
  return normalizeAddress(address).startsWith('M');
}

function isActiveValue(value: boolean | number | undefined): boolean {
  if (typeof value === 'number') return value !== 0;
  return Boolean(value);
}

function forcedValue(mode: PlcForceMode): boolean {
  return mode === 'force_on';
}

function blockReason(entry: PlcForceEntry, state: PlcState, policy: PlcForcePolicy): string | null {
  const address = normalizeAddress(entry.address);

  if (!entry.enabled) return 'Force desabilitado.';
  if (!address) return 'Endereço vazio.';
  if (typeof state[address] === 'number') return 'Force booleano não é aplicado em registrador numérico.';

  if (isInputAddress(address) && !policy.allowInputForces) return 'Forçamento de entradas está bloqueado pela política.';
  if (isMemoryAddress(address) && !policy.allowMemoryForces) return 'Forçamento de memórias está bloqueado pela política.';
  if (isOutputAddress(address)) {
    if (!policy.allowOutputForces) return 'Forçamento de saídas está bloqueado por segurança.';
    if (policy.blockOutputForceWhenOn && isActiveValue(state[address])) return 'Saída já está ON; force direto foi bloqueado para evitar mascarar intertravamento.';
  }

  if (!isInputAddress(address) && !isOutputAddress(address) && !isMemoryAddress(address)) {
    return 'Apenas I, Q/O e M são suportados nesta Force Table didática.';
  }

  return null;
}

export function applyPlcForces(
  currentState: PlcState,
  forceEntries: PlcForceEntry[],
  policy: PlcForcePolicy = defaultPlcForcePolicy,
): PlcForceApplyResult {
  const nextState: PlcState = { ...currentState };
  const appliedForces: PlcForceEntry[] = [];
  const blockedForces: PlcForceEntry[] = [];
  const diagnostics: PlcForceDiagnostic[] = [];

  for (const entry of forceEntries) {
    const normalizedEntry: PlcForceEntry = {
      ...entry,
      address: normalizeAddress(entry.address),
    };
    const reason = blockReason(normalizedEntry, currentState, policy);

    if (reason) {
      blockedForces.push(normalizedEntry);
      diagnostics.push({
        address: normalizedEntry.address,
        severity: normalizedEntry.enabled ? 'blocked' : 'info',
        message: reason,
      });
      continue;
    }

    nextState[normalizedEntry.address] = forcedValue(normalizedEntry.mode);
    appliedForces.push(normalizedEntry);
    diagnostics.push({
      address: normalizedEntry.address,
      severity: isOutputAddress(normalizedEntry.address) ? 'warn' : 'info',
      message: `${normalizedEntry.address} aplicado como ${forcedValue(normalizedEntry.mode) ? 'ON' : 'OFF'} por force.`,
    });
  }

  return {
    state: nextState,
    appliedForces,
    blockedForces,
    diagnostics,
  };
}

export function clearPlcForce(forceEntries: PlcForceEntry[], address: string): PlcForceEntry[] {
  const normalized = normalizeAddress(address);
  return forceEntries.filter((entry) => normalizeAddress(entry.address) !== normalized);
}

export function upsertPlcForce(forceEntries: PlcForceEntry[], nextForce: PlcForceEntry): PlcForceEntry[] {
  const normalized = normalizeAddress(nextForce.address);
  const sanitized: PlcForceEntry = { ...nextForce, address: normalized };
  const withoutCurrent = clearPlcForce(forceEntries, normalized);
  return [...withoutCurrent, sanitized];
}
