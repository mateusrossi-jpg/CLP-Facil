import { HardwareTarget } from './hardwareTypes';

export type GpioCapability = 'input' | 'output' | 'analog' | 'pwm' | 'i2c' | 'spi' | 'serial';
export type GpioUseScope = 'input' | 'output';
export type GpioPinRisk = 'recommended' | 'caution' | 'blocked';
export type BoardPinSide = 'left' | 'right';

export type BoardPin = {
  id: string;
  label: string;
  gpio: string;
  physicalLabel?: string;
  side: BoardPinSide;
  order: number;
  capabilities: GpioCapability[];
  recommendedFor?: GpioUseScope[];
  risk: GpioPinRisk;
  inputOnly?: boolean;
  reserved?: boolean;
  bootSensitive?: boolean;
  serialPin?: boolean;
  note?: string;
};

export type BoardGpioCatalog = {
  target: HardwareTarget;
  label: string;
  chipLabel: string;
  aliases?: HardwareTarget[];
  pins: BoardPin[];
};

function pin(
  gpio: string,
  side: BoardPinSide,
  order: number,
  capabilities: GpioCapability[],
  options: Partial<Omit<BoardPin, 'id' | 'label' | 'gpio' | 'side' | 'order' | 'capabilities'>> = {},
): BoardPin {
  const normalized = gpio.replace(/^GPIO/i, '');
  const label = gpio.startsWith('D') || gpio.startsWith('A') || gpio === 'RX' || gpio === 'TX' || gpio === 'EN' ? gpio : `GPIO${normalized}`;
  return {
    id: label.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    label,
    gpio: normalized,
    side,
    order,
    capabilities,
    risk: options.risk ?? 'recommended',
    ...options,
  };
}

const esp32Pins: BoardPin[] = [
  pin('EN', 'left', 0, [], { risk: 'blocked', reserved: true, note: 'Reset/Enable. Não use como I/O.' }),
  pin('36', 'left', 1, ['input', 'analog'], { inputOnly: true, recommendedFor: ['input'], note: 'Somente entrada.' }),
  pin('39', 'left', 2, ['input', 'analog'], { inputOnly: true, recommendedFor: ['input'], note: 'Somente entrada.' }),
  pin('34', 'left', 3, ['input', 'analog'], { inputOnly: true, recommendedFor: ['input'], note: 'Somente entrada.' }),
  pin('35', 'left', 4, ['input', 'analog'], { inputOnly: true, recommendedFor: ['input'], note: 'Somente entrada.' }),
  pin('32', 'left', 5, ['input', 'output', 'analog', 'pwm'], { recommendedFor: ['input'] }),
  pin('33', 'left', 6, ['input', 'output', 'analog', 'pwm'], { recommendedFor: ['input'] }),
  pin('25', 'left', 7, ['input', 'output', 'analog', 'pwm'], { recommendedFor: ['input', 'output'] }),
  pin('26', 'left', 8, ['input', 'output', 'analog', 'pwm'], { recommendedFor: ['output'] }),
  pin('27', 'left', 9, ['input', 'output', 'analog', 'pwm'], { recommendedFor: ['output'] }),
  pin('14', 'left', 10, ['input', 'output', 'pwm', 'spi'], { recommendedFor: ['input', 'output'] }),
  pin('12', 'left', 11, ['input', 'output', 'pwm', 'spi'], { risk: 'caution', bootSensitive: true, note: 'Pino sensível de boot/strapping. Use com cuidado.' }),
  pin('13', 'left', 12, ['input', 'output', 'pwm', 'spi'], { recommendedFor: ['input', 'output'] }),
  pin('23', 'right', 0, ['input', 'output', 'pwm', 'spi'], { recommendedFor: ['output'] }),
  pin('22', 'right', 1, ['input', 'output', 'pwm', 'i2c'], { recommendedFor: ['output'] }),
  pin('21', 'right', 2, ['input', 'output', 'pwm', 'i2c'], { recommendedFor: ['output'] }),
  pin('19', 'right', 3, ['input', 'output', 'pwm', 'spi'], { recommendedFor: ['output'] }),
  pin('18', 'right', 4, ['input', 'output', 'pwm', 'spi'], { recommendedFor: ['output'] }),
  pin('5', 'right', 5, ['input', 'output', 'pwm', 'spi'], { risk: 'caution', bootSensitive: true, note: 'Pode influenciar boot em algumas placas. Use com cuidado.' }),
  pin('17', 'right', 6, ['input', 'output', 'pwm'], { recommendedFor: ['output'] }),
  pin('16', 'right', 7, ['input', 'output', 'pwm'], { recommendedFor: ['output'] }),
  pin('4', 'right', 8, ['input', 'output', 'analog', 'pwm'], { risk: 'caution', bootSensitive: true, note: 'Pino sensível em algumas placas.' }),
  pin('2', 'right', 9, ['input', 'output', 'pwm'], { risk: 'caution', bootSensitive: true, note: 'LED onboard/boot strapping em muitas placas.' }),
  pin('15', 'right', 10, ['input', 'output', 'pwm'], { risk: 'caution', bootSensitive: true, note: 'Pino sensível de boot/strapping.' }),
  pin('0', 'right', 11, ['input', 'output', 'pwm'], { risk: 'caution', bootSensitive: true, note: 'BOOT. Pode colocar o ESP32 em modo gravação.' }),
  pin('1', 'right', 12, ['input', 'output', 'serial'], { risk: 'caution', serialPin: true, note: 'TX serial. Pode interferir no upload/log.' }),
  pin('3', 'right', 13, ['input', 'output', 'serial'], { risk: 'caution', serialPin: true, note: 'RX serial. Pode interferir no upload/log.' }),
  pin('6', 'right', 14, [], { risk: 'blocked', reserved: true, note: 'Reservado para flash interna.' }),
  pin('7', 'right', 15, [], { risk: 'blocked', reserved: true, note: 'Reservado para flash interna.' }),
  pin('8', 'right', 16, [], { risk: 'blocked', reserved: true, note: 'Reservado para flash interna.' }),
  pin('9', 'right', 17, [], { risk: 'blocked', reserved: true, note: 'Reservado para flash interna.' }),
  pin('10', 'right', 18, [], { risk: 'blocked', reserved: true, note: 'Reservado para flash interna.' }),
  pin('11', 'right', 19, [], { risk: 'blocked', reserved: true, note: 'Reservado para flash interna.' }),
];

const esp32S3Pins: BoardPin[] = [
  pin('1', 'left', 0, ['input', 'output', 'analog', 'pwm'], { recommendedFor: ['output'] }),
  pin('2', 'left', 1, ['input', 'output', 'analog', 'pwm'], { recommendedFor: ['output'] }),
  pin('4', 'left', 2, ['input', 'output', 'analog', 'pwm'], { recommendedFor: ['input', 'output'] }),
  pin('5', 'left', 3, ['input', 'output', 'analog', 'pwm'], { recommendedFor: ['input', 'output'] }),
  pin('6', 'left', 4, ['input', 'output', 'analog', 'pwm'], { recommendedFor: ['input', 'output'] }),
  pin('7', 'left', 5, ['input', 'output', 'analog', 'pwm'], { recommendedFor: ['input', 'output'] }),
  pin('8', 'left', 6, ['input', 'output', 'analog', 'pwm'], { risk: 'caution', note: 'Pode variar por placa; confira se não está reservado.' }),
  pin('9', 'left', 7, ['input', 'output', 'analog', 'pwm'], { risk: 'caution', note: 'Pode variar por placa; confira se não está reservado.' }),
  pin('10', 'left', 8, ['input', 'output', 'analog', 'pwm'], { risk: 'caution', note: 'Pode variar por placa; confira se não está reservado.' }),
  pin('15', 'left', 9, ['input', 'output', 'pwm'], { recommendedFor: ['input'] }),
  pin('16', 'left', 10, ['input', 'output', 'pwm'], { recommendedFor: ['input'] }),
  pin('17', 'left', 11, ['input', 'output', 'pwm'], { recommendedFor: ['input'] }),
  pin('18', 'left', 12, ['input', 'output', 'pwm'], { recommendedFor: ['input'] }),
  pin('19', 'right', 0, ['input', 'output', 'serial'], { risk: 'caution', serialPin: true, note: 'USB D- em placas com USB nativo. Evite se usar USB.' }),
  pin('20', 'right', 1, ['input', 'output', 'serial'], { risk: 'caution', serialPin: true, note: 'USB D+ em placas com USB nativo. Evite se usar USB.' }),
  pin('38', 'right', 2, ['input', 'output', 'pwm'], { recommendedFor: ['output'] }),
  pin('39', 'right', 3, ['input', 'output', 'pwm'], { recommendedFor: ['output'] }),
  pin('40', 'right', 4, ['input', 'output', 'pwm'], { recommendedFor: ['output'] }),
  pin('41', 'right', 5, ['input', 'output', 'pwm'], { recommendedFor: ['output'] }),
  pin('42', 'right', 6, ['input', 'output', 'pwm'], { recommendedFor: ['output'] }),
  pin('43', 'right', 7, ['input', 'output', 'serial'], { risk: 'caution', serialPin: true, note: 'TX0 em muitas placas.' }),
  pin('44', 'right', 8, ['input', 'output', 'serial'], { risk: 'caution', serialPin: true, note: 'RX0 em muitas placas.' }),
  pin('45', 'right', 9, ['input', 'output'], { risk: 'caution', bootSensitive: true, note: 'Pino de strapping em muitos ESP32-S3.' }),
  pin('46', 'right', 10, ['input', 'output'], { risk: 'caution', bootSensitive: true, note: 'Pino de strapping em muitos ESP32-S3.' }),
];

const esp32C3Pins: BoardPin[] = [
  pin('0', 'left', 0, ['input', 'output', 'analog', 'pwm'], { recommendedFor: ['input', 'output'] }),
  pin('1', 'left', 1, ['input', 'output', 'analog', 'pwm'], { recommendedFor: ['input', 'output'] }),
  pin('2', 'left', 2, ['input', 'output', 'analog', 'pwm'], { recommendedFor: ['input'] }),
  pin('3', 'left', 3, ['input', 'output', 'analog', 'pwm'], { recommendedFor: ['input'] }),
  pin('4', 'left', 4, ['input', 'output', 'analog', 'pwm'], { recommendedFor: ['input'] }),
  pin('5', 'left', 5, ['input', 'output', 'pwm'], { recommendedFor: ['input'] }),
  pin('6', 'right', 0, ['input', 'output', 'pwm'], { recommendedFor: ['output'] }),
  pin('7', 'right', 1, ['input', 'output', 'pwm'], { recommendedFor: ['output'] }),
  pin('8', 'right', 2, ['input', 'output', 'pwm'], { risk: 'caution', bootSensitive: true, note: 'Pino de boot/strapping em muitas placas C3.' }),
  pin('9', 'right', 3, ['input', 'output', 'pwm'], { risk: 'caution', bootSensitive: true, note: 'BOOT em muitas placas C3.' }),
  pin('10', 'right', 4, ['input', 'output', 'pwm'], { recommendedFor: ['output'] }),
  pin('18', 'right', 5, ['input', 'output', 'serial'], { risk: 'caution', serialPin: true, note: 'USB D- em placas com USB nativo.' }),
  pin('19', 'right', 6, ['input', 'output', 'serial'], { risk: 'caution', serialPin: true, note: 'USB D+ em placas com USB nativo.' }),
  pin('20', 'right', 7, ['input', 'output', 'serial'], { risk: 'caution', serialPin: true, note: 'RX0 em várias placas.' }),
  pin('21', 'right', 8, ['input', 'output', 'serial'], { risk: 'caution', serialPin: true, note: 'TX0 em várias placas.' }),
];

const esp32CamPins: BoardPin[] = [
  pin('0', 'left', 0, ['input', 'output'], { risk: 'caution', bootSensitive: true, note: 'Usado para modo flash/programação.' }),
  pin('2', 'left', 1, ['input', 'output'], { risk: 'caution', note: 'Compartilhado com SD em muitos módulos.' }),
  pin('4', 'left', 2, ['input', 'output'], { risk: 'caution', note: 'LED flash em muitos ESP32-CAM.' }),
  pin('12', 'left', 3, ['input', 'output'], { risk: 'caution', bootSensitive: true, note: 'Compartilhado com SD e sensível no boot.' }),
  pin('13', 'left', 4, ['input', 'output'], { recommendedFor: ['input', 'output'] }),
  pin('14', 'right', 0, ['input', 'output'], { recommendedFor: ['input', 'output'] }),
  pin('15', 'right', 1, ['input', 'output'], { risk: 'caution', bootSensitive: true, note: 'Compartilhado com SD em muitas placas.' }),
  pin('16', 'right', 2, ['input', 'output'], { recommendedFor: ['input', 'output'] }),
  pin('1', 'right', 3, ['input', 'output', 'serial'], { risk: 'caution', serialPin: true, note: 'TX serial/programação.' }),
  pin('3', 'right', 4, ['input', 'output', 'serial'], { risk: 'caution', serialPin: true, note: 'RX serial/programação.' }),
];

const esp8266Pins: BoardPin[] = [
  pin('D0', 'left', 0, ['output'], { risk: 'caution', note: 'GPIO16. Limitações em interrupção/PWM conforme placa.' }),
  pin('D1', 'left', 1, ['input', 'output', 'i2c'], { recommendedFor: ['input', 'output'] }),
  pin('D2', 'left', 2, ['input', 'output', 'i2c'], { recommendedFor: ['input', 'output'] }),
  pin('D3', 'left', 3, ['input', 'output'], { risk: 'caution', bootSensitive: true, note: 'GPIO0. Sensível no boot.' }),
  pin('D4', 'left', 4, ['input', 'output'], { risk: 'caution', bootSensitive: true, note: 'GPIO2/LED onboard. Sensível no boot.' }),
  pin('D5', 'right', 0, ['input', 'output', 'spi', 'pwm'], { recommendedFor: ['input', 'output'] }),
  pin('D6', 'right', 1, ['input', 'output', 'spi', 'pwm'], { recommendedFor: ['input', 'output'] }),
  pin('D7', 'right', 2, ['input', 'output', 'spi', 'pwm'], { recommendedFor: ['input', 'output'] }),
  pin('D8', 'right', 3, ['input', 'output', 'spi'], { risk: 'caution', bootSensitive: true, note: 'GPIO15. Sensível no boot.' }),
  pin('RX', 'right', 4, ['input', 'output', 'serial'], { risk: 'caution', serialPin: true, note: 'Serial RX. Evite se usar upload/monitor.' }),
  pin('TX', 'right', 5, ['input', 'output', 'serial'], { risk: 'caution', serialPin: true, note: 'Serial TX. Evite se usar upload/monitor.' }),
  pin('A0', 'right', 6, ['analog', 'input'], { risk: 'caution', note: 'Entrada analógica. Não use como saída digital.' }),
];

const arduinoUnoPins: BoardPin[] = [
  pin('0', 'left', 0, ['input', 'output', 'serial'], { risk: 'caution', serialPin: true, note: 'RX serial. Pode interferir no upload.' }),
  pin('1', 'left', 1, ['input', 'output', 'serial'], { risk: 'caution', serialPin: true, note: 'TX serial. Pode interferir no upload.' }),
  pin('2', 'left', 2, ['input', 'output'], { recommendedFor: ['input'] }),
  pin('3', 'left', 3, ['input', 'output', 'pwm'], { recommendedFor: ['input'] }),
  pin('4', 'left', 4, ['input', 'output'], { recommendedFor: ['input'] }),
  pin('5', 'left', 5, ['input', 'output', 'pwm'], { recommendedFor: ['input'] }),
  pin('6', 'left', 6, ['input', 'output', 'pwm'], { recommendedFor: ['input'] }),
  pin('7', 'left', 7, ['input', 'output'], { recommendedFor: ['input'] }),
  pin('8', 'right', 0, ['input', 'output'], { recommendedFor: ['input', 'output'] }),
  pin('9', 'right', 1, ['input', 'output', 'pwm'], { recommendedFor: ['output'] }),
  pin('10', 'right', 2, ['input', 'output', 'pwm', 'spi'], { recommendedFor: ['output'] }),
  pin('11', 'right', 3, ['input', 'output', 'pwm', 'spi'], { recommendedFor: ['output'] }),
  pin('12', 'right', 4, ['input', 'output', 'spi'], { recommendedFor: ['output'] }),
  pin('13', 'right', 5, ['input', 'output', 'spi'], { risk: 'caution', note: 'LED onboard. Pode piscar no boot/reset.' }),
  pin('A0', 'right', 6, ['input', 'analog'], { recommendedFor: ['input'] }),
  pin('A1', 'right', 7, ['input', 'analog'], { recommendedFor: ['input'] }),
  pin('A2', 'right', 8, ['input', 'analog'], { recommendedFor: ['input'] }),
  pin('A3', 'right', 9, ['input', 'analog'], { recommendedFor: ['input'] }),
  pin('A4', 'right', 10, ['input', 'analog', 'i2c'], { recommendedFor: ['input'] }),
  pin('A5', 'right', 11, ['input', 'analog', 'i2c'], { recommendedFor: ['input'] }),
];

const arduinoMegaPins: BoardPin[] = [
  ...Array.from({ length: 10 }, (_, index) => pin(String(22 + index), 'left', index, ['input', 'output'], { recommendedFor: ['input'] })),
  ...Array.from({ length: 10 }, (_, index) => pin(String(32 + index), 'right', index, ['input', 'output'], { recommendedFor: ['output'] })),
  pin('0', 'left', 11, ['input', 'output', 'serial'], { risk: 'caution', serialPin: true, note: 'RX0 serial. Evite para não interferir no upload.' }),
  pin('1', 'left', 12, ['input', 'output', 'serial'], { risk: 'caution', serialPin: true, note: 'TX0 serial. Evite para não interferir no upload.' }),
  pin('A0', 'right', 11, ['input', 'analog'], { recommendedFor: ['input'] }),
  pin('A1', 'right', 12, ['input', 'analog'], { recommendedFor: ['input'] }),
];

export const gpioBoardCatalogs: BoardGpioCatalog[] = [
  { target: 'esp32', label: 'ESP32 DevKit / WROOM', chipLabel: 'ESP32', aliases: ['esphome'], pins: esp32Pins },
  { target: 'esp32_s3', label: 'ESP32-S3 DevKit', chipLabel: 'ESP32-S3', pins: esp32S3Pins },
  { target: 'esp32_c3', label: 'ESP32-C3 DevKit', chipLabel: 'ESP32-C3', pins: esp32C3Pins },
  { target: 'esp32_cam', label: 'ESP32-CAM', chipLabel: 'ESP32-CAM', pins: esp32CamPins },
  { target: 'esp8266', label: 'ESP8266 NodeMCU', chipLabel: 'ESP8266', pins: esp8266Pins },
  { target: 'arduino_uno', label: 'Arduino Uno', chipLabel: 'UNO', aliases: ['arduino_nano', 'generic_arduino'], pins: arduinoUnoPins },
  { target: 'arduino_mega', label: 'Arduino Mega 2560', chipLabel: 'MEGA', pins: arduinoMegaPins },
];

export function getGpioBoardCatalog(target: HardwareTarget): BoardGpioCatalog {
  return gpioBoardCatalogs.find((catalog) => catalog.target === target || catalog.aliases?.includes(target)) ?? gpioBoardCatalogs[0];
}

export function normalizeGpioPin(pinValue: string | undefined): string {
  const raw = (pinValue ?? '').trim().toUpperCase();
  return raw.replace(/^GPIO/, '');
}

export function getBoardPin(catalog: BoardGpioCatalog, pinValue: string | undefined): BoardPin | undefined {
  const normalized = normalizeGpioPin(pinValue);
  return catalog.pins.find((pinItem) => normalizeGpioPin(pinItem.gpio) === normalized || normalizeGpioPin(pinItem.label) === normalized);
}

export function getSelectablePins(catalog: BoardGpioCatalog, scope: GpioUseScope): BoardPin[] {
  return [...catalog.pins]
    .filter((pinItem) => !pinItem.reserved && pinItem.capabilities.includes(scope))
    .sort((left, right) => {
      const leftRecommended = left.recommendedFor?.includes(scope) ? 0 : 1;
      const rightRecommended = right.recommendedFor?.includes(scope) ? 0 : 1;
      if (leftRecommended !== rightRecommended) return leftRecommended - rightRecommended;
      const riskOrder = { recommended: 0, caution: 1, blocked: 2 };
      if (riskOrder[left.risk] !== riskOrder[right.risk]) return riskOrder[left.risk] - riskOrder[right.risk];
      return left.order - right.order;
    });
}
