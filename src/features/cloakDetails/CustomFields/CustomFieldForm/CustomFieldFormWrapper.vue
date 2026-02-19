<script setup>
import Button from "@/features/Button.vue";
import { computed, useAttrs } from "vue";
import { isEmpty } from "@/features/cloakDetails/CustomFields/CustomFieldForm/validations";

const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  value: {
    type: Object,
    default: () => ({}),
  },
  fieldType: {
    type: String,
    default: "",
  },
});

defineEmits(["cancel", "attempt-save"]);

const attrs = useAttrs();

const isSaveDisabled = computed(() => {
  if (isEmpty(props.value.label)) {
    return true;
  }

  if (props.fieldType !== "address" && isEmpty(props.value.value)) {
    return true;
  }

  return !!(
    props.fieldType === "address" &&
    ["city", "country", "postal_code", "state", "street_address", "unit"].every(
      (key) => isEmpty(props.value.value[key])
    )
  );
});
</script>

<template>
  <div class="custom-field-form">
    <h3 class="custom-field-form__title">
      {{ title }}
    </h3>
    <slot />
    <div class="custom-field-form__actions">
      <Button
        type="secondary"
        @click="$emit('cancel')"
      >
        Cancel
      </Button>
      <Button
        :loading="attrs['is-loading']"
        :disabled="isSaveDisabled"
        @click="$emit('attempt-save')"
      >
        Save
      </Button>
    </div>
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.custom-field-form {
  border: 1px solid $color-primary-10;
  border-radius: 15px;
  padding: 16px;
  background: $color-base-white-100;

  &__title {
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 18px;
    color: $color-primary-100;
    margin-bottom: 16px;
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    margin-top: 16px;
    gap: 10px;
  }

  .border-input-text,
  .border-input-multiline,
  .border-input-switch,
  .border-input-select {
    margin-top: 12px;
  }
}
</style>
