<script setup>
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import BaseMedallion from "@/library/BaseMedallion.vue";
import MonitoringFeaturesSheet from "@/features/monitoring/MonitoringFeaturesSheet.vue";
import MonitoringTerms from "@/features/monitoring/MonitoringTerms.vue";

defineEmits(["go-to-monitoring"]);
</script>

<template>
  <div class="page-enrollment-activated">
    <BaseMedallion
      icon="search-user"
      size="md"
      class="page-enrollment-activated__medallion"
    />
    <BaseText
      as="h1"
      variant="headline-2-semibold"
      class="page-enrollment-activated__title"
    >
      Identity Monitoring is activated
    </BaseText>
    <BaseText
      variant="headline-6-medium"
      class="page-enrollment-activated__text"
    >
      To get the best experience download the Cloaked App.
    </BaseText>
    <img
      src="@/assets/images/monitoring/app-teaser-qr.png"
      alt="Activate Identity Monitoring"
      class="page-enrollment-activated__image"
    />
    <MonitoringFeaturesSheet class="page-enrollment-activated__features" />
    <footer class="page-enrollment-activated__footer">
      <MonitoringTerms />
      <BaseButton
        variant="secondary"
        full-width
        class="page-enrollment-activated__continue"
        @click="$emit('go-to-monitoring')"
        @keydown.enter="$emit('go-to-monitoring')"
      >
        Continue
      </BaseButton>
      <BaseText
        variant="body-small-medium"
        as="a"
        class="page-enrollment-activated__done"
        @click="$emit('go-to-monitoring')"
        @keydown.enter="$emit('go-to-monitoring')"
      >
        I've already downloaded the app
      </BaseText>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.page-enrollment-activated {
  display: flex;
  flex-direction: column;
  align-items: center;

  &__medallion {
    :deep(.base-medallion__button) {
      background-color: $color-safe-zone-green-15;
    }

    :deep(.base-medallion__button-icon) {
      background-color: $color-safe-zone-green;
    }
  }

  &__title {
    width: 100vw;
    text-align: center;
    padding: 0 16px;
    margin-top: 8px;
  }

  &__text {
    margin-top: 12px;
    color: $color-primary-70;
    text-align: center;
  }

  &__image {
    margin-top: 24px;
  }

  &__features {
    margin-top: -10px;
  }

  &__footer {
    width: 100%;
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__continue {
    margin-top: 24px;
  }

  &__done {
    text-decoration: underline;
    cursor: pointer;
    margin-top: 12px;

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
