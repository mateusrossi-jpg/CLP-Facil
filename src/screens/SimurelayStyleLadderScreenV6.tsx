import { SimurelayStyleLadderScreenV5 } from './SimurelayStyleLadderScreenV5';

export function SimurelayStyleLadderScreenV6() {
  return <SimurelayStyleLadderScreenV5 />;
}

// V6 implementation checkpoint:
// Stable base: V5 has physical ghost drag with PanResponder, magnetic zones, live wires, Simurelay-style dark workspace,
// retractable I/O, component drawer, contextual insertion and editable rungs.
// This version marks the next behavior contract for release snap:
// 1. Drag ghost from active component.
// 2. Detect nearest valid zone while moving.
// 3. Keep nearest zone in hotZone state.
// 4. On release, if hotZone exists, call addBlock(hotZone).
// 5. If no hotZone exists, spring ghost back to origin.
// 6. Keep UI minimal: no permanent toolbars, no exposed bottom controls.
//
// Reason for separate V6 entry:
// - Keeps V5 stable for testing.
// - Gives the app a clean import target for the snap-release iteration.
// - Avoids changing dependency versions or package files.
