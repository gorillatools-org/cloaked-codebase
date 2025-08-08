<script setup>
import UiMenuButton from "@/features/UiMenu/UiMenuButton.vue";
import UiMenu from "@/features/UiMenu/UiMenu.vue";
import { computed } from "vue";
import CustomFieldIcon from "@/features/cloakDetails/CustomFields/CustomFieldIcon.vue";
import ButtonAdd from "@/features/ButtonAdd.vue";

defineEmits(["add"]);

const options = computed(() => [
  { type: "text", label: "Custom text" },
  { type: "address", label: "Address" },
  { type: "auth", label: "Authentication key" },
  { type: "bank", label: "Banking information" },
  { type: "date", label: "Date" },
  { type: "identification", label: "Identification number" },
  { type: "url", label: "Secondary URL" },
]);
</script>

<template>
  <UiMenu
    width="220px"
    placement="bottom-start"
  >
    <ButtonAdd label="Add new information" />
    <template #content>
      <UiMenuButton
        v-for="(option, index) in options"
        :key="index"
        class="custom-field-add__option"
        @click="$emit('add', option.type)"
      >
        <div class="custom-field-add__icon">
          <CustomFieldIcon :type="option.type" />
        </div>
        {{ option.label }}
      </UiMenuButton>
    </template>
  </UiMenu>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.custom-field-add {
  &__option {
    color: $color-primary-100;
    font-size: 13px;
    font-weight: 400;

    &:hover {
      opacity: 0.8;
    }
  }

  &__icon {
    flex-shrink: 0;
    margin-right: 8px;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;

    .custom-field-icon {
      // fix color override
      color: $color-primary-50;
    }
  }
}
</style>
