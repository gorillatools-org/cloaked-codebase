<script setup>
import BaseSheet from "@/library/BaseSheet.vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseInputFeedback from "@/library/BaseInputFeedback.vue";

defineProps({
  title: {
    type: String,
    default: null,
  },
  subtitle: {
    type: String,
    default: null,
  },
  icon: {
    type: String,
    default: "name-card",
  },
  text: {
    type: String,
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
});

defineEmits(["click", "keydown"]);
</script>

<template>
  <div
    class="enrollment-add-info"
    :class="{
      'enrollment-add-info--disabled': disabled,
      'enrollment-add-info--error': !!error,
    }"
    tabindex="0"
    @click="!disabled && $emit('click')"
    @keydown.enter="!disabled && $emit('keydown', $event)"
  >
    <BaseText
      v-if="title"
      as="span"
      variant="body-small-medium"
      class="enrollment-add-info__title"
    >
      {{ title }}
    </BaseText>
    <BaseSheet
      spacing-y="sm"
      spacing-x="sm"
      elevation="sm"
      class="enrollment-add-info__sheet"
    >
      <div class="enrollment-add-info__icon">
        <BaseIcon :name="icon" />
      </div>
      <div>
        <BaseText
          v-if="subtitle"
          as="h4"
          variant="body-3-semibold"
        >
          {{ subtitle }}
        </BaseText>
        <BaseText
          v-if="text"
          as="p"
          variant="caption-semibold"
          class="enrollment-add-info__text"
        >
          {{ text }}
        </BaseText>
      </div>
      <BaseIcon
        name="chevron-right"
        class="enrollment-add-info__chevron"
      />
    </BaseSheet>
    <BaseInputFeedback
      v-if="error"
      :message="error"
      variant="error"
    />
  </div>
</template>

<style scoped lang="scss">
.enrollment-add-info {
  display: grid;
  gap: 4px 0;

  &:focus {
    outline: none;
  }

  &__title {
    color: $color-primary-50;
  }

  &__sheet {
    display: grid;
    grid-template-columns: 32px 1fr 24px;
    cursor: pointer;
    align-items: center;
    grid-column-gap: 10px;

    &:hover {
      border: 1px solid $color-primary-50;
    }

    @at-root .enrollment-add-info--error & {
      border-color: $color-alert;
    }

    @at-root .enrollment-add-info--disabled & {
      background-color: $color-primary-5;
      color: $color-primary-20;
      border: 1px solid rgba($black, 0.05);
      cursor: not-allowed;

      &:hover {
        border: 1px solid rgba($black, 0.05);
      }
    }

    @at-root .enrollment-add-info:focus & {
      outline: none;
      border-color: $color-primary-100;
    }
  }

  &__icon {
    place-self: center;
    font-size: 19px;
    width: 32px;
    height: 32px;
    background-color: $color-primary-5;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 100px;
  }

  &__text {
    color: $color-primary-50;
  }

  &__chevron {
    place-self: center;
    font-size: 19px;
  }
}
</style>
