import { communicationProtocols, difficultyLabel, maturityLabel, protocolsByMaturity } from './protocolCatalog';

type ProtocolRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, condition: boolean, details?: string): ProtocolRegressionResult {
  return { name, passed: condition, details: condition ? undefined : details };
}

function runProtocolCatalogRegression(): ProtocolRegressionResult {
  const ids = communicationProtocols.map((protocol) => protocol.id);
  const hasModbusTcp = ids.includes('modbus_tcp');
  const hasModbusRtu = ids.includes('modbus_rtu');
  const hasEthernetIp = ids.includes('ethernet_ip');
  const hasMqtt = ids.includes('mqtt');
  const hasEspHome = ids.includes('esphome_api');

  return assertResult(
    'catalogo de protocolos cobre rotas principais',
    hasModbusTcp && hasModbusRtu && hasEthernetIp && hasMqtt && hasEspHome,
    `ids=${ids.join(',')}`,
  );
}

function runProtocolPriorityRegression(): ProtocolRegressionResult {
  const ready = protocolsByMaturity('ready_for_planning').map((protocol) => protocol.id);
  const hasPracticalProtocols = ready.includes('modbus_tcp') && ready.includes('modbus_rtu') && ready.includes('mqtt');
  const ethernetIpIsAdvanced = communicationProtocols.find((protocol) => protocol.id === 'ethernet_ip')?.maturity === 'advanced_research';

  return assertResult(
    'prioriza Modbus/MQTT e deixa EtherNet/IP como pesquisa avancada',
    hasPracticalProtocols && ethernetIpIsAdvanced,
    `ready=${ready.join(',')}, ethernetIpAdvanced=${ethernetIpIsAdvanced}`,
  );
}

function runProtocolLabelsRegression(): ProtocolRegressionResult {
  return assertResult(
    'labels de protocolo estao definidos',
    maturityLabel('ready_for_planning') === 'Planejar agora' && difficultyLabel('very_high') === 'Muito alta',
  );
}

export function runProtocolRegressionSuite(): ProtocolRegressionResult[] {
  return [
    runProtocolCatalogRegression(),
    runProtocolPriorityRegression(),
    runProtocolLabelsRegression(),
  ];
}
