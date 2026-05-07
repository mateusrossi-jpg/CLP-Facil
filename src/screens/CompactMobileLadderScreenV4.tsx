export { CompactMobileLadderScreenV3 as CompactMobileLadderScreenV4 } from './CompactMobileLadderScreenV3';

// V4 direction notes:
// - Keep V3 as the stable compact mobile implementation.
// - Next code pass should add contextual block movement actions directly into V3/V4:
//   move left, move right, duplicate, create branch from selected block.
// - This alias keeps a versioned entry point without duplicating the large screen file.
