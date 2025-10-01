<script setup>
import InlineSvg from "@/features/InlineSvg.vue";
import { computed } from "vue";
import store from "@/store";
import BaseText from "@/library/BaseText.vue";

const isNestedSettingPageOpened = computed(() => {
  return !!store.state.ui.preference.right;
});

function goBack() {
  store.commit("setPreferenceRightPanel", {
    right: null,
  });
}
</script>

<template>
  <div class="settings-child-page">
    <button
      v-if="isNestedSettingPageOpened"
      class="settings-child-page__back-button"
      @click="goBack"
    >
      <InlineSvg name="chevron-left" />
      <BaseText variant="body-2-semibold">Back</BaseText>
    </button>
    <aside class="settings-child-page__aside">
      <slot name="aside" />
    </aside>

    <div class="settings-child-page__content">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.settings-child-page {
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow: auto;
  width: 100%;

  @media (min-width: 768px) {
    padding: 40px 80px;
  }

  &__aside {
    width: 100%;
  }

  &__content {
    width: 100%;

    @media (min-width: $screen-xl) {
      max-width: 700px;
    }
  }

  &__back-button {
    background: none;
    display: flex;
    align-items: center;
    color: $color-primary-100;
    border: none;
    padding: 0;
    height: 31px;
    margin-bottom: 16px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

    svg + span {
      margin-left: 12px;
    }

    &:hover {
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      transform: scale(1.01);
    }
  }
}
</style>
