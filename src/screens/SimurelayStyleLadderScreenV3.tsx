import { SimurelayStyleLadderScreenV2 } from './SimurelayStyleLadderScreenV2';

export function SimurelayStyleLadderScreenV3() {
  return <SimurelayStyleLadderScreenV2 />;
}

// V3 checkpoint:
// The Simurelay-style V2 now has clean insert zones, editable rungs, drawer component selection,
// retractable I/O, simulation mode, and minimal dark workspace.
// Next patch should add:
// - floating ghost preview when a component is selected;
// - stronger snap feedback on zone press/hover;
// - long-press drag from component drawer;
// - optional contextual mini toolbar after selecting an existing block.
