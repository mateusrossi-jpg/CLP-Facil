export type CommunicationProtocolId =
  | 'modbus_tcp'
  | 'modbus_rtu'
  | 'ethernet_ip'
  | 's7_tcp'
  | 'opc_ua'
  | 'mqtt'
  | 'esphome_api'
  | 'serial_usb'
  | 'ota_wifi'
  | 'canopen';

export type ProtocolLayer = 'fieldbus' | 'industrial_ethernet' | 'iot' | 'local_upload' | 'supervisory';
export type ProtocolMaturity = 'ready_for_planning' | 'future' | 'advanced_research';
export type ProtocolDifficulty = 'low' | 'medium' | 'high' | 'very_high';

export type CommunicationProtocol = {
  id: CommunicationProtocolId;
  name: string;
  shortName: string;
  layer: ProtocolLayer;
  maturity: ProtocolMaturity;
  difficulty: ProtocolDifficulty;
  summary: string;
  easyClpUse: string;
  firstImplementation: string;
  supportedTargets: string[];
  warnings: string[];
  roadmap: string[];
};

export const communicationProtocols: CommunicationProtocol[] = [
  {
    id: 'modbus_tcp',
    name: 'Modbus TCP',
    shortName: 'Modbus TCP',
    layer: 'industrial_ethernet',
    maturity: 'ready_for_planning',
    difficulty: 'medium',
    summary: 'Protocolo industrial aberto e muito usado para ler/escrever coils, entradas e registradores via rede Ethernet.',
    easyClpUse: 'Mapear I/Q/M/N para coils e holding/input registers em CLPs, inversores, IHM, gateways e módulos remotos.',
    firstImplementation: 'Gerar mapa de registradores e cliente Modbus TCP didático para bancada local.',
    supportedTargets: ['ESP32', 'Gateway local', 'CLP com Modbus TCP', 'Inversores e módulos I/O'],
    warnings: [
      'Não substitui projeto de segurança elétrica.',
      'Escrita em registradores reais deve exigir confirmação do usuário.',
      'Requer IP, porta, Unit ID e tabela de endereços correta.',
    ],
    roadmap: [
      'Criar tabela I/Q/M/N → coil/register.',
      'Exportar mapa de endereços.',
      'Implementar cliente de leitura/escrita em bancada.',
      'Adicionar modo somente leitura para diagnóstico.',
    ],
  },
  {
    id: 'modbus_rtu',
    name: 'Modbus RTU',
    shortName: 'Modbus RTU',
    layer: 'fieldbus',
    maturity: 'ready_for_planning',
    difficulty: 'medium',
    summary: 'Versão serial do Modbus, comum em RS485, inversores, medidores e controladores industriais.',
    easyClpUse: 'Gerar mapa e código para ESP32/Arduino com RS485, ou documentar endereços para bancada industrial.',
    firstImplementation: 'Exportar tabela e exemplo Arduino/ESP32 RS485 com leitura/escrita básica.',
    supportedTargets: ['ESP32 + RS485', 'Arduino + RS485', 'Inversores', 'Medidores', 'Controladores'],
    warnings: [
      'Exige transceptor RS485 adequado e ligação A/B/GND correta.',
      'Terminação, polarização e blindagem são importantes em campo.',
      'Endereços de registrador variam muito por fabricante.',
    ],
    roadmap: [
      'Adicionar perfil RS485 no Hardware.',
      'Gerar exemplo com baud rate, paridade e slave ID.',
      'Criar validador de registradores.',
    ],
  },
  {
    id: 'ethernet_ip',
    name: 'EtherNet/IP / CIP',
    shortName: 'EtherNet/IP',
    layer: 'industrial_ethernet',
    maturity: 'advanced_research',
    difficulty: 'very_high',
    summary: 'Protocolo industrial usado no ecossistema Allen-Bradley/Rockwell e outros dispositivos compatíveis com CIP.',
    easyClpUse: 'Fase inicial apenas educacional: mostrar equivalência de tags/instruções e planejar leitura/escrita de tags em bancada controlada.',
    firstImplementation: 'Referência educativa e exportação de lista de tags; comunicação real fica para fase avançada.',
    supportedTargets: ['Rockwell-like', 'CLPs e dispositivos CIP', 'Gateways industriais'],
    warnings: [
      'Não implementar upload/download de lógica de CLP real nesta fase.',
      'Comunicação com tags reais pode ter riscos operacionais.',
      'Não é perfil oficial de fabricante.',
    ],
    roadmap: [
      'Manter perfil Rockwell-like educacional.',
      'Exportar tabela de tags.',
      'Pesquisar cliente EtherNet/IP somente leitura.',
      'Testar em bancada isolada antes de qualquer escrita.',
    ],
  },
  {
    id: 's7_tcp',
    name: 'Siemens S7 / TCP',
    shortName: 'S7 TCP',
    layer: 'industrial_ethernet',
    maturity: 'advanced_research',
    difficulty: 'very_high',
    summary: 'Comunicação com CLPs Siemens por rede, usualmente em cenários associados ao ecossistema TIA/S7.',
    easyClpUse: 'Fase inicial como perfil IEC/Siemens-like e documentação de equivalência; comunicação real fica para pesquisa avançada.',
    firstImplementation: 'Perfil visual IEC-like e exportação de relatório de tags.',
    supportedTargets: ['Siemens-like', 'S7-1200/1500 em estudo', 'Gateways'],
    warnings: [
      'Não exporta projeto TIA Portal.',
      'Comunicação real requer validação cuidadosa de DBs, endereços e permissões.',
      'Não é perfil oficial de fabricante.',
    ],
    roadmap: [
      'Fortalecer IEC-like.',
      'Exportar relatório de tags/endereços.',
      'Pesquisar leitura de dados somente em bancada.',
    ],
  },
  {
    id: 'opc_ua',
    name: 'OPC UA',
    shortName: 'OPC UA',
    layer: 'supervisory',
    maturity: 'future',
    difficulty: 'high',
    summary: 'Padrão comum para integração supervisória, SCADA, indústria 4.0 e troca estruturada de dados.',
    easyClpUse: 'No futuro, expor estados do Easy-CLP/Node como variáveis para supervisório ou gateway.',
    firstImplementation: 'Modelo de tags e documentação de namespace; servidor real fica para versão futura.',
    supportedTargets: ['Gateway', 'SCADA', 'Supervisório', 'Node futuro'],
    warnings: [
      'Exige atenção a certificados, segurança e modelo de dados.',
      'Não é necessário para o MVP mobile.',
    ],
    roadmap: [
      'Criar modelo de tags estável.',
      'Exportar lista de variáveis.',
      'Planejar gateway OPC UA no futuro.',
    ],
  },
  {
    id: 'mqtt',
    name: 'MQTT',
    shortName: 'MQTT',
    layer: 'iot',
    maturity: 'ready_for_planning',
    difficulty: 'medium',
    summary: 'Protocolo leve por tópicos, bom para IoT, dashboards, Home Assistant e telemetria local.',
    easyClpUse: 'Publicar estados I/Q/M/N e receber comandos por tópicos em ESP32, gateway ou broker local.',
    firstImplementation: 'Gerar convenção de tópicos e exemplo ESP32/Arduino ou ESPHome com MQTT.',
    supportedTargets: ['ESP32', 'ESPHome', 'Home Assistant', 'Broker local', 'Gateway'],
    warnings: [
      'Comando remoto de saída precisa de autenticação e confirmação.',
      'Broker mal configurado pode expor automações na rede.',
    ],
    roadmap: [
      'Definir tópicos easyclp/node/io.',
      'Gerar YAML ESPHome com MQTT.',
      'Adicionar estado online/offline.',
    ],
  },
  {
    id: 'esphome_api',
    name: 'ESPHome Native API',
    shortName: 'ESPHome API',
    layer: 'iot',
    maturity: 'future',
    difficulty: 'high',
    summary: 'API nativa usada pelo ESPHome para integração local com Home Assistant e dispositivos ESP.',
    easyClpUse: 'Permitir que o app converse com nodes ESPHome já gravados, depois da exportação YAML.',
    firstImplementation: 'Exportar YAML corretamente; controle direto pela API fica para fase futura.',
    supportedTargets: ['ESP32', 'ESP8266', 'Home Assistant', 'ESPHome'],
    warnings: [
      'Controle direto exige autenticação, descoberta de rede e tratamento de reconexão.',
      'No iPhone/web pode haver limitações de rede local.',
    ],
    roadmap: [
      'Gerar YAML ESPHome robusto.',
      'Adicionar campos de API/encryption key.',
      'Pesquisar descoberta local futuramente.',
    ],
  },
  {
    id: 'serial_usb',
    name: 'Serial / USB',
    shortName: 'USB Serial',
    layer: 'local_upload',
    maturity: 'future',
    difficulty: 'high',
    summary: 'Caminho para gravar ou conversar com placas pelo computador via porta serial.',
    easyClpUse: 'Futuro envio direto do sketch ou lógica para placa em ambiente desktop.',
    firstImplementation: 'Manter exportação de código; upload direto fica para desktop/helper local.',
    supportedTargets: ['Arduino', 'ESP32', 'ESP8266', 'Desktop'],
    warnings: [
      'iPhone e navegador mobile não são bons alvos para USB serial direto.',
      'Requer drivers, permissões e ferramenta de upload.',
    ],
    roadmap: [
      'Exportar .ino/.yaml.',
      'Estudar Web Serial no desktop.',
      'Planejar helper local com Arduino CLI/PlatformIO.',
    ],
  },
  {
    id: 'ota_wifi',
    name: 'OTA via Wi-Fi',
    shortName: 'OTA Wi-Fi',
    layer: 'local_upload',
    maturity: 'future',
    difficulty: 'high',
    summary: 'Atualização pela rede depois que o ESP já recebeu um firmware inicial.',
    easyClpUse: 'Futuro envio de lógica ou firmware para ESP32 sem cabo, após primeira gravação por USB.',
    firstImplementation: 'Planejar firmware Easy-CLP Node ou aproveitar ESPHome OTA no fluxo YAML.',
    supportedTargets: ['ESP32', 'ESP8266', 'ESPHome'],
    warnings: [
      'OTA inseguro pode comprometer o dispositivo.',
      'Atualização deve preservar estados seguros de saída.',
    ],
    roadmap: [
      'Primeiro exportar código.',
      'Depois criar firmware Node com API segura.',
      'Adicionar assinatura/validação de atualização.',
    ],
  },
  {
    id: 'canopen',
    name: 'CANopen',
    shortName: 'CANopen',
    layer: 'fieldbus',
    maturity: 'advanced_research',
    difficulty: 'very_high',
    summary: 'Protocolo de barramento CAN usado em automação, drives e sistemas embarcados industriais.',
    easyClpUse: 'Possível futuro para integração com drives e módulos CAN, não recomendado para MVP.',
    firstImplementation: 'Apenas referência e estudo.',
    supportedTargets: ['Drives', 'Módulos CAN', 'ESP32 com transceptor CAN'],
    warnings: [
      'Exige transceptor físico e conhecimento de objetos/dicionário CANopen.',
      'Não priorizar antes de Modbus/MQTT.',
    ],
    roadmap: [
      'Manter como referência.',
      'Priorizar Modbus e MQTT antes.',
    ],
  },
];

export function protocolsByMaturity(maturity: CommunicationProtocol['maturity']) {
  return communicationProtocols.filter((protocol) => protocol.maturity === maturity);
}

export function difficultyLabel(difficulty: ProtocolDifficulty) {
  if (difficulty === 'low') return 'Baixa';
  if (difficulty === 'medium') return 'Média';
  if (difficulty === 'high') return 'Alta';
  return 'Muito alta';
}

export function maturityLabel(maturity: ProtocolMaturity) {
  if (maturity === 'ready_for_planning') return 'Planejar agora';
  if (maturity === 'future') return 'Futuro';
  return 'Pesquisa avançada';
}
