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
    label: 'ESP32 DevKit',
    description: 'Boa opção para bancada com Wi-Fi, muitas GPIOs e futuro suporte a ESPHome/OTA.',
    defaultScanMs: 50,
    digitalInputPins: ['32', '33', '25', '26', '27', '14', '12', '13', '34', '35'],
    digitalOutputPins: ['2', '4', '5', '16', '17', '18', '19', '21', '22', '23', '25', '26', '27'],
    supportsInputPullup: true,
    supportsInputPulldown: true,
    notes: [
      'GPIO34 e GPIO35 são somente entrada no ESP32.',
      'Evite pinos de boot/strapping em montagem real se não souber o efeito elétrico.',
      'Para relés, defina corretamente se o módulo é ativo em HIGH ou ativo em LOW.',
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
