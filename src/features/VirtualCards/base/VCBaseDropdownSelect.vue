<script setup lang="ts">
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import {
  computed,
  onMounted,
  ref,
  watch,
  nextTick,
  onBeforeUnmount,
} from "vue";
import { vOnClickOutside } from "@vueuse/components";

export type DropdownSelectOption<T = string> = {
  label: string;
  value: T;
  visible?: boolean;
};

type Props<T = string> = {
  options: DropdownSelectOption<T>[];
  openWidth?: number | string;
  closedHeight?: number | string;
};

const props = withDefaults(defineProps<Props>(), {
  openWidth: 180,
  closedHeight: 30,
});

const model = defineModel<string>({ required: true });

let optionListResizeObserver: ResizeObserver | null = null;

const isOpen = ref(false);
const wasOpened = ref(false);

const wrapperEl = ref<HTMLElement | null>(null);
const measureEl = ref<HTMLElement | null>(null);
const optionListEl = ref<HTMLElement | null>(null);

const closedWidthValue = ref<number | null>(null);
const closedHeightValue = ref<number | null>(null);
const openHeightValue = ref<number | null>(null);

const selectedOption = computed(() =>
  props.options.find((option) => option.value === model.value)
);

const visibleOptions = computed(() =>
  props.options.filter((option) => option.visible !== false)
);

onMounted(() => {
  measureClosedSize();
  measureOpenSize();

  window.addEventListener("resize", measureClosedSize);
  window.addEventListener("resize", measureOpenSize);

  if (optionListEl.value) {
    optionListResizeObserver = new ResizeObserver(() => {
      measureOpenSize();
    });
    optionListResizeObserver.observe(optionListEl.value);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", measureClosedSize);
  window.removeEventListener("resize", measureOpenSize);
  if (optionListResizeObserver) {
    optionListResizeObserver.disconnect();
    optionListResizeObserver = null;
  }
});

const toggleOpen = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    wasOpened.value = true;
  }
};

const close = () => {
  isOpen.value = false;
};

const selectOption = (value: string) => {
  model.value = value;
  close();
};

const toCssLength = (value?: number | string | null): string | undefined => {
  if (!value) return undefined;
  return typeof value === "number" ? `${value}px` : value;
};

const measureClosedSize = () => {
  nextTick(() => {
    const wrapper = wrapperEl.value;
    const measure = measureEl.value;
    if (!wrapper || !measure) return;

    // Copy wrapper paddings & borders to add to the content width/height
    const styles = getComputedStyle(wrapper);
    const padX =
      parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
    const borderX =
      parseFloat(styles.borderLeftWidth) + parseFloat(styles.borderRightWidth);

    // Ghost row is out of document flow, white-space:nowrap; get its natural size
    const rect = measure.getBoundingClientRect();
    const iconWidth = 23;

    closedWidthValue.value = Math.ceil(rect.width + padX + borderX + iconWidth);
    closedHeightValue.value = 30; // Fixed height
  });
};

const measureOpenSize = () => {
  nextTick(() => {
    const wrapper = wrapperEl.value;
    const list = optionListEl.value as HTMLElement | null;
    const measure = measureEl.value;
    if (!wrapper || !list || !measure) return;

    // Compute borders to add to total height
    const styles = getComputedStyle(wrapper);
    const borderY =
      parseFloat(styles.borderTopWidth) + parseFloat(styles.borderBottomWidth);

    const listHeight = list.scrollHeight;
    const padding = 5;

    openHeightValue.value = Math.ceil(listHeight + padding + borderY);
  });
};

watch(
  [() => model.value, () => props.options],
  () => {
    measureClosedSize();
    measureOpenSize();
  },
  { deep: true }
);
</script>

<template>
  <div
    v-on-click-outside="close"
    class="vc-base-dropdown-select"
    :class="{
      'vc-base-dropdown-select--open': isOpen,
      'vc-base-dropdown-select--was-opened': wasOpened,
    }"
  >
    <div
      ref="wrapperEl"
      class="vc-base-dropdown-select__wrapper"
      role="combobox"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      tabindex="0"
      :style="{
        '--w-closed': closedWidthValue ? closedWidthValue + 'px' : undefined,
        '--h-closed':
          toCssLength(props.closedHeight) ??
          (closedHeightValue ? closedHeightValue + 'px' : undefined),
        '--w-open': toCssLength(props.openWidth),
        '--h-open': openHeightValue ? openHeightValue + 'px' : undefined,
      }"
      @click="toggleOpen"
      @keydown.enter.prevent.stop="
        isOpen = true;
        wasOpened = true;
      "
      @keydown.space.prevent.stop="
        isOpen = true;
        wasOpened = true;
      "
      @keydown.escape.prevent.stop="close"
    >
      <div class="vc-base-dropdown-select__selected-option">
        <BaseText
          variant="body-small-semibold"
          class="vc-base-dropdown-select__selected-option-label"
        >
          {{ selectedOption?.label }}
        </BaseText>
      </div>
      <BaseIcon
        name="chevron-down"
        class="vc-base-dropdown-select__selected-option-icon"
      />

      <ul
        ref="optionListEl"
        class="vc-base-dropdown-select__option-list"
        role="listbox"
      >
        <li
          v-for="option in visibleOptions"
          :key="option.value"
          role="option"
          :aria-selected="option.value === model"
          class="vc-base-dropdown-select__option-item"
          :class="{
            'vc-base-dropdown-select__option-item--selected':
              option.value === model,
          }"
          @click.stop="selectOption(option.value)"
        >
          <BaseText
            class="vc-base-dropdown-select__option-item-label"
            variant="body-small-semibold"
          >
            {{ option.label }}
          </BaseText>
          <Transition name="vc-fade">
            <BaseIcon
              v-if="option.value === model"
              name="check"
              class="vc-base-dropdown-select__option-item-selected-icon"
            />
          </Transition>
        </li>
      </ul>
    </div>

    <!-- Ghost row for measurement (kept outside wrapper so it's never constrained) -->
    <div
      ref="measureEl"
      class="vc-base-dropdown-select__measure"
      aria-hidden="true"
    >
      <div
        class="vc-base-dropdown-select__selected-option vc-base-dropdown-select__selected-option--ghost"
      >
        <BaseText
          variant="body-small-semibold"
          class="vc-base-dropdown-select__selected-option-label"
        >
          {{ selectedOption?.label }}
        </BaseText>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.vc-base-dropdown-select {
  position: relative;

  --w-open: 180px;
  --h-open: 114px;
  --timing-function: cubic-bezier(0.19, 1, 0.22, 1);

  &__wrapper {
    position: absolute;
    top: 0;
    right: 0;
    width: var(--w-closed, max-content);
    height: var(--h-closed, max-content);
    overflow: hidden;
    border: 1px solid $color-base-black-15;
    background: $color-base-white-100;
    cursor: pointer;
    border-radius: 17px;
    transition:
      width 0.3s var(--timing-function),
      height 0.3s var(--timing-function),
      border-radius 0.3s var(--timing-function),
      border-color 0.3s var(--timing-function),
      box-shadow 0.3s var(--timing-function);
    z-index: 1;
    will-change: width, height;

    &:hover {
      border-color: $color-base-black-30;
    }

    .vc-base-dropdown-select--open & {
      width: var(--w-open);
      height: var(--h-open);
      border-radius: 12px;
      box-shadow: 0 8px 24px rgb(0 0 0 / 10%);
      border-color: $color-base-black-30;
      cursor: default;
    }
  }

  &__selected-option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 12px;
    white-space: nowrap;
    visibility: visible;
    transition: visibility 0s ease-in;
    transition-delay: 0.05s;

    .vc-base-dropdown-select--open & {
      visibility: hidden;
      transition-delay: unset;
    }

    &-icon {
      font-size: 16px;
      margin-left: auto;
      flex: 0 0 auto;
      font-weight: 400;
      position: absolute;
      right: 10px;
      top: 4.5px;
      transition:
        opacity 0.15s var(--timing-function),
        transform 0.15s var(--timing-function);

      .vc-base-dropdown-select--open & {
        opacity: 0;
        transform: translateY(6px);
      }
    }
  }

  &__option-list {
    padding: 4px 8px;
    list-style: none;
    transform: translateY(-25px);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;

    .vc-base-dropdown-select--open & {
      display: block;
      animation: fade-in 0.4s var(--timing-function) forwards;
      pointer-events: auto;
    }

    .vc-base-dropdown-select:not(.vc-base-dropdown-select--was-opened) & {
      display: none;
      animation: none;
    }

    .vc-base-dropdown-select--was-opened:not(.vc-base-dropdown-select--open) & {
      display: block;
      animation: fade-out 0.1s var(--timing-function) forwards;
    }
  }

  &__option-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px;
    border-radius: 8px;
    background: $color-base-white-100;

    &:hover {
      background: $color-base-black-5;
    }

    &-label {
      font-weight: 500;

      .vc-base-dropdown-select__option-item--selected & {
        color: $color-base-black-100;
        font-weight: bold;
      }
    }

    &-selected-icon {
      margin-left: auto;
      font-size: 16px;
      font-weight: 400;
      color: $color-base-black-100;
      display: none;

      .vc-base-dropdown-select__option-item--selected & {
        display: block;
      }
    }
  }

  /* Ghost measurer: out of flow, no constraints, identical row styles */
  &__measure {
    pointer-events: none;
    opacity: 0;
    visibility: hidden;
    white-space: nowrap;
  }
}

.vc-fade-enter-active,
.vc-fade-leave-active {
  transition: opacity 0.25s var(--timing-function);
}

.vc-fade-leave-active {
  display: block !important;
}

.vc-fade-enter-from,
.vc-fade-leave-to {
  opacity: 0;
}

@keyframes fade-in {
  from {
    opacity: 0;
    visibility: hidden;
  }

  to {
    opacity: 1;
    visibility: visible;
  }
}

@keyframes fade-out {
  from {
    opacity: 1;
    visibility: visible;
  }

  to {
    opacity: 0;
    visibility: hidden;
  }
}
</style>
