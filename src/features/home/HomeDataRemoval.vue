<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import moment from "moment/moment";
import DataDeleteService from "@/api/actions/data-delete-service.js";
import router from "@/routes/router";
import InlineSvg from "@/features/InlineSvg.vue";
import store from "@/store";
import { PH_EVENT_USER_CLICKED_DATA_DELETION_STATUS_IN_HOME_PAGE_TILE } from "@/scripts/posthogEvents";
import AtomHomeTitle from "@/features/home/AtomHomePageBanner/AtomHomeTitle.vue";
import AtomHomeBannerBody from "@/features/home/AtomHomePageBanner/AtomHomeBannerBody.vue";
import HomeDataRemovalSubtitle from "@/features/home/HomeDataRemovalSubtitle.vue";
import HomeDataRemovalFooter from "@/features/home/HomeDataRemovalFooter.vue";
import HomeDataRemovalBox from "@/features/home/HomeDataRemovalBox.vue";
import { posthogCapture } from "@/scripts/posthog.js";
import { MONTHS } from "@/scripts/constants";
import DataRemovalSkeletonLoader from "@/routes/DataDeletion/components/DataRemovalSkeletonLoader.vue";
import { format } from "@/scripts/format";
import BaseText from "@/library/BaseText.vue";

const inputRef = ref();
const topSectionRef = ref();

const enrollmentDataFetched = computed(() => {
  return store.getters["dataDelete/enrollmentData"]?.enrollmentDataFetched;
});

const state = reactive({
  input: "",
  sending: false,
  loading: enrollmentDataFetched.value ? false : true,
});

onMounted(() => {
  DataDeleteService.getEnrollmentData()
    .then(() => {
      state.loading = false;
    })
    .catch(() => {
      state.loading = false;
    });
  window.addEventListener("focus-data-deletion-input", focusInput);
});

onBeforeUnmount(() => {
  window.removeEventListener("focus-data-deletion-input", focusInput);
});

const brokersInProgress = computed(() => {
  return store.getters["dataDelete/enrollmentData"]?.brokersInProgress ?? 0;
});

const totalItemsRemoved = computed(() => {
  const itemsRemoved =
    store.getters["dataDelete/enrollmentData"]?.totalItemsRemoved ?? 0;
  return format.formatNumbersBasedonLocale(itemsRemoved);
});

const totalItemsRemovedToday = computed(() => {
  const itemsRemovedToday =
    store.getters["dataDelete/enrollmentData"]?.totalItemsRemovedToday ?? 0;
  return format.formatNumbersBasedonLocale(itemsRemovedToday);
});

const brokersCompleted = computed(() => {
  return store.getters["dataDelete/enrollmentData"]?.brokersCompleted ?? 0;
});

const scanUpdatedDate = computed(() => {
  return (
    store.getters["dataDelete/enrollmentData"]?.scanUpdatedDate ?? new Date()
  );
});
const isComplete = computed(() => {
  return store.getters["dataDelete/enrollmentData"]?.isComplete ?? false;
});
const scanningSites = computed(() => {
  return store.getters["dataDelete/enrollmentData"]?.scanningSites ?? 0;
});

const daysProtected = computed(() => {
  return store.getters["dataDelete/enrollmentData"]?.daysProtected ?? 0;
});
const hasScan = computed(() => {
  return (
    store.getters["dataDelete/enrollmentData"]?.enrollmentDataFetched ?? false
  );
});

const nextScanDate = computed(() => {
  const nextScanDateTime =
    store.getters["dataDelete/enrollmentData"]?.nextScanDate;
  if (nextScanDateTime) {
    const nextScan = new Date(nextScanDateTime);
    return `${MONTHS[nextScan.getMonth()]} ${nextScan.getDate()}`;
  }

  return null;
});

const hasAllScanData = computed(() => {
  return [
    hasScan.value,
    brokersInProgress.value,
    brokersCompleted.value,
    scanUpdatedDate.value,
    scanningSites.value,
    totalItemsRemoved.value,
    totalItemsRemovedToday.value,
    nextScanDate.value,
    daysProtected.value,
  ].every((data) => data === 0 || !!data);
});

const statusText = computed(() => {
  return isComplete.value ? "Data monitoring is on" : "In progress";
});

const formattedDate = computed(() => {
  return moment(scanUpdatedDate.value).format("dddd, MMMM Do");
});

const formattedTime = computed(() => {
  return moment(scanUpdatedDate.value).format("LT");
});

const subheaderText = computed(() => {
  return isComplete.value
    ? `Cloaked automatically monitors all ${scanningSites.value} data broker sites for any new records and actively requests to have them removed.`
    : `Status updated ${formattedDate.value} at ${formattedTime.value}.`;
});

function navToStatusPage() {
  posthogCapture(PH_EVENT_USER_CLICKED_DATA_DELETION_STATUS_IN_HOME_PAGE_TILE);
  router.push({ name: "DataRemove" });
}

function focusInput() {
  topSectionRef?.value?.scrollIntoView({
    behavior: "smooth",
    inline: "start",
    block: "end",
  });
  setTimeout(() => {
    inputRef?.value?.focus();
  }, 1000);
}
</script>
<template>
  <section ref="topSectionRef">
    <DataRemovalSkeletonLoader
      v-if="state.loading"
      small
    />
    <div
      v-else-if="hasAllScanData"
      class="widget-wrapper"
    >
      <AtomHomeTitle title="Data Removal">
        <BaseText
          as="div"
          variant="body-3-semibold"
          underline
          class="title-link"
          @click="navToStatusPage"
        >
          View full analytics
          <InlineSvg name="data-delete/graph" />
        </BaseText>
      </AtomHomeTitle>
      <div
        class="completed-body-section"
        @click="navToStatusPage"
      >
        <BaseText
          as="h2"
          variant="headline-4-bold"
          class="header"
        >
          {{ statusText }}
          <InlineSvg
            :key="isComplete ? 'fuzzy-green-dot' : 'fuzzy-orange-dot'"
            :name="isComplete ? 'fuzzy-green-dot' : 'fuzzy-orange-dot'"
          />
        </BaseText>
        <BaseText
          as="p"
          variant="body-small-medium"
          class="subheader"
        >
          {{ subheaderText }}
        </BaseText>
        <div class="flex-row progress-section">
          <HomeDataRemovalBox :status="isComplete ? 'complete' : 'in-progress'">
            <template #number>
              <div class="color-success">
                {{ totalItemsRemoved }}
              </div>
            </template>
            <template
              v-if="totalItemsRemovedToday > 0"
              #bubble
            >
              <div>{{ `+ ${totalItemsRemovedToday} Today` }}</div>
            </template>
            <template #label>
              <div>Records removed</div>
            </template>
          </HomeDataRemovalBox>
          <HomeDataRemovalBox>
            <template #number>
              <div>
                {{ nextScanDate }}
              </div>
            </template>
            <template #label>
              <div>Next Scan</div>
            </template>
          </HomeDataRemovalBox>
        </div>
      </div>
    </div>

    <div
      v-else
      class="widget-wrapper"
    >
      <AtomHomeTitle title="Data Removal">
        <BaseText
          as="div"
          variant="body-small-medium"
          class="bubble"
        >
          New!
        </BaseText>
      </AtomHomeTitle>

      <AtomHomeBannerBody>
        <div>
          <HomeDataRemovalSubtitle
            header="Uncover your identity risk"
            subheader="Data brokers sell your personal info to anyone for a price. Input your
          number to check your threat level."
          />

          <HomeDataRemovalFooter />
        </div>
      </AtomHomeBannerBody>
    </div>
  </section>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.input-wrapper {
  position: relative;
  width: auto;
  flex-grow: 1;
  color: $color-primary-100;

  svg {
    position: absolute;
    height: 19px;
    width: 19px;
    top: 50%;
    left: 24px;
    transform: translate(-50%, -50%);
  }

  input {
    padding: 16px;
    padding-left: 42px;
    width: 100%;
    border-radius: 56px;
    border: 2px solid $color-primary-10;
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    outline-color: $color-primary-100;
    background-color: $color-base-white-100;
    caret-color: $color-primary-100;
    color: $color-primary-100;
  }
}

.flex-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.title-link {
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);

  svg {
    color: $color-primary-100;
    height: 15px;
    width: auto;
  }

  &:hover {
    transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
    opacity: 0.7;
    transform: scale(1.01);
  }
}

.completed-body-section {
  color: $color-primary-100;
  cursor: pointer;
  margin-top: 16px;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid $color-primary-10;
  transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);

  &:hover {
    transform: scale(1.007) translate3d(0, 0, 0);
    transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
  }

  &:active {
    transform: scale(1) translate3d(0, 0, 0);
    transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
  }

  .header {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
    justify-content: flex-start;
  }

  .progress-section {
    gap: 12px;
    margin-top: 16px;
  }
}

.in-progress {
  color: $color-in-progress;
}

.color-success {
  color: $color-success;
}

.blue {
  color: $color-brand-3-100;
}

.bubble {
  display: flex;
  padding: 1px 6px;
  align-items: center;
  background-color: $color-success;
  color: $color-primary-100-light;
  border-radius: 41px;
}

.disabled {
  opacity: 0.4;
}

.personal-details {
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  color: $color-primary-100;
  margin-top: 16px;
}

.widget-wrapper {
  animation: fade-in 0.5s ease-in-out forwards;
}

@keyframes fade-in {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}
</style>
