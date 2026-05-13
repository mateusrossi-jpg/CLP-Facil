import { spacing } from '../theme/spacing';

export const TOUCH_TARGET_PX = 44;

export const LADDER_GEOMETRY = {
  railLeftX: 0,
  nodeWidth: TOUCH_TARGET_PX,
  nodeHeight: TOUCH_TARGET_PX,
  cellGapX: spacing.lg,
  branchGapY: spacing.md,
  rungPaddingY: spacing.lg,
  rungPaddingRight: spacing.xl,
} as const;

export type LadderGeometry = typeof LADDER_GEOMETRY;
