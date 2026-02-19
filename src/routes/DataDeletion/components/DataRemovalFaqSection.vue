<script setup>
import { ref } from "vue";
import { SUPPORT_EMAIL } from "@/scripts/constants";
import { posthogCapture } from "@/scripts/posthog";
import BaseText from "@/library/BaseText.vue";

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
  {
    question: "Need help and want to talk to Cloaked Support?",
    answer: [
      "Click here to access the Cloaked Support website. To chat with support, visit the Cloaked Support website and find the chat widget in the bottom right of the page.",
    ],
  },
]);

const activeIndex = ref(null);

function toggleAnswer(index) {
  activeIndex.value = activeIndex.value === index ? null : index;
}

function onClickHere() {
  window.open("https://help.cloaked.app/hc/en-us", "_blank");
  posthogCapture("user_clicked_support_website_FAQ_section_data_removal_page");
}
</script>

<template>
  <div class="faq-section">
    <div
      v-for="(faq, questionIndex) in faqs"
      :key="questionIndex"
      class="faq-item"
      @click="toggleAnswer(questionIndex)"
    >
      <div class="faq-text-wrapper">
        <div class="faq-question">
          <span class="icon">
            {{ activeIndex === questionIndex ? "-" : "+" }}
          </span>
          <BaseText variant="headline-6-medium">{{ faq.question }}</BaseText>
        </div>
        <div
          class="faq-answer-wrapper"
          :class="{ opened: activeIndex === questionIndex }"
        >
          <div
            class="faq-answer"
            :class="{ opened: activeIndex === questionIndex }"
          >
            <p
              v-for="(answer, answerIndex) in faq.answer"
              :key="answerIndex"
            >
              <BaseText
                v-if="
                  faq.question ===
                  'How do I fix wrong information or add additional information?'
                "
                variant="headline-5-bold"
              >
                Reach out to support at
                <span class="email">{{ SUPPORT_EMAIL }}</span>
                and let us know what needs to be changed. We'll do our best to
                accommodate changes or additions.
              </BaseText>
              <BaseText
                v-else-if="
                  faq.question ===
                  'Need help and want to talk to Cloaked Support?'
                "
                variant="headline-5-bold"
              >
                Click
                <span
                  class="link-text"
                  @click="onClickHere"
                >
                  {{ "here" }}
                </span>
                {{
                  " to access the Cloaked Support website. To chat with support, visit the Cloaked Support website and find the chat widget in the bottom right of the page."
                }}
              </BaseText>
              <BaseText
                v-else
                variant="headline-5-bold"
              >
                {{ answer }}
              </BaseText>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.faq-section {
  padding: 24px;
  background-color: $color-base-white-100;
  border: 1px solid $color-primary-10;
  border-radius: 12px;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.faq-item {
  display: flex;
  flex-direction: row;
  cursor: pointer;
  border: 1px solid $color-primary-10;
  background-color: $color-primary-1;
  border-radius: 12px;
  padding: 24px 24px;
  box-sizing: border-box;
  transition: all 0.3s ease;
  color: $color-primary-100;
  gap: 16px;
  transition: all 0.3s ease-in-out;
  @at-root .theme-dark & {
    background-color: $color-primary-5;
  }
  &:hover {
    transform: scale(1.003);
    border: 1px solid $color-primary-100;
    transition: all 0.3s ease-in-out;
  }
}

.faq-text-wrapper {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: $color-primary-100;

  .faq-question {
    display: flex;
    gap: 16px;
    .icon {
      width: 11px;
    }
  }

  .faq-answer-wrapper {
    display: grid;
    grid-template-rows: 0fr;
    opacity: 0;
    transition:
      grid-template-rows 0.3s ease-out,
      opacity 0.3s ease-out;
    &.opened {
      grid-template-rows: 1fr;
      opacity: 1;
    }

    .faq-answer {
      display: flex;
      flex-direction: column;
      gap: 16px;
      overflow: hidden;
      padding-left: 24px;

      transition: all 0.3s ease;
      &.opened {
        padding-top: 16px;
        transition: all 0.3s ease;
      }
    }
  }
}

.email {
  text-decoration: underline;
}

.link-text {
  color: $color-primary-100;
  text-decoration: underline;
  &:hover {
    opacity: 0.8;
    animation: all 0.3s ease;
  }
}
</style>
