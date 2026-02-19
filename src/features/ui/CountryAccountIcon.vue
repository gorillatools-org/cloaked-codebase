<script setup>
import { LAUNCHED_COUNTRIES } from "@/scripts/countries/countries.js";
import { computed } from "vue";
import { assetUrl } from "@/scripts/assets.js";
import InlineSvg from "@/features/InlineSvg.vue";

// Accepts a country code and returns the corresponding country flag icon.

const props = defineProps({
  countryInfo: {
    type: Object,
    default: null,
  },
  initials: { type: String, default: null },
  override: {
    height: Number,
    width: Number,
    type: Object,
    default: null,
  },
});

defineEmits(["mouseenter", "mouseleave"]);

const getBkgdWrapperStyle = () => {
  return {
    ...props.override,
    height: height.value,
    width: width.value,
  };
};
const getDefaultIconStyle = () => {
  return {
    height: `${0.3889 * parseFloat(height.value.replace("px", ""))}px`,
    width: `${0.3889 * parseFloat(width.value.replace("px", ""))}px`,
  };
};
const getInitialsFontSize = () => {
  return {
    "font-size": `${
      props.override ? 0.444 * parseFloat(height.value.replace("px", "")) : "18"
    }px`,
  };
};
const getMiniIconBorderStyle = () => {
  return {
    "outline-width": `${
      0.083 * 0.4375 * parseFloat(width.value.replace("px", ""))
    }px`,
    height: `${0.4375 * parseFloat(height.value.replace("px", ""))}px`,
    width: `${0.4375 * parseFloat(width.value.replace("px", ""))}px`,
  };
};
const getMiniIconStyle = () => {
  return {
    height: `${0.4375 * parseFloat(height.value.replace("px", ""))}px`,
    width: `${0.4375 * parseFloat(width.value.replace("px", ""))}px`,
  };
};

const height = computed(
  () => (props.override && props.override.height) || "40px"
);
const width = computed(
  () => (props.override && props.override.width) || "40px"
);
</script>
<template>
  <div
    class="circle"
    :class="{ blocked: props.showBlockIcon }"
    :style="getBkgdWrapperStyle()"
    @mouseenter="$emit('mouseenter')"
    @mouseleave="$emit('mouseleave')"
  >
    <div
      v-if="props.countryInfo.countryCode"
      class="sr-only"
    >
      Your account is in {{ props.countryInfo.countryCode }} mode
    </div>

    <span
      v-if="props.initials"
      :style="getInitialsFontSize()"
    >
      {{ props.initials.toUpperCase() }}
    </span>
    <div
      v-else
      :style="getDefaultIconStyle()"
      class="circle__default"
    >
      <InlineSvg
        name="user-icon-filled"
        class="circle__default__user-icon"
      />
    </div>
    <div
      v-if="LAUNCHED_COUNTRIES.includes(props.countryInfo.countryCode)"
      class="circle__mini"
      :style="getMiniIconBorderStyle()"
    >
      <img
        v-if="props.countryInfo.countryCode"
        class="flag-badge__icon"
        :src="
          assetUrl(
            `@/assets/images/all_flags/round/${props.countryInfo.countryCode}.png`
          )
        "
        :alt="`${props.countryInfo.countryCode} flag`"
        :style="getMiniIconStyle()"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.circle {
  background-color: $color-primary-100;
  color: $color-primary-1;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  flex-grow: 0;
  flex-shrink: 0;

  &__default {
    display: flex;

    &__user-icon {
      height: 100%;
      width: 100%;
      align-self: center;
    }
  }

  &__mini {
    height: 24px;
    width: 24px;
    border-radius: 50%;
    background-color: $color-primary-20;
    outline: 2px solid $color-primary-5;
    position: absolute;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    right: -14%;
    bottom: -7%;
  }
}

.sr-only:not(:focus, :active) {
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}
</style>
