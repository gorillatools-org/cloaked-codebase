<script setup>
import { computed } from "vue";
import store from "@/store";
import BaseText from "@/library/BaseText.vue";

const kycValidated = computed(() => {
  return store.state.authentication?.user?.cloaked_card_kyc_configured;
});
</script>

<template>
  <div class="status">
    <div class="title">
      <BaseText
        as="h1"
        variant="headline-3-bold"
      >
        Status
      </BaseText>

      <BaseText
        v-if="kycValidated"
        as="p"
        variant="body-2-semibold"
        class="approved"
      >
        Approved for Cloaked Pay
      </BaseText>
      <BaseText
        v-else
        as="p"
        variant="body-2-semibold"
        class="rejected"
      >
        Not approved for Cloaked Pay
      </BaseText>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.status {
  margin-top: 24px;
  .title {
    p {
      margin-top: 16px;
      color: $color-primary-70;
      padding-left: 22px;
      position: relative;
      &:before {
        content: "";
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: $color-primary-100;
        position: absolute;
        left: 6px;
        top: 50%;
        transform: translateY(-50%);
      }
      &.approved {
        &:before {
          background-color: $color-success;
        }
      }
      &.rejected {
        &:before {
          background-color: $color-alert;
        }
      }
    }
  }
}
</style>
