<script setup>
import ModalTemplate from "@/features/ModalTemplate";
import inlineSvg from "@/features/InlineSvg";
import { posthogCapture } from "@/scripts/posthog.js";

const props = defineProps({
  show: Boolean,
});

const emit = defineEmits(["close", "goBack"]);

const closeModal = () => {
  posthogCapture("pay_wallet_kyc_flow_start_verification_button_tapped");
  emit("close");
};
</script>

<template>
  <ModalTemplate
    :show="props.show"
    class="identity-verification"
    no-close
    width="375px"
  >
    <template #body>
      <div class="text">
        <div class="icon">
          <inlineSvg name="pay/identity-verification" />
        </div>

        <h1>Identity verification</h1>

        <p>
          Cloaked will securely verify your legal name, address and other
          specifics, for Cloaked Pay.
        </p>

        <div class="buttons">
          <button @click="closeModal">
            Start verification
            <inlineSvg name="user-verification" />
          </button>
          <span @click="emit('goBack')">Go back</span>
        </div>
      </div>
    </template>
  </ModalTemplate>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.text {
  color: $color-primary-100;
  padding: 36px 0;
  text-align: center;

  .icon {
    margin-bottom: 24px;
    width: 130px;
    display: inline-block;

    svg {
      width: 100%;
      height: auto;
    }
  }

  h1 {
    font-size: 32px;
    font-style: normal;
    font-weight: 600;
    line-height: 40px;
    color: $color-primary-100;
    padding: 0 10px;
  }

  p {
    margin-top: 16px;
    font-size: 15px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    color: $color-primary-70;
  }

  .buttons {
    margin-top: 16px;

    button {
      width: 100%;
      background: $color-primary-100;
      padding: 11px;
      color: $color-primary-1;
      border: none;
      border-radius: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      font-style: normal;
      font-weight: 500;
      line-height: normal;

      svg {
        width: 24px;
        height: 24px;
        margin-left: 4px;
        padding: 4px;
      }

      &:hover {
        cursor: pointer;
        background: $color-primary-90;
      }
    }

    span {
      margin-top: 16px;
      display: inline-block;
      font-size: 15px;
      font-style: normal;
      font-weight: 500;
      line-height: normal;
      color: $color-primary-100;

      &:hover {
        cursor: pointer;
        text-decoration: underline;
      }
    }
  }
}
</style>
