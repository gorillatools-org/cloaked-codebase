<template>
  <div>
    <dialog
      class="get-started-modal"
      :style="getStyle"
      :open="isOpen"
      @click="close"
      @keydown.esc="close"
    >
      <div
        class="modal-content"
        :style="{ marginTop: getStyle.top }"
      >
        <inlineSvg
          name="left-notch"
          class="left-notch"
        />
        <div
          class="modal-container"
          :style="{ width: state.step ? '356px' : '275px' }"
          @click="(event) => event.stopPropagation()"
        >
          <div
            v-if="!state.step"
            class="get-started"
          >
            <inlineSvg name="cloaked-orange" />
            <h1 class="title">
              Continue your privacy journey and earn rewards
            </h1>
            <p class="description">
              Improve your privacy by completing tasks and learning about
              Cloaked. Once you're finished, claim your
              <b>free Cloaked t-shirt*</b>
              to let the world know you're a privacy pro.
            </p>
            <p class="condition">
              *Users must complete all items to receive the t-shirt.
            </p>
            <div class="footer">
              <InputSpinner v-if="state.loading" />
              <a
                v-else
                href="#"
                @click="initGetStarted"
              >
                Got it
              </a>
              <span>{{ stepsLeft }}</span>
            </div>
          </div>
          <div v-else>
            <div class="header">
              <h1>Get Started</h1>
              <h3>{{ currentStepData?.completion || 0 }}% complete</h3>
            </div>
            <div class="banners">
              <img
                v-show="state.step === 1"
                key="strong-checklist"
                src="@/assets/images/strong-checklist.png"
              />
              <img
                v-show="state.step === 2"
                key="power-checklist"
                src="@/assets/images/power-checklist.png"
              />
              <img
                v-show="state.step === 3"
                key="secure-checklist"
                src="@/assets/images/secure-checklist.png"
              />
              <div
                class="carousel-arrow left-arrow"
                @click="step(-1)"
              >
                <inlineSvg
                  name="arrow-long-left"
                  :class="`step${state.step}`"
                />
              </div>
              <div
                class="carousel-arrow right-arrow"
                @click="step(1)"
              >
                <inlineSvg
                  name="arrow-long-right"
                  :class="`step${state.step}`"
                />
              </div>
              <div class="banner-title">
                <h1>{{ currentStepData.title }}</h1>
                <div
                  v-if="currentStepData.completion === 100"
                  class="completed"
                >
                  <p>Completed</p>
                  <inlineSvg name="checkmark-filled" />
                </div>
                <p v-else>{{ currentStepData.completedFraction }} completed</p>
              </div>
            </div>
            <div class="checklist">
              <CheckList
                :key="state.type"
                :type="state.type"
                @updated="checkListUpdated"
              />
            </div>
            <Button
              v-if="totalProgress === 100"
              size="lg"
              type="primary"
              class="claim"
              @click="showDoneModal"
            >
              Claim my free T-shirt
            </Button>
            <ul class="start-steps">
              <li :class="{ selected: state.step === 1 }" />
              <li :class="{ selected: state.step === 2 }" />
              <li :class="{ selected: state.step === 3 }" />
            </ul>
          </div>
        </div>
      </div>
    </dialog>
    <CheckListDoneModal
      :key="state.modalData.type || state.showModal"
      :open="state.showModal"
      :modal-data="state.modalData"
      :free-shirt-url="claimFreeTShirtUrl"
      @close="() => (state.showModal = false)"
      @show-modal="showDoneModal"
    />
  </div>
</template>
<script setup>
import { computed, reactive, watch } from "vue";
import { FREE_SHIRT_URL } from "@/scripts/constants";
import store from "@/store";
import inlineSvg from "@/features/InlineSvg";
import CheckList from "./get-started/CheckList";
import CheckListDoneModal from "./get-started/CheckListDoneModal";
import UserService from "@/api/actions/user-service";
import InputSpinner from "@/features/InputSpinner";
import Button from "@/features/Button.vue";
const claimFreeTShirtUrl = FREE_SHIRT_URL;
const strongModalData = {
  title: "You're off to a strong start!",
  description: `You completed all of your "Start Strong" tasks! Take a moment to celebrate as you continue your privacy journey.`,
  type: "strong",
};
const powerUpModalData = {
  title: "Your privacy is powering up!",
  description: `You completed all of your "Power up your privacy" tasks! Take a moment to celebrate as you continue your privacy journey.`,
  type: "power-up",
};
const securityModalData = {
  title: "You supercharged your security!",
  description: `You completed all of your "Supercharge your security" tasks! Take a moment to celebrate as you continue your privacy journey.`,
  type: "security",
};
const allDoneModalData = {
  title: "You're a privacy pro! Now it's time to let the world know.",
  description:
    "You completed all of your Get Started tasks! Copy this promo code and use the link below to claim your free t-shirt. ",
  type: "all-done",
};
const allModalData = [
  strongModalData,
  powerUpModalData,
  securityModalData,
  allDoneModalData,
];

const state = reactive({
  step: 1,
  loading: false,
  showModal: false,
  type: "strong",
  modalData: {
    title: "",
    description: "",
    type: "",
  },
});

const isOpen = computed(() => {
  return !!store.getters["getStarted/getEvent"];
});

watch(
  isOpen,
  () => {
    if (isOpen.value) {
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflowY = "auto";
      state.step = 1;
      state.type = "strong";
    }
  },
  { deep: true }
);

const stepsLeft = computed(() => store.getters["getStarted/totalStepsLeft"]);

const getStyle = computed(() => {
  if (!isOpen.value) {
    return {};
  }
  const button = store.getters["getStarted/getEvent"];
  const pos = button.getBoundingClientRect();
  const left = pos.right + 20;
  return {
    left: `${left}px`,
    width: `calc(100vw - ${left}px)`,
    height: "100vh",
    top: `${Math.floor(pos.top)}px`,
    padding: 0,
  };
});

const currentStepData = computed(() =>
  store.getters["getStarted/getCurrentStepData"](state.step)
);

const totalProgress = computed(
  () => store.getters["getStarted/totalProgressPercentage"]
);

async function initGetStarted() {
  try {
    state.loading = true;
    await UserService.fetchGetStartedCheckList();
    state.step = 1;
  } catch (e) {
    console.error(e);
  } finally {
    state.loading = false;
  }
}

function close() {
  store.dispatch("getStarted/openGetStarted", false);
}

function step(increment) {
  let step = state.step + increment;
  if (step > 3) {
    step = 1;
  }
  if (step < 1) {
    step = 3;
  }
  if (step === 1) state.type = "strong";
  else if (step === 2) state.type = "power-up";
  else if (step === 3) state.type = "security";
  state.step = step;
}

function checkListUpdated() {
  if (currentStepData.value.completion === 100) {
    state.modalData = allModalData[state.step - 1];
    state.showModal = true;
  }
}

function showDoneModal() {
  state.modalData = allModalData[3];
  state.showModal = true;
}
</script>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.get-started-modal {
  position: fixed;
  background-color: rgb(0 0 0 / 50%);
  z-index: 999;
  border: 0;
  top: 0 !important;

  .banners {
    position: relative;
    display: flex;
    justify-content: center;

    .carousel-arrow {
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #fff;
      width: 24px;
      height: 24px;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;

      &.left-arrow {
        left: 20px;
      }

      &.right-arrow {
        right: 20px;
      }

      .step1 {
        fill: $color-brand-5-100-light;
      }

      .step2 {
        fill: $color-brand-3-100-light;
      }

      .step3 {
        fill: $color-brand-6-100-light;
      }
    }

    .banner-title {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
      width: 100%;

      h1 {
        font-size: 15px;
        font-weight: 600;
        color: $color-primary-100-dark;
      }

      p {
        font-size: 10px;
        color: $color-base-white-50-dark;
        margin-top: 4px;
      }

      .completed {
        display: flex;
        align-items: center;
        justify-content: center;
        column-gap: 4px;

        p {
          color: #fff;
          margin-top: 0;
        }
      }
    }
  }

  .checklist {
    margin: 8px 0;
  }

  .claim {
    justify-content: center;
    width: 100%;
    margin: 8px 0;
  }

  ul.start-steps {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 40px;
    padding: 10px;
    gap: 7px;

    li {
      min-width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: $color-primary-30;

      &.selected {
        background-color: $color-primary-100;
      }
    }
  }

  .modal-content {
    display: flex;
    margin-left: 20px;

    .left-notch {
      fill: $color-base-white-100 !important;

      path {
        fill: $color-base-white-100 !important;
      }
    }

    .modal-container {
      border-radius: 20px;
      background-color: $color-base-white-100;
      margin-top: -55px;
      padding: 20px 16px 0;
      overflow: hidden;
      color: $color-primary-100;

      .get-started {
        padding: 14px 16px 24px 12px;

        .title {
          font-size: 24px;
          font-weight: 500;
          margin-top: 12px;
        }

        .description {
          font-size: 16px;
          margin: 12px 0;
          text-wrap: balance;
        }

        .condition {
          font-size: 12px;
        }

        .footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
          margin-top: 24px;

          a {
            text-decoration: underline;
          }
        }
      }

      .header {
        padding: 0 20px 10px 5px;

        h1 {
          font-size: 24px;
          font-weight: 600;
          color: $color-primary-100;
        }

        h3 {
          font-size: 15px;
          color: $color-primary-100;
        }
      }
    }
  }
}
</style>
