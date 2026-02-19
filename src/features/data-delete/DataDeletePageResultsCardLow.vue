<script setup>
import DataDeleteThreatTag from "@/features/data-delete/atoms/DataDeleteThreatTag.vue";
import DataDeleteCard from "@/features/data-delete/atoms/DataDeleteCard.vue";
import DataDeleteCardInfo from "@/features/data-delete/atoms/DataDeleteCardInfo.vue";
import DataDeleteCardDivider from "@/features/data-delete/atoms/DataDeleteCardDivider.vue";
import DataDeleteThumbsFeedback from "@/features/data-delete/DataDeleteThumbsFeedback.vue";
import { computed, watch } from "vue";
import { formatPhone } from "@/scripts/format";
import BaseText from "@/library/BaseText.vue";

const props = defineProps({
  result: {
    type: Object,
    required: true,
  },
});

const isCardVisible = computed(
  () => props.result.phones?.length || props.result.emails?.length
);

const emit = defineEmits(["update:modelValue"]);
watch(
  () => isCardVisible.value,
  (isVisible) => emit("update:modelValue", !!isVisible),
  { immediate: true }
);
</script>

<template>
  <DataDeleteCard
    v-if="isCardVisible"
    type="dark"
    class="data-delete-results-low"
  >
    <div class="data-delete-results-low__header">
      <DataDeleteThreatTag threat-level="low" />
      <DataDeleteThumbsFeedback result-id="low-risk" />
    </div>
    <div v-if="result.phones?.length">
      <BaseText
        as="h3"
        variant="headline-4-bold"
        class="data-delete__subtitle"
      >
        Phone Numbers
      </BaseText>
      <div
        v-for="(phone, index) in result.phones"
        :key="index"
      >
        {{ formatPhone(phone) }}
      </div>
    </div>
    <div v-if="result.emails?.length">
      <BaseText
        as="h3"
        variant="headline-4-bold"
        class="data-delete__subtitle"
      >
        Emails
      </BaseText>
      <div
        v-for="(email, index) in result.emails"
        :key="index"
      >
        {{ email }}
      </div>
    </div>
    <DataDeleteCardDivider />
    <DataDeleteCardInfo>
      Spammers can use this information to automate phone calls, texts and
      emails, subjecting you to unwanted advertising and dangerous phishing
      attempts.
    </DataDeleteCardInfo>
  </DataDeleteCard>
</template>

<style lang="scss" scoped>
.data-delete-results-low {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
    width: 100%;
  }
}
</style>
