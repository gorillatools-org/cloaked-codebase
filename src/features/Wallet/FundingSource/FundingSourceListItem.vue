<script setup lang="ts">
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import type { FundingSource } from "@/types/Wallet/funding-source";
import { computed, type PropType } from "vue";
import { CARD_LABEL_BY_PROVIDER_TYPE } from "@/scripts/constants";
import Button from "@/features/Button.vue";
import useFundingSource from "@/composables/Wallet/useFundingSource";

const emit = defineEmits<{
  (e: "select"): void;
  (e: "remove"): void;
  (e: "edit"): void;
}>();

const props = defineProps({
  fundingSource: {
    type: Object as PropType<FundingSource>,
    required: true,
  },
  isSelectMode: {
    type: Boolean,
    default: false,
  },
  isSelectLoading: {
    type: Boolean,
    default: false,
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
  showActions: {
    type: Boolean,
    default: false,
  },
  showDefaultBadge: {
    type: Boolean,
    default: true,
  },
});

const { getProviderIcon, getCardBrandImgURL } = useFundingSource();

const isDefaultFundingSource = computed(() => {
  return props.fundingSource.primary;
});

const brandImgURL = computed(() => {
  return getCardBrandImgURL(props.fundingSource.card_brand);
});

const cardType = computed(() => {
  return CARD_LABEL_BY_PROVIDER_TYPE[
    props.fundingSource.provider as keyof typeof CARD_LABEL_BY_PROVIDER_TYPE
  ];
});

const formattedCardBrand = computed(() => {
  return (
    props.fundingSource.card_brand.charAt(0).toUpperCase() +
    props.fundingSource.card_brand.slice(1)
  );
});

const fallbackIconName = computed(() => {
  return getProviderIcon(props.fundingSource.provider ?? "");
});

const handleSelect = () => {
  if (
    props.isDisabled ||
    props.isSelectLoading ||
    props.isSelected ||
    !props.isSelectMode
  )
    return;
  emit("select");
};
</script>
<template>
  <div
    class="fs-list-item"
    :class="{
      'fs-list-item--select-mode': isSelectMode,
      'fs-list-item--loading': isSelectLoading,
      'fs-list-item--disabled': isDisabled,
      'fs-list-item--selected': isSelected,
    }"
    @click="handleSelect"
  >
    <div
      v-if="isSelectMode"
      class="fs-list-item__selection-container"
    >
      <BaseIcon
        v-if="!isSelectLoading"
        :name="isSelected ? 'circle-radio-filled' : 'circle-radio'"
        class="fs-list-item__selection-icon"
      />
      <span
        v-else
        class="fs-list-item__selection-loader"
      ></span>
    </div>
    <div class="fs-list-item__brand-container">
      <img
        v-if="brandImgURL"
        :src="brandImgURL"
        alt="brand"
        class="fs-list-item__brand-img"
      />
      <BaseIcon
        v-else
        :name="fallbackIconName"
        class="fs-list-item__brand-img-fallback"
      />
    </div>
    <div class="fs-list-item__infos-container">
      <div class="fs-list-item__infos-brand-container">
        <BaseText
          as="p"
          variant="headline-6-bold"
          class="fs-list-item__infos-brand-text"
          :title="`${formattedCardBrand} ${fundingSource.nickname ? `(${fundingSource.nickname})` : ''}`"
        >
          {{ formattedCardBrand }}
          <template v-if="fundingSource.nickname">
            ({{ fundingSource.nickname }})
          </template>
        </BaseText>
        <transition name="fade">
          <div
            v-if="isDefaultFundingSource && showDefaultBadge && showActions"
            class="fs-list-item__infos-brand-default-badge-container"
          >
            <div class="fs-list-item__infos-brand-default-badge">
              <BaseText
                as="p"
                variant="caption-bold"
                style="margin-top: 0.5px"
              >
                Default
              </BaseText>
            </div>
          </div>
        </transition>
      </div>
      <BaseText
        as="p"
        variant="body-small-medium"
        class="fs-list-item__infos-last-four"
      >
        **** {{ fundingSource.pan_last_four }} • {{ cardType }}
      </BaseText>
    </div>

    <transition name="fade">
      <div
        v-if="isDefaultFundingSource && showDefaultBadge && !showActions"
        class="fs-list-item__infos-brand-default-badge-container fs-list-item__infos-brand-default-badge-container--end"
      >
        <div class="fs-list-item__infos-brand-default-badge">
          <BaseText
            as="p"
            variant="caption-bold"
            style="margin-top: 0.5px"
          >
            Default
          </BaseText>
        </div>
      </div>
    </transition>
    <div
      v-if="showActions"
      class="fs-list-item__actions-container"
    >
      <Button
        type="tag"
        size="small"
        class="fs-list-item__actions-edit-button"
        @click.stop="emit('edit')"
      >
        Edit
      </Button>
      <Button
        type="danger-secondary"
        class="fs-list-item__actions-remove-button"
        size="small"
        @click.stop="emit('remove')"
      >
        Remove
      </Button>
    </div>
  </div>
</template>
<style scoped lang="scss">
/* stylelint-disable */
$component-name: "fs-list-item";

.#{$component-name} {
  display: flex;
  align-items: center;
  height: 75px;
  padding: 16px;
  border-radius: 24px;
  border: 1px solid var(--color-base-black-15);
  box-shadow: 0px 5px 20px 0px rgba(0, 0, 0, 0.05);
  transition:
    opacity 0.15s ease-in-out,
    background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;

  &:hover,
  &--loading {
    border-color: var(--color-base-black-50);
    box-shadow: 0px 10px 24px 0px rgba(0, 0, 0, 0.15);
  }

  &--select-mode:not(&--selected) {
    cursor: pointer;
  }

  &--disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  &__selection {
    &-container {
      min-width: 18px;
      margin-right: 10px;
    }

    &-icon {
      font-size: 18px;
    }

    &-loader {
      display: block;
      width: 17px;
      height: 17px;
      border-radius: 50%;
      background: linear-gradient(currentcolor 40%, transparent 70%);
      mask: radial-gradient(closest-side, transparent 70%, black 70%);
      animation: loading 0.5s linear infinite;
    }
  }

  &__brand {
    &-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      min-width: 32px;
      min-height: 32px;
      border-radius: 50%;
      overflow: hidden;
      border: 1px solid var(--color-primary-10);
      background-color: #fff;
    }

    &-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    &-img-fallback {
      width: 17px;
      color: var(--color-primary-50);
      margin-left: 2px;
    }
  }

  &__infos {
    &-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-left: 10px;
      min-width: 0;
    }

    &-brand {
      &-container {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      &-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      &-default-badge {
        align-items: center;
        justify-content: center;
        background-color: var(--color-primary-100);
        border-radius: 19px;
        padding: 3px 10px;
        color: var(--color-base-white-0);
      }

      &-default-badge-container {
        &--end {
          display: flex;
          justify-content: flex-end;
          flex-grow: 1;
        }
      }
    }

    &-last-four {
      color: var(--color-primary-70);
    }
  }

  &__actions {
    &-container {
      display: flex;
      justify-self: flex-end;
      flex-grow: 1;
      align-items: center;
      justify-content: flex-end;
      margin-left: 10px;
      gap: 4px;

      .button {
        opacity: 0;
        visibility: hidden;
        transform: translateX(10px);
        transition:
          opacity 0.15s ease-in-out,
          visibility 0.15s ease-in-out,
          transform 0.15s ease-in-out;

        .#{$component-name}:hover & {
          opacity: 1;
          visibility: visible;
          transform: translateX(0);
        }
      }
    }

    &-edit-button {
      font-weight: 600;

      @at-root .theme-dark & {
        border-color: rgba($color-primary-100-dark, 0.15);
      }

      @at-root .theme-light & {
        border-color: rgba($color-primary-100-light, 0.15);
      }
    }

    &-remove-button {
      background: transparent;
      border-color: rgba($color-status-error, 0.15) !important;
      font-weight: 600;
    }
  }
}

@keyframes loading {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

// Fade transition
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.15s ease-in-out,
    transform 0.15s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-5px);
}
</style>
