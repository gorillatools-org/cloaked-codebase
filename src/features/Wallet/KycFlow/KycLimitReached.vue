<script setup>
import { HELP_CENTER_BASE_URL } from "@/scripts/constants";

defineEmits(["toggleVisible"]);

function toggleSupport() {
  window.open(HELP_CENTER_BASE_URL, "_blank");
}
</script>

<template>
  <section>
    <div class="content">
      <div class="title">
        <h1>Cannot complete verification</h1>
      </div>

      <div class="text">
        <p>
          The limit for KYC checks has been reached. Please contact support for
          assistance.
        </p>
      </div>

      <div class="button">
        <button @click="toggleSupport()">Contact support</button>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
section {
  position: relative;
  overflow: hidden;

  .content {
    width: 100%;
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
    max-width: 654px;

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
