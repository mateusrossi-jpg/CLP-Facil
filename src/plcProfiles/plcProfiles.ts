import {
  EditorBlock,
  EditorCoilMode,
  EditorCompareMode,
  EditorContactMode,
  EditorCounterMode,
  EditorMathMode,
  EditorProjectState,
  EditorRung,
  EditorTimerMode,
} from '../engine/editorTypes';

export type PlcProfileId = 'easy_clp' | 'rockwell_like' | 'iec_like' | 'commands_like';

export type PlcProfileInstructionSet = {
  contact: Record<EditorContactMode, string>;
  coil: Record<EditorCoilMode, string>;
  timer: Record<EditorTimerMode, string>;
  counter: Record<EditorCounterMode, string>;
  compare: Record<EditorCompareMode, string>;
  math: Record<EditorMathMode, string>;
};

export type PlcProfile = {
  id: PlcProfileId;
  name: string;
  shortName: string;
  description: string;
  disclaimer: string;
  instructions: PlcProfileInstructionSet;
};

export type PlcProfileBlockView = {
  blockId: string;
  variable: string;
  label: string;
  instruction: string;
  operand: string;
  description: string;
};

export type PlcProfileRungView = {
  rungId: string;
  label: string;
  series: PlcProfileBlockView[];
  parallelBranches: PlcProfileBlockView[][];
  output: PlcProfileBlockView | null;
  textLine: string;
};

export type PlcProfileProjectView = {
  profile: PlcProfile;
  rungs: PlcProfileRungView[];
};

export const plcProfiles: PlcProfile[] = [
  {
    id: 'easy_clp',
    name: 'Easy-CLP didático',
    shortName: 'Easy-CLP',
    description: 'Nomes simples para aprender lógica Ladder, comandos elétricos e bancada didática.',
    disclaimer: 'Perfil didático interno. Não representa uma marca de CLP específica.',
    instructions: {
      contact: {
        NO: 'NA',
        NC: 'NF',
        RISING: 'Borda +',
        FALLING: 'Borda -',
      },
      coil: {
        NORMAL: 'Bobina',
        SET: 'Set',
        RESET: 'Reset',
        PULSE: 'Pulso',
      },
      timer: {
        TON: 'TON',
        TOF: 'TOF',
        TP: 'TP',
      },
      counter: {
        CTU: 'CTU',
        CTD: 'CTD',
        CTUD: 'CTUD',
      },
      compare: {
        EQU: '=',
        NEQ: '<>',
        GRT: '>',
        LES: '<',
        GEQ: '>=',
        LEQ: '<=',
      },
      math: {
        MOV: 'MOV',
        ADD: 'ADD',
        SUB: 'SUB',
        MUL: 'MUL',
        DIV: 'DIV',
      },
    },
  },
  {
    id: 'rockwell_like',
    name: 'Rockwell-like',
    shortName: 'Rockwell',
    description: 'Visualização educacional inspirada na nomenclatura comum de instruções Allen-Bradley/Rockwell.',
    disclaimer: 'Perfil educacional não oficial. O app não gera projeto Studio 5000 nem comunica com CLP Rockwell nesta fase.',
    instructions: {
      contact: {
        NO: 'XIC',
        NC: 'XIO',
        RISING: 'ONS',
        FALLING: 'OSF',
      },
      coil: {
        NORMAL: 'OTE',
        SET: 'OTL',
        RESET: 'OTU',
        PULSE: 'ONS/OTE',
      },
      timer: {
        TON: 'TON',
        TOF: 'TOF',
        TP: 'TP',
      },
      counter: {
        CTU: 'CTU',
        CTD: 'CTD',
        CTUD: 'CTUD',
      },
      compare: {
        EQU: 'EQU',
        NEQ: 'NEQ',
        GRT: 'GRT',
        LES: 'LES',
        GEQ: 'GEQ',
        LEQ: 'LEQ',
      },
      math: {
        MOV: 'MOV',
        ADD: 'ADD',
        SUB: 'SUB',
        MUL: 'MUL',
        DIV: 'DIV',
      },
    },
  },
  {
    id: 'iec_like',
    name: 'IEC / Siemens-like',
    shortName: 'IEC',
    description: 'Visualização educacional próxima de blocos e nomes comuns em ambientes IEC 61131-3/Siemens-like.',
    disclaimer: 'Perfil educacional não oficial. Não exporta projeto TIA Portal nesta fase.',
    instructions: {
      contact: {
        NO: 'Contato NA',
        NC: 'Contato NF',
        RISING: 'P_TRIG',
        FALLING: 'N_TRIG',
      },
      coil: {
        NORMAL: 'Coil',
        SET: 'S',
        RESET: 'R',
        PULSE: 'PULSE',
      },
      timer: {
        TON: 'TON',
        TOF: 'TOF',
        TP: 'TP',
      },
      counter: {
        CTU: 'CTU',
        CTD: 'CTD',
        CTUD: 'CTUD',
      },
      compare: {
        EQU: 'EQ',
        NEQ: 'NE',
        GRT: 'GT',
        LES: 'LT',
        GEQ: 'GE',
        LEQ: 'LE',
      },
      math: {
        MOV: 'MOVE',
        ADD: 'ADD',
        SUB: 'SUB',
        MUL: 'MUL',
        DIV: 'DIV',
      },
    },
  },
  {
    id: 'commands_like',
    name: 'Comandos elétricos',
    shortName: 'Comandos',
    description: 'Leitura voltada para bancada de comandos elétricos, contatores, botoeiras e relés auxiliares.',
    disclaimer: 'Perfil didático para representação de comandos. Não substitui diagrama elétrico normativo ou projeto profissional.',
    instructions: {
      contact: {
        NO: 'Contato NA',
        NC: 'Contato NF',
        RISING: 'Pulso liga',
        FALLING: 'Pulso desliga',
      },
      coil: {
        NORMAL: 'Bobina/Contator',
        SET: 'Retenção',
        RESET: 'Desarme',
        PULSE: 'Pulso',
      },
      timer: {
        TON: 'Relé tempo TON',
        TOF: 'Relé tempo TOF',
        TP: 'Pulso temporizado',
      },
      counter: {
        CTU: 'Contador +',
        CTD: 'Contador -',
        CTUD: 'Contador +/-',
      },
      compare: {
        EQU: 'Igual',
        NEQ: 'Diferente',
        GRT: 'Maior',
        LES: 'Menor',
        GEQ: 'Maior/igual',
        LEQ: 'Menor/igual',
      },
      math: {
        MOV: 'Transferir',
        ADD: 'Somar',
        SUB: 'Subtrair',
        MUL: 'Multiplicar',
        DIV: 'Dividir',
      },
    },
  },
];

export function getPlcProfile(profileId: PlcProfileId): PlcProfile {
  return plcProfiles.find((profile) => profile.id === profileId) ?? plcProfiles[0];
}

function normalizeVariable(variable: string | undefined): string {
  return (variable ?? '').trim().toUpperCase();
}

function instructionForBlock(block: EditorBlock, profile: PlcProfile): string {
  if (block.compareMode) return profile.instructions.compare[block.compareMode];
  if (block.mathMode) return profile.instructions.math[block.mathMode];
  if (block.role === 'timer') return profile.instructions.timer[block.timerMode ?? 'TON'];
  if (block.role === 'counter') return profile.instructions.counter[block.counterMode ?? 'CTU'];
  if (block.role === 'coil') return profile.instructions.coil[block.coilMode ?? 'NORMAL'];
  return profile.instructions.contact[block.contactMode ?? 'NO'];
}

function operandForBlock(block: EditorBlock): string {
  if (block.compareMode) return `${block.sourceA ?? 'A'} ${block.compareMode} ${block.sourceB ?? 'B'}`;
  if (block.mathMode) {
    const destination = block.destination ?? block.variable;
    const sourceA = block.sourceA ?? 'A';
    const sourceB = block.sourceB ?? '';
    return block.mathMode === 'MOV' ? `${destination} <- ${sourceA}` : `${destination} <- ${sourceA}, ${sourceB}`;
  }
  if (block.role === 'timer') return `${normalizeVariable(block.variable)} PRE ${block.presetMs ?? 0}ms`;
  if (block.role === 'counter') return `${normalizeVariable(block.variable)} PRE ${block.preset ?? 0}`;
  return normalizeVariable(block.variable);
}

function descriptionForBlock(block: EditorBlock): string {
  if (block.compareMode) return `Compara ${block.sourceA ?? 'A'} com ${block.sourceB ?? 'B'}.`;
  if (block.mathMode) return `Executa ${block.mathMode} e grava em ${block.destination ?? block.variable}.`;
  if (block.role === 'timer') return `Temporizador ${block.timerMode ?? 'TON'} associado a ${block.variable}.`;
  if (block.role === 'counter') return `Contador ${block.counterMode ?? 'CTU'} associado a ${block.variable}.`;
  if (block.role === 'coil') return `Escreve na saída ou memória ${block.variable}.`;
  if (block.contactMode === 'NC') return `Conduz quando ${block.variable} está desligado.`;
  if (block.contactMode === 'RISING') return `Gera pulso na subida de ${block.variable}.`;
  if (block.contactMode === 'FALLING') return `Gera pulso na descida de ${block.variable}.`;
  return `Conduz quando ${block.variable} está ligado.`;
}

function blockView(block: EditorBlock, profile: PlcProfile): PlcProfileBlockView {
  return {
    blockId: block.id,
    variable: normalizeVariable(block.variable),
    label: block.name,
    instruction: instructionForBlock(block, profile),
    operand: operandForBlock(block),
    description: descriptionForBlock(block),
  };
}

function parallelBranchesFor(rung: EditorRung) {
  if (rung.parallelBranches) return rung.parallelBranches;
  return rung.parallelBlocks.map((block, index) => ({
    id: `${rung.id}-legacy-branch-${block.id}`,
    seriesIndex: block.parallelIndex ?? index,
    blocks: [block],
  }));
}

function rungTextLine(series: PlcProfileBlockView[], branches: PlcProfileBlockView[][], output: PlcProfileBlockView | null): string {
  const seriesText = series.map((block) => `${block.instruction}(${block.operand})`).join(' → ');
  const branchText = branches.length > 0
    ? ` || ${branches.map((branch) => `[${branch.map((block) => `${block.instruction}(${block.operand})`).join(' → ')}]`).join(' || ')}`
    : '';
  const outputText = output ? ` => ${output.instruction}(${output.operand})` : ' => sem saída';
  return `${seriesText || 'sem condição'}${branchText}${outputText}`;
}

export function createPlcProfileProjectView(project: EditorProjectState, profileId: PlcProfileId): PlcProfileProjectView {
  const profile = getPlcProfile(profileId);
  const rungs = project.rungs.map((rung) => {
    const series = rung.seriesBlocks.map((block) => blockView(block, profile));
    const parallelBranches = parallelBranchesFor(rung).map((branch) => branch.blocks.map((block) => blockView(block, profile)));
    const output = rung.coilBlock ? blockView(rung.coilBlock, profile) : null;
    return {
      rungId: rung.id,
      label: rung.label,
      series,
      parallelBranches,
      output,
      textLine: rungTextLine(series, parallelBranches, output),
    };
  });

  return { profile, rungs };
}
