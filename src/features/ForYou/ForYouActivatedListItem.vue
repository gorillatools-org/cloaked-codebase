<script setup>
import BaseIcon from "@/library/BaseIcon.vue";
import BaseText from "@/library/BaseText.vue";
import { computed } from "vue";

const props = defineProps({
  feature: {
    type: Object,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["click"]);

const iconMapping = {
  vpn: "website",
  id_monitoring: "search-user",
  heimdall: "phone-shield",
  data_deletion: "data-broker",
  id_theft: "shield-tick-filled",
};

const progressMapping = {
  vpn: "For Your Privacy",
  id_monitoring: "For Your Safety",
  heimdall: "For Tackling Spam",
  data_deletion: "Protecting Your Safety",
  id_theft: "Securing Your Identity",
};

const icon = computed(() => {
  return iconMapping[props.feature.internal_name] || "cloaked-logo-outline";
});

const progress = computed(() => {
  return progressMapping[props.feature.internal_name] || null;
});
</script>

<template>
  <div
    class="for-you-activated-list-item"
    :class="{ 'for-you-activated-list-item--active': isActive }"
    @click="emit('click', props.feature)"
  >
    <BaseIcon
      :name="icon"
      class="for-you-activated-list-item__icon"
    />
    <div class="for-you-activated-list-item__content">
      <BaseText
        variant="body-small-semibold"
        class="for-you-activated-list-item__title"
      >
        {{ props.feature.public_name }}
      </BaseText>
      <BaseText
        variant="caption-semibold"
        class="for-you-activated-list-item__description"
      >
        {{ progress }}
      </BaseText>
    </div>

    <BaseIcon
      name="chevron-right"
      class="for-you-activated-list-item__chevron"
    />
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.for-you-activated-list-item {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  border-radius: 24px;
  border: 1px solid $color-primary-10;
  background: $color-base-white-100;
  box-shadow: 0px 4px 24px 0px rgba(0, 0, 0, 0.05);
  padding: 16px;
  position: relative;

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    font-size: 40px;
    font-weight: 500;
    background-color: $color-primary-5;
    font-size: 20px;
    color: $color-primary-100;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 16px;
    transform: translateY(-50%);
    border: 1px solid $color-primary-10;
  }

  &__content {
    margin-left: 50px;
    margin-right: 58px;
  }

  &__title,
  &__description {
    display: block;
    width: 100%;
  }

  &__chevron {
    position: absolute;
    right: 8px;
    top: 50%;
    width: 40px;
    height: 40px;
    font-size: 18px;
    font-weight: 600;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &:hover {
    background-color: $color-primary-1;
    cursor: pointer;
  }

  &--active {
    background-color: rgba($color-foam-blue, 0.15);

    & .for-you-activated-list-item__icon {
      background-color: transparent;
      border: 1px solid $color-foam-blue;
    }

    &:hover {
      background-color: rgba($color-foam-blue, 0.15);
      cursor: default;
    }
  }
}
</style>
