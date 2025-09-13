<script setup>
import { ref, computed } from "vue";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import BaseMedallion from "@/library/BaseMedallion.vue";
import BaseProgressTag from "@/library/BaseProgressTag.vue";
import ForYouDiscoverListItem from "@/features/ForYou/ForYouDiscoverListItem.vue";
import AdvancedModeModal from "@/features/AdvancedMode/AdvancedModeModal.vue";
import { useBasicMode, useBasicModeRouting } from "@/composables/useBasicMode";
import { useRouter } from "vue-router";
import { useEncryptionGate } from "@/composables/useEncryptionGate";
import store from "@/store";
import { posthogCapture } from "@/scripts/posthog.js";

const { withEncryptionGate } = useEncryptionGate();
const { isBasicModeEnabled } = useBasicMode();
const { toggleBasicModeWithRouting } = useBasicModeRouting();
const router = useRouter();

const isAdvancedModeModalOpen = ref(false);
const toggle = computed(() => !isBasicModeEnabled.value);

// Features list drag functionality
const featuresListRef = ref(null);
const isFeaturesDragging = ref(false);
const featuresStartX = ref(0);
const featuresScrollLeft = ref(0);

// Advanced mode features
const advancedFeatures = [
  {
    icon: "key",
    text: "Encrypted Password Manager",
  },
  {
    icon: "phone",
    text: "Phone Number Generator",
  },
  {
    icon: "email",
    text: "Email Address Generator",
  },
  {
    icon: "shield-tick",
    text: "Authenticator Code Storage",
  },
  {
    icon: "plus",
    text: "Much More",
  },
];

const props = defineProps({
  discoverFeatures: {
    type: Array,
    required: true,
  },
});

// Filter out one_ring and heimdall from discover features
const filteredDiscoverFeatures = computed(() => {
  return props.discoverFeatures.filter(
    (feature) =>
      feature.internal_name !== "one_ring" &&
      feature.internal_name !== "heimdall"
  );
});

const openBasicModeModals = () => {
  posthogCapture("foryou_user_toggles_advanced_mode");

  if (!isBasicModeEnabled.value) {
    store.dispatch("openModal", {
      header: "Turn off advanced mode?",
      paragraphs: [
        "Everything you do in advanced mode will always be available if you turn it back on, including any Identities you create, emails and messages you send, etc.",
        "For additional help, you can reach out to support@cloaked.com",
      ],
      button: {
        text: "Yes, go back to basic mode",
        onClick: changeBasicMode,
      },
    });
  } else {
    isAdvancedModeModalOpen.value = true;
  }
};

const changeBasicMode = () => {
  toggleBasicModeWithRouting(router);
  posthogCapture("foryou_user_toggles_basic_mode");
};

const goToAdvancedMode = () => {
  isAdvancedModeModalOpen.value = false;
  withEncryptionGate(() => toggleBasicModeWithRouting(router), {
    context: "advanced-mode",
  });
  posthogCapture("foryou_user_toggles_advanced_mode");
};

const closeAdvancedModeModal = () => {
  isAdvancedModeModalOpen.value = false;
  posthogCapture("foryou_user_closes_advanced_mode_modal");
};

// Features list drag handlers
const handleFeaturesMouseDown = (e) => {
  if (!featuresListRef.value) return;

  isFeaturesDragging.value = true;
  featuresStartX.value = e.pageX - featuresListRef.value.offsetLeft;
  featuresScrollLeft.value = featuresListRef.value.scrollLeft;

  featuresListRef.value.style.cursor = "grabbing";
  featuresListRef.value.style.userSelect = "none";
};

const handleFeaturesMouseMove = (e) => {
  if (!isFeaturesDragging.value || !featuresListRef.value) return;

  e.preventDefault();
  const x = e.pageX - featuresListRef.value.offsetLeft;
  const walk = (x - featuresStartX.value) * 2;
  featuresListRef.value.scrollLeft = featuresScrollLeft.value - walk;
};

const handleFeaturesMouseUp = () => {
  if (!featuresListRef.value) return;

  isFeaturesDragging.value = false;
  featuresListRef.value.style.cursor = "grab";
  featuresListRef.value.style.userSelect = "";
};

const handleFeaturesMouseLeave = () => {
  if (!featuresListRef.value) return;

  isFeaturesDragging.value = false;
  featuresListRef.value.style.cursor = "grab";
  featuresListRef.value.style.userSelect = "";
};
</script>

<template>
  <div class="for-you-discover-list">
    <div class="for-you-discover-list__header">
      <BaseIcon
        name="search"
        class="for-you-discover-list__header-icon"
      />
      <BaseText
        as="h1"
        variant="headline-3-medium"
        class="for-you-discover-list__header-title"
      >
        Discover new kinds of protection
      </BaseText>
      <BaseText
        as="h2"
        variant="headline-6-medium"
        class="for-you-discover-list__header-subtitle"
      >
        Included with your subscription
      </BaseText>
    </div>

    <div class="for-you-discover-list__features">
      <ForYouDiscoverListItem
        v-for="feature in filteredDiscoverFeatures"
        :key="feature.id"
        :feature="feature"
        class="for-you-discover-list__features-item"
      />

      <!-- Advanced Mode Item -->
      <div
        class="for-you-discover-list-item for-you-discover-list-item--no-hero for-you-discover-list__features-item"
      >
        <div
          class="for-you-discover-list-item__content for-you-discover-list-item__content--no-hero"
        >
          <div class="for-you-discover-list-item__content-title">
            <div class="for-you-discover-list-item__content-title-top">
              <BaseMedallion
                icon="bolt"
                color="cloaked"
                class="for-you-discover-list-item__content-title-icon"
              />

              <BaseProgressTag
                color="cloaked"
                class="for-you-discover-list-item__content-title-progress-tag"
              >
                For Privacy Pros
              </BaseProgressTag>
            </div>

            <BaseText
              variant="headline-4-bold"
              class="for-you-discover-list-item__content-title-text"
            >
              Zero-knowledge features for the privacy pros
            </BaseText>
          </div>

          <BaseText
            variant="body-3-regular"
            class="for-you-discover-list-item__content-summary"
          >
            A totally new experience allowing you to control every piece of
            information the internet knows about you.
          </BaseText>

          <div
            ref="featuresListRef"
            class="for-you-discover-list-item__content-features"
            @mousedown="handleFeaturesMouseDown"
            @mousemove="handleFeaturesMouseMove"
            @mouseup="handleFeaturesMouseUp"
            @mouseleave="handleFeaturesMouseLeave"
          >
            <div
              v-for="(feature, index) in advancedFeatures"
              :key="index"
              class="for-you-discover-list-item__content-features-item"
            >
              <BaseIcon
                :name="feature.icon"
                class="for-you-discover-list-item__content-features-item-icon"
              />
              <BaseText
                variant="body-small-semibold"
                class="for-you-discover-list-item__content-features-item-text"
              >
                {{ feature.text }}
              </BaseText>
            </div>
          </div>

          <BaseButton
            variant="secondary"
            full-width
            @click="openBasicModeModals"
          >
            {{ toggle ? "Disable Advanced Mode" : "Enable Advanced Mode" }}
          </BaseButton>
        </div>
      </div>
    </div>

    <AdvancedModeModal
      :value="isAdvancedModeModalOpen"
      @close="closeAdvancedModeModal"
      @go-to-advanced-mode="goToAdvancedMode"
    />
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.for-you-discover-list {
  padding: 24px;

  &__header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;

    &-icon {
      display: block;
      width: 32px;
      height: 32px;
      font-size: 32px;
      font-weight: 500;
    }

    &-subtitle {
      color: $color-primary-70;
    }
  }

  &__features {
    margin-top: 25px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(355px, 1fr));
    gap: 8px;

    &-item {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      flex-wrap: wrap;
      width: 100%;
    }
  }
}

/* Advanced Mode Discovery Item Styles */
.for-you-discover-list-item {
  background-color: $color-base-white-100;
  border-radius: 30px;
  overflow: hidden;
  border: 1px solid $color-primary-10;

  &--no-hero {
    min-height: 207px;
    display: flex;
    align-items: center;
    overflow: hidden;
  }

  &__content {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;

    &--no-hero {
      padding: 32px 24px;
      height: 100%;
      justify-content: center;
    }

    &-title {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;

      &-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }

      &-text {
        color: $color-primary-100;
      }
    }

    &-summary {
      color: $color-primary-70;
      line-height: 1.5;
    }

    &-features {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      overflow-y: hidden;
      scroll-behavior: smooth;
      cursor: grab;
      padding-bottom: 4px;
      margin: 0 -24px;
      padding-left: 24px;
      padding-right: 24px;

      // Hide scrollbar but keep functionality
      -ms-overflow-style: none;
      scrollbar-width: none;

      &::-webkit-scrollbar {
        display: none;
      }

      &:active {
        cursor: grabbing;
      }

      &-item {
        flex-shrink: 0;
        width: 130px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-start;
        padding: 24px 16px;
        border-radius: 29px;
        gap: 8px;
        background-color: $color-base-white-100;
        border: 1px solid $color-primary-20;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

        &-icon {
          font-size: 24px;
          color: $color-primary-70;
          flex-shrink: 0;
        }

        &-text {
          color: $color-primary-70;
          line-height: 1.3;
          word-wrap: break-word;
          hyphens: auto;
          text-align: left;
        }
      }
    }
  }
}
</style>
