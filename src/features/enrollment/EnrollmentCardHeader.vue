<script setup>
import { ref } from "vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import EnrollmentCardModal from "@/features/enrollment/EnrollmentCardModal.vue";

defineProps({
  icon: {
    type: String,
    default: "user-tick-filled",
  },
  secureText: {
    type: String,
    default: "Secure Form",
  },
  hideIcon: {
    type: Boolean,
    default: false,
  },
  alignment: {
    type: String,
    default: "space-between",
    validator: (value) =>
      ["flex-start", "flex-end", "center", "space-between"].includes(value),
  },
  subheaderText: {
    type: String,
    default: undefined,
  },
  headerText: {
    type: String,
    default: undefined,
  },
});

const isModalOpen = ref(false);
</script>

<template>
  <div
    class="enrollment-card-header"
    :class="`enrollment-card-header--${alignment}`"
  >
    <slot
      v-if="!hideIcon"
      name="hero-icon"
    >
      <BaseIcon
        :name="icon"
        class="enrollment-card-header__user"
      />
    </slot>
    <div
      class="enrollment-card-header__secure"
      @click="isModalOpen = true"
    >
      <BaseText
        variant="caption-bold"
        class="enrollment-card-header__secure-text"
      >
        <BaseIcon
          name="lock-filled"
          class="enrollment-card-header__lock"
        />
        {{ secureText }}
        <BaseIcon
          name="info"
          class="enrollment-card-header__info"
        />
      </BaseText>
    </div>
    <EnrollmentCardModal
      v-model="isModalOpen"
      :subheader-text="subheaderText"
      :header-text="headerText"
    />
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.enrollment-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  &--flex-end {
    justify-content: flex-end;
  }

  &--flex-start {
    justify-content: flex-start;
  }

  &--center {
    justify-content: center;
  }

  &--space-between {
    justify-content: space-between;
  }

  &__user {
    font-size: 46px;
    margin: 6px;
  }

  &__secure {
    position: relative;
    cursor: pointer;

    &:before,
    &:after {
      content: "";
      position: absolute;
      border-radius: 100px;
    }

    &:before {
      inset: -1px;
      background: linear-gradient(46deg, #0085ff 1.19%, #67dbfc 100%);
    }

    &:after {
      inset: 0;
      background: $color-base-white-100;
    }

    &-text {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 10px 16px;
      background-image: linear-gradient(46deg, #0085ff 1.19%, #67dbfc 100%);
      color: transparent;
      background-clip: text;
      position: relative;
      z-index: 1;
    }
  }

  &__lock,
  &__info {
    background-image: linear-gradient(46deg, #0085ff 1.19%, #67dbfc 100%);
    color: transparent;
    background-clip: text;
  }

  &__lock {
    font-size: 19px;
    font-weight: 400;
  }

  &__info {
    font-size: 16px;
    font-weight: 400;
    margin-left: 4px;
  }
}
</style>
