<script setup>
import TimelineDay from "@/features/homeV3/timeline/TimelineDay.vue";

const props = defineProps({
  timelineData: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <div class="timeline-section-container">
    <div class="progress" />
    <div class="inner-container">
      <TimelineDay
        v-for="(item, index) in props.timelineData"
        :key="index"
        :position="index"
        :exposures="item.exposures"
        :text="item.text"
        :callout="item.callout"
        :hasOnClick="item.hasOnClick"
        :day="item.day"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.timeline-section-container {
  position: relative;
  display: block;

  .progress {
    width: 34px;
    position: absolute;
    padding: 16px;
    border-radius: 34px;
    background: $color-primary-1;
    border: 1px solid $color-primary-10;
    height: 100%;
  }

  .inner-container {
    display: flex;
    flex-direction: column;
  }
}
</style>
