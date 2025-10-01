<script setup>
import UiSwitchInput from "@/features/UiSwitchInput.vue";
import UiEmailOptionLabel from "@/features/UiEmailOptionLabel.vue";
import UiMenu from "@/features/UiMenu/UiMenu.vue";
import UiMenuButton from "@/features/UiMenu/UiMenuButton.vue";
import UiMenuSeparator from "@/features/UiMenu/UiMenuSeparator.vue";
import UiTooltip from "@/features/ui/ui-tooltip.vue";
import router from "@/routes/router";
import InlineSvg from "@/features/InlineSvg.vue";

import { computed } from "vue";

const props = defineProps({
  field: { type: String, default: "" },
  selected: { type: String, default: "" },
  options: { type: Array, default: () => [] },
  allowed: { type: Boolean, default: false },
  defaultValue: { type: String, default: "" },
  unverifiedEntries: { type: Boolean, default: false },
});

const emit = defineEmits(["select", "deselect", "sentToSettings"]);

const switchTooltipTitle = computed(() => {
  switch (props.field) {
    case "email": {
      if (props.unverifiedEntries) {
        return "Verify your email address to enable forwarding";
      } else {
        return "Add an email address to enable forwarding";
      }
    }
    case "call": {
      if (props.unverifiedEntries) {
        return "Verify your phone number to enable forwarding";
      } else {
        return "Add a phone number to enable forwarding";
      }
    }

    case "message": {
      if (props.unverifiedEntries) {
        return "Verify your phone number to enable forwarding";
      } else {
        return "Add a phone number to enable forwarding";
      }
    }
    default: {
      return "";
    }
  }
});
const switchIsDisabled = computed(() => {
  return !props.selected && !props.defaultValue;
});
const headerText = computed(() => {
  switch (props.field) {
    case "email": {
      return "Forward incoming emails to";
    }
    case "call": {
      return "Forward incoming calls to";
    }
    case "message": {
      return "Forward incoming texts to";
    }

    default: {
      return "";
    }
  }
});
const selectedText = computed(() => {
  return props.selected || props.defaultValue || addFieldText.value;
});
const addFieldText = computed(() => {
  switch (props.field) {
    case "email": {
      if (props.options.length) {
        return "Select a forwarding email";
      }
      return "Add a forwarding email";
    }
    case "call": {
      if (props.options.length) {
        return "Select a forwarding number";
      }
      return "Add a forwarding number";
    }
    case "message": {
      if (props.options.length) {
        return "Select a forwarding number";
      }
      return "Add a forwarding number";
    }
    default: {
      return "";
    }
  }
});
const addButtonText = computed(() => {
  switch (props.field) {
    case "email": {
      return "Add a new forwarding email";
    }
    case "call": {
      return "Add a new forwarding number";
    }
    case "message": {
      return "Add a new forwarding number";
    }
    default: {
      return "";
    }
  }
});

function handleSelect(selection) {
  emit("select", selection);
}
function addNewField() {
  emit("sentToSettings");
  router.push({ name: "settings.forwarding" });
}
function toggleForward($event) {
  $event.preventDefault();
  if (switchIsDisabled.value) {
    return addNewField();
  }

  if (props.allowed) {
    if (props.selected) {
      return emit("deselect");
    } else if (props.defaultValue) {
      return handleSelect(props.defaultValue);
    }
  }
}
</script>

<template>
  <section :id="`fwd-toggle-${props.field}`">
    <div class="fwd-toggle-wrapper">
      <UiMenu
        width="250px"
        placement="bottom-start"
      >
        <div class="fwd-toggle-wrapper__label">
          <div class="fwd-toggle-wrapper__label-title">
            {{ headerText }}
          </div>

          <div
            class="fwd-toggle-wrapper__label-selection"
            :class="{
              'fwd-toggle-wrapper__label-selection--selected': props.selected,
            }"
          >
            <span class="selected-ellipsis">{{ selectedText }}</span>

            <InlineSvg name="chevron-down" />
          </div>
        </div>

        <template #content>
          <UiMenuButton
            v-for="option in props.options"
            :key="option"
            :title="option"
            :active="option === props.selected"
            @click="() => handleSelect(option)"
          >
            <template #icon>
              <InlineSvg
                v-if="option === props.selected"
                name="check"
              />
              <span v-else />
            </template>

            <template
              v-if="props.field === 'email'"
              #title
            >
              <UiEmailOptionLabel :email="option" />
            </template>
          </UiMenuButton>

          <UiMenuSeparator />

          <UiMenuButton
            :title="addButtonText"
            @click="addNewField"
          >
            <template #icon>
              <InlineSvg name="plus" />
            </template>
          </UiMenuButton>
        </template>
      </UiMenu>

      <div @click="toggleForward">
        <UiTooltip
          :aria-id="`ToggleSwitch.${props.field || ''}`"
          :title="switchTooltipTitle"
          :can-show="switchIsDisabled"
          align-x="right"
        >
          <UiSwitchInput
            :value="!!props.selected"
            :disabled="switchIsDisabled"
          />
        </UiTooltip>
      </div>
    </div>
  </section>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.fwd-toggle-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  padding: 10px 0;
  gap: 8px;

  &__label {
    font-weight: 400;
    font-size: 12px;
    line-height: 18px;

    &:hover {
      cursor: pointer;
    }
  }

  &__label-title {
    color: $color-primary-100;
    cursor: default;
  }

  &__label-selection {
    font-weight: 500;
    color: $color-primary-100;
    display: flex;
    align-items: center;
    gap: 2px;

    .selected-ellipsis {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 230px;
      display: inline-block;
    }

    svg {
      flex-shrink: 0;
    }

    &--selected {
      text-decoration-line: underline;
    }

    &--disabled {
      color: $color-primary-50;
      cursor: not-allowed;
    }
  }

  .ui-menu {
    flex: 1 1 0;
  }
}

.flyout-row {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding: 15.5px 0;
  cursor: pointer;
}

.pre-space {
  width: 44px;
  display: flex;
  justify-content: center;
  align-items: center;

  svg {
    fill: $color-accent;
    width: 20px;
  }
}
</style>
