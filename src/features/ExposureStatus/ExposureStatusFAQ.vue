<script setup>
import { ref, nextTick } from "vue";
import { SUPPORT_EMAIL, HELP_CENTER_BASE_URL } from "@/scripts/constants";
import BaseSheet from "@/library/BaseSheet.vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseButton from "@/library/BaseButton.vue";
import { posthogCapture } from "@/scripts/posthog.js";

const expandedItems = ref(new Set());

// Find the first scrollable parent of an element
const getScrollParent = (element) => {
  if (!element) return document.documentElement;

  const isScrollable = (el) => {
    const hasScrollableContent = el.scrollHeight > el.clientHeight;
    const overflowYStyle = window.getComputedStyle(el).overflowY;
    const isOverflowHidden = overflowYStyle.indexOf("hidden") !== -1;

    return hasScrollableContent && !isOverflowHidden;
  };

  let parent = element.parentElement;
  while (parent) {
    if (isScrollable(parent)) {
      return parent;
    }
    parent = parent.parentElement;
  }

  return document.documentElement;
};

const toggleFaq = (question) => {
  if (expandedItems.value.has(question)) {
    expandedItems.value.delete(question);
  } else {
    expandedItems.value.add(question);
    nextTick(() => {
      // Wait a bit for the animation to start so height calculations are accurate
      setTimeout(() => {
        const element = document.querySelector(`[data-faq="${question}"]`);
        if (element) {
          const scrollParent = getScrollParent(element);

          // Calculate element's position relative to its scroll parent
          const elementRect = element.getBoundingClientRect();
          const containerRect = scrollParent.getBoundingClientRect();
          const relativeTop = elementRect.top - containerRect.top;

          // Scroll with offset
          scrollParent.scrollBy({
            top: relativeTop - 120,
            behavior: "smooth",
          });
        }
      }, 50);
    });
  }
};

const faqs = ref([
  {
    question: "What is a Data Broker?",
    answer: [
      "Data brokers are websites that buy and sell personal, identifiable information about you and people you know. They will most often do this without your consent.",
      "There are several risks with a data broker possessing your personal information (records): identity theft, financial fraud, targeted advertising, and more.",
    ],
  },
  {
    question: "What is a record?",
    answer: [
      "A record can be your name, email address(es), phone number(s), address(es), or a relative(s). We submit requests to have this data removed on your behalf. Some data brokers may have more than one profile on you with multiple records within each.",
      "Cloaked calculates your individual pieces of information found on a data broker to display your Records Removed number.",
    ],
  },
  {
    question: "How does Cloaked remove my data?",
    answer: [
      "We submit requests to have this data removed on your behalf. Some data brokers may have more than one profile on you with multiple records within each.",
      "In some cases, you will need to manually remove your data from a broker from the Action Required section, which could impact your Estimated Completion date.",
    ],
  },
  {
    question: "How long does it take to delete my data?",
    answer: [
      "Cloaked adds the total estimated removal time per data broker to provide an Estimated Completion Date.",
      "In some cases, you will need to manually remove your data from a broker from the Action Required section, which could impact your Estimated Completion date.",
      "In essence, the time it takes to delete your data completely varies but you can expect the majority of your data across the data brokers we scan to be removed within approximately 45 days.",
    ],
  },
  {
    question: "How do I fix wrong information or add additional information?",
    answer: [
      `Reach out to support at ${SUPPORT_EMAIL} and let us know what needs to be changed. We'll do our best to accommodate changes or additions.`,
    ],
  },
]);

const openLink = () => {
  window.open(HELP_CENTER_BASE_URL, "_blank");
  posthogCapture("dashboard_FAQ_get_support");
};
</script>

<template>
  <BaseSheet class="exposure-status-faq">
    <div class="exposure-status-faq__title">
      <BaseText
        variant="headline-4-bold"
        as="h4"
      >
        FAQ
      </BaseText>
    </div>
    <div class="exposure-status-faq__content">
      <BaseSheet
        v-for="faq in faqs"
        :key="faq.question"
        rounding="sm"
        class="exposure-status-faq__content-item"
        :data-faq="faq.question"
      >
        <div
          class="exposure-status-faq__content-item-header"
          @click="() => toggleFaq(faq.question)"
        >
          <BaseText
            class="exposure-status-faq__content-item-header-text"
            variant="body-3-semibold"
            as="p"
          >
            {{ faq.question }}
          </BaseText>
          <BaseIcon
            :name="expandedItems.has(faq.question) ? 'minus' : 'plus'"
            class="exposure-status-faq__content-item-header-icon"
          />
        </div>
        <transition name="exposure-status-faq__content-item-transition">
          <div
            v-show="expandedItems.has(faq.question)"
            class="exposure-status-faq__content-item-answer"
          >
            <BaseText
              v-for="answer in faq.answer"
              :key="answer"
              variant="body-small-medium"
              as="p"
              class="exposure-status-faq__content-item-answer-text"
            >
              {{ answer }}
            </BaseText>
          </div>
        </transition>
      </BaseSheet>

      <div class="exposure-status-faq__content-button-container">
        <BaseText
          variant="body-3-semibold"
          as="p"
          class="exposure-status-faq__content-button-text"
        >
          Still have questions?
        </BaseText>
        <BaseButton
          variant="secondary"
          full-width
          icon="new-tab"
          class="exposure-status-faq__content-button"
          size="md"
          @click="openLink"
        >
          Get support
        </BaseButton>
      </div>
    </div>
  </BaseSheet>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.exposure-status-faq {
  &__title {
    padding: 8px 0;
  }

  &__content {
    margin-top: 16px;

    &-button-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-direction: column;
      margin-top: 24px;
    }

    &-button-text {
      margin-bottom: 16px;
    }
  }

  &__content-item {
    margin-top: 8px;
    padding: 0px;

    &:first-child {
      margin-top: 0px;
    }
  }

  &__content-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding: 16px;
    border-radius: 12px;
    color: $color-primary-100;

    &:hover {
      cursor: pointer;
    }

    &-text {
      font-weight: 600;
      width: calc(100% - 40px);
    }

    &-icon {
      font-size: 18px;
      font-weight: 600;
      width: 40px;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-left: 16px;
      border-radius: 50%;

      &:hover {
        background-color: $color-primary-5;
      }
    }
  }

  &__content-item-answer {
    margin: 8px 16px 16px 16px;

    &-text {
      margin-top: 12px;

      &:first-child {
        margin-top: 0px;
      }
    }
  }

  &__content-item-transition {
    &-enter-active,
    &-leave-active {
      transition: all 0.4s ease-in-out;
      overflow: hidden;
    }

    &-enter-from,
    &-leave-to {
      max-height: 0;
      opacity: 0;
    }

    &-enter-to,
    &-leave-from {
      max-height: 500px;
      opacity: 1;
    }
  }
}
</style>
