<script setup>
import { onMounted, watch } from "vue";
import InlineSvg from "@/features/InlineSvg.vue";
import DataDeletePrivacyPolicy from "@/features/data-delete/DataDeletePrivacyPolicy.vue";
import DataDeleteCard from "@/features/data-delete/atoms/DataDeleteCard.vue";
import { PH_EVENT_USER_VIEWED_DATA_DELETION_SEARCH_LOADING } from "@/scripts/posthogEvents";
import { posthogCapture } from "@/scripts/posthog.js";
import BaseText from "@/library/BaseText.vue";
import { useDisplay } from "@/composables/useDisplay.js";

const props = defineProps({
  userName: {
    type: String,
    default: null,
  },
  searchComplete: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["setStep"]);

watch(
  () => props.searchComplete,
  (value) => value && emit("setStep"),
  { immediate: true }
);

onMounted(() => {
  posthogCapture(PH_EVENT_USER_VIEWED_DATA_DELETION_SEARCH_LOADING);
});

const { isMobile } = useDisplay();
</script>

<template>
  <div class="data-delete-search data-delete__page">
    <InlineSvg
      name="data-delete/globe-shield"
      class="data-delete__title-icon data-delete-search__icon"
    />
    <BaseText
      as="h1"
      :variant="isMobile ? 'headline-2-semibold' : 'headline-1-medium'"
      class="data-delete__title data-delete-search__title"
    >
      Searching for exposures...
    </BaseText>
    <BaseText
      as="p"
      variant="headline-6-medium"
      class="data-delete__text data-delete-search__text"
    >
      <template v-if="userName">
        On behalf of "{{ userName }}"
        <br />
      </template>
      This can take up to one minute.
    </BaseText>

    <DataDeleteCard
      type="light"
      class="data-delete-search__loading-container"
    >
      <BaseText
        as="h2"
        variant="headline-4-bold"
        class="data-delete__subtitle"
      >
        Establishing Secure Connection...
      </BaseText>
      <div class="data-delete-search__loading-bar">
        <div class="data-delete-search__loading-bar-progress" />
      </div>
    </DataDeleteCard>

    <BaseText
      as="p"
      variant="headline-6-medium"
      class="data-delete__text data-delete-search__brokers"
    >
      Data brokers are companies that buy and sell your data. We search hundreds
      to find what info of yours has been exposed.
    </BaseText>

    <DataDeletePrivacyPolicy class="data-delete-search__privacy-policy" />
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.data-delete-search {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;

  @media all and (min-width: $screen-xl) {
    margin-top: clamp(50px, 5vh, 250px);
  }

  &__icon {
    opacity: 0;
    animation: appear-bottom-5 0.4s forwards ease-out;
  }

  &__title {
    opacity: 0;
    animation: appear-bottom-5 0.4s 0.05s forwards ease-out;
  }

  & &__text {
    opacity: 0;
    animation: appear-bottom-5 0.4s 0.1s forwards ease-out;

    @media all and (min-width: $screen-xl) {
      margin-top: 16px;
    }
  }

  & &__brokers {
    margin-top: 16px;
    opacity: 0;
    animation: appear-bottom-5 0.5s 0.25s forwards ease-out;

    @media all and (min-width: $screen-xl) {
      margin: 16px auto 0;
      max-width: 360px;
    }
  }

  &__privacy-policy {
    margin: auto auto 0;
    padding: 32px 0 16px;
    opacity: 0;
    animation: appear-bottom-5 0.5s 0.5s forwards ease-out;

    @media all and (min-width: $screen-xl) {
      padding: 50px 0 25px;
    }
  }

  .loading-spinner-delete {
    animation: spin 1.5s infinite linear;
    transform-origin: center center;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  &__loading-container {
    width: 100%;
    max-width: 360px;
    border-radius: 16px;
    padding: 16px;
    background-blend-mode: screen;
    margin: 16px auto 0;
    text-align: center;
    opacity: 0;
    animation: appear-bottom-5 0.5s 0.15s forwards ease-out;
  }

  &__loading-bar {
    width: 100%;
    height: 4px;
    background-color: #a0a0a0;
    margin-top: 20px;
    overflow: hidden;
    position: relative;
    border-radius: 4px;

    @keyframes data-delete-search-loading {
      0% {
        width: 0;
      }

      23.08% {
        /* 3 seconds out of 13 seconds is approximately 23.08% */
        width: 95%;
      }

      100% {
        /* 10 seconds out of 13 seconds is approximately 76.92% */
        width: 100%;
      }
    }

    &-progress {
      width: 100%;
      height: 100%;
      background-color: #fff;
      animation: data-delete-search-loading 13s linear forwards;
    }
  }
}
</style>
