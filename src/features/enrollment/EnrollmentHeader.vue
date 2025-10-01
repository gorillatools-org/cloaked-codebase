<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import LineProgress from "@/features/ui/LineProgress.vue";
import InlineSvg from "@/features/InlineSvg.vue";
import store from "@/store/index.js";
import { FROM_SUBSCRIBE_NOW } from "@/scripts/userFlags.js";

defineProps({
  step: {
    type: Number,
    required: true,
  },
  steps: {
    type: Array,
    default: () => [],
  },
});

defineEmits(["back", "close"]);

const header = ref(null);
const headerWidth = ref(0);

const onWindowResize = () => {
  headerWidth.value = header.value?.offsetWidth ?? 0;
};

onMounted(() => {
  window.addEventListener("resize", onWindowResize, { passive: true });
  onWindowResize();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onWindowResize);
});

const canClose = computed(() => store.getters.getFlag(FROM_SUBSCRIBE_NOW));
</script>

<template>
  <div
    ref="header"
    class="enrollment-header"
  >
    <span class="enrollment-header__logo">
      <InlineSvg name="cloaked-logo-orange" />
    </span>
    <LineProgress
      :width="headerWidth"
      :progress="step / steps.length"
      class="enrollment-header__progress"
    />
    <button
      class="enrollment-header__back"
      :disabled="step === 1"
      @click="$emit('back')"
      @keydown.enter="$emit('back')"
    >
      <InlineSvg
        name="chevron-left"
        class="enrollment-header__back-icon"
      />
    </button>
    <button
      v-if="canClose"
      class="enrollment-header__close"
      @click="$emit('close')"
      @keydown.enter="$emit('close')"
    >
      <BaseIcon
        name="close"
        class="enrollment-header__close-icon"
      />
    </button>
    <BaseText
      variant="caption-semibold"
      class="enrollment-header__caption"
    >
      Step {{ step }} of {{ steps.length }}
    </BaseText>
    <BaseText
      as="h1"
      variant="headline-6-medium"
      class="enrollment-header__title"
    >
      {{ steps[step - 1] }}
    </BaseText>
  </div>
</template>

<style scoped lang="scss">
.enrollment-header {
  display: grid;
  gap: 2px 8px;
  grid-template-columns: 24px 1fr 24px;
  grid-template-areas: "logo logo logo" "progress progress progress" "back caption close" "back title close";

  &__logo {
    grid-area: logo;
    place-self: center;
    margin-bottom: 16px;
    width: 30px;
    height: 30px;

    & > * {
      width: 100%;
      height: 100%;
    }

    :deep(path:first-child) {
      fill: $color-primary-100;
    }
  }

  &__progress {
    grid-area: progress;
    margin-bottom: 20px;
  }

  &__back {
    grid-area: back;
    place-self: center;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    width: 24px;
    height: 24px;

    &:hover {
      opacity: 0.7;
    }

    &:disabled {
      opacity: 1;
      cursor: not-allowed;
    }

    &-icon {
      width: 19px;
      height: 19px;
    }

    &:focus-visible {
      outline: 1px solid $color-primary-100;
    }
  }

  &__caption {
    grid-area: caption;
  }

  &__title {
    grid-area: title;
  }

  &__close {
    grid-area: close;
    font-size: 28px;
    place-self: center;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;

    &:hover {
      opacity: 0.7;
    }

    &:focus-visible {
      outline: 1px solid $color-primary-100;
    }
  }
}
</style>
