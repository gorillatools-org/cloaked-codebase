<script setup>
import DataDeleteThreatTag from "@/features/data-delete/atoms/DataDeleteThreatTag.vue";
import DataDeleteCard from "@/features/data-delete/atoms/DataDeleteCard.vue";
import DataDeleteCardInfo from "@/features/data-delete/atoms/DataDeleteCardInfo.vue";
import DataDeleteCardDivider from "@/features/data-delete/atoms/DataDeleteCardDivider.vue";
import DataDeleteShare from "@/features/data-delete/atoms/DataDeleteShare.vue";
import { computed, watch } from "vue";
import { useRelativesParsing } from "@/features/data-delete/composables/useRelativesParsing";
import BaseText from "@/library/BaseText.vue";

const props = defineProps({
  result: {
    type: Object,
    required: true,
  },
});

const gender = computed(() =>
  props.result.gender === "M"
    ? "Male"
    : props.result.gender === "F"
      ? "Female"
      : null
);

const mapRelatives = (relative) => {
  const name =
    relative.fullName ??
    [relative.firstName, relative.lastName]
      .filter((value) => !!value)
      .join(" ");

  return `${name} ${
    relative.relation && relative.relation !== "Unknown"
      ? `(${relative.relation})`
      : ""
  }`
    ?.trim()
    ?.toLowerCase();
};

const {
  partners: rawPartners,
  relatives: rawRelatives,
  others: rawOthers,
} = useRelativesParsing(props.result.relatives);

const partners = computed(() => rawPartners.value.map(mapRelatives));
const relatives = computed(() => rawRelatives.value.map(mapRelatives));
const others = computed(() => rawOthers.value.map(mapRelatives));

const listedPartners = computed(() => partners.value.slice(0, 2));
const otherPartners = computed(() => partners.value.slice(2));

const listedRelatives = computed(() => relatives.value.slice(0, 2));
const otherRelatives = computed(() => relatives.value.slice(2));

const listedOthers = computed(() => others.value.slice(0, 2));
const otherOthers = computed(() => others.value.slice(2));

const isCardVisible = computed(
  () =>
    gender.value ||
    partners.value.length ||
    relatives.value.length ||
    others.value.length
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
    class="data-delete-card-medium"
  >
    <DataDeleteThreatTag threat-level="medium" />
    <div v-if="gender">
      <BaseText
        as="h3"
        variant="headline-4-bold"
        class="data-delete__subtitle"
      >
        Gender
      </BaseText>
      <div>
        {{ gender }}
      </div>
    </div>
    <div v-if="partners.length">
      <BaseText
        as="h3"
        variant="headline-4-bold"
        class="data-delete__subtitle"
      >
        Spouse or Partner
      </BaseText>
      <div
        v-for="(person, index) in listedPartners"
        :key="index"
        class="data-delete__capitalized"
      >
        {{ person }}
      </div>
      <div v-if="otherPartners.length">
        + {{ otherPartners.length }}
        {{ otherPartners.length === 1 ? "other" : "others" }}
      </div>
    </div>
    <div v-if="relatives.length">
      <BaseText
        as="h3"
        variant="headline-4-bold"
        class="data-delete__subtitle"
      >
        Relatives
      </BaseText>
      <div
        v-for="(person, index) in listedRelatives"
        :key="index"
        class="data-delete__capitalized"
      >
        {{ person }}
      </div>
      <div v-if="otherRelatives.length">
        + {{ otherRelatives.length }}
        {{ otherRelatives.length === 1 ? "other" : "others" }}
      </div>
    </div>
    <DataDeleteShare
      v-if="partners.length || relatives.length"
      class="data-delete-card-medium__share"
    />
    <div v-if="others.length">
      <BaseText
        as="h3"
        variant="headline-4-bold"
        class="data-delete__subtitle"
      >
        Friends or Associates
      </BaseText>
      <div
        v-for="(person, index) in listedOthers"
        :key="index"
        class="data-delete__capitalized"
      >
        {{ person }}
      </div>
      <div v-if="otherOthers.length">
        + {{ otherOthers.length }}
        {{ otherOthers.length === 1 ? "other" : "others" }}
      </div>
    </div>
    <DataDeleteCardDivider />
    <DataDeleteCardInfo>
      Scammers with this information can change insurance policies and access
      important documents requiring popular verification methods.
    </DataDeleteCardInfo>
  </DataDeleteCard>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.data-delete-card-medium {
  &__share {
    margin-top: -8px;
  }
}
</style>
