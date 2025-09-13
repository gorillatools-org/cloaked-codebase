<script setup>
import UiHeader from "@/features/eSim/UiHeader.vue";
import UiButton from "@/features/eSim/UiButton.vue";
import UiButtonRow from "@/features/eSim/UiButtonRow.vue";
import UiPageWrapper from "@/features/eSim/UiPageWrapper.vue";
import InlineSvg from "@/features/InlineSvg";
import { PH_SCREEN_EVENT_ESIM_ONBOARDING_INTRO_SCREEN } from "@/scripts/posthogEvents";
import { reactive, computed } from "vue";
import { WEBSITE_TERMS_OF_SERVICE_URL } from "@/scripts/constants";

const emit = defineEmits(["next"]);

const INFO_STEPS = [
  "getStarted",
  "preventSwap",
  "iMessage",
  "acceptAll",
  "intergrate",
];
const state = reactive({
  infoStep: 0,
});

const mainHeader = computed(() => {
  switch (state.infoStep) {
    case 0:
      return "Get started with Cloaked eSIM";
    case 1:
      return "Prevent SIM-swapping & fraud";
    case 2:
      return "iMessage compatible";
    case 3:
      return "Accepted everywhere";
    case 4:
      return "Seamlessly integrates with your device";
    default:
      return "Get started with Cloaked eSIM";
  }
});

const subtitleHeader = computed(() => {
  switch (state.infoStep) {
    case 0:
      return "Ultimate protection for calls and texts is here. Add a Cloaked eSIM to your plan and switch seamlessly between your personal number and an always-Cloaked, secure eSIM number.";
    case 1:
      return "Physical SIMs are vulnerable to spoofing and swapping, enabling hackers to impersonate you. Cloaked eSIM is locked to your device, so it cannot be transferred to or used from from any other device.";
    case 2:
      return "When you enable iMessage with your Cloaked eSIM on your iOS device, you can send and receive iMessages just like your normal phone number.";
    case 3:
      return "Cloaked eSIM numbers can be used anywhere your personal number can, including services that block VOIP numbers.";
    case 4:
      return "No additional hardware or software is required to use Cloaked eSIM. Installation takes just a few minutes and works on any eSIM-capable device.";
    default:
      return "Ultimate protection for calls and texts is here. Add a Cloaked eSIM to your plan and switch seamlessly between your personal number and an always-Cloaked, secure eSIM number.";
  }
});

const imgName = computed(() => {
  switch (state.infoStep) {
    case 0:
      return "esim-simcard";
    case 1:
      return "esim-simlock";
    case 2:
      return "esim-imessage";
    case 3:
      return "esim-greencheck";
    case 4:
      return "esim-mobile";
    default:
      return "esim-simcard";
  }
});

function nextInfoStep() {
  let next = state.infoStep + 1;
  const maxStep = INFO_STEPS.length - 1;

  if (next > maxStep) {
    next = 0;
  }

  state.infoStep = next;
}

function backInfoStep() {
  if (state.infoStep > 0) {
    state.infoStep = state.infoStep - 1;
  }
}
</script>

<template>
  <UiPageWrapper
    show-logo
    animate
    logo="cloaked-esim-logo"
    :screen-event="PH_SCREEN_EVENT_ESIM_ONBOARDING_INTRO_SCREEN"
    :style="{ height: '100%' }"
  >
    <UiHeader>
      <h1>
        {{ mainHeader }}
      </h1>

      <h5>
        {{ subtitleHeader }}
      </h5>

      <h6 v-if="state.infoStep === 0">
        Cloaked eSim subject to phone compatibility and appropriate coverage
        area.
        <a
          :href="WEBSITE_TERMS_OF_SERVICE_URL"
          target="_blank"
          class="link"
        >
          See Full Terms
        </a>
        .
      </h6>
      <div>
        <div class="default-carousel">
          <InlineSvg
            class="arrow"
            :class="{ visible: state.infoStep > 0 }"
            name="left-arrow-carousel"
            @click="backInfoStep"
          />
          <div class="carousel-image">
            <InlineSvg
              :key="imgName"
              :name="imgName"
            />
          </div>
          <InlineSvg
            class="arrow"
            :class="{ visible: state.infoStep < 4 }"
            name="right-arrow-carousel"
            @click="nextInfoStep"
          />
        </div>
      </div>
      <UiButtonRow>
        <UiButton
          gradient
          img-name="arrow-long-right"
          @click="emit('next')"
        >
          Continue
        </UiButton>
      </UiButtonRow>
    </UiHeader>
  </UiPageWrapper>
</template>
<style lang="scss" scoped>
/* stylelint-disable */
.default-carousel {
  height: 500px;
  width: 100%;
  color: $color-primary-100;
  display: flex;
  align-items: center;
  position: absolute;
  top: 200px;
  left: 0;
  justify-content: center;
  z-index: -1;

  .carousel-image {
    width: 400px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .arrow {
    visibility: hidden;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.1);
      transition: all 0.3s ease;
    }

    &.visible {
      transition: all 0.3s ease;
      visibility: visible;
    }
  }
}

.link {
  cursor: pointer;
  transition: transform 0.3s ease;
  text-decoration: underline;

  &:hover {
    transform: scale(1.05);
    transition: transform 0.3s ease;
  }
}
</style>
