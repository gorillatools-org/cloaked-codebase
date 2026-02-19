<script setup>
import { computed } from "vue";
import InlineSvg from "@/features/InlineSvg.vue";
import BaseButton from "@/library/BaseButton.vue";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";
import { PH_FEATURE_FLAG_SCAN_RESULTS_PROTECT_CTA } from "@/scripts/posthogEvents";

const { featureFlag, hasLoadedFeatureFlag } = usePostHogFeatureFlag(
  PH_FEATURE_FLAG_SCAN_RESULTS_PROTECT_CTA
);

const ctaText = computed(() => {
  if (!hasLoadedFeatureFlag.value) return "Remove my Data";

  switch (featureFlag.value) {
    case "test-A":
      return "Delete your online data";
    case "test-B":
      return "Protect your online data";
    default:
      return "Remove My Data";
  }
});

const emit = defineEmits(["delete"]);

const onDelete = () => {
  emit("delete");
};
</script>

<template>
  <header class="scan-page-header">
    <div class="scan-page-header__logo">
      <InlineSvg
        name="cloaked-logo-full"
        class="scan-page-header__logo-full"
      />
    </div>
    <div>
      <BaseButton
        class="scan-page-header__cta"
        variant="primary"
        @click="onDelete"
      >
        {{ ctaText }}
      </BaseButton>
    </div>
  </header>
  <div class="scan-page-header__sticky-wrapper">
    <BaseButton
      class="scan-page-header__cta"
      variant="primary"
      @click="onDelete"
    >
      {{ ctaText }}
    </BaseButton>
  </div>
</template>

<style scoped lang="scss">
.scan-page-header {
  display: none;

  &__logo {
    padding: 8px 16px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__logo-full {
    width: 143px;
  }

  &__cta {
    width: 100%;
    height: 54px;
    font-size: 15px;
    font-weight: 600;

    :deep(.base-icon) {
      display: none;
    }
  }

  &__sticky-wrapper {
    position: fixed;
    z-index: 10;
    bottom: 0;
    left: 0;
    width: 100vw;
    padding: 16px 22px;

    @at-root .theme-dark & {
      background: linear-gradient(to bottom, transparent, $black);
    }

    @at-root .theme-light & {
      background: linear-gradient(to bottom, transparent, $white);
    }

    @media all and (min-width: $screen-lg) {
      position: static;
      width: 100%;
      padding: 0;

      @at-root .theme-dark &,
        .theme-light & {
        background: none;
      }
    }
  }
}

@media all and (min-width: $screen-lg) {
  .scan-page-header {
    display: flex;
    justify-content: space-between;
    max-width: 1014px;
    margin: auto;
    align-items: center;

    &__sticky-wrapper {
      display: none;
    }
  }
}
</style>
