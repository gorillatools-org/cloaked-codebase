<script setup>
import { computed, ref, watch } from "vue";
import CustomFieldIcon from "@/features/cloakDetails/CustomFields/CustomFieldIcon.vue";
import {
  getCopyValue,
  getStringValue,
} from "@/features/cloakDetails/CustomFields/utils";
import SecretValue from "@/features/ui/SecretValue.vue";
import SecretToggle from "@/features/ui/SecretToggle.vue";
import UiMenu from "@/features/UiMenu/UiMenu.vue";
import UiMenuButton from "@/features/UiMenu/UiMenuButton.vue";
import UiMenuSeparator from "@/features/UiMenu/UiMenuSeparator.vue";
import CloakInfoRowButton from "@/features/cloakDetails/CloakInfoRowButton.vue";
import UiTooltip from "@/features/ui/ui-tooltip.vue";
import IdentityService from "@/api/actions/identity-service";
import { posthogCapture } from "@/scripts/posthog.js";
import InlineSvg from "@/features/InlineSvg.vue";
import { tools } from "@/scripts/tools";
const props = defineProps({
  type: {
    type: String,
    validator: (value) =>
      [
        "text",
        "address",
        "url",
        "date",
        "bank",
        "auth",
        "identification",
      ].includes(value),
    default: null,
  },
  label: {
    type: String,
    default: null,
  },
  value: {
    type: [String, Object],
    default: null,
  },
  isSecret: {
    type: Boolean,
  },
  maxLines: {
    type: Number,
    default: 12,
  },
  identityId: {
    type: Number,
    default: null,
  },
});

defineEmits(["edit", "delete"]);

const isHidden = ref(props.isSecret);
const tooltip = ref("Click to copy");
const isMenuOpen = ref(false);

const valueStyle = computed(() => ({
  "-webkit-line-clamp": props.maxLines,
}));

watch(
  () => props.isSecret,
  (value) => {
    isHidden.value = value;
  },
  { deep: true }
);

const stringValue = computed(() => getStringValue(props.type, props.value));
const copyValue = computed(() => getCopyValue(props.type, props.value));

const copy = () => {
  tools.copyToClipboard(copyValue.value);
  tooltip.value = "Copied";
  posthogCapture("user_copied_identifier", {
    identifier: props.type,
  });
  IdentityService.patchIdentityUpdatedAt(props.identityId);
};

const resetTooltip = () => {
  setTimeout(() => {
    tooltip.value = "Click to copy";
  }, 300);
};
</script>

<template>
  <div
    class="custom-field"
    :class="{ 'custom-field--menu-open': isMenuOpen }"
  >
    <UiTooltip
      class="custom-field__content"
      :title="tooltip"
      align-x="center"
      @click="copy"
      @mouseleave="resetTooltip"
    >
      <div class="custom-field__icon">
        <CustomFieldIcon :type="type" />
      </div>
      <div>
        <div
          v-if="label"
          class="custom-field__label"
        >
          {{ label }}
        </div>
        <div
          v-if="value"
          class="custom-field__value"
          :style="valueStyle"
        >
          <SecretValue
            v-if="isSecret"
            :is-hidden="isHidden"
            variant="body-small-medium"
          >
            <a
              v-if="type === 'url'"
              :href="value"
              target="_blank"
              rel="noreferrer"
              class="custom-field__link"
            >
              {{ stringValue }}
            </a>
            <template v-else>
              {{ stringValue }}
            </template>
          </SecretValue>
          <a
            v-else-if="type === 'url'"
            :href="value"
            target="_blank"
            rel="noreferrer"
            class="custom-field__link"
          >
            {{ stringValue }}
          </a>
          <template v-else>
            {{ stringValue }}
          </template>
        </div>
      </div>
    </UiTooltip>
    <div class="custom-field__actions">
      <CloakInfoRowButton
        v-if="isSecret"
        icon
        @click.stop="isHidden = !isHidden"
      >
        <SecretToggle :value="isHidden" />
      </CloakInfoRowButton>
      <UiMenu
        width="188px"
        placement="bottom-end"
        :value="isMenuOpen"
        @input="(event) => (isMenuOpen = event)"
      >
        <CloakInfoRowButton
          icon
          class="custom-field__menu"
          :active="isMenuOpen"
        >
          <InlineSvg name="kabob" />
        </CloakInfoRowButton>
        <template #content>
          <UiMenuButton
            title="Edit"
            @click="$emit('edit')"
          >
            <template #icon>
              <InlineSvg name="edit-pencil" />
            </template>
          </UiMenuButton>
          <UiMenuButton
            title="Copy"
            @click="copy"
          >
            <template #icon>
              <InlineSvg name="copy" />
            </template>
          </UiMenuButton>
          <UiMenuSeparator />
          <UiMenuButton
            title="Delete"
            @click="$emit('delete')"
          >
            <template #icon>
              <InlineSvg
                name="delete-trash"
                height="15px"
                width="15px"
              />
            </template>
          </UiMenuButton>
        </template>
      </UiMenu>
    </div>
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.custom-field {
  display: flex;
  align-items: center;
  position: relative;

  &__content {
    display: flex;
    align-items: center;
    cursor: pointer;
    flex-grow: 1;
  }

  &__icon {
    flex-shrink: 0;
    margin-right: 10px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__label {
    font-weight: 400;
    font-size: 12px;
    line-height: 18px;
    color: $color-primary-50;
    word-break: break-word;
  }

  &__value {
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
    color: $color-primary-100;
    white-space: pre-wrap;
    overflow: hidden;
    display: -webkit-box;
    word-break: break-word;
    -webkit-box-orient: vertical;
  }

  &__link {
    text-decoration: underline;

    &:hover {
      opacity: 0.8;
    }
  }

  &__actions {
    margin-left: auto;
    padding-left: 60px;
    display: none;
    position: absolute;
    z-index: 1;
    right: 0;
    top: 50%;
    height: 100%;
    transform: translateY(-50%);
    background: linear-gradient(
      to left,
      $color-base-white-100 40%,
      transparent
    );
    pointer-events: none;

    @at-root .custom-field:hover &,
      .custom-field--menu-open & {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    & > * {
      pointer-events: initial;
    }
  }

  & &__menu {
    color: $color-primary-100;
  }
}
</style>
