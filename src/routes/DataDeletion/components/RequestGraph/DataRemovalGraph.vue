<script setup>
import * as d3 from "d3";
import { computed, onMounted, ref, watch, onBeforeUnmount } from "vue";
import DataRemovalGraphTooltip from "@/routes/DataDeletion/components/RequestGraph/DataRemovalGraphTooltip.vue";

const props = defineProps({
  data: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(
        (line) =>
          typeof line.label === "string" &&
          Array.isArray(line.points) &&
          line.points.every(
            (item) =>
              Object.prototype.hasOwnProperty.call(item, "x") &&
              item.x instanceof Date &&
              Object.prototype.hasOwnProperty.call(item, "y") &&
              typeof item.y === "number"
          )
      );
    },
  },
  lineColors: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every((color) => typeof color === "string");
    },
  },
  activeSeries: {
    type: String,
    required: false,
    default: null,
  },
});

const tooltip = ref(null);
const tooltipData = ref(null);
const tooltipLeft = ref(0);
const shouldDrawInnerLines = ref(true);
const chartDrawn = ref(false);
const isLoading = ref(true); // Add loading state
const hasValidContainerSize = ref(false);

const margin = { top: 25, right: 10, bottom: 25, left: 10 };

const container = computed(() =>
  d3.select(".data-removal-graph_chart-container")
);

const stackedData = computed(() => {
  const stack = d3
    .stack()
    .keys(d3.range(props.data.length))
    .value((d, key) => d[key].y)
    .order(d3.stackOrderReverse); // Reverse the order of stacking

  const layers = stack(d3.transpose(props.data.map((line) => line.points)));

  // Transfer the isExtrapolated flag from the original data to the stacked data
  return layers.map((layer, i) => {
    return layer.map((d, j) => {
      // Copy the isExtrapolated flag from the corresponding original data point
      d.isExtrapolated = props.data[i].points[j].isExtrapolated;
      // Add the original data point for reference
      d.data = [props.data[i].points[j]];
      return d;
    });
  });
});

onMounted(() => {
  drawSkeleton();
  window.addEventListener("resize", drawChart);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", drawChart);
});

function setupChartDimensions() {
  const containerWidth = container?.value
    ?.node()
    ?.getBoundingClientRect()?.width;
  const containerHeight = container.value
    ?.node()
    ?.getBoundingClientRect()?.height;

  const width = containerWidth - margin.left - margin.right;
  const height = containerHeight - margin.top - margin.bottom;

  const svg = d3
    .select("#myChart")
    .attr("height", height + margin.top + margin.bottom)
    .attr("width", width + margin.left + margin.right)
    .select("g");

  if (!svg.empty()) {
    svg.remove();
  }

  const chartGroup = d3
    .select("#myChart")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  return { width, height, chartGroup };
}

function drawSkeleton() {
  const { width, height, chartGroup } = setupChartDimensions();
  if (width <= 0 || height <= 0) return;
  hasValidContainerSize.value = true;
  // Draw skeleton lines
  const skeletonLines = 3;
  const skeletonLineHeight = height / (skeletonLines - 1);
  for (let i = 0; i < skeletonLines; i++) {
    chartGroup
      .append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", i * skeletonLineHeight)
      .attr("y2", i * skeletonLineHeight)
      .style("stroke", "lightgrey");
  }

  chartGroup
    .append("line")
    .attr("class", "vertical-line-highlight")
    .attr("x1", 0)
    .attr("x2", 0)
    .attr("y1", 0)
    .attr("y2", height)
    .style("stroke", "lightgrey")
    .style("stroke-dasharray", "2,2")
    .style("opacity", 1);

  chartGroup
    .append("line")
    .attr("class", "vertical-line-highlight")
    .attr("x1", width)
    .attr("x2", width)
    .attr("y1", 0)
    .attr("y2", height)
    .style("stroke", "lightgrey")
    .style("stroke-dasharray", "2,2")
    .style("opacity", 1);
}

function drawChart() {
  isLoading.value = false;
  const { width, height, chartGroup } = setupChartDimensions();
  const allData = props.data.flatMap((line) => line.points);
  const x = d3
    .scaleTime()
    .domain(d3.extent(allData, (d) => d?.x))
    .range([0, width]);

  const sumYValues = {};
  allData.forEach((d) => {
    const xValue = d.x;
    if (!sumYValues[xValue]) {
      sumYValues[xValue] = 0;
    }
    sumYValues[xValue] += d.y;
  });

  const yMax = d3.max(Object.values(sumYValues));
  // Add 10% buffer and round to the next highest 100
  const yDomainMaxRounded = Math.ceil((yMax * 1.1) / 100) * 100;

  // Only create tick values for top and bottom if shouldDrawInnerLines is false
  let yTickValues = [0, yDomainMaxRounded];

  // Create more tick values (every 20% of max) if inner lines should be drawn
  if (shouldDrawInnerLines.value) {
    const tickStep = yDomainMaxRounded / 5;
    yTickValues = [0];
    for (let i = 1; i <= 5; i++) {
      yTickValues.push(tickStep * i);
    }
  }

  const y = d3.scaleLinear().domain([0, yDomainMaxRounded]).range([height, 0]);

  const yAxis = d3
    .axisLeft(y)
    .tickValues(yTickValues)
    .tickSize(-width)
    .tickPadding(0);

  drawAxes(chartGroup, x, y, yAxis, width, height, yDomainMaxRounded);
  drawAreas(chartGroup, x, y);
  drawLines(chartGroup, x, y);
  drawHoverEffects(chartGroup, x, y, width, height, allData);
  drawYAxisLabels(chartGroup, yAxis, margin);
}

function drawAxes(chartGroup, x, y, yAxis, width, height, yMax) {
  // Add y-axis with grid lines
  const axis = chartGroup
    .append("g")
    .call(yAxis)
    .attr("class", "data-removal-graph_y-axis");

  // Adjust opacity of grid lines based on their y-position
  axis.selectAll(".tick line").each(function (d) {
    const opacity = d === yMax || d === 0 ? 0.5 : 0.15; // Top and bottom lines more visible, others very faint
    d3.select(this)
      .style("stroke-opacity", opacity)
      .style("stroke-dasharray", d === yMax || d === 0 ? "none" : "1,0");
  });

  // Don't hide tick text, we'll use it for our custom labels
  // axis.selectAll(".tick text").style("display", "none");
}

function drawAreas(chartGroup, x, y) {
  const area = d3
    .area()
    .x((d) => x(d.data[0].x))
    .y0((d) => y(d[0]))
    .y1((d) => y(d[1]))
    .curve(d3.curveMonotoneX);

  chartGroup
    .selectAll(".data-removal-graph_area")
    .data(stackedData.value)
    .enter()
    .append("path")
    .attr("class", "data-removal-graph_area")
    .attr("d", area)
    .style("fill", (d, i) => props.lineColors[i])
    .style("opacity", 0);
}

function drawLines(chartGroup, x, y) {
  // Create a single line generator for all data points
  const line = d3
    .line()
    .x((d) => x(d.data[0].x))
    .y((d) => y(d[1]))
    .curve(d3.curveMonotoneX);

  // Create paths for each dataset
  const path = chartGroup
    .selectAll(".data-removal-graph_line")
    .data(stackedData.value)
    .enter()
    .append("path")
    .attr("class", "data-removal-graph_line")
    .attr("d", line)
    .style("stroke", (d, i) => props.lineColors[i])
    .style("fill", "none");

  // // Add a transparent path for each line that will be used to detect hover events
  // const hoverPath = chartGroup
  //   .selectAll(".data-removal-graph_hover_path")
  //   .data(stackedData.value)
  //   .enter()
  //   .append("path")
  //   .attr("class", "data-removal-graph_hover_path")
  //   .attr("d", line)
  //   .style("stroke", "transparent")
  //   .style("stroke-width", 10)
  //   .style("fill", "none");

  // Animate the drawing of the lines
  path
    .attr("stroke-dasharray", function () {
      return this.getTotalLength();
    })
    .attr("stroke-dashoffset", function () {
      return this.getTotalLength();
    })
    .transition()
    .duration(1000)
    .ease(d3.easeCircleIn)
    .attr("stroke-dashoffset", 0)
    .on("end", () => {
      chartDrawn.value = true;

      // After the animation completes, modify the style of extrapolated segments
      path.each(function (d, i) {
        const lineColor = props.lineColors[i];

        // Ensure the base path has the correct color
        d3.select(this).style("stroke", lineColor);

        const lineData = d;

        // Find transition point from actual to extrapolated data
        let transitionPoint = null;

        for (let j = 0; j < lineData.length - 1; j++) {
          if (!lineData[j].isExtrapolated && lineData[j + 1].isExtrapolated) {
            transitionPoint = j + 1;
            break;
          }
        }

        // If we have a transition point, adjust the segment styling
        if (transitionPoint !== null) {
          const point = lineData[transitionPoint - 1];
          const nextPoint = lineData[transitionPoint];

          const xPos1 = x(point.data[0].x);
          const yPos1 = y(point[1]);
          const xPos2 = x(nextPoint.data[0].x);
          const yPos2 = y(nextPoint[1]);

          // Create the gradient for this path
          const gradientId = `line-gradient-${i}`;

          const gradient = chartGroup
            .append("linearGradient")
            .attr("id", gradientId)
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", xPos1)
            .attr("y1", yPos1)
            .attr("x2", xPos2)
            .attr("y2", yPos2);

          gradient
            .append("stop")
            .attr("offset", "0%")
            .attr("stop-color", lineColor)
            .attr("stop-opacity", 1);

          gradient
            .append("stop")
            .attr("offset", "100%")
            .attr("stop-color", lineColor)
            .attr("stop-opacity", 0.5);

          // Apply gradient to the line
          d3.select(this)
            .style("stroke", `url(#${gradientId})`)
            .style("stroke-opacity", function (d, i) {
              const lineLabel = props.data[i]?.label;
              return props.activeSeries && props.activeSeries !== lineLabel
                ? 0.3
                : 1;
            });

          // Create clipping paths for extrapolated segments
          const clipId = `clip-extrapolated-${i}`;
          const clipPath = chartGroup.append("clipPath").attr("id", clipId);

          clipPath
            .append("path")
            .attr("d", line(lineData.slice(transitionPoint)));

          // Create an overlay path for the extrapolated part with reduced opacity
          chartGroup
            .append("path")
            .attr("d", line(lineData))
            .attr("clip-path", `url(#${clipId})`)
            .style("stroke", lineColor)
            .style("fill", "none")
            .style(
              "opacity",
              props.activeSeries && props.activeSeries !== props.data[i]?.label
                ? 0.15
                : 0.5
            );
        }
      });
    });

  // Set initial opacity based on active series
  path.style("opacity", (d, i) => {
    if (i >= props.data.length) return 1; // Guard against out-of-bounds
    const lineLabel = props.data[i]?.label;
    return props.activeSeries && props.activeSeries !== lineLabel ? 0.3 : 1;
  });
}

function drawCircles(chartGroup, x, y, closestData) {
  const circlesData = stackedData.value
    .map((layer, index) => {
      const dataPoint = layer.find(
        (d) => d.data[0].x.getTime() === closestData.x.getTime()
      );
      return dataPoint
        ? {
            x: dataPoint.data[0].x,
            y: dataPoint[1],
            color: props.lineColors[index], // Reverse the color order
          }
        : null;
    })
    .filter((d) => d !== null);

  const circles = chartGroup
    .selectAll(".data-removal-graph_circle")
    .data(circlesData, (d) => d.x); // Use x value as key

  // Handle the enter selection
  circles
    .enter()
    .append("circle")
    .attr("class", "data-removal-graph_circle")
    .attr("r", 5) // Increase circle radius
    .style("fill", (d) => d.color)
    .merge(circles) // Merge enter and update selections
    .attr("cx", (d) => x(d.x))
    .attr("cy", (d) => y(d.y))
    .style("display", "block");

  // Handle the exit selection
  circles.exit().remove();

  return circles;
}

function drawTooltip(tooltipElement, closestData, x) {
  const tooltipOffset = -10; // Add an offset to the tooltip left
  const tooltipLeftValue =
    x(closestData.x) -
    tooltipElement?.node()?.getBoundingClientRect().width +
    tooltipOffset;
  const tooltipRightValue = x(closestData.x) + tooltipOffset * -3;

  // Check if this is an extrapolated data point
  const isExtrapolated = closestData.isExtrapolated || false;

  tooltipData.value = {
    formattedDate: d3.timeFormat("%a %b %d, %Y")(closestData.x),
    isExtrapolated: isExtrapolated,
    data: props.data
      .map((line, index) => {
        const point = line.points.find(
          (item) => item.x.getTime() === closestData.x.getTime()
        );
        return {
          label: line.label,
          value: point?.y,
          color: props.lineColors[index],
          isExtrapolated: point?.isExtrapolated || false,
        };
      })
      .filter((item) => item.value !== undefined),
  };
  tooltipLeft.value =
    tooltipLeftValue < 0 ? tooltipRightValue : tooltipLeftValue;
  tooltipElement?.transition().duration(0).style("opacity", 1);
}

function drawHoverEffects(chartGroup, x, y, width, height) {
  const hoverLine = chartGroup
    .append("line")
    .attr("class", "data-removal-graph_hover-line");
  const tooltipElement = d3.select(tooltip?.value?.$el);

  container.value
    .on("mousemove", function (event) {
      const [mouseX] = d3.pointer(event);
      const adjustedMouseX = mouseX - margin.left;

      const closestData = props.data
        .flatMap((line) => line.points)
        .reduce((prev, curr) => {
          return Math.abs(x(curr.x) - adjustedMouseX) <
            Math.abs(x(prev.x) - adjustedMouseX)
            ? curr
            : prev;
        });

      drawCircles(chartGroup, x, y, closestData);

      hoverLine
        .attr("x1", x(closestData.x))
        .attr("x2", x(closestData.x))
        .attr("y1", 0)
        .attr("y2", height)
        .style("display", "block")
        .style("stroke", "darkgray")
        .style("stroke-dasharray", "3,0");

      drawTooltip(tooltipElement, closestData, x, y, width);
    })
    .on("click", function (event) {
      const [mouseX] = d3.pointer(event);
      const adjustedMouseX = mouseX - margin.left;

      const closestData = props.data
        .flatMap((line) => line.points)
        .reduce((prev, curr) => {
          return Math.abs(x(curr.x) - adjustedMouseX) <
            Math.abs(x(prev.x) - adjustedMouseX)
            ? curr
            : prev;
        });

      drawCircles(chartGroup, x, y, closestData);

      hoverLine
        .attr("x1", x(closestData.x))
        .attr("x2", x(closestData.x))
        .attr("y1", 0)
        .attr("y2", height)
        .style("display", "block")
        .style("stroke", "darkgray")
        .style("stroke-dasharray", "3,0");

      drawTooltip(tooltipElement, closestData, x, y, width);
    })
    .on("mouseout", function (event) {
      if (!event.relatedTarget || !this.contains(event.relatedTarget)) {
        chartGroup
          .selectAll(".data-removal-graph_circle")
          .style("display", "none");
        hoverLine.style("display", "none");
        tooltipElement?.transition().duration(300).style("opacity", 0);
      }
    });
}

function drawYAxisLabels(chartGroup, yAxis, margin) {
  const newGroup = chartGroup
    .append("g")
    .attr("transform", `translate(-${margin.left}, -${margin.top})`);

  // Get all y-axis text elements
  const yAxisTexts = chartGroup.selectAll(".data-removal-graph_y-axis text");

  // Get only the first (bottom) and last (top) elements
  const firstText = yAxisTexts.nodes()[0];
  const lastText = yAxisTexts.nodes()[yAxisTexts.size() - 1];

  // Process only the top and bottom labels
  [firstText, lastText].forEach(function (node) {
    if (!node) return; // Skip if node doesn't exist

    const text = d3.select(node);
    const bbox = node.getBBox();
    const shift = 0;
    const parentTransform = node.parentNode.getCTM();
    const absoluteX = parentTransform.e;
    const absoluteY = bbox.y + parentTransform.f;
    text.style("display", "none");

    newGroup
      .append("rect")
      .attr("x", absoluteX - 6 + shift)
      .attr("y", absoluteY)
      .attr("width", bbox.width + 12)
      .attr("height", bbox.height + 4)
      .attr("rx", 8)
      .attr("ry", 8)
      .attr("class", "y-axis-bubble")
      .style("opacity", 0) // Start with opacity 0 for animation
      .transition()
      .duration(500)
      .style("opacity", 1); // Animate to final opacity

    newGroup
      .append("text")
      .attr("x", absoluteX + shift + bbox.width / 2)
      .attr("y", absoluteY + bbox.height / 2 + 4)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("opacity", 0) // Start with opacity 0 for animation
      .text(text.text())
      .attr("font-size", "12px")
      .attr("class", "y-axis-text")
      .transition()
      .duration(500)
      .style("opacity", 1); // Animate to final opacity
  });

  // Hide all other y-axis labels
  yAxisTexts.style("display", "none");
}

function checkContainerSize() {
  const containerWidth = container.value.node()?.getBoundingClientRect()?.width;
  const containerHeight = container.value
    .node()
    ?.getBoundingClientRect()?.height;

  if (containerWidth > 0 && containerHeight > 0) {
    hasValidContainerSize.value = true;
    if (props.data.length) {
      drawChart();
    } else {
      drawSkeleton();
    }
  } else {
    requestAnimationFrame(checkContainerSize);
  }
}

watch(
  () => props.activeSeries,
  (newVal, oldVal) => {
    if (newVal !== oldVal && chartDrawn.value) {
      const svg = d3.select("#myChart");

      // Update main lines opacity
      svg
        .selectAll(".data-removal-graph_line")
        .transition()
        .duration(300)
        .style("stroke-opacity", (d, i) => {
          if (!props.data[i]) return 1; // Guard against out-of-bounds
          const lineLabel = props.data[i].label;
          return props.activeSeries && props.activeSeries !== lineLabel
            ? 0.3
            : 1;
        });

      // Update extrapolated segments opacity
      svg
        .selectAll(
          "path:not(.data-removal-graph_line):not(.data-removal-graph_hover_path)"
        )
        .filter(function () {
          // Only select paths that have opacity set (extrapolated segments)
          return (
            d3.select(this).style("opacity") !== "" &&
            d3.select(this).style("opacity") !== "0"
          );
        })
        .transition()
        .duration(300)
        .style("opacity", function (d, i) {
          // Try to get the index from the clip-path attribute
          const clipPathAttr = this.getAttribute("clip-path");
          let index = -1;

          if (clipPathAttr) {
            const match = clipPathAttr.match(/clip-extrapolated-(\d+)/);
            if (match && match[1]) {
              index = parseInt(match[1]);
            }
          }

          // If we couldn't get an index, use the iteration index
          if (index === -1 || index >= props.data.length) {
            if (i >= props.data.length) return 0.5;
            index = i;
          }

          const lineLabel = props.data[index]?.label;
          return props.activeSeries && props.activeSeries !== lineLabel
            ? 0.15
            : 0.5;
        });

      // Update areas
      svg
        .selectAll(".data-removal-graph_area")
        .transition()
        .duration(300)
        .style("opacity", (d, i) => {
          if (!props.data[i]) return 0; // Guard against out-of-bounds
          const lineLabel = props.data[i].label;
          return props.activeSeries && props.activeSeries === lineLabel
            ? 0.7
            : 0;
        });
    }
  },
  { deep: true, immediate: true }
);

watch(
  () => props.data,
  (value) => {
    if (value?.length) {
      setTimeout(checkContainerSize, 2000);
    }
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <div class="data-removal-graph_chart-container">
    <svg id="myChart" />
    <div class="data-removal-graph_tooltip-container">
      <DataRemovalGraphTooltip
        ref="tooltip"
        class="data-removal-graph_tooltip"
        :tooltip-data="tooltipData"
        :tooltip-left="tooltipLeft"
      />
    </div>
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.data-removal-graph_chart-container {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: crosshair;
}

.data-removal-graph_line {
  fill: none;
  stroke-width: 3.5;
}

.data-removal-graph_hover_path {
  cursor: pointer;
  pointer-events: all;
  stroke-width: 12;
}

.data-removal-graph_extrapolated_line {
  fill: none;
  stroke-width: 3.5;
}

.data-removal-graph_tooltip-container {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  top: 0px;
}

.data-removal-graph_tooltip {
  position: relative;
  background-color: transparent;
  border: 1px solid $color-primary-10;
  opacity: 0;
  padding: 10px;
  pointer-events: auto;
  font-size: 12px;
  color: $color-primary-100;
  cursor: pointer;
  box-shadow: 0 0 10px rgba($black, 0.1);
  border-radius: 5px;
}

.data-removal-graph_circle {
  display: none;
}

.data-removal-graph_hover-line {
  stroke: lightgrey;
  stroke-width: 1;
  stroke-dasharray: 3, 3;
  display: none;
}

.data-removal-graph_y-axis path {
  stroke-width: 0;
}

.tick-text,
.tick text {
  font-size: 12px;
  fill: $color-primary-100;
}

.tick line {
  stroke: $color-primary-70;
  stroke-width: 1px;
  shape-rendering: crispEdges;
}

.tick-text,
.tick text {
  font-size: 12px;
  fill: $color-primary-100;
}

.tooltip-line {
  position: absolute;
  height: 1px;
  display: none;
}

.vertical-line {
  stroke: $color-primary-70;
  stroke-width: 1;
  stroke-dasharray: 2, 2;
}

.y-axis-bubble {
  fill: $color-primary-5;
  stroke: $color-primary-100;
}

.y-axis-text {
  fill: $color-primary-100;
}
</style>
