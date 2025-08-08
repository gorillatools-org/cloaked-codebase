<script setup>
import InlineSvg from "@/features/InlineSvg.vue";
import { posthogCapture } from "@/scripts/posthog.js";
import { useRouter } from "vue-router";
import { useInvites } from "@/features/subscribe/composables/useInvites.js";

const router = useRouter();
const { freeSpots } = useInvites();

function navToSettings() {
  router.push({ name: "settings.subscription" });
  posthogCapture("user_clicks_send_invite_basic_dashboard_bulk_plan");
}
</script>

<template>
  <div class="bulk-plan-card">
    <div class="icon-wrapper">
      <InlineSvg name="user-verification-blue-gradient" />
      <p class="title">Secure your family</p>
    </div>
    <p class="description">
      Protect your loved ones by starting their Data Removal process. You have
      <span class="bold">{{ freeSpots }}</span>
      {{ freeSpots === 1 ? "invite" : "invites" }} remaining.
    </p>
    <button
      class="activate-button"
      @click="navToSettings"
    >
      Send Invite
    </button>
  </div>
</template>

<style scoped lang="scss">
.bulk-plan-card {
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

    .bold {
      font-size: 12px;
      font-style: normal;
      font-weight: 600;
      line-height: normal;
      color: $color-primary-100;
    }
  }

  .activate-button {
    background: linear-gradient(46deg, #0085ff 1.19%, #67dbfc 100%);
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
