<script setup>
import { markRaw, ref } from "vue";
import store from "@/store";
import InlineSvg from "@/features/InlineSvg.vue";
import { posthogCapture } from "@/scripts/posthog.js";
import IdentityTheftProtectionModal from "@/features/IdentityTheftProtection/IdentityTheftProtectionModal.vue";

const identityTheftProtectionModal = ref(false);

function showIdentityTheftModal() {
  posthogCapture("users_click_idtheft_cloakedv3");
  identityTheftProtectionModal.value = true;

  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(IdentityTheftProtectionModal),
      props: {
        show: true,
      },
      events: {
        close: () => {
          identityTheftProtectionModal.value = false;
          store.dispatch("closeModal");
        },
      },
    },
  });
}
</script>

<template>
  <div class="id-theft-card">
    <div class="icon-wrapper">
      <InlineSvg name="checkmark-shield-gradient" />
      <p class="title">Identity Theft Protection</p>
    </div>
    <p class="description">
      Activate $1M coverage in the event of a data breach. Free with your
      subscription.
    </p>
    <button
      class="activate-button"
      @click="showIdentityTheftModal"
    >
      Learn more
    </button>
  </div>
</template>

<style scoped lang="scss">
.id-theft-card {
  background: $color-primary-1;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 16px 20px 0 rgba($black, 0.05);
  width: 100%;
  border: 1px solid $color-primary-10;
  height: fit-content;
  gap: 8px;
  display: flex;
  flex-direction: column;

  .icon-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;

    .title {
      color: $color-primary-100;
      font-size: 15px;
      font-weight: 600;
      line-height: 22.5px;
    }
  }

  .description {
    color: $color-primary-70;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
  }

  .activate-button {
    background: $cloaked-gradient;
    color: $color-primary-1-light;
    font-size: 12px;
    font-weight: 600;
    line-height: 18px;
    padding: 8px 16px;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    width: 100%;
    display: block;
    box-shadow: 0 4px 10px rgba($black, 0.1);
    transition: background 0.3s ease;

    &:hover {
      box-shadow: 0 5px 5px 0 rgba($color-primary-100-light, 0.1);

      @at-root .theme-dark & {
        box-shadow: 0 5px 5px 0 rgba($color-primary-100-dark, 0.1);
      }

      &:disabled {
        transform: none;
        box-shadow: none;
        transition: none;
      }
    }
  }
}
</style>
