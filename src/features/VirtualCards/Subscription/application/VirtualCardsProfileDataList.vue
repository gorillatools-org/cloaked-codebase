<script setup lang="ts">
import { reactive, watchEffect } from "vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";

export type VirtualCardsProfileDataItem = {
  label: string;
  value: string;
  secretValue?: string;
  secret?: boolean;
};

interface Props {
  items: VirtualCardsProfileDataItem[];
}

const props = defineProps<Props>();

// Track obfuscation state
const isObfuscatedByLabel = reactive<Record<string, boolean>>({});

watchEffect(() => {
  const currentLabels = new Set(props.items.map((item) => item.label));

  // Add new labels (initialize if not present)
  props.items.forEach((item) => {
    if (!(item.label in isObfuscatedByLabel)) {
      isObfuscatedByLabel[item.label] = Boolean(item.secret);
    }
  });

  // Remove old labels that disappeared
  Object.keys(isObfuscatedByLabel).forEach((label) => {
    if (!currentLabels.has(label)) {
      delete isObfuscatedByLabel[label];
    }
  });
});

const toggleObfuscation = (label: string) => {
  isObfuscatedByLabel[label] = !isObfuscatedByLabel[label];
};

const getDisplayedValue = (item: VirtualCardsProfileDataItem) => {
  if (item.secretValue) {
    return isObfuscatedByLabel[item.label] ? item.secretValue : item.value;
  }
  return item.value;
};
</script>

<template>
  <div class="vc-application-profile">
    <ul class="vc-application-profile__list">
      <li
        v-for="item in props.items"
        :key="item.label"
        class="vc-application-profile__item"
      >
        <BaseText
          variant="body-3-semibold"
          class="vc-application-profile__item-label"
        >
          {{ item.label }}
        </BaseText>
        <div
          class="vc-application-profile__item-value-container"
          :class="{
            'vc-application-profile__item-value-container--secret':
              item.secretValue && isObfuscatedByLabel[item.label],
          }"
        >
          <BaseText
            variant="body-3-semibold"
            class="vc-application-profile__item-value-text"
          >
            {{ getDisplayedValue(item) }}
          </BaseText>
          <BaseIcon
            v-if="item.secretValue"
            class="vc-application-profile__item-value-icon"
            :name="
              isObfuscatedByLabel[item.label] ? 'eye-visible' : 'eye-hidden'
            "
            @click="toggleObfuscation(item.label)"
          />
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.vc-application-profile {
  display: flex;
  flex-direction: column;
  background-color: $color-base-white-80;
  border-radius: 16px;
  border: 1px solid $color-base-black-10;
  padding: 24px 16px;
  box-shadow: 0 5px 20px 0 rgb(0 0 0 / 5%);
  margin-top: 32px;
  gap: 8px;
  width: 100%;

  &__list {
    display: flex;
    flex-direction: column;
    gap: 24px;
    width: 100%;
  }

  &__item {
    display: flex;

    &-label {
      color: $color-primary-70;
      flex: 1;
    }

    &-value {
      &-container {
        display: flex;
        justify-content: flex-end;
        flex: 1;
        text-align: right;
        gap: 10px;
      }

      &-text {
        .vc-application-profile__item-value-container--secret & {
          // Scale up, because font-size mess with the margin top
          transform: translate(-17px, -1px) scale(2);
        }
      }

      &-icon {
        cursor: pointer;
        font-size: 16px;
        transition: opacity 0.12s ease-out;

        &:hover {
          opacity: 0.7;
        }
      }
    }
  }
}
</style>
