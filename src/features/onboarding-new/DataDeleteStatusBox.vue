<script setup>
import { computed, onBeforeMount } from "vue";
import store from "@/store";
import DataDeleteService from "@/api/actions/data-delete-service.js";
import { MONTHS } from "@/scripts/constants";
onBeforeMount(() => {
  DataDeleteService.getEnrollmentData();
});

const nextScanDate = computed(() => {
  const nextScanDateTime =
    store.getters["dataDelete/enrollmentData"]?.nextScanDate;
  if (nextScanDateTime) {
    const nextScan = new Date(nextScanDateTime);
    return `${MONTHS[nextScan.getMonth()].slice(0, 3)} ${nextScan.getDate()}`;
  }
  return "—";
});
const scanningSites = computed(() => {
  return store.getters["dataDelete/enrollmentData"]?.scanningSites ?? 0;
});
</script>
<template>
  <div class="data-remove-card-box">
    <div class="data-remove-card-box__content">
      <slot />
    </div>
    <div class="data-remove-submitted__status">
      <div class="widget">
        <div class="broker-sites">
          {{ scanningSites }}
        </div>
        <div>Data broker sites</div>
      </div>
      <div class="widget">
        <div class="date">
          {{ nextScanDate }}
        </div>
        <div>Next scan</div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.data-remove-card-box {
  border-radius: 16px;
  border: 1px solid $color-primary-20;
  background-blend-mode: screen;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  cursor: pointer;
  gap: 13px;
  flex-direction: column;
  width: 100%;
  margin-top: 26px;
  background: rgba($color-primary-100-light, 0.1);
  box-shadow: 0 10px 10px 0 rgba($color-primary-1-light, 0.1);

  @at-root .theme-dark & {
    background: rgba($color-primary-100-dark, 0.1);
    box-shadow: 0 10px 10px 0 rgba($color-primary-1-dark, 0.1);
  }

  &__content {
    display: flex;
    flex-direction: column;
  }

  &__status {
    margin-top: 13px;
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;

    &--info-required {
      color: $color-info;
    }

    &--review-required {
      color: $color-info;
    }

    &--submitting,
    &--submitted {
      color: $color-success;
    }
  }
}

.data-remove-submitted__status {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 8px;
  width: 100%;

  .widget {
    border: 1px solid $color-primary-20;
    border-radius: 16px;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    font-size: 10px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
    color: $color-primary-100;
    height: 80px;
    padding: 8px 12px;
    background: rgba($color-primary-100-light, 0.1);
    box-shadow: 0 10px 10px 0 rgba($color-primary-1-light, 0.1);

    @at-root .theme-dark & {
      background: rgba($color-primary-100-dark, 0.1);
      box-shadow: 0 10px 10px 0 rgba($color-primary-1-dark, 0.1);
    }

    .broker-sites {
      color: $color-in-progress;
      font-size: 25px;
      font-style: normal;
      font-weight: 600;
      line-height: 40px; /* 160% */
    }

    .date {
      color: $color-primary-100;
      font-size: 25px;
      font-style: normal;
      font-weight: 600;
      line-height: 40px; /* 160% */
    }
  }
}
</style>
