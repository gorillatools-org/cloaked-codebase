<script setup lang="ts">
import { ref, computed, nextTick, watch } from "vue";
import EnterIcon from "@/assets/icons/enter.svg";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseText from "@/library/BaseText.vue";
import useFundingSource from "@/composables/Wallet/useFundingSource";
import type { FundingSource } from "@/types/Wallet/funding-source";
import FundingSourceListItem from "../Wallet/FundingSource/FundingSourceListItem.vue";
import Popper from "@/features/Popper.vue";
import { CARD_LABEL_BY_PROVIDER_TYPE } from "@/scripts/constants";
import { capitalizeFirstLetter } from "@/scripts/format";

const model = defineModel<string | null>({ required: true, default: null });

const {
  fundingSources,
  defaultFundingSource,
  getCardBrandImgURL,
  getProviderIcon,
} = useFundingSource();

const isOpen = ref(false);
const activeIndex = ref<number | null>(null);
const isKeyboardNavigation = ref(false);
const optionsListRef = ref<HTMLUListElement | null>(null);
const wrapperEl = ref<HTMLElement | null>(null);
const activatorEl = ref<HTMLElement | null>(null);
const popperWidth = ref<string | undefined>(undefined);

const selectedFundingSource = computed(() => {
  return (
    fundingSources.value?.find((source) => source.id === model.value) ||
    defaultFundingSource.value
  );
});

const totalOptions = computed(() => fundingSources.value?.length ?? 0);

function selectFundingSource(fundingSource: FundingSource) {
  model.value = fundingSource.id;
}

function openViaActivatorClick() {
  activatorEl.value?.click();
}

function handleEnter() {
  if (!isOpen.value) {
    openViaActivatorClick();

    if (totalOptions.value > 0) {
      activeIndex.value = getSelectedIndexOrDefault();
    }

    return;
  }

  if (activeIndex.value === null || !fundingSources.value?.length) {
    return;
  }

  const selectedOption = fundingSources.value[activeIndex.value];
  if (selectedOption) {
    selectFundingSource(selectedOption);
    openViaActivatorClick();
  }
}

function handleEscape(event: KeyboardEvent) {
  event.preventDefault();
  event.stopPropagation();
  if (isOpen.value) {
    openViaActivatorClick();
    activeIndex.value = null;
  }
}

function nav(direction: number) {
  if (!isOpen.value) {
    openViaActivatorClick();
    if (totalOptions.value > 0) activeIndex.value = getSelectedIndexOrDefault();
    return;
  }
  if (totalOptions.value === 0) return;

  let newActive = activeIndex.value;
  if (newActive === null) {
    newActive = 0;
  } else {
    newActive += direction;
    if (newActive < 0) newActive = totalOptions.value - 1;
    else if (newActive >= totalOptions.value) newActive = 0;
  }
  isKeyboardNavigation.value = true;
  activeIndex.value = newActive;
}

function setActive(index: number) {
  if (!isOpen.value) return;
  isKeyboardNavigation.value = false;
  activeIndex.value = index;
}

function scrollToActiveItem() {
  if (activeIndex.value === null || !optionsListRef.value) return;
  nextTick(() => {
    const activeElement = optionsListRef.value?.querySelector(
      ".vc-funding-source-dropdown__options-item--active"
    );
    if (activeElement) {
      activeElement.scrollIntoView({ block: "nearest" });
    }
  });
}

function getSelectedIndexOrDefault(): number {
  const idx =
    fundingSources.value?.findIndex((s) => s.id === model.value) ?? -1;
  return idx >= 0 ? idx : 0;
}

function getFormattedCardBrand(brand: string | undefined): string {
  if (!brand) return "";
  return brand.charAt(0).toUpperCase() + brand.slice(1);
}

function getCardType(
  provider?: keyof typeof CARD_LABEL_BY_PROVIDER_TYPE
): string {
  if (!provider) return "";
  return CARD_LABEL_BY_PROVIDER_TYPE[provider] || "";
}

function getFundingSourceName(fundingSource: FundingSource): string {
  const fundingSourceNickname = fundingSource.nickname
    ? `(${fundingSource.nickname})`
    : "";
  return `${capitalizeFirstLetter(fundingSource.card_brand)} ${fundingSourceNickname}`;
}

function onPopperOpen() {
  isOpen.value = true;
  const width = wrapperEl.value?.getBoundingClientRect().width;
  popperWidth.value = width ? `${Math.round(width)}px` : undefined;
  activeIndex.value = getSelectedIndexOrDefault();
}

function onPopperClose() {
  isOpen.value = false;
  activeIndex.value = null;
}

watch(
  () => activeIndex.value,
  () => {
    if (isKeyboardNavigation.value) scrollToActiveItem();
  }
);

watch(
  () => isOpen.value,
  () => {
    if (isOpen.value) {
      nextTick(() => {
        scrollToActiveItem();
      });
    }
  }
);
</script>

<template>
  <div
    ref="wrapperEl"
    class="vc-funding-source-dropdown"
    :class="{ 'vc-funding-source-dropdown--active': isOpen }"
    role="combobox"
    aria-haspopup="listbox"
    :aria-expanded="isOpen"
    :aria-activedescendant="
      activeIndex !== null ? `funding-source-option-${activeIndex}` : undefined
    "
  >
    <Popper
      :width="popperWidth"
      :z-index="11000"
      @open="onPopperOpen"
      @close="onPopperClose"
    >
      <div
        ref="activatorEl"
        class="vc-funding-source-dropdown__selected-option-container"
        tabindex="0"
        @keydown.enter.prevent.stop="handleEnter"
        @keydown.space.prevent.stop="handleEnter"
        @keydown.escape.prevent.stop="handleEscape"
        @keydown.up.prevent="nav(-1)"
        @keydown.down.prevent="nav(1)"
      >
        <FundingSourceListItem
          v-if="selectedFundingSource"
          :plain="true"
          :no-effects="true"
          :funding-source="selectedFundingSource"
          :is-select-mode="false"
        >
          <template #actions>
            <BaseIcon
              name="chevron-down"
              class="vc-funding-source-dropdown__selected-option-chevron"
            />
          </template>
        </FundingSourceListItem>
      </div>

      <template #content>
        <div
          class="vc-funding-source-dropdown__options"
          role="listbox"
          aria-label="Funding source options"
        >
          <ul
            ref="optionsListRef"
            class="vc-funding-source-dropdown__options-list"
          >
            <li
              v-for="(fundingSource, index) in fundingSources"
              :id="`funding-source-option-${index}`"
              :key="fundingSource.id"
              class="vc-funding-source-dropdown__options-item"
              :class="{
                'vc-funding-source-dropdown__options-item--active':
                  activeIndex === index,
              }"
              role="option"
              :aria-selected="activeIndex === index"
              @click="
                (selectFundingSource(fundingSource), openViaActivatorClick())
              "
              @mouseenter="setActive(index)"
            >
              <div class="vc-funding-source-dropdown__options-item-wrapper">
                <div class="vc-funding-source-dropdown__options-item-infos">
                  <div class="vc-funding-source-dropdown__options-item-brand">
                    <img
                      v-if="getCardBrandImgURL(fundingSource.card_brand)"
                      :src="getCardBrandImgURL(fundingSource.card_brand)"
                      alt="brand"
                      class="vc-funding-source-dropdown__options-item-brand-img"
                    />
                    <BaseIcon
                      v-else
                      :name="getProviderIcon(fundingSource.provider || '')"
                      class="vc-funding-source-dropdown__options-item-brand-fallback"
                    />
                  </div>
                  <div class="vc-funding-source-dropdown__options-item-texts">
                    <BaseText
                      as="p"
                      variant="body-2-semibold"
                      class="vc-funding-source-dropdown__options-item-title"
                      :title="`${fundingSource.nickname || getFormattedCardBrand(fundingSource.card_brand)} •••• ${fundingSource.pan_last_four}`"
                    >
                      <span
                        class="vc-funding-source-dropdown__options-item-title-name"
                      >
                        {{ getFundingSourceName(fundingSource) }}
                      </span>
                      <span
                        class="vc-funding-source-dropdown__options-item-title-last4"
                      >
                        •••• {{ fundingSource.pan_last_four }}
                      </span>
                    </BaseText>
                    <span
                      class="vc-funding-source-dropdown__options-item-separator"
                      aria-hidden="true"
                    />
                    <BaseText
                      as="p"
                      variant="body-3-regular"
                      class="vc-funding-source-dropdown__options-item-subtitle"
                    >
                      {{ getCardType(fundingSource.provider) }}
                    </BaseText>
                    <div
                      v-if="fundingSource.primary"
                      class="vc-funding-source-dropdown__options-item-default"
                    >
                      <BaseText
                        as="span"
                        variant="caption-bold"
                      >
                        Default
                      </BaseText>
                    </div>
                  </div>
                </div>
                <span class="vc-funding-source-dropdown__options-item-icons">
                  <BaseIcon
                    v-if="fundingSource.id === model"
                    class="vc-funding-source-dropdown__options-item-check-icon"
                    name="check"
                  />
                  <EnterIcon
                    v-else-if="activeIndex === index"
                    class="vc-funding-source-dropdown__options-item-enter-icon"
                  />
                </span>
              </div>
            </li>
          </ul>
        </div>
      </template>
    </Popper>
  </div>
</template>

<style scoped lang="scss">
.vc-funding-source-dropdown {
  width: 100%;
  position: relative;
  background-color: $color-base-white-100;
  border-radius: 30px;

  &__selected-option {
    &-container {
      padding: 20px 18px;
      border-radius: 30px;
      outline: 1px solid $color-base-black-10;
      min-height: 85px;
      transition: outline-color 0.12s ease-in-out;

      &:hover {
        outline-color: $color-primary-30;
      }

      &:focus,
      &:focus-visible {
        outline: 1px solid $color-primary-100;
      }

      .vc-funding-source-dropdown--active & {
        outline: 1px solid $color-primary-100;
      }
    }

    &-chevron {
      font-size: 19px;
      transition: transform 0.16s ease-out;

      .vc-funding-source-dropdown--active & {
        transform: rotate(180deg);
      }
    }
  }

  &__options {
    border-radius: 24px;
    border: 1px solid $color-primary-70;
    margin-top: 10px;
    width: 100%;
    background-color: $color-base-white-100;
    overflow: hidden;

    &-list {
      display: flex;
      flex-direction: column;
      list-style: none;
      max-height: 240px;
      overflow: hidden auto;

      &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 8px;
      }

      &::-webkit-scrollbar-thumb {
        background: $color-primary-20;
        border-radius: 8px;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: $color-primary-100 !important;
      }
    }

    &-item {
      &-wrapper {
        width: 100%;
        display: flex;
        align-items: center;
        padding: 12px 16px;
        cursor: pointer;
        gap: 10px;
      }

      &--active {
        .vc-funding-source-dropdown__options-item-wrapper {
          background-color: $color-primary-10;
        }

        .vc-funding-source-dropdown__options-item-title {
          color: $color-primary-100;
        }
      }

      &-brand {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        min-width: 32px;
        min-height: 32px;
        border-radius: 50%;
        overflow: hidden;
        border: 1px solid $color-primary-10;
        background-color: $color-white;

        &-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        &-fallback {
          color: $color-primary-50;
        }
      }

      &-texts {
        display: flex;
        align-items: center;
        gap: 8px;
        color: $color-primary-100;

        .vc-funding-source-dropdown__options-item-title {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: $color-primary-100;
          max-width: 100%;

          &-name {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            display: inline-block;
            max-width: 200px;
            vertical-align: bottom;
          }

          &-last4 {
            flex-shrink: 0;
          }
        }

        .vc-funding-source-dropdown__options-item-subtitle {
          color: $color-primary-100;
        }
      }

      &-separator {
        width: 4px;
        height: 4px;
        border-radius: 99px;
        background: $color-primary-100;
        flex: 0 0 auto;
      }

      &-infos {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
        flex: 1 1 auto;
        padding-right: 6px;
      }

      &-icons {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-left: auto;
        padding-left: 8px;
        min-width: 28px;
      }

      &-default {
        background-color: $color-primary-100;
        color: $color-base-white-100;
        border-radius: 19px;
        padding: 3px 10px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      &-enter-icon {
        justify-self: flex-end;
        width: 18px;
        min-width: 18px;
        color: $color-primary-50;
      }

      &-check-icon {
        justify-self: flex-end;
        font-size: 18px;
      }

      &:not(:last-child) {
        border-bottom: 1px solid $color-primary-10;
      }

      &--active &-enter-icon {
        opacity: 1;
      }
    }
  }
}
</style>
