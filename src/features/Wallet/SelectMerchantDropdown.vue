<script setup lang="ts">
import { ref, reactive, computed, nextTick, watch } from "vue";
import { debounce } from "lodash-es";
import WebService from "@/api/actions/web-service";
import IdentityIcon from "@/features/ui/IdentityIcon.vue";
import EnterIcon from "@/assets/icons/enter.svg";
import { url } from "@/scripts/validation";
import { standardizeUrl } from "@/scripts/format";

const model = defineModel<
  any | { website_url: string; nickname?: string; title?: string }
>();

const isOptionsVisible = ref(false);
const inputValue = ref<string>("");
const selectedMerchant = ref<any>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const optionsListRef = ref<HTMLUListElement | null>(null);

const optionsState = reactive<{
  results: any[];
  searching: boolean;
  active: number | null;
}>({
  results: [],
  searching: false,
  active: null,
});

const isKeyboardNavigation = ref(false);
const debouncedSearchWebsites = debounce(searchWebsites, 200);

const totalOptions = computed(() => {
  return optionsState.results.length + (inputValue.value ? 1 : 0);
});

function selectMerchant(merchant: any) {
  inputValue.value = merchant.title || merchant.nickname;
  isOptionsVisible.value = false;
  selectedMerchant.value = merchant;
  model.value = merchant;
  optionsState.active = null;
}

function handleCustomOption() {
  if (!inputValue.value) {
    model.value = "";
    return;
  }

  selectedMerchant.value = null;
  isOptionsVisible.value = false;
  optionsState.active = null;

  // Check if the input is a URL and if so, convert it to a nickname and website_url
  let newModelValue: { website_url: string; nickname: string } | string =
    inputValue.value.trim();
  if (url(inputValue.value)) {
    const url = new URL(standardizeUrl(inputValue.value));
    newModelValue = {
      website_url: url.toString(),
      nickname: url.hostname,
    };
  }

  model.value = newModelValue;
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

function handleBlur() {
  isOptionsVisible.value = false;
  optionsState.active = null;

  if (!selectedMerchant.value) {
    handleCustomOption();
  }
}

function handleEnter() {
  if (optionsState.active === null) {
    isOptionsVisible.value = false;
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
      ".select-merchant-dropdown__options-item--active"
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
        optionsState.results = data.results.map((website: any) => ({
          ...website,
          logo_url: getImageFor(website),
          nickname: website.name,
          website_url: website.base_domain,
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

function getImageFor(website: any) {
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
</script>

<template>
  <div class="select-merchant-dropdown">
    <div class="select-merchant-dropdown__input-container">
      <IdentityIcon
        :identity="selectedMerchant"
        :override="{ height: '36px', width: '36px', 'margin-right': '10px' }"
      />
      <input
        ref="inputRef"
        v-model="inputValue"
        type="text"
        placeholder="Add name or URL"
        class="select-merchant-dropdown__input-el"
        autocomplete="off"
        maxlength="50"
        data-lpignore="true"
        role="combobox"
        :aria-expanded="isOptionsVisible"
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
    </div>
    <div
      class="select-merchant-dropdown__options"
      :class="{ 'select-merchant-dropdown__options--active': isOptionsVisible }"
      role="listbox"
      aria-label="Merchant options"
    >
      <ul
        ref="optionsListRef"
        class="select-merchant-dropdown__options-list"
      >
        <li
          :id="`merchant-option-0`"
          class="select-merchant-dropdown__options-item"
          :class="{
            'select-merchant-dropdown__options-item--active':
              optionsState.active === 0,
          }"
          role="option"
          :aria-selected="optionsState.active === 0"
          @click="handleCustomOption"
          @mouseenter="setActive(0)"
        >
          <div class="select-merchant-dropdown__options-item-wrapper">
            <div class="select-merchant-dropdown__options-item-infos">
              <p class="select-merchant-dropdown__options-item-title">
                Use "{{ inputValue.trim() }}"
              </p>
            </div>
            <EnterIcon
              class="select-merchant-dropdown__options-item-enter-icon"
            />
          </div>
        </li>

        <!-- Searching placeholders-->
        <template v-if="optionsState.searching">
          <li
            v-for="i in 3"
            :key="i"
            class="select-merchant-dropdown__options-item"
          >
            <div
              class="select-merchant-dropdown__options-item-wrapper select-merchant-dropdown__options-item-wrapper--placeholder"
            ></div>
          </li>
        </template>

        <!-- Options -->
        <template v-else>
          <li
            v-for="(merchant, index) in optionsState.results"
            :id="`merchant-option-${index + 1}`"
            :key="index"
            class="select-merchant-dropdown__options-item"
            :class="{
              'select-merchant-dropdown__options-item--active':
                optionsState.active === index + 1,
            }"
            role="option"
            :aria-selected="optionsState.active === index + 1"
            @click="selectMerchant(merchant)"
            @mouseenter="setActive(index + 1)"
          >
            <div class="select-merchant-dropdown__options-item-wrapper">
              <div class="select-merchant-dropdown__options-item-infos">
                <IdentityIcon
                  :identity="merchant"
                  :override="{
                    height: '28px',
                    width: '28px',
                    'margin-right': '10px',
                  }"
                />
                <p class="select-merchant-dropdown__options-item-infos-title">
                  {{ merchant.title || merchant.nickname }}
                </p>
              </div>
              <EnterIcon
                class="select-merchant-dropdown__options-item-enter-icon"
              />
            </div>
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
$component-name: "select-merchant-dropdown";

.#{$component-name} {
  width: 100%;
  position: relative;
  background-color: var(--color-primary-5);
  border-radius: 24px;
  padding-inline: 20px;

  &__input {
    &-container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &-el {
      padding: 20px 0;
      width: 100%;
      height: 100%;
      background-color: transparent;
      color: var(--color-primary-100);
      font-size: 20px;
      border: none;
      outline: none;
      font-size: 1.5rem;
      font-style: normal;
      font-weight: 600;
      line-height: normal;
    }
  }

  &__options {
    border-radius: 24px;
    border: 1px solid var(--color-primary-20);
    padding: 12px;
    position: absolute;
    top: calc(100% + 10px);
    z-index: 1;
    left: 0;
    width: 100%;
    background-color: var(--color-primary-5);
    box-shadow: 0 5px 10px 1px rgba(0, 0, 0, 0.1);
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
      overflow-y: auto;
      overflow-x: hidden;
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
        .#{$component-name}__options-item-wrapper {
          background-color: var(--color-primary-10);
          transition: background-color 0.2s ease;
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

      &:not(:last-child) {
        border-bottom: 1px solid var(--color-primary-10);
      }

      &--active &-enter-icon {
        opacity: 1;
      }

      &-enter-icon {
        justify-self: flex-end;
        opacity: 0;
        width: 20px;
        min-width: 20px;
        color: $color-primary-50;
      }
    }
  }
}
</style>
