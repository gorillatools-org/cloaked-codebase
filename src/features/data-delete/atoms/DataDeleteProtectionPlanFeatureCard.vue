<script setup>
import DataDeleteCard from "@/features/data-delete/atoms/DataDeleteCard.vue";
import BaseText from "@/library/BaseText.vue";

defineProps({
  feature: { type: Object, required: true },
  index: { type: Number, required: true },
});
</script>

<template>
  <DataDeleteCard
    type="light"
    class="data-delete-plan-card"
  >
    <div class="data-delete-plan-card__badge">
      <BaseText
        as="p"
        variant="body-small-semibold"
        class="data-delete-plan-card__badge-text"
      >
        {{ index + 1 }}
      </BaseText>
    </div>

    <div class="data-delete-plan-card__content">
      <BaseText
        as="p"
        variant="headline-6-bold"
        class="data-delete-plan-card__title"
      >
        {{ feature.title }}
      </BaseText>

      <BaseText
        as="p"
        variant="label-medium"
        class="data-delete-plan-card__description"
      >
        {{ feature.description }}
      </BaseText>

      <BaseText
        v-if="feature.status"
        as="p"
        variant="label-medium"
        class="data-delete-plan-card__status"
      >
        {{ feature.status }}
      </BaseText>
    </div>
  </DataDeleteCard>
</template>

<style scoped lang="scss">
.data-delete-plan-card {
  display: flex;
  position: relative;
  padding: 16px;
  border-radius: 24px;

  &__badge {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: $color-white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 6px;
    margin-top: 2px;
    color: $color-primary-1;
    flex-shrink: 0;
  }

  &__badge-text {
    font-size: 13px;
    line-height: 1;
  }

  &__content {
    display: flex;
    flex-direction: column;
  }

  &__title {
    font-size: 16px;
    line-height: 20px;
    margin-bottom: 4px;
  }

  &__description {
    font-size: 12px;
    line-height: 16px;
    margin-bottom: 8px;
  }

  &__status {
    font-size: 12px;
    line-height: 16px;
    margin-top: auto;
  }

  @media screen and (min-width: $screen-sm) {
    padding: 20px;
  }

  @media all and (min-width: $screen-md) {
    &__badge-text {
      font-size: 14px;
    }

    &__title {
      font-size: 20px;
      line-height: 24px;
      margin-bottom: 3px;
    }

    &__description {
      font-size: 14px;
      line-height: 20px;
      margin-bottom: 14px;
    }

    &__status {
      font-size: 14px;
      line-height: 20px;
    }

    &__badge {
      width: 20px;
      height: 20px;
      margin-right: 6px;
    }
  }
}
</style>
