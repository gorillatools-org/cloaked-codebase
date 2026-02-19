<script setup>
import { computed } from "vue";
import InlineSvg from "@/features/InlineSvg.vue";
import BaseButton from "@/library/BaseButton.vue";
import DataDeleteSticky from "@/features/data-delete/atoms/DataDeleteSticky.vue";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";
import { PH_FEATURE_FLAG_TOP_OF_FUNNEL_EXPERIMENT } from "@/scripts/posthogEvents";

const { featureFlag, hasLoadedFeatureFlag } = usePostHogFeatureFlag(
  PH_FEATURE_FLAG_TOP_OF_FUNNEL_EXPERIMENT
);

const ctaText = computed(() => {
  if (!hasLoadedFeatureFlag.value) return "Remove my Data";

  switch (featureFlag.value) {
    case "spycloud-flow-cta-a":
      return "Clean Up My Data";
    case "spycloud-flow-cta-b":
      return "Remove My Information";
    case "spycloud-flow-cta-c":
      return "Remove My Data";
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
  <DataDeleteSticky class="scan-page-header__sticky-wrapper">
    <BaseButton
      class="scan-page-header__cta"
      variant="primary"
      @click="onDelete"
    >
      {{ ctaText }}
    </BaseButton>
  </DataDeleteSticky>
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
    padding: 16px;
  }
}

@media all and (min-width: $screen-sm) {
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
