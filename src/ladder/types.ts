export type BlockType = 'NO' | 'NC' | 'COIL' | 'TON' | 'TOF' | 'CTU' | 'CTD';

export type LadderBlock = {
  id: string;
  type: BlockType;
  address: string;
  presetMs?: number;
  elapsedMs?: number;
  presetCount?: number;
  count?: number;
};

export type LadderRung = {
  id: string;
  series: LadderBlock[];
  parallel?: LadderBlock[];
  coil?: LadderBlock;
};

export type PlcState = Record<string, boolean | number>;

export type SelectedBlock = { rungId: string; lane: 'series' | 'parallel' | 'coil'; blockId: string } | null;
