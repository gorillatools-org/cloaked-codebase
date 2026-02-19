import { shuffle } from "lodash-es";
import type { Dot, Connection, ConnectionFinderConfig } from "../types";
import { NETWORK_CONFIG } from "../constants";
import { getDistance, hasMinimumSpacing } from "./collision";

export function findValidConnection(
  config: ConnectionFinderConfig
): Dot | null {
  const {
    dots,
    centerDot,
    existingConnections,
    connectedDotIds,
    grid,
    ratios,
    minAngularGap,
  } = config;

  const minDistance = grid.maxDistance * ratios.min * grid.spacing;
  const maxDistance = grid.maxDistance * ratios.max * grid.spacing;

  const availableDots = dots.filter((dot) => {
    if (dot.id === centerDot.id || connectedDotIds.has(dot.id)) return false;

    const isEdgeDot =
      dot.row === 0 ||
      dot.row === grid.rows - 1 ||
      dot.col === 0 ||
      dot.col === grid.cols - 1;

    if (isEdgeDot) return false;

    const distance = getDistance(dot, centerDot);
    return distance >= minDistance && distance <= maxDistance;
  });

  // Calculate angular gap for each candidate
  const dotsWithAngularGap = availableDots.map((dot) => ({
    dot,
    angularGap: getMinAngularDistance(
      centerDot,
      dot,
      existingConnections,
      dots
    ),
  }));

  // Separate into good vs poor angular gaps, then shuffle within each group
  // This ensures variety while still prioritizing well-spaced candidates
  const goodGapDots = shuffle(
    dotsWithAngularGap.filter((item) => item.angularGap >= minAngularGap)
  );
  const badGapDots = shuffle(
    dotsWithAngularGap.filter((item) => item.angularGap < minAngularGap)
  );

  // Try good gaps first (shuffled for variety), then fall back to poor gaps
  return (
    tryFindValidDot(goodGapDots, config) ?? tryFindValidDot(badGapDots, config)
  );
}

export function getAnimationDuration(length: number): number {
  return Math.min(
    NETWORK_CONFIG.ANIMATION_BASE_DURATION_S +
      length / NETWORK_CONFIG.ANIMATION_SPEED_DIVISOR,
    NETWORK_CONFIG.ANIMATION_MAX_DURATION_S
  );
}

function getMinAngularDistance(
  centerDot: Dot,
  targetDot: Dot,
  existingConnections: Connection[],
  dots: Dot[]
): number {
  if (existingConnections.length === 0) return Math.PI * 2;

  const targetAngle = Math.atan2(
    targetDot.y - centerDot.y,
    targetDot.x - centerDot.x
  );
  let minGap = Math.PI * 2;

  for (const connection of existingConnections) {
    const connectionEndDot = dots.find((dot) => dot.id === connection.to);
    if (!connectionEndDot) continue;

    const existingAngle = Math.atan2(
      connectionEndDot.y - centerDot.y,
      connectionEndDot.x - centerDot.x
    );

    let angleDifference = Math.abs(targetAngle - existingAngle);
    if (angleDifference > Math.PI) {
      angleDifference = Math.PI * 2 - angleDifference;
    }

    minGap = Math.min(minGap, angleDifference);
  }

  return minGap;
}

function tryFindValidDot(
  candidates: Array<{ dot: Dot; angularGap: number }>,
  config: ConnectionFinderConfig
): Dot | null {
  const { existingConnections, dots, tooltip, spacingPadding } = config;

  for (
    let relaxation = 0;
    relaxation < NETWORK_CONFIG.MAX_RELAXATION_LEVELS;
    relaxation++
  ) {
    for (const { dot } of candidates) {
      if (
        hasMinimumSpacing(
          dot,
          existingConnections,
          dots,
          tooltip.width,
          tooltip.scale,
          spacingPadding,
          relaxation
        )
      ) {
        return dot;
      }
    }
  }

  return null;
}
