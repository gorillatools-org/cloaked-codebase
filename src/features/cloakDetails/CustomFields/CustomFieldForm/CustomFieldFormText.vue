<script setup>
import CustomFieldFormWrapper from "@/features/cloakDetails/CustomFields/CustomFieldForm/CustomFieldFormWrapper.vue";
import BorderInputText from "@/features/BorderInputText.vue";
import CustomFieldFormInputIsSensitive from "@/features/cloakDetails/CustomFields/CustomFieldFormInputIsSensitive.vue";
import { computed, onMounted, ref, useAttrs } from "vue";
import BorderInputMultiline from "@/features/BorderInputMultiline.vue";
import { getDefaultLabel } from "@/features/cloakDetails/CustomFields/CustomFieldForm/utils";

const props = defineProps({
  fieldType: {
    type: String,
    required: true,
  },
  value: {
    type: Object,
    required: true,
  },
  errors: {
    type: Object,
    required: true,
  },
});

const attrs = useAttrs();

const emit = defineEmits(["input", "validate"]);

const label = ref(null);

onMounted(() => {
  label.value.$refs.input.focus();
});

const labelPlaceholder = computed(() => getDefaultLabel(props.fieldType));

const valuePlaceholder = computed(() => {
  const typeToPlaceholder = {
    text: `Type anything here`,
    url: `https://`,
    date: `YYYY-MM-DD`,
    bank: `Type anything here`,
    auth: `Type anything here`,
    identification: `Type anything here`,
  };

  return typeToPlaceholder[props.fieldType];
});

const onValueInput = (value) => {
  emit("input", { ...props.value, value });

  if (props.errors?.value?.length) {
    emit("validate", { value, field: "value" });
  }
};
</script>

<template>
  <CustomFieldFormWrapper
    v-bind="attrs"
    class="custom-field-form-text"
    :value="value"
  >
    <BorderInputText
      ref="label"
      label="Label"
      :value="value.label"
      :placeholder="labelPlaceholder"
      @input="$emit('input', { ...value, label: $event })"
    />
    <BorderInputMultiline
      v-if="fieldType === 'url'"
      label="Content"
      :value="value.value"
      :errors="errors?.value"
      :placeholder="valuePlaceholder"
      @input="onValueInput"
      @change="$emit('validate', { value: $event, field: 'value' })"
    />
    <BorderInputText
      v-else
      label="Content"
      :value="value.value"
      :errors="errors?.value"
      :placeholder="valuePlaceholder"
      @input="onValueInput"
      @change="$emit('validate', { value: $event, field: 'value' })"
    />
    <CustomFieldFormInputIsSensitive
      :value="!!value.isSecret"
      @input="($event) => $emit('input', { ...value, isSecret: $event })"
    />
  </CustomFieldFormWrapper>
</template>
