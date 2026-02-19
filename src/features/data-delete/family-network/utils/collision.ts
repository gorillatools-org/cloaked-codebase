import type { Point, Dot, Connection } from "../types";
import { NETWORK_CONFIG } from "../constants";

export function getDistance(point1: Point, point2: Point): number {
  return Math.hypot(point2.x - point1.x, point2.y - point1.y);
}

export function hasMinimumSpacing(
  candidateDot: Point,
  existingConnections: Connection[],
  dots: Dot[],
  tooltipWidth: number,
  tooltipScale: number,
  spacingPadding: number,
  relaxationLevel: number = 0
): boolean {
  if (existingConnections.length === 0) return true;

  const minDistance = calculateMinDistance(
    tooltipWidth,
    tooltipScale,
    spacingPadding,
    relaxationLevel
  );

  return !existingConnections.some((connection) => {
    const connectionEndDot = dots.find((dot) => dot.id === connection.to);
    return (
      connectionEndDot &&
      getDistance(candidateDot, connectionEndDot) < minDistance
    );
  });
}

function calculateMinDistance(
  tooltipWidth: number,
  tooltipScale: number,
  spacingPadding: number,
  relaxationLevel: number
): number {
  const {
    MINIMUM_TOOLTIP_GAP_PX,
    MIN_TOOLTIP_OVERLAP_RATIO,
    SPACING_RELAXATION_MULTIPLIER,
    COLLISION_RELAXATION_PER_LEVEL,
  } = NETWORK_CONFIG;

  const scaledWidth = tooltipWidth * tooltipScale;
  const baseDistance = scaledWidth + spacingPadding + MINIMUM_TOOLTIP_GAP_PX;
  const floorDistance =
    scaledWidth * MIN_TOOLTIP_OVERLAP_RATIO + MINIMUM_TOOLTIP_GAP_PX;
  const relaxationReduction =
    relaxationLevel *
    SPACING_RELAXATION_MULTIPLIER *
    COLLISION_RELAXATION_PER_LEVEL;

  return Math.max(floorDistance, baseDistance - relaxationReduction);
}
