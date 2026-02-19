<script setup>
import * as d3 from "d3";
import { computed, onMounted, ref, watch } from "vue";
import DataRemovalGraph from "@/routes/DataDeletion/components/RequestGraph/DataRemovalGraph.vue";
import { useColorScheme } from "@/composables/useColorScheme";
import { format } from "@/scripts/format";
import BaseText from "@/library/BaseText.vue";

const props = defineProps({
  rawGraphData: {
    type: Object,
    default: () => {},
  },
});

const mobilePlatform = ref(null);
const hideGraph = ref(false);

const graphDataFromAndroidJson = ref("");
const graphDataFromAndroid = ref({});
const colorSchemeFromMobile = ref(null);

const graphDataFormatted = ref([]);
const activeSeries = ref(null);

const formatDate = d3.timeFormat("%b %d, %Y");
const colorScale = d3.scaleOrdinal([
  "#00C47D",
  "#9C95DC",
  "#FBBC04",
  "#E94B6F",
  "#4CD0F5",
]);

onMounted(() => {
  // NOTE: This is for ios
  window.addEventListener("message", handleMessageDataFromIOS);
  window?.webkit?.messageHandlers?.cloakedApp?.postMessage({});

  // NOTE: cloakedMobile object will only exist on android, code will fail to execute if not in try/catch cus cloakedMobile is not defined in this component
  try {
    //NOTE: This is for android
    graphDataFromAndroidJson.value = cloakedMobile?.provideGraphJson();
    graphDataFromAndroid.value = JSON.parse(graphDataFromAndroidJson.value);
    colorSchemeFromMobile.value = cloakedMobile?.getColorScheme();
    mobilePlatform.value = "android";
  } catch {
    // do nothing
  }
});

const lineColors = computed(() =>
  graphDataFormatted?.value?.map((_, index) => colorScale(index))
);
const allPoints = computed(() =>
  graphDataFormatted?.value?.flatMap((line) => line?.points)
);
const firstDate = computed(() => {
  return allPoints?.value?.length
    ? formatDate(d3.min(allPoints.value, (point) => point?.x))
    : null;
});

const lastDate = computed(() => {
  return allPoints?.value?.length
    ? formatDate(d3.max(allPoints.value, (point) => point?.x))
    : null;
});

function addInitialZeroValuesIfNeeded(graphData) {
  const hasNonZeroInitialValue = graphData.some(
    (dataSet) => dataSet.points.length && dataSet.points[0].y !== 0
  );
  if (hasNonZeroInitialValue) {
    graphData.forEach((dataSet) => {
      if (dataSet.points.length) {
        const firstDate = new Date(dataSet.points[0].x);
        const dateBeforeFirst = new Date(firstDate);
        dateBeforeFirst.setDate(firstDate.getDate() - 1);
        dataSet.points.unshift({ x: dateBeforeFirst, y: 0 });
      }
    });
  }
}

function convertToMidnightLocal(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date;
}

function handleMessageDataFromIOS(message) {
  if (
    typeof message.data === "string" &&
    message.data.includes("graph_data") &&
    import.meta.env.VITE_REDIRECT_URI.includes(message?.origin)
  ) {
    mobilePlatform.value = "ios";
    handleGraphData(JSON.parse(message.data));
  }
  if (
    typeof message.data === "string" &&
    message.data.includes("colorScheme") &&
    import.meta.env.VITE_REDIRECT_URI.includes(message?.origin)
  ) {
    mobilePlatform.value = "ios";
    colorSchemeFromMobile.value = message.data.includes("dark")
      ? "dark"
      : "light";
  }
}

function handleGraphData(apiResponse) {
  const rawDataArray = apiResponse?.graph_data;

  if (!rawDataArray || !rawDataArray.length) {
    hideGraph.value = true;
    return;
  }
  hideGraph.value = false;
  // Build a lookup of raw data by date
  const dates = rawDataArray.map((data) => data.date);
  const rawDataObj = {};
  rawDataArray.forEach((data) => (rawDataObj[data.date] = data));

  // Sort the dates chronologically
  const datesSorted = dates.sort((a, b) => new Date(a) - new Date(b));

  // Prepare the five series we need
  const fullNameGraphData = { label: "Full name", points: [] };
  const emailGraphData = { label: "Email address", points: [] };
  const phoneGraphData = { label: "Phone number", points: [] };
  const addressGraphData = { label: "Address", points: [] };
  const relativesGraphData = { label: "Relatives", points: [] };

  // This array will hold all days (including interpolated ones)
  const datesSortedWithFillers = [];
  // This array will hold only the reported (original) cumulative data points.
  const reportedCumulative = [];

  // Use the first reported day as starting cumulative info.
  const firstData = rawDataObj[datesSorted[0]];
  let cumulatedInfo = {
    full_name: firstData?.full_name || 0,
    email_addresses: firstData?.email_addresses || 0,
    phone_numbers: firstData?.phone_numbers || 0,
    addresses: firstData?.addresses || 0,
    relatives: firstData?.relatives || 0,
  };

  // Easing function (cosine-based easeInOut)
  const ease = (t) => (1 - Math.cos(t * Math.PI)) / 2;

  // Helper to push a data point into a series.
  const pushPoint = (series, date, value, isExtrapolated = false) => {
    series.points.push({ x: date, y: value, isExtrapolated });
  };

  datesSorted.forEach((date, index) => {
    const currentDate = convertToMidnightLocal(date);
    const info = rawDataObj[date];

    if (index === 0) {
      datesSortedWithFillers.push({
        date: currentDate,
        info: { ...cumulatedInfo },
      });
      // Save the first reported point
      reportedCumulative.push({
        date: currentDate,
        info: { ...cumulatedInfo },
      });
    } else {
      const previousDateRaw = datesSorted[index - 1];
      const previousDate = convertToMidnightLocal(previousDateRaw);
      const millisecondsInOneDay = 1000 * 60 * 60 * 24;
      const numOfMissingDays = Math.floor(
        (currentDate - previousDate) / millisecondsInOneDay
      );

      // Snapshot of the previous cumulative info before updating.
      const prevCumulatedInfo = { ...cumulatedInfo };

      // Update cumulative info with the new report.
      cumulatedInfo.full_name += info?.full_name ?? 0;
      cumulatedInfo.email_addresses += info?.email_addresses ?? 0;
      cumulatedInfo.phone_numbers += info?.phone_numbers ?? 0;
      cumulatedInfo.addresses += info?.addresses ?? 0;
      cumulatedInfo.relatives += info?.relatives ?? 0;

      // If there are missing days between previous and current report,
      // interpolate using an easing function.
      if (numOfMissingDays > 1) {
        for (let i = 1; i < numOfMissingDays; i++) {
          const fillerDate = new Date(previousDate);
          fillerDate.setDate(fillerDate.getDate() + i);
          const t = i / numOfMissingDays; // normalized progress
          const easedT = ease(t);
          const interpolatedInfo = {
            full_name:
              prevCumulatedInfo.full_name +
              (cumulatedInfo.full_name - prevCumulatedInfo.full_name) * easedT,
            email_addresses:
              prevCumulatedInfo.email_addresses +
              (cumulatedInfo.email_addresses -
                prevCumulatedInfo.email_addresses) *
                easedT,
            phone_numbers:
              prevCumulatedInfo.phone_numbers +
              (cumulatedInfo.phone_numbers - prevCumulatedInfo.phone_numbers) *
                easedT,
            addresses:
              prevCumulatedInfo.addresses +
              (cumulatedInfo.addresses - prevCumulatedInfo.addresses) * easedT,
            relatives:
              prevCumulatedInfo.relatives +
              (cumulatedInfo.relatives - prevCumulatedInfo.relatives) * easedT,
          };
          datesSortedWithFillers.push({
            date: fillerDate,
            info: interpolatedInfo,
          });
        }
      }

      // Push the current reported day and record it.
      datesSortedWithFillers.push({
        date: currentDate,
        info: { ...cumulatedInfo },
      });
      reportedCumulative.push({
        date: currentDate,
        info: { ...cumulatedInfo },
      });
    }

    // For the very last reported date, extend up to "today"
    if (index === datesSorted.length - 1) {
      const now = new Date();
      const day = now.getDate();
      const month = now.getMonth();
      const year = now.getFullYear();
      const today = convertToMidnightLocal(`${year}-${month + 1}-${day}`);
      const millisecondsInOneDay = 1000 * 60 * 60 * 24;
      const numOfMissingDaysFromToday = Math.floor(
        (today - currentDate) / millisecondsInOneDay
      );
      // Skip extrapolation if we don't have enough history or no days to extrapolate
      if (numOfMissingDaysFromToday > 0 && reportedCumulative.length > 1) {
        // Use a rolling average from the last few reported intervals.
        const rollingCount = Math.min(3, reportedCumulative.length - 1);

        // If we still don't have enough data for a rolling average, skip extrapolation
        if (rollingCount > 0) {
          let sumRate = {
            full_name: 0,
            email_addresses: 0,
            phone_numbers: 0,
            addresses: 0,
            relatives: 0,
          };

          for (
            let j = reportedCumulative.length - rollingCount;
            j < reportedCumulative.length;
            j++
          ) {
            const prev = reportedCumulative[j - 1];
            const curr = reportedCumulative[j];
            const gapDays = Math.max(
              Math.floor((curr.date - prev.date) / millisecondsInOneDay),
              1
            );
            sumRate.full_name +=
              (curr.info.full_name - prev.info.full_name) / gapDays;
            sumRate.email_addresses +=
              (curr.info.email_addresses - prev.info.email_addresses) / gapDays;
            sumRate.phone_numbers +=
              (curr.info.phone_numbers - prev.info.phone_numbers) / gapDays;
            sumRate.addresses +=
              (curr.info.addresses - prev.info.addresses) / gapDays;
            sumRate.relatives +=
              (curr.info.relatives - prev.info.relatives) / gapDays;
          }

          const dailyRate = {
            full_name: sumRate.full_name / rollingCount,
            email_addresses: sumRate.email_addresses / rollingCount,
            phone_numbers: sumRate.phone_numbers / rollingCount,
            addresses: sumRate.addresses / rollingCount,
            relatives: sumRate.relatives / rollingCount,
          };

          // For each missing day after the last reported day, extrapolate using the rolling daily rate.
          for (let i = 1; i <= numOfMissingDaysFromToday; i++) {
            const fillerDate = new Date(currentDate);
            fillerDate.setDate(fillerDate.getDate() + i);
            const t = i / (numOfMissingDaysFromToday + 1);
            const easedT = ease(t);
            const extrapolatedInfo = {
              full_name:
                cumulatedInfo.full_name + dailyRate.full_name * i * easedT,
              email_addresses:
                cumulatedInfo.email_addresses +
                dailyRate.email_addresses * i * easedT,
              phone_numbers:
                cumulatedInfo.phone_numbers +
                dailyRate.phone_numbers * i * easedT,
              addresses:
                cumulatedInfo.addresses + dailyRate.addresses * i * easedT,
              relatives:
                cumulatedInfo.relatives + dailyRate.relatives * i * easedT,
            };
            datesSortedWithFillers.push({
              date: fillerDate,
              info: extrapolatedInfo,
              isExtrapolated: true,
            });
          }
        }
      }
    }
  });

  datesSortedWithFillers.forEach((sortedGraphObject) => {
    const isExtrapolated = sortedGraphObject.isExtrapolated || false;
    pushPoint(
      fullNameGraphData,
      sortedGraphObject.date,
      sortedGraphObject.info.full_name,
      isExtrapolated
    );
    pushPoint(
      emailGraphData,
      sortedGraphObject.date,
      sortedGraphObject.info.email_addresses,
      isExtrapolated
    );
    pushPoint(
      phoneGraphData,
      sortedGraphObject.date,
      sortedGraphObject.info.phone_numbers,
      isExtrapolated
    );
    pushPoint(
      addressGraphData,
      sortedGraphObject.date,
      sortedGraphObject.info.addresses,
      isExtrapolated
    );
    pushPoint(
      relativesGraphData,
      sortedGraphObject.date,
      sortedGraphObject.info.relatives,
      isExtrapolated
    );
  });

  addInitialZeroValuesIfNeeded([
    fullNameGraphData,
    emailGraphData,
    phoneGraphData,
    addressGraphData,
    relativesGraphData,
  ]);

  graphDataFormatted.value = [
    fullNameGraphData,
    emailGraphData,
    phoneGraphData,
    addressGraphData,
    relativesGraphData,
  ].sort((a, b) => {
    const aLastPoint = a.points[a.points.length - 1]?.y ?? 0;
    const bLastPoint = b.points[b.points.length - 1]?.y ?? 0;
    return bLastPoint - aLastPoint;
  });
}

function toggleActiveSeries(line) {
  if (activeSeries.value === line.label) {
    activeSeries.value = null;
  } else {
    activeSeries.value = line.label;
  }
}

function getShortLabel(label) {
  if (label === "Full name") {
    return "Name";
  }
  if (label === "Email address") {
    return "Email";
  }
  if (label === "Phone number") {
    return "Phone";
  }
  if (label === "Addresses") {
    return "Address";
  }
  if (label === "Relatives") {
    return "Family";
  }
  return label;
}

function getLastYValue(dataset) {
  // Find the last non-extrapolated point in the dataset
  for (let i = dataset?.points.length - 1; i >= 0; i--) {
    if (!dataset.points[i].isExtrapolated) {
      return (
        format.formatNumbersBasedonLocale(parseInt(dataset.points[i].y)) ?? "—"
      );
    }
  }
  // Fallback to the first point if all are extrapolated
  return (
    format.formatNumbersBasedonLocale(parseInt(dataset?.points[0]?.y)) ?? "—"
  );
}

watch(
  () => props.rawGraphData,
  (newVal) => {
    if (newVal?.graph_data?.length) {
      handleGraphData(newVal);
    }
  },
  { immediate: true, deep: true }
);

watch(
  () => graphDataFromAndroid.value,
  (newVal) => {
    if (newVal?.graph_data?.length) {
      handleGraphData(newVal);
    }
  },
  { immediate: true, deep: true }
);

const { setColorScheme } = useColorScheme();

watch(
  () => colorSchemeFromMobile.value,
  (newVal) => {
    if (mobilePlatform.value) {
      setColorScheme(newVal);
    }
  },
  { immediate: true }
);
</script>

<template>
  <div
    v-show="!hideGraph"
    :class="{ 'full-screen': !!mobilePlatform }"
  >
    <div class="data-removal-graph_bottom-row">
      <div
        class="data-removal-graph_legend"
        :class="{ mobile: !!mobilePlatform }"
      >
        <div
          v-for="(line, index) in graphDataFormatted"
          :key="index"
          :class="{
            active: activeSeries === line.label,
            'not-mobile': !mobilePlatform,
            mobile: !!mobilePlatform,
          }"
          class="data-removal-graph_legend-item"
          @click="toggleActiveSeries(line)"
        >
          <BaseText
            variant="headline-4-bold"
            as="div"
            class="data-removal-graph_legend-count"
            :class="{ 'small-text': !!mobilePlatform }"
          >
            {{ getLastYValue(line) }}
          </BaseText>
          <BaseText
            variant="caption-semibold"
            as="div"
            class="data-removal-graph_legend-label-short"
          >
            {{ getShortLabel(line.label) }}
          </BaseText>
          <BaseText
            v-if="!mobilePlatform"
            as="div"
            variant="body-small-medium"
            class="data-removal-graph_legend-label"
          >
            {{ line.label }}
          </BaseText>
        </div>
      </div>
    </div>
    <div class="data-removal-graph-container">
      <DataRemovalGraph
        :data="graphDataFormatted"
        :line-colors="lineColors"
        :active-series="activeSeries"
      />
    </div>
    <div
      v-if="firstDate || lastDate"
      class="data-removal-graph_timeline"
    >
      <div class="data-removal-graph__timeline-columns">
        <div
          v-if="firstDate"
          class="data-removal-graph__timeline-column-left"
        >
          <BaseText
            as="div"
            variant="caption-semibold"
          >
            Start
          </BaseText>
          <BaseText
            as="div"
            variant="body-small-medium"
            class="data-removal-graph__timeline-row-subheader"
          >
            {{ firstDate }}
          </BaseText>
        </div>
        <div
          v-if="lastDate"
          class="data-removal-graph__timeline-column-right"
        >
          <BaseText
            as="div"
            variant="caption-semibold"
          >
            Today
          </BaseText>
          <BaseText
            as="div"
            variant="body-small-medium"
            class="data-removal-graph__timeline-row-subheader"
          >
            {{ lastDate }}
          </BaseText>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.full-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  background-color: $color-base-white-100;
}

.data-removal-graph-container {
  width: 100%;
  height: 200px;
}

.data-removal-graph_timeline {
  display: flex;
  flex-direction: column;
  color: $color-primary-100;
  padding: 8px 10px 0;
  .data-removal-graph__timeline-columns {
    display: flex;
    justify-content: space-between;
    .data-removal-graph__timeline-column-left,
    .data-removal-graph__timeline-column-right {
      display: flex;
      flex-direction: column;
    }
    .data-removal-graph__timeline-column-left {
      align-items: flex-start;
      width: 100%;
    }
    .data-removal-graph__timeline-column-right {
      align-items: flex-end;
      width: 100%;
    }
  }
}

.data-removal-graph_bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding: 5px 0;
}

.data-removal-graph_legend {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  height: auto;
  width: 100%;
  &.mobile {
    padding: 0px 1px;
  }

  .data-removal-graph_legend-item {
    color: $color-primary-100;
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
    transition: all 0.3s;
    padding: 8px 16px;
    border-radius: 14px;
    border: 1px solid $color-primary-100;
    cursor: default;
    flex-wrap: nowrap;
    width: calc((100% - 32px) / 5); // 100% -(gaps(32px)) / 5
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    @media (max-width: 768px) {
      min-height: 35px;
    }
    @media (max-width: 840px) {
      padding: 8px;
    }
    &.mobile {
      border: none;
      background-color: $color-primary-5;
      padding: 8px 0px;
      gap: 0;
      align-items: center;
    }

    &.active {
      background-color: $color-primary-100;
      color: $color-primary-1;
    }

    .data-removal-graph_legend-label {
      flex-grow: 1;
      text-wrap: nowrap;
      white-space: nowrap;
      @include line-clamp(1);
    }
    .data-removal-graph_legend-label-short {
      flex-grow: 1;
      text-wrap: nowrap;
      white-space: nowrap;
      display: none !important;
      @include line-clamp(1);
    }
    .data-removal-graph_legend-count {
      &.small-text {
        font-size: 15px;
      }
    }

    @media (max-width: 1090px) {
      .data-removal-graph_legend-label-short {
        display: block !important;
      }
      .data-removal-graph_legend-label {
        display: none !important;
      }
    }
  }
}
</style>
