<script setup lang="ts">
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import type { FundingSource } from "@/types/Wallet/funding-source";
import { computed, type PropType } from "vue";
import { CARD_LABEL_BY_PROVIDER_TYPE } from "@/scripts/constants";
import useFundingSource from "@/composables/Wallet/useFundingSource";
import VCBaseDropdownMenu, {
  type DropdownMenuItem,
} from "@/features/VirtualCards/base/VCBaseDropdownMenu.vue";

const emit = defineEmits<{
  (e: "select"): void;
  (e: "set-default"): void;
  (e: "remove"): void;
  (e: "settings"): void;
  (e: "update"): void;
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
  isLoading: {
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
  borderRadius: {
    type: String,
    default: "24px",
  },
  plain: {
    type: Boolean,
    default: false,
  },
  noEffects: {
    type: Boolean,
    default: false,
  },
});

const { getProviderIcon, getCardBrandImgURL, expiredFundingSources } =
  useFundingSource();

const actionsList = computed<DropdownMenuItem[][]>(() => {
  return [
    [
      {
        id: "update",
        label: "Update card",
        icon: isExpired.value ? "info" : "edit",
        color: isExpired.value ? "danger" : undefined,
        onClick: () => emit("update"),
      },
      {
        id: "set-default",
        label: "Mark as default",
        icon: "tick-circle",
        visible: !props.isSelected && !isExpired.value,
        onClick: () => emit("set-default"),
      },
      {
        id: "remove",
        label: "Remove",
        icon: "remove",
        onClick: () => emit("remove"),
      },
      {
        id: "settings",
        label: "Settings",
        icon: "setting",
        onClick: () => emit("settings"),
      },
    ],
  ];
});

const isDefaultFundingSource = computed(() => {
  return props.fundingSource.primary;
});

const isExpired = computed(() => {
  return !!expiredFundingSources.value?.find(
    (fundingSource) => fundingSource.id === props.fundingSource.id
  );
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
    props.isLoading ||
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
      'fs-list-item--loading': isLoading,
      'fs-list-item--disabled': isDisabled,
      'fs-list-item--selected': isSelected,
      'fs-list-item--expired': isExpired,
      'fs-list-item--plain': plain,
      'fs-list-item--no-effects': noEffects,
    }"
    :style="{ borderRadius: plain ? '0' : props.borderRadius }"
    @click="handleSelect"
  >
    <!--Loading-->
    <div
      v-if="isLoading"
      class="fs-list-item__loader-container"
    >
      <span class="fs-list-item__loader"></span>
    </div>

    <!--Select mode-->
    <div
      v-if="isSelectMode && !isLoading"
      class="fs-list-item__selection-container"
    >
      <BaseIcon
        v-if="!isLoading"
        :name="isSelected ? 'circle-radio-filled' : 'circle-radio'"
        class="fs-list-item__selection-icon"
      />
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
        <transition
          name="fade"
          :css="props.plain || props.noEffects ? false : true"
        >
          <div
            v-if="
              isDefaultFundingSource &&
              showDefaultBadge &&
              (showActions || $slots.actions)
            "
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

    <transition
      name="fade"
      :css="!props.noEffects"
    >
      <div
        v-if="
          isDefaultFundingSource &&
          showDefaultBadge &&
          !(showActions || $slots.actions)
        "
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
      v-if="showActions || $slots.actions"
      class="fs-list-item__actions-container"
    >
      <slot name="actions">
        <VCBaseDropdownMenu
          :popper="{
            placement: 'bottom-start',
            zIndex: 10001,
            offsetAway: 5,
            width: '150px',
          }"
          :items="actionsList"
          @click.stop
        >
          <template #default="{ open }">
            <span
              class="fs-list-item__actions-toggle"
              :class="{ 'fs-list-item__actions-toggle--open': open }"
            >
              <BaseIcon
                name="more-filled"
                class="fs-list-item__actions-toggle-icon"
              />
            </span>
          </template>
        </VCBaseDropdownMenu>
      </slot>
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
  border: 1px solid var(--color-base-black-15);
  box-shadow: 0px 5px 20px 0px rgba(0, 0, 0, 0.05);
  background-color: $color-base-white-100;
  position: relative;
  transition:
    opacity 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    border-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    box-shadow 0.16s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  &:not(&--selected):hover:not(&--no-effects),
  &--loading:not(&--selected):not(&--no-effects) {
    border-color: var(--color-base-black-50);
    box-shadow: 0px 10px 24px 0px rgba(0, 0, 0, 0.15);
  }

  &--select-mode.#{$component-name}--selected {
    border-color: var(--color-primary-100);
    box-shadow: 0px 10px 24px 0px rgba(0, 0, 0, 0.15);
  }

  &--plain {
    border: none;
    box-shadow: none;
    background-color: transparent;
    padding: 0;
    height: auto;

    &:hover:not(&--no-effects),
    &--loading:not(&--no-effects) {
      border: none;
      box-shadow: none;
    }
  }

  &--select-mode:not(&--selected) {
    cursor: pointer;
  }

  &--disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  &__selection-container,
  &__loader-container {
    min-width: 18px;
    margin-right: 10px;
  }

  &__selection {
    &-icon {
      font-size: 18px;
    }
  }

  &__loader {
    display: block;
    width: 17px;
    height: 17px;
    border-radius: 50%;
    background: linear-gradient(currentcolor 40%, transparent 70%);
    mask: radial-gradient(closest-side, transparent 70%, black 70%);
    animation: loading 0.5s linear infinite;
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
        color: $color-base-white-100;
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
    }

    &-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      cursor: pointer;
      background-color: transparent;
      border-radius: 50%;
      position: relative;
      transition:
        background-color 0.15s ease-in-out,
        opacity 0.15s ease-in-out;

      .#{$component-name}--loading & {
        pointer-events: none;
        opacity: 0.5;
      }

      .#{$component-name}--expired & {
        &:before {
          content: "";
          min-width: 8px;
          min-height: 8px;
          border-radius: 50%;
          background-color: $color-status-error;
          position: absolute;
          right: -1px;
          top: -1px;
        }
      }

      .#{$component-name}:not(.#{$component-name}--no-effects) &:hover,
      .#{$component-name}:not(.#{$component-name}--no-effects) &--open {
        @at-root .theme-dark & {
          background-color: rgba($color-primary-100-dark, 0.1);
        }

        @at-root .theme-light & {
          background-color: rgba($color-primary-100-light, 0.1);
        }
      }

      &-icon {
        font-size: 15px;
      }
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
    opacity 0.2s ease,
    transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
