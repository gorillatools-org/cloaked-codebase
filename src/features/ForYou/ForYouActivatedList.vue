<script setup>
import BaseIcon from "@/library/BaseIcon.vue";
import BaseText from "@/library/BaseText.vue";
import BaseProgressTag from "@/library/BaseProgressTag.vue";
import ForYouActivatedListItem from "@/features/ForYou/ForYouActivatedListItem.vue";
import { useToast } from "@/composables/useToast.js";

const toast = useToast();

defineProps({
  activatedFeatures: {
    type: Array,
    required: true,
  },
});

const handleClick = () => {
  toast.success("Details coming soon!");
};
</script>

<template>
  <div class="for-you-activated-list">
    <div class="for-you-activated-list__header">
      <BaseIcon
        name="shield-tick-filled"
        class="for-you-activated-list__header-icon"
      />
      <BaseProgressTag>
        {{ activatedFeatures.length }} Protections Activated
      </BaseProgressTag>
      <BaseText variant="headline-3-medium">My Activated Protections</BaseText>
    </div>

    <div class="for-you-activated-list__items">
      <ForYouActivatedListItem
        v-for="feature in activatedFeatures"
        :key="feature.id"
        :feature="feature"
        @click="handleClick(feature)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
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
