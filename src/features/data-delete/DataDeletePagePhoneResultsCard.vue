<script setup>
import DataDeletePageResultsCardHigh from "@/features/data-delete/DataDeletePageResultsCardHigh.vue";
import DataDeletePageResultsCardLow from "@/features/data-delete/DataDeletePageResultsCardLow.vue";
import DataDeletePageResultsCardMedium from "@/features/data-delete/DataDeletePageResultsCardMedium.vue";
import DataDeleteCard from "@/features/data-delete/atoms/DataDeleteCard.vue";
import { ref, watch } from "vue";
import { useNameParsing } from "@/features/data-delete/composables/useNameParsing";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";

const props = defineProps({
  result: {
    type: Object,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  isForcingNewSearch: {
    type: Boolean,
    default: false,
  },
  isEmailCaptureModalFlag: {
    type: Boolean,
    default: false,
  },
});

const { name, nameAndAge } = useNameParsing(props.result);

const hasHighRisk = ref(false);
const hasMediumRisk = ref(false);
const hasLowRisk = ref(false);

const emit = defineEmits(["threat-level", "on-not-me", "update:modelValue"]);
watch(
  () => ({
    hasHighRisk: hasHighRisk.value,
    hasMediumRisk: hasMediumRisk.value,
  }),
  ({ hasHighRisk, hasMediumRisk }) =>
    emit(
      "threat-level",
      hasHighRisk ? "high" : hasMediumRisk ? "medium" : "low"
    ),
  { immediate: true }
);

const handleEmailCapture = () => {
  emit("update:modelValue", true);
};
</script>

<template>
  <DataDeleteCard class="data-delete-results-card">
    <div>
      <BaseText
        v-if="name"
        as="h2"
        variant="headline-3-bold"
        class="data-delete-results-card__name data-delete__capitalized"
      >
        {{ nameAndAge }}
      </BaseText>
      <BaseText
        v-if="!isForcingNewSearch"
        as="p"
        variant="body-2-semibold"
        class="data-delete-results-card__link data-delete-results-card__not-me"
        @click="$emit('on-not-me')"
      >
        Not you?
      </BaseText>
      <div
        v-if="isEmailCaptureModalFlag"
        class="data-delete-results-card__scan"
      >
        <BaseButton
          variant="outline"
          class="data-delete-results-card__scan-button"
          @click="handleEmailCapture"
        >
          Send scan results via email
        </BaseButton>
      </div>
    </div>
    <DataDeletePageResultsCardHigh
      v-model="hasHighRisk"
      :result="result"
      class="data-delete-results-card__card"
    />
    <DataDeletePageResultsCardMedium
      v-model="hasMediumRisk"
      :result="result"
      class="data-delete-results-card__card"
    />
    <DataDeletePageResultsCardLow
      v-model="hasLowRisk"
      :result="result"
      class="data-delete-results-card__card"
    />
  </DataDeleteCard>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.data-delete-results-card {
  display: flex;
  padding: 24px 16px;
  flex-direction: column;
  gap: 16px;
  align-self: stretch;
  margin-top: 24px;

  @media all and (min-width: $screen-xl) {
    margin-top: 0;
  }

  &__name {
    text-align: center;
  }

  & &__card {
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;

    & > * {
      animation: appear-bottom-5 0.4s forwards ease-out;
      opacity: 0;

      @for $i from 1 through 10 {
        &:nth-child(#{$i}) {
          opacity: 0;
          animation-delay: $i * 0.03s;
        }
      }
    }
  }

  &__link {
    text-decoration: underline;
    cursor: pointer;
    text-align: center;
    opacity: 0.9;
    position: relative;

    &::after {
      content: "";
      position: absolute;
      inset: -14px 0;
    }

    &:hover {
      opacity: 0.7;
    }
  }

  &__scan {
    margin-top: 16px;
    display: flex;
    justify-content: center;

    &-button {
      margin-top: 0;
    }
  }
}
</style>
