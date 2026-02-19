<script setup>
import AppModal from "@/features/ui/AppModal.vue";
import AppModalContent from "@/features/ui/AppModalContent.vue";
import BaseText from "@/library/BaseText.vue";
import BaseMedallion from "@/library/BaseMedallion.vue";
import BaseButton from "@/library/BaseButton.vue";
import MonitoringFeaturesSheet from "@/features/monitoring/MonitoringFeaturesSheet.vue";
import MonitoringTerms from "@/features/monitoring/MonitoringTerms.vue";
import { useRouter } from "vue-router";

const router = useRouter();

const isOpen = defineModel({ type: Boolean });

const onSetUp = () => {
  isOpen.value = false;

  setTimeout(() => {
    router.push({ name: "ExposureStatusEnrollExposures" });
  }, 400);
};
</script>

<template>
  <AppModal
    :value="isOpen"
    @input="isOpen = $event"
  >
    <AppModalContent class="monitoring-activate-modal__content">
      <header class="monitoring-activate-modal__header">
        <BaseMedallion
          icon="search-user"
          size="md"
          class="monitoring-activate-modal__medallion"
        />
      </header>
      <BaseText
        as="h2"
        variant="headline-2-regular"
        class="monitoring-activate-modal__title"
      >
        Activate Identity Monitoring
      </BaseText>
      <img
        src="@/assets/images/monitoring/app-teaser.png"
        alt="Activate Identity Monitoring"
        class="monitoring-activate-modal__image"
      />
      <MonitoringFeaturesSheet class="monitoring-activate-modal__features" />
      <footer class="monitoring-activate-modal__footer">
        <MonitoringTerms />
        <BaseButton
          type="primary"
          full-width
          @click="onSetUp"
        >
          Set up Identity Monitoring
        </BaseButton>
      </footer>
    </AppModalContent>
  </AppModal>
</template>

<style scoped lang="scss">
.monitoring-activate-modal {
  &__content {
    padding: 48px 36px;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__title {
    margin-top: 8px;
  }

  &__image {
    margin-top: 24px;
  }

  &__features {
    margin-top: -10px;
  }

  &__footer {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
  }
}
</style>
