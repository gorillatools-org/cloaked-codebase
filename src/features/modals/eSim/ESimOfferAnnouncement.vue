<script setup>
import { WEBSITE_TERMS_OF_SERVICE_URL } from "@/scripts/constants";
import AppModalClose from "@/features/ui/AppModalClose";
import AppModalContent from "@/features/ui/AppModalContent";
import UiButton from "@/features/eSim/UiButton.vue";
import BaseText from "@/library/BaseText.vue";
import { useDisplay } from "@/composables/useDisplay.js";

const props = defineProps({
  topTitle: {
    type: String,
    default: "Ultimate security",
  },
  secondTitle: {
    type: String,
    default: "for calls & texts",
  },
  subtitle: {
    type: String,
    default:
      "Cloaked eSIM is the most secure way to communicate from your existing mobile device.",
  },
  highlightFeatures: {
    type: Array,
    default: () => [],
  },
  buttonLabel: {
    type: String,
    default: "",
  },
  buttonAction: {
    type: Function,
    default: () => {},
  },
});
const emit = defineEmits(["close"]);

const { isMobile } = useDisplay();
</script>

<template>
  <AppModalContent width="1000px">
    <AppModalClose
      is-absolute
      @close="emit('close')"
    />
    <div class="swirl">
      <div class="swirl__left">
        <div>
          <img
            class="swirl__logo"
            src="@/assets/images/esim-header.png"
          />
          <BaseText
            as="h2"
            :variant="isMobile ? 'headline-1-medium' : 'big-heading-semibold'"
            class="swirl__gradient-text"
          >
            {{ props.topTitle }}
          </BaseText>
          <BaseText
            as="h2"
            variant="big-heading-semibold"
          >
            {{ props.secondTitle }}
          </BaseText>
          <BaseText
            as="p"
            variant="headline-4-bold"
          >
            {{ props.subtitle }}
          </BaseText>
          <div class="swirl__features">
            <div class="swirl__feature">
              <img src="@/assets/images/esim-sim-swap.png" />
              <BaseText
                as="p"
                variant="headline-6-medium"
              >
                Prevent SIM-swapping and fraud
              </BaseText>
            </div>
            <div class="swirl__feature">
              <img src="@/assets/images/esim-blue.png" />
              <BaseText
                as="p"
                variant="headline-6-medium"
              >
                Blue-bubble (iMessage) compatible
              </BaseText>
            </div>
            <div class="swirl__feature">
              <img src="@/assets/images/esim-purple.png" />
              <BaseText
                as="p"
                variant="headline-6-medium"
              >
                Never share your personal number again
              </BaseText>
            </div>
          </div>

          <div
            v-if="props.highlightFeatures?.length > 0"
            class="swirl__highlight"
          >
            <template
              v-for="feature in props.highlightFeatures"
              :key="feature"
            >
              <div class="swirl__highlight">
                <img src="@/assets/images/esim-highlight.png" />
                <BaseText
                  as="p"
                  variant="headline-6-medium"
                >
                  {{ feature }}
                </BaseText>
              </div>
            </template>
          </div>
          <div
            v-if="props.buttonLabel"
            class="swirl__action-btn"
          >
            <UiButton
              width="275px"
              gradient
              @click="props.buttonAction"
            >
              {{ props.buttonLabel }}
            </UiButton>
          </div>
        </div>
        <div class="swirl__footer">
          <BaseText
            as="p"
            variant="caption-semibold"
            class="swirl__tc"
          >
            Cloaked eSIM is subject to phone compatibility and appropriate
            coverage area.
          </BaseText>
          <BaseText
            as="p"
            variant="caption-semibold"
            class="swirl__tc"
          >
            <a
              target="_blank"
              :href="WEBSITE_TERMS_OF_SERVICE_URL"
            >
              See Full Terms.
            </a>
          </BaseText>
        </div>
      </div>
      <div class="swirl__right">
        <img src="@/assets/images/esim-iphone.png" />
      </div>
    </div>
  </AppModalContent>
</template>
<style scoped lang="scss">
/* stylelint-disable */
.swirl {
  background: url("@/assets/images/esim-BG.png") no-repeat;
  background-size: cover;
  padding: 40px;
  border-radius: 28px;
  display: flex;
  text-align: left;
  color: $color-primary-1-light;
  width: 1000px;

  &__left {
    display: flex;
    flex-direction: column;
    width: 70%;
    flex-grow: 1;
  }

  &__right {
    display: flex;
    justify-content: right;
    align-items: baseline;
    width: 30%;
    margin-bottom: -42px;
    margin-right: -30px;

    img {
      width: 100%;
      height: 100%;
      max-height: 100%;
      flex-shrink: 0;
      object-fit: cover;
    }
  }

  &__logo {
    width: 335px;
    margin-bottom: 6px;
  }

  &__gradient-text {
    background: $cloaked-gradient;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  &__subtitle {
    margin: 20px 0;
  }

  &__features {
    display: flex;
    flex-direction: column;
    margin-top: 20px;
  }

  &__feature {
    display: flex;
    align-items: center;
    margin-bottom: 14px;

    img {
      margin-right: 11px;
      height: 30px;
      width: 50px;
    }
  }

  &__highlight {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;

    img {
      flex-shrink: 0;
    }
  }

  &__action-btn {
    padding-top: 20px;
    padding-bottom: 20px;
  }

  &__footer {
    flex-grow: 0;
    margin-top: auto;
  }

  &__tc {
    color: $color-primary-30-light;

    a {
      text-decoration: underline;
    }
  }
}
</style>
