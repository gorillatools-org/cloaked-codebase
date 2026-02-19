<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
  onBeforeMount,
} from "vue";
// @ts-ignore - D3 types not available
import * as d3 from "d3";
import moment from "moment";
import { debounce } from "lodash-es";
import VCBaseCard from "@/features/VirtualCards/base/card/VCBaseCard.vue";
import BaseText from "@/library/BaseText.vue";
import { formatCurrency } from "@/features/VirtualCards/utils/currency-utils";
import { posthogCapture } from "@/scripts/posthog";
import type { WeeklyBreakdown } from "@/types/Wallet/weekly-breakdown";
import CardsServices from "@/api/actions/cards-services";
import { useToast } from "@/composables/useToast";
import { useMounted } from "@vueuse/core";
import store from "@/store";

type DailyPurchaseData = {
  date: Date;
  totalAmountInCents: number;
  dayLabel: string;
  totalPurchases: number;
};

type WeeklyData = {
  dailyData: DailyPurchaseData[];
  weeklyTotalInCents: number;
  totalPurchases: number;
};

const UNFILLED_BAR_COLOR = "var(--color-base-black-10, #0000001A)";
const FILL_BAR_COLOR = "var(--color-primary-100, #000000)";
const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

const toast = useToast();
const container = ref<HTMLElement | null>(null);
const isMounted = useMounted();
const isLoading = ref(true);
const weeklyBreakdownData = ref<WeeklyBreakdown | null>(null);

const user = computed(() => {
  return store.state.authentication?.user;
});

const weekTitle = computed(() => {
  if (weeklyBreakdownData.value?.monday?.date) {
    const mondayDate = moment.utc(weeklyBreakdownData.value.monday.date);
    return `Week of ${mondayDate.format("MMM D, YYYY")}`;
  }
  // Show current week during loading
  const currentWeekStart = moment.utc().startOf("isoWeek");
  return `Week of ${currentWeekStart.format("MMM D, YYYY")}`;
});

const summaryParts = computed(() => {
  if (!weeklyPurchaseData.value?.totalPurchases)
    return { text: "No purchases this week.", amount: "", purchaseCount: "" };

  const purchaseCount = weeklyPurchaseData.value.totalPurchases;
  const totalAmount = formatCurrency(
    weeklyPurchaseData.value.weeklyTotalInCents
  );

  return {
    text: ` purchases this week totaling `,
    amount: totalAmount,
    purchaseCount: purchaseCount.toString(),
  };
});

const weeklyPurchaseData = computed((): WeeklyData => {
  // Always build a 7-day scaffold so the chart can render labels/bars
  if (!weeklyBreakdownData.value) {
    // Return zeroed structure when no data is available
    // Use current week for proper X-axis positioning during loading
    const currentWeekStart = moment.utc().startOf("isoWeek");
    const zeroDailyData: DailyPurchaseData[] = Array.from(
      { length: 7 },
      (_, i) => ({
        date: currentWeekStart.clone().utc().add(i, "days").toDate(),
        totalAmountInCents: 0,
        totalPurchases: 0,
        dayLabel: WEEKDAY_LABELS[i],
      })
    );

    return {
      dailyData: zeroDailyData,
      weeklyTotalInCents: 0,
      totalPurchases: 0,
    };
  }

  // Build week daily data from API response
  const data: DailyPurchaseData[] = [];
  let weekTotal = 0;
  let totalPurchases = 0;

  // Process each day in the API response
  const breakdown = weeklyBreakdownData.value;
  const days = [
    breakdown.monday,
    breakdown.tuesday,
    breakdown.wednesday,
    breakdown.thursday,
    breakdown.friday,
    breakdown.saturday,
    breakdown.sunday,
  ];

  days.forEach((day, index) => {
    // Calculate net amount: settled - refunded
    const dayDate = moment.utc(day.date).toDate();
    const netAmount = day.settled.total_amount - day.refunded.total_amount;
    const totalAmountInCents = Math.max(0, netAmount);
    const purchases = day.settled.count;

    weekTotal += totalAmountInCents;
    totalPurchases += purchases;

    data.push({
      date: dayDate,
      totalAmountInCents,
      totalPurchases: purchases,
      dayLabel: WEEKDAY_LABELS[index],
    });
  });

  return {
    dailyData: data,
    weeklyTotalInCents: weekTotal,
    totalPurchases,
  };
});

onBeforeMount(() => {
  fetchWeeklyBreakdown();
});

onMounted(() => {
  window.addEventListener("resize", debouncedResize, { passive: true });
  drawChart();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", debouncedResize);
  debouncedResize.cancel();
});

const debouncedResize = debounce(() => {
  drawChart();
}, 150);

const fetchWeeklyBreakdown = async () => {
  isLoading.value = true;
  CardsServices.getWeeklyBreakdown()
    .then((response) => {
      weeklyBreakdownData.value = response as WeeklyBreakdown;
    })
    .catch(() => {
      if (!user.value || !isMounted.value) {
        return;
      }

      toast.error(
        "We were unable to fetch the weekly breakdown. Please try again later."
      );
      weeklyBreakdownData.value = null;
    })
    .finally(() => {
      isLoading.value = false;
    });
};

function createXAxis(weekData: WeeklyData, width: number) {
  return d3
    .scaleBand()
    .domain(weekData.dailyData.map((d) => d.date.toISOString()))
    .range([0, width])
    .paddingInner(0.7)
    .paddingOuter(0);
}

function setupChartDimensions() {
  const containerElement = container?.value as HTMLElement | null;
  if (!containerElement) {
    return { width: 0, height: 0, chartGroup: null };
  }

  const margin = { top: 58, right: 0, bottom: 76, left: 0 };

  const containerWidth = containerElement.getBoundingClientRect().width;
  const containerHeight = containerElement.getBoundingClientRect().height;

  const width = containerWidth - margin.left - margin.right;
  const height = containerHeight - margin.top - margin.bottom;

  d3.select("#purchasesChart")
    .attr("viewBox", `0 0 ${width} ${height + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid slice")
    .style("width", "100%")
    .style("height", "100%");

  const chartGroup = d3
    .select("#purchasesChart")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  return { width, height, chartGroup };
}

function createTooltip(containerEl: HTMLElement | null) {
  return d3
    .select(containerEl)
    .append("div")
    .attr("id", "chart-tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-color", "var(--color-base-black-15)")
    .style("border-width", "1px")
    .style("border-radius", "8px")
    .style("padding", "6px")
    .style("box-shadow", "0 4px 12px rgba(0, 0, 0, 0.15)")
    .style("z-index", "1000")
    .style("pointer-events", "none");
}

function setTooltipContent(tooltipElement: any, dayData: DailyPurchaseData) {
  const dayName = moment.utc(dayData.date).format("MMM D");
  const amount = formatCurrency(dayData.totalAmountInCents);
  const purchases = dayData.totalPurchases;

  tooltipElement.html(`
    <div class="tooltip-title">${dayName}</div>
    <div class="tooltip-amount">${amount}</div>
    <div class="tooltip-subtitle">${purchases} ${purchases === 1 ? "purchase" : "purchases"}</div>
  `);
}

function positionTooltip(
  event: MouseEvent,
  containerEl: HTMLElement | null,
  tooltipElement: any
) {
  const containerRect = containerEl?.getBoundingClientRect();
  const tooltipNode = tooltipElement.node() as HTMLElement | null;
  if (!containerRect || !tooltipNode) return;

  const tooltipWidth = tooltipNode.offsetWidth;
  const tooltipHeight = tooltipNode.offsetHeight;

  const mouseX = event.clientX - containerRect.left;
  const mouseY = event.clientY - containerRect.top;

  let tooltipX = mouseX + 20;
  let tooltipY = mouseY - 10;
  let offset = 60;

  if (tooltipX + offset + tooltipWidth > containerRect.width) {
    tooltipX = mouseX - tooltipWidth - 10;
  }

  if (tooltipY + tooltipHeight > containerRect.height) {
    tooltipY = mouseY - tooltipHeight - 10;
  }
  if (tooltipY < 0) tooltipY = 4;

  tooltipElement.style("top", `${tooltipY}px`).style("left", `${tooltipX}px`);
}

function getXAndBarWidth(XAxis: any, dateISO: string) {
  return { x: XAxis(dateISO) || 0, barWidth: XAxis.bandwidth() };
}

function drawUnfilledBar(
  parent: any,
  x: number,
  barWidth: number,
  height: number
) {
  return parent
    .append("rect")
    .attr("class", "bar-background")
    .attr("x", x)
    .attr("y", 0)
    .attr("width", barWidth)
    .attr("height", height)
    .style("fill", UNFILLED_BAR_COLOR);
}

function drawFilledBar(
  parent: any,
  x: number,
  barWidth: number,
  height: number,
  unfilledHeight: number
) {
  const bar = parent
    .append("rect")
    .attr("class", "bar-foreground")
    .attr("x", x)
    .attr("width", barWidth)
    .attr("y", height)
    .attr("height", 0)
    .style("fill", FILL_BAR_COLOR);

  bar
    .transition()
    .duration(800)
    .ease(d3.easeCubicOut)
    .attr("y", unfilledHeight)
    .attr("height", height - unfilledHeight);

  return bar;
}

function attachBarInteractions(
  barGroup: any,
  dayData: DailyPurchaseData,
  tooltipElement: any
) {
  barGroup
    .on("mouseover", function (this: HTMLElement) {
      setTooltipContent(tooltipElement, dayData);
      d3.select(this).select(".bar-foreground").style("fill", "#2DA9FF");
      d3.select(this).select(".bar-background").style("opacity", 0.7);
      tooltipElement.style("visibility", "visible");
    })
    .on("mousemove", function (this: HTMLElement, event: MouseEvent) {
      positionTooltip(event, container.value, tooltipElement);
    })
    .on("mouseout", function (this: HTMLElement) {
      tooltipElement.style("visibility", "hidden");
      d3.select(this).select(".bar-foreground").style("fill", FILL_BAR_COLOR);
      d3.select(this).select(".bar-background").style("opacity", 1);
    })
    .on("click", function () {
      posthogCapture("pay_weekly_chart_bar_tapped");
    });
}

function drawDayLabels(
  chartGroup: any,
  XAxis: any,
  weekData: WeeklyData,
  height: number
) {
  const dayLabelsGroup = chartGroup
    .append("g")
    .selectAll(".day-label")
    .data(weekData.dailyData);

  dayLabelsGroup
    .join("text")
    .text((d: DailyPurchaseData) => d.dayLabel)
    .attr("class", "day-label")
    .attr(
      "x",
      (d: DailyPurchaseData) =>
        (XAxis(d.date.toISOString()) || 0) + XAxis.bandwidth() / 2
    )
    .attr("y", height + 17)
    .attr("text-anchor", "middle")
    .style("font-family", "'Urbanist', sans-serif")
    .style("font-size", "14px")
    .style("font-weight", "600")
    .style("fill", FILL_BAR_COLOR)
    .style("text-transform", "uppercase");

  dayLabelsGroup.exit().remove();
}

function drawFilledBars(
  chartGroup: any,
  XAxis: any,
  weekData: WeeklyData,
  height: number,
  tooltipElement: any
) {
  const maxDailyAmount = Math.max(
    ...weekData.dailyData.map((d) => d.totalAmountInCents)
  );

  weekData.dailyData.forEach((dayData: DailyPurchaseData) => {
    const { x, barWidth } = getXAndBarWidth(XAxis, dayData.date.toISOString());

    const proportion =
      maxDailyAmount > 0 ? dayData.totalAmountInCents / maxDailyAmount : 0;

    const filledHeight = height * proportion;
    const unfilledHeight = height - filledHeight;

    const barGroup = chartGroup.append("g").attr("class", "bar-group");

    const backgroundBar = drawUnfilledBar(barGroup, x, barWidth, height);

    backgroundBar
      .transition()
      .duration(800)
      .ease(d3.easeCubicOut)
      .attr("height", unfilledHeight);

    drawFilledBar(barGroup, x, barWidth, height, unfilledHeight);

    attachBarInteractions(barGroup, dayData, tooltipElement);
  });
}

function drawLoadingBars(
  chartGroup: any,
  XAxis: any,
  weekData: WeeklyData,
  width: number,
  height: number
) {
  // Create shimmer gradient
  const defs = chartGroup.append("defs");
  const shimmerGradient = defs
    .append("linearGradient")
    .attr("id", "shimmer-gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");

  shimmerGradient
    .append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "transparent")
    .attr("stop-opacity", 0);

  shimmerGradient
    .append("stop")
    .attr("offset", "50%")
    .attr("stop-color", "var(--color-base-black-10)")
    .attr("stop-opacity", 1);

  shimmerGradient
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "transparent")
    .attr("stop-opacity", 0);

  // Draw shimmer bars for loading state
  weekData.dailyData.forEach((dayData: DailyPurchaseData, index: number) => {
    const { x, barWidth } = getXAndBarWidth(XAxis, dayData.date.toISOString());

    // Create clip path for this bar
    const clipId = `clip-bar-${index}`;
    const clipPath = defs.append("clipPath").attr("id", clipId);

    clipPath
      .append("rect")
      .attr("x", x)
      .attr("y", 0)
      .attr("width", barWidth)
      .attr("height", height);

    const barGroup = chartGroup
      .append("g")
      .attr("class", "bar-group shimmer-bar")
      .attr("clip-path", `url(#${clipId})`);

    // Base bar
    drawUnfilledBar(barGroup, x, barWidth, height);

    // Shimmer effect
    barGroup
      .append("rect")
      .attr("class", "bar-shimmer")
      .attr("x", -width)
      .attr("y", 0)
      .attr("width", width * 2)
      .attr("height", height)
      .style("fill", "url(#shimmer-gradient)");
  });
}

function drawChart() {
  // Clear existing chart and tooltip
  d3.select("#purchasesChart").selectAll("*").remove();
  d3.select("#chart-tooltip").remove();

  const { width, height, chartGroup } = setupChartDimensions();
  if (width <= 0 || height <= 0 || !chartGroup) return;

  const weekData = weeklyPurchaseData.value;

  const XAxis = createXAxis(weekData, width);

  const tooltipElement = createTooltip(container.value);

  if (isLoading.value) {
    drawLoadingBars(chartGroup, XAxis, weekData, width, height);
  } else {
    drawFilledBars(chartGroup, XAxis, weekData, height, tooltipElement);
  }

  drawDayLabels(chartGroup, XAxis, weekData, height);
}

watch(
  () => [weeklyBreakdownData.value, isLoading.value],
  () => {
    drawChart();
  }
);
</script>

<template>
  <VCBaseCard
    class="vc-wallet-purchases-chart"
    :border="{ borderRadius: 24 }"
  >
    <div
      ref="container"
      class="vc-wallet-purchases-chart__body"
    >
      <BaseText
        variant="headline-5-bold"
        class="vc-wallet-purchases-chart__week-title"
      >
        {{ weekTitle }}
      </BaseText>
      <svg id="purchasesChart" />

      <div class="vc-wallet-purchases-chart__summary">
        <transition name="show-up">
          <BaseText
            v-if="!isLoading"
            variant="headline-6-medium"
            class="vc-wallet-purchases-chart__summary-text"
          >
            <span class="vc-wallet-purchases-chart__summary-amount">
              {{ summaryParts.purchaseCount }}
            </span>
            {{ summaryParts.text }}
            <span class="vc-wallet-purchases-chart__summary-amount">
              {{ summaryParts.amount }}
            </span>
          </BaseText>
        </transition>
      </div>
    </div>
  </VCBaseCard>
</template>

<style lang="scss" scoped>
.vc-wallet-purchases-chart {
  &__body {
    flex-direction: column;
    display: flex;
    position: relative;
    padding: 24px;
    height: 205px;
    container-type: inline-size;
    container-name: card-body;
  }

  &__summary {
    min-height: 14px;
    margin-bottom: 4px;

    &-text {
      color: $color-primary-70;
      font-size: clamp(14px, 4cqw, 16px);
    }

    &-amount {
      font-weight: 700;
      color: $color-primary-100;
    }
  }
}

:deep(.bar-background) {
  transition: opacity 0.12s ease-in;
}

:deep(.bar-foreground) {
  transition: fill 0.12s ease-in;
}

:deep(.bar-shimmer) {
  animation: loading 1.2s ease-in infinite;
}

:deep(.tooltip-title) {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 4px;
  color: $color-primary-100-light;
}

:deep(.tooltip-subtitle) {
  font-size: 12px;
  font-weight: 400;
  color: $color-primary-50;
  margin-top: 4px;
}

:deep(.tooltip-amount) {
  font-size: 12px;
  font-weight: 700;
  color: $color-primary-100-light;
}

.show-up-enter-active,
.show-up-leave-active {
  transition:
    opacity 0.3s ease-out,
    transform 0.3s ease-out;
}

.show-up-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.show-up-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.show-up-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.show-up-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes loading {
  from {
    transform: translateX(-150%);
  }

  to {
    transform: translateX(150%);
  }
}
</style>
