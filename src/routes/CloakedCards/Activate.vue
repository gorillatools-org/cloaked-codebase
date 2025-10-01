<script setup>
import { reactive, ref } from "vue";
import KYC from "@/routes/CloakedCards/KYC.vue";
import CreateCard from "@/routes/CloakedCards/CreateCard.vue";
import InlineSvg from "@/features/InlineSvg.vue";

const ui = reactive({
  bannerActive: false,
  step: 0,
  kycStatus: null,
});
function kycOpen() {
  ui.bannerActive = true;
}
function kycClose() {
  ui.bannerActive = false;
}
function kycNext(payload) {
  ui.step = 1;
  ui.kycStatus = payload.status;
}
function done() {
  ui.bannerActive = false;
  ui.step = 0;
}
const accordianItems = ref([
  {
    q: "If I generate a new cloaked card, what is the expiration date?",
    a: [
      "If you generate a card with a daily, weekly, monthly, or yearly limit, the cloaked card generated will  specify the expiration date, and may vary between different cards.  This is similar to your current debit or credit cards, which vary in expiration timeframe and date.",
      "If you generate a “one-time” card, it will be rendered unusable after a single purchase, despite an expiration date that may extend beyond the initial purchase date.",
    ],
    open: false,
  },
  {
    q: "Can I put more than my purchase amount, and use the same card more than once?",
    a: [
      "Yes, if you generate a multi-use card with a daily, weekly, monthly or yearly limit. The limit you set can be adjusted to meet your spending needs.",
      "No, if you generate a “one-time” use card.",
    ],
    open: false,
  },
  {
    q: "Why do you need to verify my identity? I thought Cloaked was about privacy.",
    a: [
      "Pursuant to regulation, Cloaked, working with its Bank partners, must obtain, verify, and record information that identifies each person who opens an account.  We collect the required information for this identification, and “know your customer” requirements.",
    ],
    open: false,
  },
  {
    q: "Does verifying my identity include performing a pull on my credit report?",
    a: ["No, we do not perform a credit report pull for the Cloaked Card."],
    open: false,
  },
  {
    q: "Why am I not eligible for a Cloaked card?",
    a: [
      "If we are unable to obtain or verify required information for regulatory purposes, or we determine that providing a Cloaked card to you runs against Cloaked’s Terms of Service, Card Agreement, or internal policy, you will not be eligible for a Cloaked card.",
    ],
    open: false,
  },
  {
    q: "How much does Cloaked Card cost?",
    a: [
      "The Cloaked card has a monthly subscription charge, that is detailed on your rates and fees page provided at account opening.  There are no separate fees or costs outside of those disclosed on that rates and fees page.",
    ],
    open: false,
  },
]);
</script>

<template>
  <section
    class="page"
    :class="{ active: ui.bannerActive }"
  >
    <div>
      <div
        class="banner"
        :class="{ active: ui.bannerActive }"
      >
        <div class="container">
          <div class="content">
            <h1>Stolen card numbers, be gone.</h1>
            <p>
              Keep your personal cards protected with Cloaked virtual cards -
              powered by Mastercard. 0% APR. No hidden fees.
            </p>
            <button @click="kycOpen">Get verified</button>
            <p class="small">
              Eligible U.S. Cloaked customers will verify their identity. For
              more information, please take a look at the Terms of Service and
              Privacy Policy.
            </p>
          </div>

          <div class="cards">
            <div class="card-group">
              <span
                v-for="index in 4"
                :key="index"
              >
                <InlineSvg name="cloaked-icon" />
                <div class="mastercard" />
              </span>
            </div>
          </div>
        </div>
      </div>
      <KYC
        v-if="ui.step === 0"
        :active="ui.bannerActive"
        @close="kycClose"
        @next="kycNext"
      />
      <CreateCard
        v-if="ui.step === 1"
        :status="ui.kycStatus"
        :active="ui.bannerActive"
        @close="kycClose"
        @next="done"
      />
      <div class="how-it-works">
        <div class="container">
          <div class="title">
            <h1>How it works</h1>
          </div>

          <div class="items">
            <div class="item">
              <div class="image">
                <img
                  src="@/assets/images/card-hero-1.png"
                  style="width: 70%"
                />
              </div>

              <div class="content">
                <h1>Connect your funding source to Cloaked</h1>
              </div>
            </div>

            <div class="item">
              <div
                class="image"
                style="justify-content: flex-end"
              >
                <img
                  style="width: 80%; height: 45%; margin-right: -10px"
                  src="@/assets/images/card-hero-2.png"
                />
              </div>

              <div class="content">
                <h1>Set your spending limits</h1>
              </div>
            </div>

            <div class="item">
              <div class="image">
                <img
                  style="
                    margin: 20px;
                    max-height: inherit;
                    background-color: transparent;
                  "
                  src="@/assets/images/card-hero-3.png"
                />
              </div>

              <div class="content">
                <h1>Generate a Cloaked card for any identity</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="faq">
        <div class="container">
          <div class="title">
            <h1>Frequently asked questions</h1>
          </div>

          <div class="items">
            <div
              v-for="item in accordianItems"
              :key="item.q"
              class="item"
              :class="{ active: item.open }"
            >
              <div
                class="icon"
                @click="item.open = !item.open"
              >
                <InlineSvg
                  v-if="item.open"
                  name="minus"
                />
                <InlineSvg
                  v-if="!item.open"
                  name="plus"
                />
              </div>

              <div class="question">
                <h1>{{ item.q }}</h1>
              </div>

              <div class="answer">
                <div class="text">
                  <p
                    v-for="a in item.a"
                    :key="a"
                  >
                    {{ a }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
/* stylelint-disable */
section.page {
  width: 100%;
  margin: 0 auto;
  padding: 24px 32px 48px 32px;
  .container {
    margin: 0 auto;
    width: 100%;
    max-width: 1140px;
    position: relative;
  }
}
.banner {
  width: 100%;
  max-width: 1141px;
  color: $color-primary-1;
  border-radius: 24px;
  overflow: hidden;
  margin: 0 auto;
  background-color: $color-primary-90;
  &:before {
    content: "";
    width: calc(100% - 304px);
    height: 483px;
    border-radius: 24px;
    position: relative;
    z-index: 200;
    max-width: 1139px;
    top: 89px;
    transition: all 0.45s cubic-bezier(0.785, 0.135, 0.15, 0.86);
    left: calc(50% - 448px);
  }
  &.active {
    &:before {
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      position: fixed;
      border-radius: 0;
      transition-delay: 0.1s;
      background-color: $color-primary-100;
      z-index: 316;
      @include transform(translateX(0));
      max-width: 100%;
    }
    .content {
      opacity: 0;
      @include transform(translateY(20px));
      transition-delay: 0s;
      visibility: hidden;
    }
    .cards {
      right: -260px;
      top: calc(50% + 80px);
      opacity: 0;
      transition-delay: 0s;
      visibility: hidden;
    }
  }
  .content {
    max-width: 557px;
    width: 100%;
    position: relative;
    z-index: 209;
    transition: all 0.5s ease;
    opacity: 1;
    transition-delay: 0.6s;
    padding: 66px 0px 40px 40px;
    h1 {
      color: $color-primary-1;
      font-weight: 700;
      font-size: 54px;
      line-height: 63px;
      margin-bottom: 24px;
    }
    p {
      font-weight: 500;
      font-size: 18px;
      line-height: 27px;
      color: $color-primary-10;
      &.small {
        font-size: 12px;
        line-height: 18px;
      }
    }
    button {
      margin-top: 34px;
      margin-bottom: 52px;
      font-weight: 600;
      font-size: 15px;
      line-height: 22px;
      background-color: $color-primary-1;
      color: $color-primary-100;
      padding: 14px 26px;
      border-radius: 44px;
      border: 0;
      &:hover {
        cursor: pointer;
        background-color: $color-primary-10;
      }
    }
  }
  .cards {
    position: absolute;
    right: 0;
    top: 50%;
    @include transform(translateY(-50%));
    width: 580px;
    height: 100%;
    z-index: 209;
    transition: all 0.5s ease;
    opacity: 1;
    transition-delay: 0.5s;
    display: flex;
    align-items: center;
    justify-content: space-around;
    .card-group {
      @include transform(rotate(15deg));
      border-radius: 24px;
      position: relative;
      span {
        display: inline-block;
        width: 432px;
        height: 250px;
        background: radial-gradient(
            74.33% 139.2% at 54.96% 48%,
            #656565 0%,
            #38393a 100%
          )
          /* warning: gradient uses a rotation that is not supported by CSS and may not behave as expected */;
        box-shadow:
          0px 27.290000915527344px 47.290000915527344px 0px rgba(0, 0, 0, 0.25),
          0px 1px 1px 0px rgba(255, 255, 255, 0.75);
        border-radius: 36.4516px;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-left: -216px;
        margin-top: -125px;
        animation: move 10s ease infinite;
        @include keyframes(move) {
          0% {
            @include transform(translateX(0px));
          }
          50% {
            @include transform(translateX(-30px));
          }
          100% {
            @include transform(translateX(0px));
          }
        }
        &:nth-of-type(1) {
          top: calc(50% - 270px);
          left: calc(50% + 170px);
          animation-delay: 5s;
        }
        &:nth-of-type(3) {
          left: calc(50% + 455px);
        }
        &:nth-of-type(4) {
          top: calc(50% + 270px);
          left: calc(50% + 170px);
          animation-delay: 2.5s;
        }
        svg {
          position: absolute;
          top: 50%;
          left: 50%;
          @include transform(translate(-50%, -50%));
          width: 114px;
          height: auto;
          .background {
            fill: $color-primary-1;
          }
          .foreground {
            fill: $color-primary-90;
          }
        }
        .mastercard {
          position: absolute;
          right: 20px;
          bottom: 35px;
          &:before,
          &::after {
            content: "";
            position: absolute;
            right: 50%;
            top: 50%;
            @include transform(translate(-50%, -50%));
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 2px solid $color-primary-10;
          }
          &:before {
            right: calc(50% - 12px);
          }
          &:after {
            right: calc(50% + 12px);
          }
        }
      }
    }
    &:after {
      content: "";
      background: #ffffff;
      opacity: 0.67;
      filter: blur(252px);
      position: absolute;
      right: -180px;
      bottom: -180px;
      width: 488px;
      height: 488px;
      animation: pulse 4s ease infinite;
      z-index: -1;
    }
    @include keyframes(pulse) {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
      }
    }
  }
}
.kyc {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 317;
  opacity: 0;
  visibility: hidden;
  @include transition(all 0.2s ease);
  background-color: $color-primary-100;
  overflow-y: auto;
  overflow-x: hidden;
  &.active {
    opacity: 1;
    visibility: visible;
    transition-delay: 0.5s;
    .content {
      opacity: 1;
      visibility: visible;
      transition-delay: 0.7s;
      transform: translateY(0px);
    }
    .cards {
      opacity: 1;
      visibility: visible;
      span {
        &:nth-of-type(1) {
          opacity: 1;
          left: -500px;
          transition-delay: 0.5s;
        }
        &:nth-of-type(2) {
          opacity: 1;
          right: -500px;
          transition-delay: 0.65s;
        }
      }
    }
  }
  .back {
    position: fixed;
    top: 10px;
    left: 10px;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-primary-1;
    background-color: $color-primary-100;
    border-radius: 50%;
    z-index: 4;
    svg {
      width: 8px;
      height: auto;
      position: relative;
      z-index: 2;
    }
    &:after {
      content: "";
      position: absolute;
      width: 0;
      height: 0;
      background: $color-primary-90;
      border-radius: 50%;
      top: 50%;
      left: 50%;
      @include transform(translate(-50%, -50%));
      z-index: 1;
      @include transition(all 0.45s cubic-bezier(0.68, -0.55, 0.27, 1.55));
    }
    &:hover {
      cursor: pointer;
      &:after {
        width: 44px;
        height: 44px;
      }
    }
  }
  .content {
    position: relative;
    z-index: 19;
    max-width: 500px;
    width: 100%;
    margin: 0 auto;
    padding: 90px 20px;
    opacity: 0;
    visibility: hidden;
    transition: all 0.4s ease;
    transform: translateY(40px);
    transition-delay: 0.7s;
    .title {
      margin-bottom: 43px;
      h1 {
        color: $color-primary-1;
        font-weight: 700;
        font-size: 54px;
        line-height: 63px;
      }
    }
    .form {
      .terms {
        margin: 24px 0;
        p {
          margin: 10px 0;
          &:first-of-type {
            color: $color-primary-70;
            font-size: 12px;
            font-style: normal;
            font-weight: 400;
          }
          &:last-of-type {
            color: $color-primary-1;
            font-size: 15px;
            font-style: normal;
            font-weight: 400;
            line-height: normal;
          }
        }
        button {
          margin-top: 20px;
          width: 100%;
          border: none;
          padding: 11px 16px;
          border-radius: 999px;
          background-color: $color-primary-1;
          opacity: 0.4;
          cursor: pointer;
          &.enabled {
            opacity: 1;
          }
        }
      }
      .input-group {
        margin-top: 48px;
        &:first-of-type {
          margin-top: 0;
        }
        .group-title {
          h1 {
            font-weight: 600;
            font-size: 18px;
            line-height: 27px;
            color: $color-primary-1;
          }
        }
        .inputs {
          display: flex;
          margin-top: 23px;
          .input {
            width: calc(50% - 5px);
            margin-left: 10px;
            &:first-of-type {
              margin-left: 0;
            }
            label {
              display: block;
              font-weight: 500;
              font-size: 12px;
              line-height: 18px;
              color: $color-primary-10;
              margin-bottom: 4px;
            }
            input {
              width: 100%;
              padding: 18px 24px;
              background-color: $color-primary-90;
              color: $color-primary-1;
              font-weight: 500;
              font-size: 15px;
              line-height: 22px;
              border: 0;
              border-radius: 8px;
            }
          }
        }
      }
    }
  }
  .cards {
    position: absolute;
    left: 50%;
    top: 124px;
    @include transform(translateX(-50%));
    width: 642px;
    height: 400px;
    z-index: 2;
    opacity: 0;
    visibility: hidden;
    @include transition(all 0.4s ease);
    span {
      display: inline-block;
      width: 432px;
      height: 250px;
      background: radial-gradient(
          74.33% 139.2% at 54.96% 48%,
          #656565 0%,
          #38393a 100%
        )
        /* warning: gradient uses a rotation that is not supported by CSS and may not behave as expected */;
      box-shadow:
        0px 27.290000915527344px 47.290000915527344px 0px rgba(0, 0, 0, 0.25),
        0px 1px 1px 0px rgba(255, 255, 255, 0.75);
      border-radius: 36.4516px;
      position: absolute;
      opacity: 0;
      @keyframes floating1 {
        from {
          transform: translate(0, 0px) rotate(-15deg);
        }
        50% {
          transform: translate(0, 20px) rotate(-16deg);
        }
        to {
          transform: translate(0, -0px) rotate(-15deg);
        }
      }
      @keyframes floating2 {
        from {
          transform: translate(0, 0px) rotate(15deg);
        }
        50% {
          transform: translate(0, 20px) rotate(14deg);
        }
        to {
          transform: translate(0, -0px) rotate(15deg);
        }
      }
      &:nth-of-type(1) {
        top: 120px;
        left: -622px;
        animation: floating1 5s ease infinite;
        transition: all 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55);
        opacity: 0;
      }
      &:nth-of-type(2) {
        top: 0;
        right: -622px;
        transition: all 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55);
        animation: floating2 5s ease infinite;
        opacity: 0;
        animation-delay: 0.6s;
      }
      svg {
        position: absolute;
        top: 50%;
        left: 50%;
        @include transform(translate(-50%, -50%));
        width: 114px;
        height: auto;
        .background {
          fill: $color-primary-1;
        }
        .foreground {
          fill: $color-primary-90;
        }
      }
      .mastercard {
        position: absolute;
        right: 20px;
        bottom: 35px;
        &:before,
        &::after {
          content: "";
          position: absolute;
          right: 50%;
          top: 50%;
          @include transform(translate(-50%, -50%));
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid $color-primary-10;
        }
        &:before {
          right: calc(50% - 12px);
        }
        &:after {
          right: calc(50% + 12px);
        }
      }
    }
  }
}
.how-it-works {
  margin-top: 43px;
  .title {
    margin-bottom: 18px;
    h1 {
      font-weight: 600;
      font-size: 32px;
      line-height: 40px;
      color: $color-primary-100;
    }
  }
  .items {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    .item {
      width: 100%;
      max-width: 352px;
      .image {
        width: 100%;
        height: 352px;
        background-color: $color-primary-5;
        border-radius: 24px;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        > img {
          background-color: rgba(0, 0, 0, 0);
        }
      }
      .content {
        margin-top: 16px;
        h1 {
          color: $color-primary-100;
          font-weight: 600;
          font-size: 18px;
          line-height: 27px;
        }
      }
    }
  }
}
.faq {
  margin-top: 80px;
  .title {
    margin-bottom: 18px;
    h1 {
      font-weight: 600;
      font-size: 32px;
      line-height: 40px;
      color: $color-primary-100;
    }
  }
  .items {
    border: 1px solid $color-primary-10;
    border-radius: 24px;
    overflow: hidden;
    .item {
      border-top: 1px solid $color-primary-10;
      position: relative;
      .icon {
        position: absolute;
        width: 32px;
        height: 32px;
        border-radius: 32px;
        top: 18px;
        left: 18px;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        &:hover {
          cursor: pointer;
          &:after {
            width: 32px;
            height: 32px;
          }
        }
        &:after {
          content: "";
          position: absolute;
          width: 0px;
          height: 0px;
          top: 50%;
          left: 50%;
          @include transform(translate(-50%, -50%));
          background-color: $color-primary-20;
          border-radius: 32px;
          z-index: -1;
          @include transition(all 0.45s cubic-bezier(0.68, -0.55, 0.27, 1.55));
        }
        svg {
          width: 16px;
        }
      }
      &:first-of-type {
        border-top: 0;
      }
      &.active {
        background-color: $color-primary-5;
        .icon {
          &:after {
            width: 32px;
            height: 32px;
          }
        }
        .answer {
          height: auto;
          max-height: 300px;
        }
      }
      .question {
        padding: 24px 24px 24px 72px;
        h1 {
          font-weight: 600;
          font-size: 14px;
          line-height: 21px;
          color: $color-primary-100;
        }
      }
      .answer {
        height: 0;
        max-height: 0px;
        overflow: hidden;
        @include transition(all 0.4s ease-in-out);
        .text {
          padding: 0 24px 24px 72px;
          p {
            font-weight: 400;
            font-size: 15px;
            line-height: 22px;
            color: $color-primary-70;
            margin-top: 20px;
            &:first-of-type {
              margin-top: 0;
            }
          }
        }
      }
    }
  }
}
</style>
