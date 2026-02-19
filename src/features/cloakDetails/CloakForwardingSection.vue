<script setup>
import CloakForwardToggleRow from "@/features/cloakDetails/CloakForwardToggleRow.vue";
import UiMenu from "@/features/UiMenu/UiMenu.vue";
import UiMenuButton from "@/features/UiMenu/UiMenuButton.vue";
import UiEmailOptionLabel from "@/features/UiEmailOptionLabel.vue";
import InlineSvg from "@/features/InlineSvg.vue";

import { computed } from "vue";

const COMM_FILTERS_MAP = {
  email: {
    block: "Block all emails",
    manual_screen: false,
    allow_all: "Unrestricted",
  },
  message: {
    block: "Block new senders",
    manual_screen: "Request approval",
    allow_all: "Unrestricted (not recommended)",
  },
  call: {
    block: "Block new callers",
    manual_screen: "Request approval",
    allow_all: "Unrestricted (not recommended)",
  },
};
const SECTION_TITLE = {
  email: "New emails",
  message: "New texts",
  call: "New calls",
};

const props = defineProps({
  field: {
    type: String,
    default: "",
  },
  selected: {
    type: String,
    default: "",
  },
  options: {
    type: Array,
    default: () => [],
  },
  allowed: {
    type: Boolean,
    default: false,
  },
  defaultValue: {
    type: String,
    default: "",
  },
  title: {
    type: String,
    default: "",
  },
  rules: {
    type: Object,
    default: () => ({}),
  },
  unverifiedEntries: {
    type: Boolean,
  },
  locked: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "select",
  "deselect",
  "sentToSettings",
  "updateFilterRule",
]);

function getFilterDisplay(filterKey) {
  return COMM_FILTERS_MAP[props.field][filterKey];
}
function handleSelectSetting(filterKey) {
  emit("updateFilterRule", filterKey);
}

const sectionTitle = computed(() => {
  return SECTION_TITLE[props.field];
});
const commFilters = computed(() => {
  if (props.field === "message" || props.field === "call") {
    return Object.keys(COMM_FILTERS_MAP[props.field]).filter((key) => {
      /* If the selected setting is already block, show block, if not, do not add it to the list of available */
      if (selectedFilterRuleKey.value === "block") {
        return key;
      }
      return key !== "block";
    });
  }

  return Object.keys(COMM_FILTERS_MAP[props.field]).filter(
    (key) => COMM_FILTERS_MAP[props.field][key]
  );
});
const selectedFilterRuleDisplay = computed(() => {
  if (props.rules) {
    return COMM_FILTERS_MAP[props.field][props.rules.filter_rule];
  } else if (props.field === "email") {
    return;
  }
  return "";
});
const selectedFilterRuleKey = computed(() => {
  if (props.rules) {
    return props.rules.filter_rule;
  }
  return "";
});
</script>

<template>
  <section class="fwd-section-wrapper">
    <h2>{{ props.title }}</h2>

    <CloakForwardToggleRow
      :aria-id="`CloakForwardToggleRow.${props.field || ''}`"
      :field="props.field"
      :selected="props.selected"
      :options="props.options"
      :allowed="props.allowed"
      :default-value="props.defaultValue"
      :unverified-entries="props.unverifiedEntries"
      @select="(selection) => $emit('select', selection)"
      @deselect="$emit('deselect')"
      @sent-to-settings="$emit('sentToSettings')"
    />
    <div
      v-if="props.locked"
      class="fwd-toggle-wrapper__label"
    >
      <div class="fwd-toggle-wrapper__label-title">
        {{ sectionTitle }}
      </div>

      <div
        class="fwd-toggle-wrapper__label-selection"
        :class="{
          'fwd-toggle-wrapper__label-selection--selected': props.selected,
          'fwd-toggle-wrapper__label-selection--disabled': props.locked,
        }"
      >
        <span>{{ selectedFilterRuleDisplay }}</span>
      </div>
    </div>
    <UiMenu
      v-else
      width="263px"
      placement="bottom-start"
    >
      <div class="fwd-toggle-wrapper__label">
        <div class="fwd-toggle-wrapper__label-title">
          {{ sectionTitle }}
        </div>

        <div
          class="fwd-toggle-wrapper__label-selection"
          :class="{
            'fwd-toggle-wrapper__label-selection--selected': props.selected,
          }"
        >
          <span>{{ selectedFilterRuleDisplay }}</span>

          <InlineSvg name="chevron-down" />
        </div>
      </div>

      <template #content>
        <UiMenuButton
          v-for="filterKey in commFilters"
          :key="filterKey"
          :title="getFilterDisplay(filterKey)"
          :active="filterKey === selectedFilterRuleKey"
          @click="() => handleSelectSetting(filterKey)"
        >
          <template #icon>
            <InlineSvg
              v-if="filterKey === selectedFilterRuleKey"
              name="check"
            />
            <span v-else />
          </template>

          <template
            v-if="props.field === 'email'"
            #[`props.title`]
          >
            <UiEmailOptionLabel :email="getFilterDisplay(filterKey)" />
          </template>
          <template
            v-else
            #[`props.title`]
          >
            <div>{{ getFilterDisplay(filterKey) }}</div>
          </template>
        </UiMenuButton>
      </template>
    </UiMenu>
  </section>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.fwd-section-wrapper {
  border: 1px solid $color-primary-5;
  border-radius: 15px;
  padding: 20px;
  margin-top: 12px;

  > h2 {
    color: $color-primary-100;
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 18px;
  }

  .comm-notice {
    background-color: $color-base-white-10;
    border-radius: 11px;
    display: flex;
    align-items: center;
    padding: 8px 12px;
    margin-top: 12px;

    > h3 {
      line-height: 18px;
      color: $color-primary-100;
      font-style: normal;
      font-weight: 500;
      font-size: 12px;
    }
  }
}
</style>
