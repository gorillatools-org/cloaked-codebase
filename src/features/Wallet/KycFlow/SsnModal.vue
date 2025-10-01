<script setup>
import ModalTemplate from "@/features/ModalTemplate";
import inlineSvg from "@/features/InlineSvg";

const props = defineProps({
  show: Boolean,
});

const emit = defineEmits(["close"]);
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
          <inlineSvg name="lock-shield" />
        </div>

        <div class="title">
          <h1>SSN or ITIN</h1>
        </div>

        <div class="block">
          <span>
            To help the government fight terrorism and money laundering
            activities, Federal law requires financial institutions to obtain,
            verify and record information that identifies each person who opens
            an account.
          </span>
        </div>

        <div class="block">
          <h2>What this means for you.</h2>
          <span>
            When you open an account, we will ask for your name, address, and
            other information that will help us to identify you. We may also ask
            to see your driver's license or other identifying documents.
          </span>
        </div>

        <div class="block">
          <h2>Your privacy matters</h2>
          <span>
            Cloaked is SOC 2 Type II Certified. This certification means
            Cloaked's security policies, procedures, and practices meet strict
            guidelines for security, processing, and protection of customer
            data.
          </span>
        </div>

        <div class="buttons">
          <button @click="emit('close')">Close</button>
        </div>
      </div>
    </template>
  </ModalTemplate>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.text {
  padding: 24px 0;

  .icon {
    width: 42px;
    margin-bottom: 12px;

    svg {
      width: 100%;
      height: auto;
    }
  }

  .title {
    h1 {
      color: $color-primary-100;
      font-size: 18px;
      font-style: normal;
      font-weight: 600;
      line-height: normal;
      margin-bottom: 20px;
    }
  }

  .block {
    margin-top: 16px;

    &:first-child {
      margin-top: 0;
    }

    span,
    h2 {
      font-size: 14px;
      font-style: normal;
      line-height: normal;
      color: $color-primary-70;
      display: block;
    }

    span {
      font-weight: 400;
    }

    h2 {
      font-weight: 600;
      margin-bottom: 8px;
    }
  }

  .buttons {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;

    button {
      background: $color-primary-100;
      padding: 11px 22px;
      color: $color-primary-1;
      border: none;
      font-size: 15px;
      font-style: normal;
      font-weight: 500;
      line-height: normal;
      border-radius: 40px;

      &:hover {
        background: $color-primary-90;
        cursor: pointer;
      }
    }
  }
}
</style>
