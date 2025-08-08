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
});

const isModalOpen = ref(false);
</script>

<template>
  <div class="enrollment-card-header">
    <slot name="hero-icon">
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
        Secure Form
        <BaseIcon
          name="info"
          class="enrollment-card-header__info"
        />
      </BaseText>
    </div>
    <EnrollmentCardModal v-model="isModalOpen" />
  </div>
</template>

<style scoped lang="scss">
.enrollment-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

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
