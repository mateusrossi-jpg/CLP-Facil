import { LADDER_GEOMETRY, type LadderGeometry } from './ladderGeometry';

export type LadderRenderableNodeType = 'contact' | 'output' | 'series' | 'branch';

export type LadderRenderableNode = {
  id: string;
  type: LadderRenderableNodeType;
  children?: LadderRenderableNode[];
};

export type LadderRungAst = {
  id: string;
  root: LadderRenderableNode;
};

export type LadderElement = {
  id: string;
  type: LadderRenderableNodeType;
};

export type LadderPlacedNode = {
  id: string;
  x: number;
  y: number;
};

export type LadderWire = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

export type LadderLayoutResult = {
  width: number;
  height: number;
  nodes: LadderPlacedNode[];
  wires: LadderWire[];
};

type SizedSubtree = {
  width: number;
  height: number;
  hasOutput: boolean;
};

function isOutputLike(node: LadderRenderableNode): boolean {
  return node.type === 'output';
}

function measure(node: LadderRenderableNode, g: LadderGeometry): SizedSubtree {
  if (node.type === 'contact' || node.type === 'output') {
    return { width: g.nodeWidth, height: g.nodeHeight, hasOutput: node.type === 'output' };
  }

  const children = node.children ?? [];
  if (children.length === 0) {
    return { width: g.nodeWidth, height: g.nodeHeight, hasOutput: false };
  }

  if (node.type === 'series') {
    let width = 0;
    let height = 0;
    let hasOutput = false;
    children.forEach((child, index) => {
      const m = measure(child, g);
      width += m.width;
      if (index > 0) width += g.cellGapX;
      height = Math.max(height, m.height);
      hasOutput = hasOutput || m.hasOutput;
    });
    return { width, height, hasOutput };
  }

  let width = 0;
  let height = 0;
  let hasOutput = false;
  children.forEach((child, index) => {
    const m = measure(child, g);
    width = Math.max(width, m.width);
    height += m.height;
    if (index > 0) height += g.branchGapY;
    hasOutput = hasOutput || m.hasOutput;
  });
  return { width, height, hasOutput };
}

function centerY(originY: number, height: number): number {
  return originY + Math.round(height / 2);
}

function placeNodeSingle(node: LadderRenderableNode, x: number, y: number, nodes: LadderPlacedNode[]) {
  nodes.push({ id: node.id, x, y });
}

function routeHorizontal(wires: LadderWire[], startX: number, startY: number, endX: number) {
  wires.push({ startX, startY, endX, endY: startY });
}

function layout(
  node: LadderRenderableNode,
  x: number,
  y: number,
  targetRightX: number,
  g: LadderGeometry,
  nodes: LadderPlacedNode[],
  wires: LadderWire[],
): SizedSubtree {
  const m = measure(node, g);

  if (node.type === 'contact') {
    placeNodeSingle(node, x, y, nodes);
    return m;
  }

  if (node.type === 'output') {
    const alignedX = targetRightX - g.nodeWidth;
    placeNodeSingle(node, alignedX, y, nodes);
    return { ...m, width: targetRightX - x };
  }

  const children = node.children ?? [];
  if (children.length === 0) {
    placeNodeSingle(node, x, y, nodes);
    return m;
  }

  if (node.type === 'series') {
    const childMeasures = children.map((child) => measure(child, g));
    const lastOutputIndex = children.map(isOutputLike).lastIndexOf(true);
    let cursorX = x;
    children.forEach((child, idx) => {
      const childSize = childMeasures[idx];
      const childY = y + Math.round((m.height - childSize.height) / 2);
      const isLastOutput = idx === lastOutputIndex;
      const rightForChild = isLastOutput ? targetRightX : cursorX + childSize.width;
      const beforeCenterY = centerY(childY, childSize.height);
      if (idx > 0) {
        const previousX = cursorX - g.cellGapX;
        routeHorizontal(wires, previousX + g.nodeWidth, beforeCenterY, cursorX);
      }
      const laid = layout(child, cursorX, childY, rightForChild, g, nodes, wires);
      cursorX += laid.width + g.cellGapX;
    });
    return { ...m, width: targetRightX - x };
  }

  let offsetY = y;
  const branchEntryX = x;
  const branchExitX = x + m.width;
  children.forEach((child, idx) => {
    const childSize = measure(child, g);
    const branchY = offsetY;
    const midY = centerY(branchY, childSize.height);

    wires.push({ startX: branchEntryX, startY: midY, endX: branchEntryX + g.cellGapX, endY: midY });
    const childStartX = branchEntryX + g.cellGapX;
    const childTargetRight = isOutputLike(child) ? targetRightX : childStartX + childSize.width;
    layout(child, childStartX, branchY, childTargetRight, g, nodes, wires);
    wires.push({ startX: childStartX + childSize.width, startY: midY, endX: branchExitX + g.cellGapX, endY: midY });

    if (idx > 0) {
      const prevStartY = centerY(offsetY - g.branchGapY - measure(children[idx - 1], g).height, measure(children[idx - 1], g).height);
      wires.push({ startX: branchEntryX, startY: prevStartY, endX: branchEntryX, endY: midY });
      wires.push({ startX: branchExitX + g.cellGapX, startY: prevStartY, endX: branchExitX + g.cellGapX, endY: midY });
    }

    offsetY += childSize.height + g.branchGapY;
  });

  return m;
}

export function calculateRungLayout(
  rung: LadderRungAst,
  elements: readonly LadderElement[],
  geometry: LadderGeometry = LADDER_GEOMETRY,
): LadderLayoutResult {
  const elementIds = new Set(elements.map((item) => item.id));
  const nodes: LadderPlacedNode[] = [];
  const wires: LadderWire[] = [];

  const measured = measure(rung.root, geometry);
  const width = geometry.railLeftX + measured.width + geometry.rungPaddingRight + geometry.nodeWidth;
  const height = measured.height + geometry.rungPaddingY * 2;
  const railRightX = width;

  layout(rung.root, geometry.railLeftX + geometry.cellGapX, geometry.rungPaddingY, railRightX, geometry, nodes, wires);

  const filteredNodes = nodes.filter((node) => elementIds.size === 0 || elementIds.has(node.id));

  return {
    width,
    height,
    nodes: filteredNodes,
    wires,
  };
}
