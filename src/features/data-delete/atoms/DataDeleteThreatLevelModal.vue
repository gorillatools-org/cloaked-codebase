<script setup>
import DataDeleteModal from "@/features/data-delete/atoms/DataDeleteModal.vue";
import DataDeleteModalContent from "@/features/data-delete/atoms/DataDeleteModalContent.vue";
import BaseButton from "@/library/BaseButton.vue";
import DataDeleteModalTitle from "@/features/data-delete/atoms/DataDeleteModalTitle.vue";
import BaseText from "@/library/BaseText.vue";

defineProps({
  threatLevel: {
    type: String,
    default: "low",
    validator: (value) => ["low", "medium", "high"].includes(value),
  },
});

defineEmits(["update:modelValue"]);
</script>

<template>
  <DataDeleteModal
    v-bind="$attrs"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <DataDeleteModalContent class="data-delete-threat-modal">
      <DataDeleteModalTitle>
        What does your threat level mean?
      </DataDeleteModalTitle>

      <template v-if="threatLevel === 'low'">
        <BaseText
          as="p"
          variant="headline-6-medium"
          class="data-delete__text"
        >
          With a threat level of
          <em class="data-delete-threat-modal__threat--low">Low</em>
          , there is plenty o information available to:
        </BaseText>
        <BaseText
          as="ul"
          variant="headline-6-medium"
          class="data-delete-threat-modal__list"
        >
          <li>Receive automated spam calls, texts, and emails</li>
          <li>Fall victim to phishing attempts</li>
        </BaseText>
      </template>

      <template v-else-if="threatLevel === 'medium'">
        <BaseText
          as="p"
          variant="headline-6-medium"
          class="data-delete__text"
        >
          With a threat level of
          <em class="data-delete-threat-modal__threat--medium">Medium</em>
          , there is still enough information available to:
        </BaseText>
        <BaseText
          as="ul"
          variant="headline-6-medium"
          class="data-delete-threat-modal__list"
        >
          <li>Make changes to insurance policies</li>
          <li>Access important personal and financial records</li>
          <li>Receive automated spam calls, texts, and emails</li>
          <li>Fall victim to phishing attempts</li>
        </BaseText>
      </template>

      <template v-else>
        <BaseText
          as="p"
          variant="headline-6-medium"
          class="data-delete__text"
        >
          <span>{{ "With a threat level of " }}</span>
          <em class="data-delete-threat-modal__threat--high">High</em>
          <span>, there is enough data online to:</span>
        </BaseText>
        <BaseText
          as="ul"
          variant="headline-6-medium"
          class="data-delete-threat-modal__list"
        >
          <li>Open a credit card in your name</li>
          <li>Verify an existing passport</li>
          <li>Register a new insurance policy</li>
          <li>Make mortgage title adjustments</li>
          <li>Steal your identity</li>
          <li>Make changes to insurance policies</li>
          <li>Access important personal and financial records</li>
          <li>Receive automated spam calls, texts, and emails</li>
          <li>Fall victim to phishing attempts</li>
        </BaseText>
      </template>

      <BaseButton
        variant="secondary"
        size="lg"
        class="data-delete-threat-modal__close"
        @click="$emit('update:modelValue', false)"
      >
        Close
      </BaseButton>
    </DataDeleteModalContent>
  </DataDeleteModal>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.data-delete-threat-modal {
  color: $color-primary-100;

  .data-delete__text {
    color: $color-primary-30-light;
    font-size: 15px;
    text-align: left;

    @at-root .theme-light & {
      color: $color-primary-90-light;
    }
  }

  &__threat {
    &--low {
      color: $color-warning;
    }

    &--medium {
      color: $color-info;
    }

    &--high {
      color: $color-alert;
    }
  }

  &__list {
    list-style-type: disc;
    padding-left: 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__close {
    align-self: flex-end;
    margin-top: 8px;
  }
}
</style>
