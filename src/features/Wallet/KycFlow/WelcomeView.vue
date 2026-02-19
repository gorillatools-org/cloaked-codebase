<script setup>
import { onMounted } from "vue";
import {
  HELP_CENTER_BASE_URL,
  WEBSITE_TERMS_OF_SERVICE_URL,
  WEBSITE_PRIVACY_POLICY_URL,
} from "@/scripts/constants";
import InlineSvg from "@/features/InlineSvg.vue";
import CardExampleGroup from "@/features/Wallet/CardExampleGroup.vue";
import { posthogCapture } from "@/scripts/posthog.js";

const emit = defineEmits(["toggleVisible"]);

onMounted(() => {
  posthogCapture("pay_wallet_kyc_flow_welcome_viewed");
});
</script>

<template>
  <section>
    <div class="content">
      <div class="title">
        <h1>Welcome to Cloaked Pay</h1>
      </div>

      <div class="text">
        <p>
          Protect your payments, preserve your perks. With Cloaked Pay, you can
          keep your current rewards and benefits—while layering on powerful
          privacy controls, fraud prevention, and identity theft protection.
        </p>
      </div>

      <div class="text">
        <h1>Cloaked Pay perks</h1>
        <ul>
          <li>Unlimited virtual cards</li>
          <li>Instant card issuance with new numbers for every purchase</li>
          <li>Built-in merchant locking and user controls</li>
          <li>Self-destruct timers for total control</li>
          <li>Connect any debit, credit, or bank account</li>
        </ul>
      </div>

      <div class="button">
        <button @click="emit('toggleVisible')">
          Continue
          <InlineSvg name="arrow-right" />
        </button>
      </div>

      <div class="text terms">
        <p>
          Cloaked Pay is available to eligible U.S.-verified customers in
          certain states. Payment methods for Cloaked Pay may vary by
          jurisdiction. Cloaked Pay is issued by Patriot Bank, N.A., pursuant to
          licenses from Mastercard® International Incorporated. The card can be
          used everywhere Mastercard is accepted. Mastercard is a registered
          trademark of Mastercard International. For more information, please
          take a look at the
          <a
            :href="HELP_CENTER_BASE_URL"
            target="_blank"
          >
            Frequently Asked Questions
          </a>
          ,
          <a
            :href="WEBSITE_TERMS_OF_SERVICE_URL"
            target="_blank"
          >
            Terms of Service
          </a>
          and
          <a
            :href="WEBSITE_PRIVACY_POLICY_URL"
            target="_blank"
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>

    <CardExampleGroup class="cards" />
  </section>
</template>

<style scoped lang="scss">
/* stylelint-disable */
section {
  position: relative;
  overflow: hidden;

  .content {
    width: 100%;
    min-height: calc(100vh - 60px);
    padding: 66px 64px 38px;
    display: flex;
    flex-direction: column;

    > div {
      margin-top: 27px;

      &:first-child {
        margin-top: 0;
      }

      &:last-child {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
      }
    }
  }

  .title {
    max-width: 454px;

    h1 {
      color: $color-primary-100;
      font-size: 54px;
      font-style: normal;
      font-weight: 700;
      line-height: 63px;
    }
  }

  .text {
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

  .button {
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
        width: 15px;
        height: 15px;
        margin-left: 10px;
        display: inline-block;
      }
    }
  }

  .cards {
    position: absolute;
    left: 580px;
    top: 180px;
  }
}
</style>
