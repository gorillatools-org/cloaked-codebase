import { ref, computed, type Ref } from "vue";
import type {
  Dot,
  Connection,
  TooltipContent,
  TooltipItem,
  ZoomState,
} from "../types";
import { CENTER_ID, NETWORK_CONFIG, getNetworkSettings } from "../constants";
import { getDistance } from "../utils/collision";
import { findValidConnection, getAnimationDuration } from "../utils/connection";

type NetworkConfig = {
  isMobile: boolean;
  containerSize: { width: number; height: number };
};

const CENTER_OFFSET_KEY = "0-0";
const MS_TO_SECONDS = 1000;

export function useDataDeleteNetwork(config: Ref<NetworkConfig>) {
  const connections = ref<Connection[]>([]);
  const exposedOffsets = ref(new Set<string>());
  const highlightedOffsets = ref(new Set<string>());
  const visibleTooltipOffsets = ref(new Set<string>());
  const focusedExposedOffset = ref<string | null>(null);
  const tooltipContentByOffset = ref(new Map<string, TooltipContent>());
  const zoomState = ref<ZoomState>({ scale: 1, translateX: 0, translateY: 0 });

  const settings = computed(() => getNetworkSettings(config.value.isMobile));

  const gridDimensions = computed(() => {
    const { width, height } = config.value.containerSize;
    const { minDotSpacing: spacing } = settings.value;

    if (width === 0 || height === 0) {
      return {
        cols: NETWORK_CONFIG.DEFAULT_GRID_COLS,
        rows: NETWORK_CONFIG.DEFAULT_GRID_ROWS,
        spacing: NETWORK_CONFIG.DEFAULT_DOT_SPACING,
        offset: { x: 0, y: 0 },
      };
    }

    const rawCols = Math.floor(width / spacing);
    const rawRows = Math.floor(height / spacing);
    const cols = rawCols % 2 === 0 ? rawCols - 1 : rawCols;
    const rows = rawRows % 2 === 0 ? rawRows - 1 : rawRows;

    const horizontalSpacing = width / (cols + 1);
    const verticalSpacing = height / (rows + 1);
    const actualSpacing = Math.min(horizontalSpacing, verticalSpacing);

    const gridWidth = (cols + 1) * actualSpacing;
    const gridHeight = (rows + 1) * actualSpacing;

    return {
      cols,
      rows,
      spacing: actualSpacing,
      offset: {
        x: (width - gridWidth) / 2,
        y: (height - gridHeight) / 2,
      },
    };
  });

  const centerPosition = computed(() => {
    return {
      row: Math.floor(gridDimensions.value.rows / 2),
      col: Math.floor(gridDimensions.value.cols / 2),
    };
  });

  const centerId = computed(
    () => `${centerPosition.value.row}-${centerPosition.value.col}`
  );

  const dots = computed<Dot[]>(() => {
    const { cols, rows, spacing, offset } = gridDimensions.value;
    const { row: centerRow, col: centerCol } = centerPosition.value;

    const connectionEndpointOffsets = new Set(
      connections.value.map((c) => toOffsetKey(c.toRowOffset, c.toColOffset))
    );

    const allHighlightedOffsets = new Set([
      ...connectionEndpointOffsets,
      ...highlightedOffsets.value,
    ]);

    const gridDots: Dot[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const offsetKey = toOffsetKey(row - centerRow, col - centerCol);

        gridDots.push({
          id: `${row}-${col}`,
          x: (col + 1) * spacing + offset.x,
          y: (row + 1) * spacing + offset.y,
          row,
          col,
          isHighlighted: allHighlightedOffsets.has(offsetKey),
          isExposed: exposedOffsets.value.has(offsetKey),
        });
      }
    }

    return gridDots;
  });

  const dotsById = computed(() => {
    return new Map(dots.value.map((dot) => [dot.id, dot]));
  });

  const centerDot = computed(() => dotsById.value.get(centerId.value));

  const highlightedDotsWithTooltips = computed<TooltipItem[]>(() => {
    const items: TooltipItem[] = [];

    for (const dot of dots.value) {
      if (!dot.isHighlighted || dot.isExposed) continue;

      const offsetKey = dotToOffsetKey(dot);
      const content = tooltipContentByOffset.value.get(offsetKey);

      if (!visibleTooltipOffsets.value.has(offsetKey) || !content) continue;

      items.push({ dot, content, position: { x: dot.x, y: dot.y } });
    }

    return items;
  });

  const connectionsWithPositions = computed<Connection[]>(() => {
    return connections.value.map((connection) => {
      const fromDot =
        connection.from === CENTER_ID
          ? centerDot.value
          : dotsById.value.get(connection.from);

      const { row: centerRow, col: centerCol } = centerPosition.value;
      const targetId = `${centerRow + connection.toRowOffset}-${centerCol + connection.toColOffset}`;
      const toDot = dotsById.value.get(targetId);

      let fromX = fromDot?.x ?? connection.fromX;
      let fromY = fromDot?.y ?? connection.fromY;
      let toX = toDot?.x ?? connection.toX;
      let toY = toDot?.y ?? connection.toY;

      if (toX === fromX) toX += NETWORK_CONFIG.SVG_ALIGNED_LINE_OFFSET;
      if (toY === fromY) toY += NETWORK_CONFIG.SVG_ALIGNED_LINE_OFFSET;

      return {
        ...connection,
        to: targetId,
        fromX,
        fromY,
        toX,
        toY,
        length:
          fromDot && toDot
            ? Math.max(1, getDistance(fromDot, toDot))
            : connection.length,
      };
    });
  });

  function toOffsetKey(rowOffset: number, colOffset: number): string {
    return `${rowOffset}-${colOffset}`;
  }

  function dotToOffsetKey(dot: Dot): string {
    const { row: centerRow, col: centerCol } = centerPosition.value;
    return toOffsetKey(dot.row - centerRow, dot.col - centerCol);
  }

  function idToOffsetKey(dotId: string): string {
    const [row, col] = dotId.split("-").map(Number);
    const { row: centerRow, col: centerCol } = centerPosition.value;
    return toOffsetKey(row - centerRow, col - centerCol);
  }

  function updateDotState(
    dotOrId: Dot | string,
    stateSet: Ref<Set<string>>,
    enabled: boolean
  ): void {
    const offsetKey =
      typeof dotOrId === "string"
        ? idToOffsetKey(dotOrId)
        : dotToOffsetKey(dotOrId);
    enabled ? stateSet.value.add(offsetKey) : stateSet.value.delete(offsetKey);
  }

  function setDotExposed(dotOrId: Dot | string, exposed: boolean): void {
    updateDotState(dotOrId, exposedOffsets, exposed);
  }

  function setDotHighlight(dotOrId: Dot | string, highlighted: boolean): void {
    updateDotState(dotOrId, highlightedOffsets, highlighted);
  }

  function restoreFocusedExposedDot(): void {
    if (!focusedExposedOffset.value) return;

    highlightedOffsets.value.delete(focusedExposedOffset.value);
    exposedOffsets.value.add(focusedExposedOffset.value);
    focusedExposedOffset.value = null;
  }

  function zoomToDot(dot: Dot): void {
    restoreFocusedExposedDot();

    const offsetKey = dotToOffsetKey(dot);

    if (dot.isExposed && offsetKey !== CENTER_OFFSET_KEY) {
      focusedExposedOffset.value = offsetKey;
      exposedOffsets.value.delete(offsetKey);
      highlightedOffsets.value.add(offsetKey);
      visibleTooltipOffsets.value.add(offsetKey);
    }

    const { width, height } = config.value.containerSize;
    const { zoomLevel, zoomCenterYOffset } = settings.value;

    zoomState.value = {
      scale: zoomLevel,
      translateX: Math.round(width / 2 - dot.x * zoomLevel),
      translateY: Math.round(
        height / 2 + height * zoomCenterYOffset - dot.y * zoomLevel
      ),
    };
  }

  function resetZoom(): void {
    restoreFocusedExposedDot();
    zoomState.value = { scale: 1, translateX: 0, translateY: 0 };
  }

  function connectWithContent(content: TooltipContent): boolean {
    const center = centerDot.value;
    if (!center) return false;

    const { rows, cols, spacing } = gridDimensions.value;
    const { row: centerRow, col: centerCol } = centerPosition.value;

    const maxGridDistance = Math.max(
      centerRow,
      rows - centerRow - 1,
      centerCol,
      cols - centerCol - 1
    );

    const connectedDotIds = new Set(
      connectionsWithPositions.value
        .filter((c) => c.from === CENTER_ID)
        .map((c) => c.to)
    );

    const targetDot = findValidConnection({
      dots: dots.value,
      centerDot: center,
      existingConnections: connectionsWithPositions.value,
      connectedDotIds,
      grid: { rows, cols, maxDistance: maxGridDistance, spacing },
      ratios: settings.value.connectionRadiusRatios,
      tooltip: {
        width: settings.value.tooltipWidth,
        scale: settings.value.tooltipScale,
      },
      spacingPadding: settings.value.spacingPadding,
      minAngularGap: settings.value.minAngularGap,
    });

    if (!targetDot) return false;

    createConnection(targetDot, content);
    return true;
  }

  function createConnection(targetDot: Dot, content: TooltipContent): void {
    const center = centerDot.value;
    if (!center) return;

    const { row: centerRow, col: centerCol } = centerPosition.value;
    const rowOffset = targetDot.row - centerRow;
    const colOffset = targetDot.col - centerCol;
    const offsetKey = toOffsetKey(rowOffset, colOffset);

    highlightedOffsets.value.add(offsetKey);
    tooltipContentByOffset.value.set(offsetKey, content);

    const lineLength = Math.max(1, getDistance(targetDot, center));

    let toX = targetDot.x;
    let toY = targetDot.y;
    if (toX === center.x) toX += NETWORK_CONFIG.SVG_ALIGNED_LINE_OFFSET;
    if (toY === center.y) toY += NETWORK_CONFIG.SVG_ALIGNED_LINE_OFFSET;

    setTimeout(() => {
      connections.value.push({
        id: `${CENTER_ID}-${rowOffset}-${colOffset}`,
        from: CENTER_ID,
        to: targetDot.id,
        toRowOffset: rowOffset,
        toColOffset: colOffset,
        fromX: center.x,
        fromY: center.y,
        toX,
        toY,
        length: lineLength,
      });

      setTimeout(
        () => visibleTooltipOffsets.value.add(offsetKey),
        getAnimationDuration(lineLength) * MS_TO_SECONDS
      );
    }, settings.value.connectionDelay);
  }

  function isConnectionExposed(connection: Connection): boolean {
    if (connection.from !== CENTER_ID) return false;

    const targetOffsetKey = toOffsetKey(
      connection.toRowOffset,
      connection.toColOffset
    );
    return (
      exposedOffsets.value.has(CENTER_OFFSET_KEY) &&
      exposedOffsets.value.has(targetOffsetKey)
    );
  }

  function handleDotClick(event: MouseEvent, dot: Dot): void {
    event.stopPropagation();

    const offsetKey = dotToOffsetKey(dot);
    if (offsetKey === CENTER_OFFSET_KEY) return;

    if (dot.isHighlighted || dot.isExposed) {
      zoomToDot(dot);
    } else if (zoomState.value.scale > 1) {
      resetZoom();
    }
  }

  function handleTooltipClick(dot: Dot): void {
    zoomState.value.scale > 1 ? resetZoom() : zoomToDot(dot);
  }

  function handleContainerClick(event: MouseEvent): void {
    if (!(event.target as HTMLElement).closest("[data-network-interactive]")) {
      resetZoom();
    }
  }

  return {
    connections,
    connectionsWithPositions,
    dots,
    centerDot,
    highlightedDotsWithTooltips,
    zoomState,
    settings,
    containerSize: computed(() => config.value.containerSize),
    centerId,
    connectWithContent,
    zoomToDot,
    resetZoom,
    isConnectionExposed,
    handleDotClick,
    handleTooltipClick,
    handleContainerClick,
    setDotHighlight,
    setDotExposed,
    getAnimationDuration,
  };
}
