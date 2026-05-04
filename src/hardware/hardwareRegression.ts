import { createInitialEditorProject, EditorBlock, EditorProjectState } from '../engine/editorTypes';
import { compileLadderProjectForHardware } from './compileLadderProject';
import { getGpioBoardCatalog, getSelectablePins } from './gpioCatalog';
import { exportArduinoSketch } from './exportArduinoSketch';
import { exportEspHomeYaml } from './exportEspHomeYaml';
import { HardwareExportConfig } from './hardwareTypes';
import { validateGpioMap } from './validateGpioMap';

type HardwareRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, condition: boolean, details?: string): HardwareRegressionResult {
  return { name, passed: condition, details: condition ? undefined : details };
}

function contact(id: string, variable: string, contactMode: 'NO' | 'NC' | 'RISING' | 'FALLING' = 'NO'): EditorBlock {
  return {
    id,
    componentId: contactMode === 'RISING' ? 'contact-ons' : contactMode === 'FALLING' ? 'contact-osf' : contactMode === 'NC' ? 'contact-nc' : 'contact-no',
    name: id,
    description: 'Contato de teste.',
    isPro: false,
    zone: 'series',
    variable,
    role: 'contact',
    contactMode,
    category: 'logic',
  };
}

function coil(id: string, variable: string): EditorBlock {
  return {
    id,
    componentId: 'coil-q',
    name: id,
    description: 'Bobina de teste.',
    isPro: false,
    zone: 'coil',
    variable,
    role: 'coil',
    coilMode: 'NORMAL',
    category: 'output',
  };
}

const baseConfig: HardwareExportConfig = {
  target: 'esp32',
  nodeName: 'easy-clp-test',
  scanMs: 50,
  pinMap: [
    { variable: 'I0.0', label: 'Start', pin: '32', mode: 'input_pullup', debounceMs: 30 },
    { variable: 'I0.1', label: 'Stop', pin: '33', mode: 'input_pullup', debounceMs: 30 },
    { variable: 'Q0.0', label: 'Motor', pin: '26', mode: 'output', outputPolarity: 'active_high', safeState: false },
  ],
};

function runSealExportRegression(): HardwareRegressionResult {
  const project = createInitialEditorProject();
  const compiled = compileLadderProjectForHardware(project, baseConfig);
  const sketch = exportArduinoSketch(compiled);

  const hasInputPins = sketch.includes('const int PIN_I0_0 = 32;') && sketch.includes('const int PIN_I0_1 = 33;');
  const hasOutputPin = sketch.includes('const int PIN_Q0_0 = 26;');
  const hasBootSafeOff = sketch.includes('digitalWrite(PIN_Q0_0, LOW);');
  const hasSealExpression = sketch.includes('q0_0') && sketch.includes('rung_1');
  const hasScanLoop = sketch.includes('readInputs();') && sketch.includes('executeLadder();') && sketch.includes('writeOutputs();');

  return assertResult(
    'exporta partida com selo para Arduino',
    hasInputPins && hasOutputPin && hasBootSafeOff && hasSealExpression && hasScanLoop,
    `hasInputPins=${hasInputPins}, hasOutputPin=${hasOutputPin}, hasBootSafeOff=${hasBootSafeOff}, hasSealExpression=${hasSealExpression}, hasScanLoop=${hasScanLoop}`,
  );
}

function runEdgeExportRegression(): HardwareRegressionResult {
  const project: EditorProjectState = {
    selectedRungId: 'edge-rung',
    selectedBlockId: null,
    selectedZone: 'series',
    selectedSeriesIndex: 0,
    rungs: [
      {
        id: 'edge-rung',
        label: 'Linha 1 - ONS',
        seriesBlocks: [contact('edge-contact', 'I0.0', 'RISING')],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: coil('edge-coil', 'Q0.0'),
      },
    ],
  };
  const compiled = compileLadderProjectForHardware(project, baseConfig);
  const sketch = exportArduinoSketch(compiled);

  const hasPreviousState = sketch.includes('bool prev_i0_0 = false;');
  const hasRisingExpression = sketch.includes('(i0_0 && !prev_i0_0)');
  const updatesPreviousState = sketch.includes('prev_i0_0 = i0_0;');

  return assertResult(
    'exporta ONS com memoria anterior',
    hasPreviousState && hasRisingExpression && updatesPreviousState,
    `previous=${hasPreviousState}, rising=${hasRisingExpression}, update=${updatesPreviousState}`,
  );
}

function runTimerExportRegression(): HardwareRegressionResult {
  const project: EditorProjectState = {
    selectedRungId: 'ton-rung',
    selectedBlockId: null,
    selectedZone: 'series',
    selectedSeriesIndex: 0,
    rungs: [
      {
        id: 'ton-rung',
        label: 'Linha 1 - TON',
        seriesBlocks: [contact('ton-enable', 'I0.0')],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: {
          id: 'ton-block',
          componentId: 'timer-ton',
          name: 'TON',
          description: 'Temporizador TON.',
          isPro: false,
          zone: 'coil',
          variable: 'T0',
          role: 'timer',
          timerMode: 'TON',
          presetMs: 300,
          category: 'timer',
        },
      },
    ],
  };
  const compiled = compileLadderProjectForHardware(project, {
    ...baseConfig,
    pinMap: [baseConfig.pinMap[0]],
  });
  const sketch = exportArduinoSketch(compiled);

  const hasTimerStruct = sketch.includes('struct TimerState');
  const hasElapsed = sketch.includes('timer_ton_block.elapsedMs = min(timer_ton_block.elapsedMs + SCAN_MS, 300UL);');
  const writesTimerBit = sketch.includes('t0 = timer_ton_block.q;');

  return assertResult(
    'exporta TON para Arduino',
    hasTimerStruct && hasElapsed && writesTimerBit,
    `struct=${hasTimerStruct}, elapsed=${hasElapsed}, write=${writesTimerBit}`,
  );
}

function runEspHomeExportRegression(): HardwareRegressionResult {
  const compiled = compileLadderProjectForHardware(createInitialEditorProject(), baseConfig);
  const yaml = exportEspHomeYaml(compiled);

  const hasBinarySensor = yaml.includes('binary_sensor:') && yaml.includes('id: i0_0');
  const hasSwitch = yaml.includes('switch:') && yaml.includes('id: q0_0');
  const hasRestoreOff = yaml.includes('restore_mode: RESTORE_DEFAULT_OFF');

  return assertResult(
    'exporta YAML ESPHome inicial',
    hasBinarySensor && hasSwitch && hasRestoreOff,
    `binary=${hasBinarySensor}, switch=${hasSwitch}, restoreOff=${hasRestoreOff}`,
  );
}

function runGpioCatalogRegression(): HardwareRegressionResult {
  const esp32 = getGpioBoardCatalog('esp32');
  const inputPins = getSelectablePins(esp32, 'input');
  const outputPins = getSelectablePins(esp32, 'output');
  const hasInputOnly = Boolean(esp32.pins.find((pin) => pin.gpio === '34' && pin.inputOnly));
  const excludesFlashPins = !inputPins.some((pin) => pin.gpio === '6') && !outputPins.some((pin) => pin.gpio === '6');
  const suggestsInput = inputPins.some((pin) => pin.gpio === '32');
  const suggestsOutput = outputPins.some((pin) => pin.gpio === '26');

  return assertResult(
    'catalogo GPIO ESP32 separa pinos seguros',
    hasInputOnly && excludesFlashPins && suggestsInput && suggestsOutput,
    `inputOnly=${hasInputOnly}, excludesFlash=${excludesFlashPins}, input32=${suggestsInput}, output26=${suggestsOutput}`,
  );
}

function runGpioValidationRegression(): HardwareRegressionResult {
  const issues = validateGpioMap('esp32', [
    { variable: 'Q0.0', pin: '34', mode: 'output', outputPolarity: 'active_high' },
    { variable: 'I0.0', pin: '6', mode: 'input_pullup' },
    { variable: 'I0.1', pin: '0', mode: 'input_pullup' },
  ]);
  const catchesInputOnlyOutput = issues.some((issue) => issue.severity === 'error' && issue.message.includes('somente entrada'));
  const catchesReserved = issues.some((issue) => issue.severity === 'error' && issue.message.includes('reservado'));
  const catchesBootWarning = issues.some((issue) => issue.severity === 'warning' && issue.message.includes('boot'));

  return assertResult(
    'valida pinagem GPIO invalida',
    catchesInputOnlyOutput && catchesReserved && catchesBootWarning,
    `inputOnly=${catchesInputOnlyOutput}, reserved=${catchesReserved}, boot=${catchesBootWarning}`,
  );
}

export function runHardwareRegressionSuite(): HardwareRegressionResult[] {
  return [
    runSealExportRegression(),
    runEdgeExportRegression(),
    runTimerExportRegression(),
    runEspHomeExportRegression(),
    runGpioCatalogRegression(),
    runGpioValidationRegression(),
  ];
}
