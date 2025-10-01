<script setup>
import InlineSvg from "@/features/InlineSvg.vue";
import { computed } from "vue";
import CustomField from "@/features/cloakDetails/CustomFields/CustomField.vue";
import UiTooltip from "@/features/ui/ui-tooltip.vue";
import CustomFieldAdd from "@/features/cloakDetails/CustomFields/CustomFieldAdd.vue";
import CustomFieldForm from "@/features/cloakDetails/CustomFields/CustomFieldForm/CustomFieldForm.vue";
import CustomFieldModalUnsavedChanges from "@/features/cloakDetails/CustomFields/CustomFieldModal/CustomFieldModalUnsavedChanges.vue";
import CustomFieldModalConfirmDelete from "@/features/cloakDetails/CustomFields/CustomFieldModal/CustomFieldModalConfirmDelete.vue";

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  existingAddresses: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  isConfirmDeleteModalShown: {
    type: Boolean,
    default: false,
  },
  isUnsavedChangesModalShown: {
    type: Boolean,
    default: false,
  },
  value: {
    type: [Object, null],
    default: null,
  },
  readOnly: Boolean,
  identityId: { type: Number, default: null },
});

defineEmits([
  "input",
  "add",
  "edit",
  "delete",
  "set-show-confirm-delete-modal",
  "set-show-unsaved-changes-modal",
]);

const orderedItems = computed(() => {
  const typeOrder = [
    "text",
    "address",
    "auth",
    "bank",
    "date",
    "identification",
    "url",
  ];

  return [...props.items].sort((a, b) => {
    if (a.type !== b.type) {
      return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
    }

    return a.label > b.label ? 1 : -1;
  });
});
</script>

<template>
  <section class="custom-fields">
    <header>
      <h3 class="custom-fields__header">
        <span>Other information</span>
        <UiTooltip
          title="Store new custom information to identities, making them even more powerful."
          position="top"
          max-width="192"
          align-x="center"
        >
          <InlineSvg name="more-info-q" />
        </UiTooltip>
      </h3>
    </header>
    <ul
      v-if="orderedItems && orderedItems.length"
      class="custom-fields__list"
    >
      <li
        v-for="item in orderedItems"
        :key="item.id"
        class="custom-fields__list-item"
      >
        <CustomFieldForm
          v-if="value && value.id === item.id && value.value"
          :value="value"
          form-type="edit"
          :field-type="value.type"
          :is-loading="isLoading"
          @input="
            ($event) => {
              $emit('input', $event);
            }
          "
          @cancel="$emit('set-show-unsaved-changes-modal', true)"
          @save="$emit('edit')"
        />
        <CustomField
          v-else
          :type="item.type"
          :label="item.label"
          :value="item.value"
          :is-secret="item.isSecret"
          :identity-id="props.identityId"
          @edit="$emit('input', JSON.parse(JSON.stringify(item)))"
          @delete="
            $emit('input', { id: item.id });
            $emit('set-show-confirm-delete-modal', true);
          "
        />
      </li>
    </ul>
    <CustomFieldAdd
      v-if="!readOnly && (value === null || value.id)"
      class="custom-fields__add"
      @add="(type) => $emit('input', { type })"
    />
    <CustomFieldForm
      v-else-if="!readOnly"
      :value="value"
      form-type="new"
      :field-type="value?.type"
      :existing-addresses="existingAddresses"
      :is-loading="isLoading"
      @input="
        ($event) => {
          $emit('input', $event);
        }
      "
      @cancel="$emit('set-show-unsaved-changes-modal', true)"
      @save="$emit('add')"
    />
    <CustomFieldModalUnsavedChanges
      :value="isUnsavedChangesModalShown"
      @input="$emit('set-show-unsaved-changes-modal', $event)"
      @discard="
        $emit('input', null);
        $emit('set-show-unsaved-changes-modal', false);
      "
    />
    <CustomFieldModalConfirmDelete
      :value="isConfirmDeleteModalShown"
      :is-loading="isLoading"
      @input="$emit('set-show-confirm-delete-modal', $event)"
      @delete="$emit('delete')"
    />
  </section>
</template>

<style lang="scss" scoped>
.custom-fields {
  padding: 20px 24px;

  &__header {
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
    color: $color-primary-100;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
    margin-bottom: 12px;
  }

  &__list {
    &-item {
      padding: 12px 0;
    }
  }

  &__add {
    margin-top: 8px;
  }
}
</style>
