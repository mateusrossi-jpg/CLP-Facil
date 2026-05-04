import { HardwareTarget } from './hardwareTypes';

export type HardwareBoardProfile = {
  target: HardwareTarget;
  label: string;
  description: string;
  defaultScanMs: number;
  digitalInputPins: string[];
  digitalOutputPins: string[];
  supportsInputPullup: boolean;
  supportsInputPulldown: boolean;
  notes: string[];
};

export const hardwareBoardProfiles: HardwareBoardProfile[] = [
  {
    target: 'esp32',
    label: 'ESP32 DevKit / WROOM',
    description: 'Boa opção para bancada com Wi-Fi, muitas GPIOs e futuro suporte a ESPHome/OTA.',
    defaultScanMs: 50,
    digitalInputPins: ['32', '33', '25', '26', '27', '14', '12', '13', '34', '35'],
    digitalOutputPins: ['2', '4', '5', '16', '17', '18', '19', '21', '22', '23', '25', '26', '27'],
    supportsInputPullup: true,
    supportsInputPulldown: true,
    notes: [
      'GPIO34 e GPIO35 são somente entrada no ESP32 clássico.',
      'Evite pinos de boot/strapping em montagem real se não souber o efeito elétrico.',
      'Para relés, defina corretamente se o módulo é ativo em HIGH ou ativo em LOW.',
    ],
  },
  {
    target: 'esp32_s3',
    label: 'ESP32-S3 DevKit',
    description: 'ESP32 moderno com USB nativo em muitas placas, bom para I/O digital e projetos novos.',
    defaultScanMs: 50,
    digitalInputPins: ['4', '5', '6', '7', '15', '16', '17', '18'],
    digitalOutputPins: ['1', '2', '4', '5', '6', '7', '15', '16', '17', '18', '38', '39', '40', '41', '42'],
    supportsInputPullup: true,
    supportsInputPulldown: true,
    notes: [
      'ESP32-S3 varia muito por placa; confira a serigrafia do seu DevKit.',
      'Evite pinos conectados a USB, flash/PSRAM ou funções especiais da sua placa.',
      'GPIOs 45 e 46 podem ter restrições/strapping em muitas placas.',
    ],
  },
  {
    target: 'esp32_c3',
    label: 'ESP32-C3 DevKit',
    description: 'ESP32 RISC-V compacto, bom para nós IoT pequenos e automação simples.',
    defaultScanMs: 50,
    digitalInputPins: ['0', '1', '2', '3', '4', '5', '6', '7'],
    digitalOutputPins: ['0', '1', '2', '3', '4', '5', '6', '7', '10'],
    supportsInputPullup: true,
    supportsInputPulldown: true,
    notes: [
      'ESP32-C3 tem menos GPIOs disponíveis que o ESP32 clássico.',
      'GPIO8/GPIO9 costumam estar ligados a BOOT/strapping em várias placas.',
      'Confira pinos USB nativos antes de usar em relés ou entradas externas.',
    ],
  },
  {
    target: 'esp32_cam',
    label: 'ESP32-CAM',
    description: 'Placa com muitos pinos ocupados pela câmera/SD; usar com muita cautela para I/O.',
    defaultScanMs: 50,
    digitalInputPins: ['13', '14', '15', '16'],
    digitalOutputPins: ['2', '4', '12', '13', '14', '15', '16'],
    supportsInputPullup: true,
    supportsInputPulldown: true,
    notes: [
      'ESP32-CAM não é ideal para bancada de relés por ter muitos pinos compartilhados.',
      'GPIO4 costuma acionar LED flash em muitos módulos.',
      'Pinos ligados ao cartão SD/câmera podem conflitar com recursos da placa.',
    ],
  },
  {
    target: 'esp8266',
    label: 'ESP8266 NodeMCU',
    description: 'Opção Wi-Fi simples com menos GPIOs disponíveis.',
    defaultScanMs: 50,
    digitalInputPins: ['D1', 'D2', 'D5', 'D6', 'D7'],
    digitalOutputPins: ['D1', 'D2', 'D5', 'D6', 'D7'],
    supportsInputPullup: true,
    supportsInputPulldown: false,
    notes: [
      'ESP8266 tem menos GPIOs livres e pinos de boot sensíveis.',
      'Use pull-up e relés com cuidado para evitar acionamento indevido no boot.',
    ],
  },
  {
    target: 'arduino_uno',
    label: 'Arduino Uno',
    description: 'Alvo didático para bancada, laboratório e aulas.',
    defaultScanMs: 50,
    digitalInputPins: ['2', '3', '4', '5', '6', '7', '8'],
    digitalOutputPins: ['9', '10', '11', '12', '13'],
    supportsInputPullup: true,
    supportsInputPulldown: false,
    notes: [
      'Arduino Uno usa INPUT_PULLUP com contato fechando para GND na maioria das bancadas.',
      'Saídas não devem acionar cargas diretamente; use driver, transistor, optoacoplador ou módulo adequado.',
    ],
  },
  {
    target: 'arduino_nano',
    label: 'Arduino Nano',
    description: 'Parecido com Uno, compacto e barato para protótipos.',
    defaultScanMs: 50,
    digitalInputPins: ['2', '3', '4', '5', '6', '7', '8'],
    digitalOutputPins: ['9', '10', '11', '12', '13'],
    supportsInputPullup: true,
    supportsInputPulldown: false,
    notes: [
      'Use fonte e isolamento adequados ao acionar módulos externos.',
    ],
  },
  {
    target: 'arduino_mega',
    label: 'Arduino Mega 2560',
    description: 'Boa opção didática com muitos I/Os digitais para bancada maior.',
    defaultScanMs: 50,
    digitalInputPins: ['22', '23', '24', '25', '26', '27', '28', '29', '30', '31'],
    digitalOutputPins: ['32', '33', '34', '35', '36', '37', '38', '39', '40', '41'],
    supportsInputPullup: true,
    supportsInputPulldown: false,
    notes: [
      'Arduino Mega tem muitos pinos e é bom para treinos com muitas entradas/saídas.',
      'Evite 0/1 se estiver usando Serial USB para upload/monitor.',
    ],
  },
  {
    target: 'generic_arduino',
    label: 'Arduino genérico',
    description: 'Exportação C++ compatível com Arduino IDE/PlatformIO.',
    defaultScanMs: 50,
    digitalInputPins: ['2', '3', '4', '5', '6', '7', '8'],
    digitalOutputPins: ['9', '10', '11', '12', '13'],
    supportsInputPullup: true,
    supportsInputPulldown: false,
    notes: [
      'Ajuste os pinos manualmente conforme a placa escolhida.',
    ],
  },
];

export function getHardwareBoardProfile(target: HardwareTarget): HardwareBoardProfile {
  return hardwareBoardProfiles.find((profile) => profile.target === target) ?? hardwareBoardProfiles[0];
}
