<script setup>
import InlineSvg from "@/features/InlineSvg.vue";
import { useRouter } from "vue-router";
import { posthogCapture } from "@/scripts/posthog.js";
import BaseText from "@/library/BaseText.vue";

const router = useRouter();

function navToSettings() {
  router.push({ name: "settings.subscription" });
  posthogCapture("user_clicks_send_invite_advanced_dashboard_bulk_plan");
}
</script>
<template>
  <div class="home-bulk-plan">
    <div class="title-col">
      <BaseText
        as="h1"
        variant="headline-4-bold"
      >
        Start Data Removal for your Family
      </BaseText>
      <div
        class="subtitle-text"
        @click="navToSettings"
      >
        <BaseText
          variant="body-3-semibold"
          underline
        >
          Send Invites
        </BaseText>
        <InlineSvg name="chevron-right" />
      </div>
    </div>
    <div class="home-bulk-plan-icon">
      <InlineSvg name="user-verification-blue-gradient" />
    </div>
  </div>
</template>
<style lang="scss" scoped>
/* stylelint-disable */
.home-bulk-plan {
  border-radius: 10px;
  border: 1px solid $color-primary-10;
  padding: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  .title-col {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
    justify-content: center;
    color: $color-primary-100;

    .subtitle-text {
      display: flex;
      flex-direction: row;
      gap: 4px;
      align-items: center;
      justify-content: flex-start;
      cursor: pointer;

      svg {
        height: 11px;
        width: auto;
      }
    }
  }

  .home-bulk-plan-icon {
    border-radius: 18.667px;
    border: 0.887px solid $color-base-white-100;
    width: 64px;
    height: 64px;
    flex-shrink: 0;
    padding: 10.5px;
    background: rgb(83 172 240 / 5%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 5px 5px 30px 0 rgba($black, 0.15);

    svg {
      height: 43px;
      width: 43px;
    }
  }
}
</style>
