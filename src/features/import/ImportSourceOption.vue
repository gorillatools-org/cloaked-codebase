<script setup>
import { assetUrl } from "@/scripts/assets";
defineProps({
  option: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div class="import-source-option">
    <img
      :src="assetUrl(`@/assets/icons/import/${option.key}.png`)"
      :alt="option.title"
      width="44"
      height="44"
      class="import-source-option__image"
    />
    <router-link
      class="import-source-option__link"
      :to="{ name: 'ImportUpload', params: { source: option.key } }"
    >
      {{ option.title }}
    </router-link>
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.import-source-option {
  margin-top: 12px;
  padding: 10px;
  background: $color-base-white-100;
  border: 1px solid $color-primary-5;
  border-radius: 8px;
  position: relative;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;

  &:hover {
    background: $color-primary-10;
  }

  &__image {
    border-radius: 4px;
    background-color: transparent;
  }

  &__link {
    margin-left: 16px;
    font-size: 16px;
    line-height: 24px;
    color: $color-primary-100;
    cursor: pointer;

    &::after {
      content: "";
      position: absolute;
      inset: 0;
    }
  }
}
</style>
