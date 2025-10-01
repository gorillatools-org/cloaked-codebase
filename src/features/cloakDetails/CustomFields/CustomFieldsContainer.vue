<script setup>
import { ref, watch } from "vue";
import CustomFields from "@/features/cloakDetails/CustomFields/CustomFields.vue";
import { encryptCustomField } from "@/scripts/customFields";
import { withPatchedValues } from "@/store/modules/accounts-importer/automatedFixes";
import UserService from "@/api/actions/user-service";
import { useToast } from "@/composables/useToast.js";
import IdentityService from "@/api/actions/identity-service";
const toast = useToast();

const props = defineProps({
  identity: {
    type: Object,
    required: true,
  },
  readOnly: Boolean,
});

const emit = defineEmits(["refresh"]);
const editedField = ref(null);
const isLoading = ref(false);
const isConfirmDeleteModalShown = ref(false);
const isUnsavedChangesModalShown = ref(false);

const refreshIdentity = () =>
  new Promise((resolve) => {
    const unwatch = watch(
      () => props.identity?.customFields,
      () => {
        editedField.value = null;
        unwatch();
        resolve();
      },
      { deep: true }
    );

    emit("refresh", { id: props.identity.id });
  });

const onAdd = async () => {
  try {
    isLoading.value = true;
    const encryptedField = await encryptCustomField(
      withPatchedValues({
        id: self.crypto.randomUUID(),
        ...editedField.value,
      })
    );

    await IdentityService.patchCustomField(
      props.identity.id,
      JSON.stringify({
        custom_data: [
          {
            op: "add",
            path: `/custom_field/${encryptedField.id}`,
            value: encryptedField.value,
          },
        ],
      })
    );

    await refreshIdentity();
    await UserService.updateAndFetchGetStartedChecklist({
      id: 15,
      status: "completed",
    });
    toast.success("New information saved.");
  } catch {
    toast.error("There was an issue saving. Try again in a moment.");
  } finally {
    isLoading.value = false;
  }
};

const onEdit = async () => {
  try {
    isLoading.value = true;
    const encryptedField = await encryptCustomField(
      withPatchedValues(editedField.value)
    );

    await IdentityService.patchCustomField(
      props.identity.id,
      JSON.stringify({
        custom_data: [
          {
            op: "replace",
            path: `/custom_field/${encryptedField.id}`,
            value: encryptedField.value,
          },
        ],
      })
    );

    await refreshIdentity();
    toast.success("Information saved.");
  } catch {
    toast.error("There was an issue saving. Try again in a moment.");
  } finally {
    isLoading.value = false;
  }
};

const onDelete = async () => {
  try {
    isLoading.value = true;
    await IdentityService.patchCustomField(
      props.identity.id,
      JSON.stringify({
        custom_data: [
          {
            op: "remove",
            path: `/custom_field/${editedField.value.id}`,
          },
        ],
      })
    );

    await refreshIdentity();
    isConfirmDeleteModalShown.value = false;

    toast.success("Information deleted.");
  } catch {
    toast.error("There was an issue deleting. Try again in a moment.");
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <CustomFields
      v-bind="$attrs"
      :identity-id="props.identity.id"
      :read-only="readOnly"
      :is-loading="isLoading"
      :is-confirm-delete-modal-shown="isConfirmDeleteModalShown"
      :is-unsaved-changes-modal-shown="isUnsavedChangesModalShown"
      :value="editedField"
      @add="onAdd"
      @edit="onEdit"
      @delete="onDelete"
      @set-show-unsaved-changes-modal="isUnsavedChangesModalShown = $event"
      @set-show-confirm-delete-modal="isConfirmDeleteModalShown = $event"
      @input="
        (event) => {
          editedField = event;
        }
      "
    />
  </div>
</template>
