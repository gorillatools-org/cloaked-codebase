<script setup>
import { computed, watch, ref } from "vue";
import store from "@/store";
import CardsService from "@/api/actions/cards-services.js";
import InlineSvg from "@/features/InlineSvg.vue";

const cardsPanel = computed(() => {
  return store.state.rightPanel.cardPanel;
});
function closeCardPanel() {
  store.dispatch("closeCardPanel");
  setTimeout(() => {
    card.value = "";
    store.commit("currentCard", "");
    cardDetails.value = "";
    loading.value = true;
  }, 300);
}
const currentCard = computed(() => {
  return store.state.cards.currentCard;
});
const card = ref("");
const cardDetails = ref("");
const loading = ref(true);
const deleting = ref(false);
function getCardInformation() {
  CardsService.getSingleIdentityCard(
    currentCard.value.identity_id,
    currentCard.value.id
  ).then(({ data }) => {
    card.value = data;
  });
}
function convert_dollars(value) {
  if (value) {
    return (value / 100).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
  }
}
function onCardDetail(message) {
  cardDetails.value = message.data.data;

  if (message.data) {
    loading.value = false;
  }
}

watch(
  currentCard,
  () => {
    if (cardsPanel.value === true && currentCard.value) {
      getCardInformation();
      document.body.classList.add("cards-panel");

      window.addEventListener("message", onCardDetail, true);
    } else {
      document.body.classList.remove("cards-panel");

      window.removeEventListener("message", onCardDetail);
    }
  },
  { deep: true }
);

function deleteCard() {
  deleting.value = true;
  CardsService.deleteCard(
    currentCard.value.identity_id,
    currentCard.value.id
  ).then(() => {
    store.dispatch("closeCardPanel");
    store.commit("currentCard", "");
    store.commit("identityCards", "");
    card.value = "";
    cardDetails.value = "";
    loading.value = true;
    deleting.value = false;
  });
}
</script>

<template>
  <div>
    <section
      class="panel"
      :class="{ active: cardsPanel }"
    >
      <div class="header">
        <div
          class="close"
          @click="closeCardPanel()"
        >
          <span />
        </div>

        <button
          :class="{ deleting: deleting }"
          @click="deleteCard()"
        >
          <InlineSvg name="delete-trash" />
        </button>
      </div>

      <div class="block">
        <iframe
          v-if="card"
          ref="myframe"
          :src="`${card.url}`"
          frameborder="0"
        />

        <div class="title">
          <h1>Your Virtual Card</h1>
        </div>

        <div class="card">
          <svg
            v-if="cardDetails && !loading"
            class="cloaked-icon"
            width="46"
            height="36"
            viewBox="0 0 46 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              opacity="0.2"
              d="M11.3845 35.3999C11.3845 35.3999 -2.64235 30.0235 0.443564 24.3484C2.40733 20.7641 6.89592 24.6471 13.9094 28.5301L11.3845 35.3999Z"
              fill="white"
            />
            <path
              d="M28.5017 33.6073C39.1621 34.5033 43.8833 29.4613 45.0055 27.9679C45.0055 27.9679 38.6411 19.4908 34.8905 13.8043C32.3365 9.93202 29.0638 4.42638 27.1912 1.23057C26.5249 0.0934141 24.9346 0.140662 24.2549 1.26884C17.2944 12.823 4.47698 21.4843 1.60352 23.1531C3.87587 22.1674 8.0225 25.2439 13.6332 28.5295C13.6332 28.5295 17.8021 30.7969 20.6239 31.845C24.2429 33.1891 28.5017 33.6073 28.5017 33.6073Z"
              fill="#191E23"
            />
          </svg>

          <InlineSvg
            v-if="cardDetails && !loading"
            name="mastercard"
            class="mastercard-icon"
          />

          <div
            v-if="loading"
            class="loading"
          />

          <div
            v-if="cardDetails && !loading"
            class="information"
          >
            <div class="card-number">
              <h1>{{ cardDetails.pan.match(/.{1,4}/g).join(" ") }}</h1>
            </div>

            <div class="card-details">
              <span>{{ cardDetails.expMonth }}/{{ cardDetails.expYear }}</span>
              <span>{{ cardDetails.cvv }}</span>
            </div>
          </div>
        </div>

        <!-- <div class="limit">
          <h1>Limit</h1>
          <p>{{ currentCard.transaction_period_max_transactions }}</p>
        </div> -->

        <div class="information">
          <div class="section">
            <h1>Limit</h1>
            <p :class="{ loading: loading }">
              {{ convert_dollars(currentCard.transaction_period_limit) }}
            </p>
          </div>

          <div class="section">
            <h1>Duration</h1>
            <p :class="{ loading: loading }">
              <span v-if="currentCard.transaction_period === 'forever'">
                One-time transaction
              </span>
              <span v-else>
                {{ currentCard.transaction_period }}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div
        class="deleting-overlay"
        :class="{ active: deleting }"
      />
    </section>

    <div
      class="overlay"
      :class="{ active: cardsPanel }"
      @click="closeCardPanel()"
    />
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
section.panel {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: auto;
  z-index: 500;
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: $color-base-white-100;
  border-left: 1px solid rgba(0, 0, 0, 0.2);
  @include transform(translateX(600px));
  box-shadow: -10px 4px 54px 0px rgba(0, 0, 0, 0.25);
  &.active {
    right: 0;
    @include transform(translateX(0));
  }
  .header {
    border-bottom: 1px solid rgba(23, 23, 23, 0.1);
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .close {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      span {
        @include burger(17px, 1.5px, 4px, $color-primary-50);
        @include burger-to-cross;
      }
      &:hover {
        cursor: pointer;
      }
    }

    button {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: transparent;
      border: none;
      color: $color-primary-100;
      font-size: 12px;
      font-style: normal;
      font-weight: 500;
      line-height: normal;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;

      &:before {
        content: "";
        width: 0px;
        height: 0px;
        border-radius: 50%;
        background-color: $color-primary-10;
        display: block;
        position: absolute;
        top: 50%;
        left: 50%;
        @include transition(all 0.3s ease-in-out);
        @include transform(translateX(-50%) translateY(-50%));
        z-index: -2;
      }

      &:after {
        content: "";
        width: 22px;
        height: 22px;
        position: absolute;
        top: 50%;
        left: 50%;
        border: 3px solid rgba(0, 0, 0, 0.3);
        border-radius: 50%;
        border-top-color: $color-primary-1;
        @include animation(spin 1s ease-in-out infinite);
        margin-top: -11px;
        margin-left: -11px;
        opacity: 0;
        z-index: -1;
        visibility: hidden;
        @include transition(all 0.3s ease);

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      }

      &:hover {
        cursor: pointer;
      }

      svg {
        width: 60%;
        height: auto;
        fill: $color-primary-100;
      }

      &:hover {
        &:before {
          width: 36px;
          height: 36px;
        }
      }

      &.deleting {
        svg {
          display: none;
        }

        &:before {
          width: 36px;
          height: 36px;
        }

        &:after {
          opacity: 1;
          visibility: visible;
        }
      }
    }
  }
  .block {
    padding: 20px;
    iframe {
      display: none;
    }

    .title {
      padding: 0 4px;
      margin-bottom: 16px;

      h1 {
        color: $color-primary-100;
        font-size: 12px;
        font-style: normal;
        font-weight: 600;
        line-height: normal;
      }
    }
    .card {
      width: 100%;
      height: 213px;
      border-radius: 20px;
      background: radial-gradient(
        157.8% 94.4% at 54.96% 48%,
        #656565 0%,
        #38393a 100%
      );
      box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
      position: relative;
      display: flex;
      padding: 20px;

      .cloaked-icon {
        position: absolute;
        top: 20px;
        left: 24px;
        width: 45px;
        height: auto;
      }

      .mastercard-icon {
        position: absolute;
        bottom: 20px;
        right: 20px;
        width: 52px;
        height: auto;
      }

      .card-number {
        position: absolute;
        top: 50%;
        left: 20px;
        transform: translateY(-50%);

        h1 {
          display: inline-block;
          color: #fff;
          font-size: 16px;
          font-style: normal;
          font-weight: 500;
        }
      }

      .card-details {
        position: absolute;
        bottom: 30px;
        left: 24px;

        span {
          display: inline-block;
          color: #fff;
          font-size: 16px;
          font-style: normal;
          font-weight: 500;
          margin-left: 45px;

          &:first-child {
            margin-left: 0;
          }
        }
      }

      .loading {
        width: 30px;
        height: 30px;
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: #fff;
        animation: spin 1s ease-in-out infinite;
        -webkit-animation: spin 1s ease-in-out infinite;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-left: -15px;
        margin-top: -15px;

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      }
    }
    .information {
      margin-top: 8px;

      .section {
        margin-top: 8px;
        display: flex;
        padding: 10px 4px;

        &:nth-of-type(1) {
          margin-top: 0;

          p {
            &.loading {
              &:after {
                width: 50%;
              }
            }
          }
        }

        &:nth-of-type(2) {
          p {
            &.loading {
              &:after {
                width: 70%;
              }
            }
          }
        }

        h1 {
          margin-right: 8px;
          width: 100px;
          font-size: 12px;
          font-style: normal;
          font-weight: 400;
          line-height: normal;
          color: $color-primary-100;
        }

        p {
          font-size: 12px;
          font-style: normal;
          font-weight: 500;
          line-height: normal;
          color: $color-primary-100;
          width: 100%;

          &::first-letter {
            text-transform: capitalize;
          }

          &.loading {
            position: relative;
            font-size: 0px;

            &:after {
              content: "";
              width: 100%;
              height: 20px;
              border-radius: 20px;
              background-color: $color-primary-20;
              -webkit-mask: linear-gradient(-60deg, #000 30%, #0005, #000 70%)
                right/300% 100%;
              background-repeat: no-repeat;
              @include animation(shimmer 1s infinite);
              position: absolute;
              top: 50%;
              left: 0;
              margin-top: -10px;
            }

            @keyframes shimmer {
              100% {
                -webkit-mask-position: left;
              }
            }
          }
        }
      }
    }
  }

  .deleting-overlay {
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    position: absolute;
    top: 0;
    left: 0;
    z-index: 5;
    opacity: 0;
    visibility: hidden;
    @include transition(all 0.3s ease-in-out);

    &.active {
      opacity: 1;
      visibility: visible;
    }
  }
}
.overlay {
  z-index: 223;
  position: fixed;
  top: 0;
  right: 0;
  width: 100vw;
  height: 100vh;
  @include transition(all 0.3s ease-in-out);
  opacity: 0;
  visibility: hidden;
  &.active {
    opacity: 0.1;
    visibility: visible;
  }
}
</style>
