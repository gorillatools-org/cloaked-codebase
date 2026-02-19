<script setup>
import inlineSvg from "@/features/InlineSvg.vue";
import { computed, onMounted } from "vue";
import store from "@/store";
import CardsServices from "@/api/actions/cards-services";
import { useBasicMode } from "@/composables/useBasicMode.js";
import { posthogCapture } from "@/scripts/posthog";
import CardExampleGroup from "@/features/Wallet/CardExampleGroup.vue";

const { isBasicModeEnabled } = useBasicMode();

const eventModeName = computed(() => {
  return isBasicModeEnabled.value ? "basic" : "advanced";
});

const status = computed(() => {
  if (
    store.state.authentication?.user?.card_wait_list?.placement ||
    store.state.authentication?.user?.card_wait_list === true
  ) {
    return true;
  } else {
    return false;
  }
});

function signUp() {
  CardsServices.addToWaitlist();
  posthogCapture(`pay_waitlist_${eventModeName.value}_mode_join_tapped`);
}

onMounted(() => {
  posthogCapture(`pay_waitlist_${eventModeName.value}_mode_viewed`);
});
</script>

<template>
  <div class="waitlist-section">
    <div class="waitlist-section__title">
      <span class="waitlist-section__pill">Coming Soon</span>
      <h1>Cloaked Pay</h1>
    </div>

    <div class="waitlist-section__text">
      <p>
        Experience a new era of control, privacy, and protection with Cloaked
        Pay.
      </p>
      <p>
        Create unique virtual Mastercard® numbers for every purchase. Cloak
        your real card. Lock out fraud. Stay one step ahead of fraudsters.
      </p>
    </div>

    <div class="waitlist-section__button">
      <button
        :class="{ disabled: status === true }"
        @click="signUp()"
      >
        <span v-if="status !== true">Join the waitlist</span>
        <span v-if="status === true">You're on the list!</span>
        <inlineSvg
          v-if="status !== true"
          :key="status"
          name="list"
        />
        <inlineSvg
          v-if="status === true"
          :key="status"
          name="user-success"
        />
      </button>
    </div>

    <CardExampleGroup class="waitlist-section__card-examples" />
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.waitlist-section {
  width: 100%;
  min-height: calc(100vh - 60px);
  padding: 66px 64px 38px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden !important;

  > div {
    margin-top: 27px;

    &:first-child {
      margin-top: 0;
    }

    &:last-child {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }
  }
}

.waitlist-section__card-examples {
  position: absolute;
  left: 580px;
}

.waitlist-section__title {
  max-width: 454px;

  h1 {
    color: $color-primary-100;
    font-size: 54px;
    font-style: normal;
    font-weight: 700;
    line-height: 63px;
  }
}

.waitlist-section__pill {
  border-radius: 20px;
  background:
    linear-gradient($color-base-white-100, $color-base-white-100) padding-box,
    $cloaked-gradient border-box;
  padding: 7px 20px;
  border: 2px solid transparent;
  font-size: 13px;
  color: $color-primary-100;
  margin-bottom: 24px;
  display: inline-block;
}

.waitlist-section__text {
  max-width: 454px;

  h1 {
    color: $color-primary-100;
    font-size: 18px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
    margin-bottom: 4px;
  }

  p,
  ul {
    color: $color-primary-50;
    font-size: 18px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    margin-top: 12px;

    &:first-child {
      margin-top: 0;
    }
  }

  ul {
    li {
      padding-left: 20px;
      position: relative;

      &::before {
        content: "";
        position: absolute;
        top: 50%;
        left: 5px;
        transform: translateY(-50%);
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background-color: $color-primary-50;
      }
    }
  }

  &.terms {
    p {
      color: $color-primary-100;
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      line-height: normal;

      a {
        text-decoration: underline;
      }
    }
  }
}

.waitlist-section__button {
  max-width: 215px;

  button {
    width: 100%;
    padding: 11px;
    border-radius: 30px;
    background: transparent;
    color: $color-primary-100;
    font-size: 15px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    border: 1px solid $color-primary-100;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: $color-primary-10;
    }

    svg {
      width: 24px;
      height: 24px;
      margin-left: 10px;
      display: inline-block;
    }

    &.disabled {
      cursor: not-allowed;
      background: $color-success;
      border-color: $color-success;
      color: $white;
      pointer-events: none;
    }
  }
}
</style>
