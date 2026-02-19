<script setup lang="ts">
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import type { BaseIconName } from "@/library/baseIconTypes";

defineProps<{
  icon: BaseIconName;
  title: string;
  subtitle: string;
}>();
</script>

<template>
  <header class="scan-header">
    <div class="scan-header__head">
      <div class="scan-header__left">
        <div
          class="scan-header__icon"
          aria-hidden="true"
        >
          <BaseIcon
            :name="icon"
            class="scan-header--icon"
          />
        </div>
        <BaseText
          as="h2"
          variant="headline-5-bold"
          class="scan-header__title"
        >
          {{ title }}
        </BaseText>
      </div>
      <slot name="feedback" />
    </div>

    <BaseText
      as="h3"
      variant="headline-3-bold"
      class="scan-header__subtitle"
    >
      {{ subtitle }}
    </BaseText>
  </header>
</template>

<style lang="scss" scoped>
.scan-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;

  &--icon {
    font-size: 20px;
  }

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }

  &__left {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  &__icon {
    width: 48px;
    height: 48px;
    border-radius: 24px;
    display: grid;
    place-items: center;
    background-color: $color-status-error;
  }

  &__title {
    color: $color-primary-100;
    font-size: 16px;

    @media screen and (min-width: $screen-sm) {
      font-size: 18px;
    }
  }

  &__subtitle {
    color: $color-primary-100;
  }
}
</style>
