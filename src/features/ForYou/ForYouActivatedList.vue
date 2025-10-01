<script setup>
import { markRaw, ref, computed } from "vue";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseText from "@/library/BaseText.vue";
import BaseProgressTag from "@/library/BaseProgressTag.vue";
import ForYouActivatedListItem from "@/features/ForYou/ForYouActivatedListItem.vue";
import IdentityTheftProtectionModal from "@/features/IdentityTheftProtection/IdentityTheftProtectionModal.vue";
import { useRouter, useRoute } from "vue-router";
import store from "@/store";

const router = useRouter();
const route = useRoute();
const identityTheftProtectionModal = ref(false);

const props = defineProps({
  activatedFeatures: {
    type: Array,
    required: true,
  },
});

// Filter out one_ring and heimdall from activated features
const filteredActivatedFeatures = computed(() => {
  return props.activatedFeatures.filter(
    (feature) =>
      feature.internal_name !== "one_ring" &&
      feature.internal_name !== "heimdall"
  );
});

// Check if a feature is currently being viewed
const currentFeatureId = computed(() => {
  return route.name === "ForYouFeature" ? route.params.id : null;
});

const isFeatureActive = (feature) => {
  return (
    currentFeatureId.value &&
    String(feature.id) === String(currentFeatureId.value)
  );
};

const handleClick = (feature) => {
  // Check if this is the identity theft protection feature
  if (feature.internal_name === "id_theft") {
    openIdentityTheftProtectionModal();
  } else {
    router.push(`/for-you/feature/${feature.id}`);
  }
};

const openIdentityTheftProtectionModal = () => {
  identityTheftProtectionModal.value = true;

  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(IdentityTheftProtectionModal),
      props: {
        show: true,
      },
      events: {
        close: () => {
          identityTheftProtectionModal.value = false;
          store.dispatch("closeModal");
        },
      },
    },
  });
};
</script>

<template>
  <div class="for-you-activated-list">
    <div class="for-you-activated-list__header">
      <BaseIcon
        name="shield-tick-filled"
        class="for-you-activated-list__header-icon"
      />
      <BaseProgressTag
        color="safe-zone-blue"
        variant="secondary"
      >
        {{ filteredActivatedFeatures.length }} Protections Activated
      </BaseProgressTag>
      <BaseText variant="headline-3-medium">My Activated Protections</BaseText>
    </div>

    <div class="for-you-activated-list__items">
      <ForYouActivatedListItem
        v-for="feature in filteredActivatedFeatures"
        :key="feature.id"
        :feature="feature"
        :is-active="isFeatureActive(feature)"
        @click="handleClick(feature)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.for-you-activated-list {
  &__header {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: space-between;

    &-icon {
      display: block;
      width: 32px;
      height: 32px;
      font-size: 32px;
      font-weight: 500;
    }
  }

  &__items {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
}
</style>
