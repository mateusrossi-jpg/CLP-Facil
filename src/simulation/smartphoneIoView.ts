export type SmartphoneSignalType = 'input' | 'output' | 'memory' | 'function';

export type SmartphoneSignalSnapshot = {
  address: string;
  name: string;
  type: SmartphoneSignalType;
  value: boolean | number | string | undefined;
};

export type SmartphoneIoGroupId = 'inputs' | 'outputs' | 'memory' | 'functions';

export type SmartphoneIoSummary = {
  groupId: SmartphoneIoGroupId;
  label: string;
  totalCount: number;
  activeCount: number;
  guidance: string;
  activeAddresses: string[];
};

const groupLabels: Record<SmartphoneIoGroupId, string> = {
  inputs: 'Entradas',
  outputs: 'Saídas',
  memory: 'Memórias',
  functions: 'Timers/Contadores',
};

function signalMatchesGroup(signal: SmartphoneSignalSnapshot, groupId: SmartphoneIoGroupId) {
  if (groupId === 'inputs') return signal.type === 'input';
  if (groupId === 'outputs') return signal.type === 'output';
  if (groupId === 'memory') return signal.type === 'memory';
  return signal.type === 'function';
}

function isActive(value: SmartphoneSignalSnapshot['value']) {
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') return value.length > 0 && value !== '0' && value.toLowerCase() !== 'false';
  return Boolean(value);
}

function guidanceFor(groupId: SmartphoneIoGroupId, activeCount: number, totalCount: number) {
  if (groupId === 'inputs') {
    return activeCount > 0
      ? `${activeCount} de ${totalCount} entrada(s) estão acionadas neste scan. Entradas representam botoeiras, sensores e permissões.`
      : 'Nenhuma entrada acionada neste scan. Toque em uma entrada para simular uma botoeira ou sensor.';
  }

  if (groupId === 'outputs') {
    return activeCount > 0
      ? `${activeCount} saída(s) energizada(s). Saídas representam bobinas, contatores, relés ou indicadores.`
      : 'Nenhuma saída energizada. A lógica ainda não encontrou condição verdadeira para acionar uma bobina.';
  }

  if (groupId === 'memory') {
    return activeCount > 0
      ? `${activeCount} memória(s) ativa(s). Memórias ajudam a criar selo, etapas internas e permissões auxiliares.`
      : 'Nenhuma memória ativa. Memórias são úteis para retenção, etapas e lógica interna.';
  }

  return activeCount > 0
    ? `${activeCount} timer/contador ativo(s). Observe PRE, ACC e condição DN/Q para entender o estado.`
    : 'Nenhum timer/contador ativo. Ligue a condição da linha para acompanhar temporização ou contagem.';
}

export function createSmartphoneIoSummary(
  signals: SmartphoneSignalSnapshot[],
  groupId: SmartphoneIoGroupId,
): SmartphoneIoSummary {
  const groupSignals = signals.filter((signal) => signalMatchesGroup(signal, groupId));
  const activeSignals = groupSignals.filter((signal) => isActive(signal.value));

  return {
    groupId,
    label: groupLabels[groupId],
    totalCount: groupSignals.length,
    activeCount: activeSignals.length,
    guidance: guidanceFor(groupId, activeSignals.length, groupSignals.length),
    activeAddresses: activeSignals.map((signal) => signal.address).slice(0, 6),
  };
}
