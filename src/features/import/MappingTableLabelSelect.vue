<script setup>
import {
  LABEL_IGNORE,
  CUSTOM_LABELS as customLabels,
} from "@/store/modules/accounts-importer/shared.js";
import { computed, ref } from "vue";
import store from "@/store";
import { vOnClickOutside } from "@vueuse/components";
import InlineSvg from "@/features/InlineSvg.vue";

const emit = defineEmits(["input"]);
const props = defineProps({
  value: {
    type: String,
    required: false,
    default: null,
  },
});
const isOpen = ref(false);
const labels = computed(() => store.getters["accountsImporter/LABELS"]);
const isIgnored = computed(() => props.value === LABEL_IGNORE);
const label = computed(() => {
  if (isIgnored.value) {
    return "(Ignored column)";
  }
  return props.value || "Choose label (required)";
});
const icon = computed(() => {
  if (isIgnored.value) {
    return "ignored";
  }

  return props.value ? "check-mark-rounded" : "add";
});
const isV2User = computed(() => store.getters.isV2User);
function onLabelClicked(label) {
  emit("input", label);
  isOpen.value = false;
}
</script>

<template>
  <div
    v-on-click-outside="() => (isOpen = false)"
    class="label-select"
  >
    <button
      class="label-select__button"
      :class="{
        'label-select__button--open': isOpen,
        'label-select__button--ignored': isIgnored,
        'label-select__button--no-label': !value,
      }"
      @click="isOpen = !isOpen"
      @keydown.esc="isOpen = false"
    >
      <InlineSvg
        :key="icon"
        :name="icon"
        class="label-select__icon"
      />
      {{ label }}
      <InlineSvg
        name="chevron"
        class="label-select__chevron"
      />
    </button>
    <transition name="label-dropdown-fade">
      <ul
        v-show="isOpen"
        class="label-select__dropdown"
      >
        <li
          v-for="fieldLabel in labels"
          :key="fieldLabel.label"
          class="label-select__label"
          :class="{
            'label-select__label--warning': fieldLabel.isWarning,
            'label-select__label--padded':
              !!value && fieldLabel.label !== value,
            'label-select__label--selected': fieldLabel.label === value,
          }"
          @click="onLabelClicked(fieldLabel)"
        >
          <InlineSvg
            v-if="fieldLabel.label === value"
            name="checkmark"
            class="label-select__label-icon"
          />
          {{ fieldLabel.label }}
        </li>
        <template v-if="isV2User">
          <li
            class="label-select__dropdown-title"
            :class="{ 'label-select__dropdown-title--padded': !!value }"
          >
            Other information
          </li>
          <li
            v-for="customFieldLabel in customLabels"
            :key="customFieldLabel.label"
            class="label-select__label"
            :class="{
              'label-select__label--warning': customFieldLabel.isWarning,
              'label-select__label--padded':
                !!value && customFieldLabel.label !== value,
              'label-select__label--selected': customFieldLabel.label === value,
            }"
            @click="onLabelClicked(customFieldLabel)"
          >
            <InlineSvg
              v-if="customFieldLabel.label === value"
              name="checkmark"
              class="label-select__label-icon"
            />
            {{ customFieldLabel.label }}
          </li>
        </template>
      </ul>
    </transition>
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.label-select {
  position: relative;

  &__button {
    width: 100%;
    min-width: 200px;
    display: flex;
    align-items: center;
    height: 40px;
    padding: 6px 8px;
    background: $color-base-white-100;
    border: 1px solid rgb(0 0 0 / 4%);
    box-shadow:
      0 0 12px rgb(0 0 0 / 4%),
      0 1px 4px rgb(1 2 24 / 8%);
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    color: $color-primary-100;
    transition: all 0.1s cubic-bezier(0.17, 0.67, 0.83, 0.67);

    &:hover {
      transform: scale(1.02);
      transition: all 0.2s cubic-bezier(0.17, 0.67, 0.83, 0.67);
    }

    &--no-label {
      color: $color-alert;
    }

    &--ignored {
      color: $color-primary-50;
    }

    &--open {
      background: rgb(0 0 0 / 4%);
    }
  }

  &__dropdown {
    position: absolute;
    left: 0;
    right: 0;
    top: 100%;
    padding: 4px;
    background: $color-primary-1;
    border: 1px solid rgb(0 0 0 / 10%);
    box-shadow: 0 5px 40px rgba($black, 0.16);
    border-radius: 12px;
    z-index: 1;
    overflow: auto;
    max-height: calc(100vh - 440px);

    @at-root .theme-dark & {
      box-shadow: 0 5px 40px rgba($white, 0.16);
    }

    &-title {
      color: $color-primary-100;
      font-size: 12px;
      font-family: $global-font;
      font-weight: 600;
      height: 40px;
      display: flex;
      align-items: center;
      padding: 0 12px;
      margin-top: 12px;

      &--padded {
        margin-left: 8px;
      }
    }
  }

  &__icon {
    margin-right: 8px;
    fill: #00c49a;
  }

  &__chevron {
    margin-left: auto;
    transition: transform 0.1s ease-out;

    @at-root .label-select__button--open & {
      transform: rotate(180deg);
    }
  }

  &__label {
    font-weight: 400;
    font-size: 14px;
    line-height: 130%;
    color: $color-primary-100;
    padding: 0 12px;
    height: 40px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;

    &-icon {
      margin-right: 8px;
    }

    transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);

    &:hover {
      background: $color-primary-5;
      transform: scale(1.02);
      transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
    }

    &--warning {
      color: $color-alert;
    }

    &--padded {
      padding-left: calc(11px + 32px);
    }

    &--selected {
      color: #6251f8;
    }
  }
}

.label-dropdown-fade-enter-active,
.label-dropdown-fade-leave-active {
  transition: all 0.15s ease-in-out;
}

.label-dropdown-fade-enter,
.label-dropdown-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
