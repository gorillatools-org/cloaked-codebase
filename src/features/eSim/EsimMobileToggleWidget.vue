<script setup>
import { computed } from "vue";
import { assetUrl } from "@/scripts/assets";
import { useColorScheme } from "@/composables/useColorScheme";

const props = defineProps({
  deviceType: {
    type: String,
    default: "ios",
  },
  imgName: {
    type: String,
    required: true,
  },
  instructions: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["updateDeviceType"]);

const { colorScheme } = useColorScheme();
const imgSuffix = computed(() => `-${colorScheme.value}`);
</script>
<template>
  <div class="device-settings">
    <div class="selection-row">
      <div
        class="selection"
        :class="{ selected: props.deviceType === 'ios' }"
        @click="emit('updateDeviceType', 'ios')"
      >
        iOS
      </div>
      <div
        class="selection"
        :class="{ selected: props.deviceType === 'android' }"
        @click="emit('updateDeviceType', 'android')"
      >
        Android
      </div>
    </div>
    <div
      v-if="props.instructions"
      class="instructions"
    >
      {{ props.instructions }}
    </div>
    <img
      :key="props.imgName"
      class="phone-image"
      :src="assetUrl(`@/assets/images/esim/${props.imgName}${imgSuffix}.png`)"
    />
  </div>
</template>
<style lang="scss" scoped>
/* stylelint-disable */
.device-settings {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background-color: rgba($color-primary-100-light, 0.2);

  @at-root .theme-dark & {
    background-color: rgba($color-primary-100-dark, 0.2);
  }

  width: 100%;
  max-width: 450px;
  transition: all 0.3s ease;
  color: $color-primary-50;
  margin-top: 24px;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;

  .selection-row {
    display: flex;
    flex-direction: row;
    justify-content: center;
    border-bottom: 1px solid transparent;
    transition: all 0.3s ease;
    width: 100%;
    height: 40px;
    cursor: pointer;

    .selection {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;

      &.selected {
        color: $color-primary-100;
        font-size: 14px;
        font-style: normal;
        font-weight: 600;
        line-height: normal;
        border-bottom: 1px solid $color-primary-100;
        transition: all 0.3s ease;
      }
    }
  }

  .instructions {
    color: $color-primary-100;
    font-size: 13px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    padding: 18px 24px 0;
    white-space: pre-wrap;
  }

  .phone-image {
    margin-top: 24px;
    padding: 0 16px;
  }
}
</style>
