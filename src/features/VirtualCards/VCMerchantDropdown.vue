<script setup lang="ts">
import { ref, reactive, computed, nextTick, watch } from "vue";
import { debounce } from "lodash-es";
import WebService from "@/api/actions/web-service";
import IdentityIcon from "@/features/ui/IdentityIcon.vue";
import EnterIcon from "@/assets/icons/enter.svg";
import { url } from "@/scripts/validation";
import { standardizeUrl } from "@/scripts/format";
import type { Website } from "@/types/website";
import BaseIcon from "@/library/BaseIcon.vue";

export type MerchantDropdownOption = Pick<Website, "name" | "logo_url"> & {
  base_domain?: string;
  cloak_brand_color?: string;
};
export type MerchantDropdownModel = string | MerchantDropdownOption;

type Props = {
  showEditAction?: boolean;
  disabled?: boolean;
  cloakBrandColor?: string;
};

const emit = defineEmits(["edited"]);

const props = withDefaults(defineProps<Props>(), {
  showEditAction: false,
  disabled: false,
  cloakBrandColor: undefined,
});

const model = defineModel<MerchantDropdownModel>({ required: true });

const isOptionsVisible = ref(false);
const inputValue = ref<string>("");
const selectedMerchant = ref<MerchantDropdownOption | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const optionsListRef = ref<HTMLUListElement | null>(null);

const optionsState = reactive<{
  results: Website[];
  searching: boolean;
  active: number | null;
}>({
  results: [],
  searching: false,
  active: null,
});

const isKeyboardNavigation = ref(false);
const isEditing = ref(props.showEditAction ? false : true);
const tempEditingModel = ref<MerchantDropdownModel | null>(null);
const debouncedSearchWebsites = debounce(searchWebsites, 200);

const totalOptions = computed(() => {
  return optionsState.results.length + (inputValue.value ? 1 : 0);
});

function startEditing() {
  isEditing.value = true;
  tempEditingModel.value = model.value;
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus();
    }
  });
}

function stopEditing() {
  if (!props.showEditAction || !isEditing.value) {
    return;
  }

  isEditing.value = false;
  tempEditingModel.value = null;
  emit("edited", model.value);
}

function rollbackEdition() {
  if (!props.showEditAction || !isEditing.value) {
    return;
  }

  model.value = tempEditingModel.value || "";
  tempEditingModel.value = null;
  isEditing.value = false;
}

function selectMerchant(merchant: Website) {
  inputValue.value = merchant.name;
  isOptionsVisible.value = false;
  selectedMerchant.value = merchant;
  model.value = merchant;
  optionsState.active = null;

  stopEditing();
}

function handleCustomOption() {
  if (!inputValue.value) {
    model.value = "";
    stopEditing();
    return;
  }

  selectedMerchant.value = null;
  isOptionsVisible.value = false;
  optionsState.active = null;

  // Check if the input is a URL and if so, convert it to a name and base_domain
  let newModelValue: MerchantDropdownOption | string = inputValue.value.trim();
  if (url(inputValue.value)) {
    const url = new URL(standardizeUrl(inputValue.value));
    newModelValue = {
      base_domain: url.toString(),
      name: url.hostname.trim(),
      logo_url: null,
    };
  }

  model.value = newModelValue;
  stopEditing();
}

function handleInputEvent() {
  selectedMerchant.value = null;
  model.value = inputValue.value;

  if (!inputValue.value) {
    isOptionsVisible.value = false;
    optionsState.active = null;
    return;
  }

  isOptionsVisible.value = true;
  optionsState.active = null;
  debouncedSearchWebsites();
}

async function handleBlur() {
  isOptionsVisible.value = false;
  optionsState.active = null;

  setTimeout(
    () => {
      if (!selectedMerchant.value) {
        handleCustomOption();
      } else {
        stopEditing();
      }
    },
    props.showEditAction ? 150 : 0
  ); // Waiting for rollbackEdition to be called and prevent the blur event from being called again
}

function handleEnter() {
  if (optionsState.active === null) {
    isOptionsVisible.value = false;

    if (props.showEditAction) {
      handleCustomOption();
    }

    return;
  }

  if (optionsState.active === 0) {
    // Custom option selected (index 0)
    handleCustomOption();
  } else {
    const selectedOption = optionsState.results[optionsState.active - 1];
    selectMerchant(selectedOption);
  }
}

function handleEscape(event: KeyboardEvent) {
  event.preventDefault();
  event.stopPropagation();

  if (isOptionsVisible.value) {
    isOptionsVisible.value = false;
    optionsState.active = null;
    inputRef.value?.focus();
  }
}

function nav(direction: number) {
  if (!isOptionsVisible.value || totalOptions.value === 0) {
    return;
  }

  let newActive = optionsState.active;

  if (newActive === null) {
    newActive = 0;
  } else {
    newActive += direction;

    if (newActive < 0) {
      newActive = totalOptions.value - 1;
    } else if (newActive >= totalOptions.value) {
      newActive = 0;
    }
  }

  isKeyboardNavigation.value = true;
  optionsState.active = newActive;
}

function setActive(index: number) {
  isKeyboardNavigation.value = false;
  optionsState.active = index;
}

function scrollToActiveItem() {
  if (optionsState.active === null || !optionsListRef.value) {
    return;
  }

  nextTick(() => {
    const activeElement = optionsListRef.value?.querySelector(
      ".vc-merchant-dropdown__options-item--active"
    );
    if (activeElement) {
      activeElement.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  });
}

async function searchWebsites() {
  const query = inputValue.value;

  optionsState.results = [];
  if (optionsState.searching || !query) {
    return;
  }

  optionsState.searching = true;
  optionsState.active = null;

  let strippedQuery;

  try {
    strippedQuery = new URL(query).host;
    strippedQuery = strippedQuery.replace("www.", "");
  } catch {
    strippedQuery = query.toLowerCase();
  }

  return WebService.searchWebsites(strippedQuery)
    .then(({ data }) => {
      if (data && data.results) {
        optionsState.results = data.results.map((website: Website) => ({
          ...website,
          name: website.name.trim(),
          logo_url: getImageFor(website),
        }));
      } else {
        optionsState.results = [];
      }

      if (!optionsState.results.length) {
        return;
      }

      const exactMatch = optionsState.results.findIndex(
        (item) => item.base_domain === strippedQuery
      );

      if (exactMatch >= 0) {
        const items = [...optionsState.results];
        const item = items[exactMatch];

        items.splice(exactMatch, 1);
        optionsState.results = [item, ...items];
        optionsState.active = 0;
      }
    })
    .catch(() => {
      optionsState.results = [];
    })
    .finally(() => {
      optionsState.searching = false;
    });
}

function getImageFor(website: Website) {
  return (
    website.logo_url ||
    website.icon_image_url ||
    website.logo_image_url ||
    website.logo_svg_url ||
    website.icon_svg_url
  );
}

// Watch for active state changes to handle scrolling
watch(
  () => optionsState.active,
  () => {
    if (isKeyboardNavigation.value) {
      scrollToActiveItem();
    }
  }
);

watch(
  model,
  (value) => {
    if (typeof value === "object") {
      inputValue.value = value.name ?? "";
      selectedMerchant.value = value;
    } else {
      inputValue.value = value;
    }
  },
  { immediate: true }
);
</script>

<template>
  <div
    class="vc-merchant-dropdown"
    :class="{ 'vc-merchant-dropdown--editing': isEditing }"
  >
    <div class="vc-merchant-dropdown__input-container">
      <IdentityIcon
        :identity="
          selectedMerchant
            ? selectedMerchant
            : { name: inputValue, cloak_brand_color: props.cloakBrandColor }
        "
        :override="{ height: '36px', width: '36px', 'margin-right': '10px' }"
      />
      <input
        ref="inputRef"
        v-model="inputValue"
        type="text"
        placeholder="Add name or URL"
        class="vc-merchant-dropdown__input-el"
        autocomplete="off"
        maxlength="50"
        data-lpignore="true"
        role="combobox"
        :disabled="!isEditing || props.disabled"
        :aria-expanded="isOptionsVisible && isEditing"
        :aria-activedescendant="
          optionsState.active !== null
            ? `merchant-option-${optionsState.active}`
            : undefined
        "
        aria-autocomplete="list"
        aria-label="Select merchant dropdown"
        @blur="handleBlur"
        @input="handleInputEvent"
        @keydown.enter="handleEnter"
        @keydown.escape.prevent.stop="handleEscape"
        @keydown.up.prevent="nav(-1)"
        @keydown.down.prevent="nav(1)"
      />
      <div
        v-if="props.showEditAction"
        class="vc-merchant-dropdown__edit-action"
      >
        <BaseIcon
          :name="isEditing ? 'close' : 'edit'"
          class="vc-merchant-dropdown__edit-action-icon"
          :aria-label="isEditing ? 'Edit nickname' : 'Cancel editing'"
          tabindex="0"
          @keydown.enter="isEditing ? rollbackEdition() : startEditing()"
          @keydown.space="isEditing ? rollbackEdition() : startEditing()"
          @click.prevent.stop="isEditing ? rollbackEdition() : startEditing()"
        />
      </div>
    </div>
    <div
      class="vc-merchant-dropdown__options"
      :class="{
        'vc-merchant-dropdown__options--active': isOptionsVisible && isEditing,
      }"
      role="listbox"
      aria-label="Merchant options"
    >
      <ul
        ref="optionsListRef"
        class="vc-merchant-dropdown__options-list"
      >
        <li
          :id="`merchant-option-0`"
          class="vc-merchant-dropdown__options-item"
          :class="{
            'vc-merchant-dropdown__options-item--active':
              optionsState.active === 0,
          }"
          role="option"
          :aria-selected="optionsState.active === 0"
          @click="handleCustomOption"
          @mouseenter="setActive(0)"
        >
          <div class="vc-merchant-dropdown__options-item-wrapper">
            <div class="vc-merchant-dropdown__options-item-infos">
              <p class="vc-merchant-dropdown__options-item-title">
                Use "{{ inputValue.trim() }}"
              </p>
            </div>
            <EnterIcon class="vc-merchant-dropdown__options-item-enter-icon" />
          </div>
        </li>

        <!-- Searching placeholders-->
        <template v-if="optionsState.searching">
          <li
            v-for="i in 3"
            :key="i"
            class="vc-merchant-dropdown__options-item"
          >
            <div
              class="vc-merchant-dropdown__options-item-wrapper vc-merchant-dropdown__options-item-wrapper--placeholder"
            ></div>
          </li>
        </template>

        <!-- Options -->
        <template v-else>
          <li
            v-for="(merchant, index) in optionsState.results"
            :id="`merchant-option-${index + 1}`"
            :key="index"
            class="vc-merchant-dropdown__options-item"
            :class="{
              'vc-merchant-dropdown__options-item--active':
                optionsState.active === index + 1,
            }"
            role="option"
            :aria-selected="optionsState.active === index + 1"
            @click="selectMerchant(merchant)"
            @mouseenter="setActive(index + 1)"
          >
            <div class="vc-merchant-dropdown__options-item-wrapper">
              <div class="vc-merchant-dropdown__options-item-infos">
                <IdentityIcon
                  :identity="merchant"
                  :override="{
                    height: '28px',
                    width: '28px',
                    'margin-right': '10px',
                  }"
                />
                <p class="vc-merchant-dropdown__options-item-infos-title">
                  {{ merchant.name }}
                </p>
              </div>
              <EnterIcon
                class="vc-merchant-dropdown__options-item-enter-icon"
              />
            </div>
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
.vc-merchant-dropdown {
  width: 100%;
  position: relative;
  background-color: $color-base-white-100;
  border-radius: 30px;
  outline: 1px solid $color-base-black-10;
  padding-inline: 17px;

  &--editing {
    background-color: $color-primary-5;
  }

  &--editing:focus-within {
    outline-color: $color-primary-100;
  }

  &__input {
    &-container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    &-el {
      padding: 22px 0;
      width: 100%;
      height: 100%;
      background-color: transparent;
      color: var(--color-primary-100);
      border: none;
      outline: none;
      font-size: 20px;
      font-style: normal;
      font-weight: 600;
      line-height: normal;

      &::placeholder {
        color: var(--color-primary-30);
        font-size: 20px;
      }
    }
  }

  &__edit-action {
    margin-top: 6px;
    margin-right: 6px;

    &-icon {
      cursor: pointer;
      font-size: 19px;
      font-weight: 400;
      transition: opacity 0.12s ease-in;

      &:hover {
        opacity: 0.8;
      }
    }
  }

  &__options {
    border-radius: 24px;
    border: 1px solid var(--color-primary-20);
    padding: 12px;
    position: absolute;
    top: calc(100% + 10px);
    z-index: 6;
    left: 0;
    width: 100%;
    background-color: var(--color-primary-5);
    box-shadow: 0 5px 10px 1px rgb(0 0 0 / 10%);
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 0.3s ease-in-out,
      visibility 0.3s ease-in-out;

    &--active {
      opacity: 1;
      visibility: visible;
    }

    &-list {
      display: flex;
      flex-direction: column;
      list-style: none;
      max-height: 240px;
      overflow: hidden auto;
    }

    &-item {
      padding-block: 2px;

      &-wrapper {
        width: 100%;
        display: flex;
        align-items: center;
        padding: 10px;
        border-radius: 16px;
        min-height: 50px;
        cursor: pointer;

        &--placeholder {
          margin-top: 5px;
          background-color: var(--color-primary-10);
        }
      }

      &--active {
        .vc-merchant-dropdown__options-item-wrapper {
          background-color: var(--color-primary-10);
        }
      }

      &-infos {
        width: 90%;
        display: flex;
        align-items: center;
        flex-grow: 1;

        &-title {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      &-enter-icon {
        justify-self: flex-end;
        opacity: 0;
        width: 20px;
        min-width: 20px;
        color: $color-primary-50;
      }

      &:not(:last-child) {
        border-bottom: 1px solid var(--color-primary-10);
      }

      &--active &-enter-icon {
        opacity: 1;
      }
    }
  }
}
</style>
