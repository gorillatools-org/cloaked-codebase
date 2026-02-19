<script setup>
import store from "@/store";

import IdentityService from "@/api/actions/identity-service";

import { computed, reactive, nextTick } from "vue";
import CloakInfoRow from "@/features/cloakDetails/CloakInfoRow.vue";

const props = defineProps({
  cloak: {
    type: Object,
    required: true,
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["refresh"]);

const state = reactive({
  loading: false,
  expectsRefresh: false,
  cloakCopyForUpdate: null,
});

function updateCloakCopy(updateData) {
  const cloakCopy = {
    ...(state.cloakCopyForUpdate ? state.cloakCopyForUpdate : props.cloak),
    ...updateData,
  };
  state.cloakCopyForUpdate = { ...cloakCopy };
}

function save(value) {
  state.loading = true;
  return nextTick(() => {
    updateAutofill("notes", value);
  });
}

function patchAutofill(payload) {
  return IdentityService.patchAutofill(props.cloak.id, payload)
    .then((data) => {
      state.cloakCopyForUpdate = {
        ...state.cloakCopyForUpdate,
        stored_autofill: data,
      };

      if (state.cloakCopyForUpdate.id === props.cloak.id) {
        state.expectsRefresh = true;
      }

      emit("refresh", state.cloakCopyForUpdate);
    })
    .finally(() => {
      state.loading = false;
    });
}

function updateAutofill(name, value) {
  const userAccountVersion = store.state.authentication?.user?.account_version;
  updateCloakCopy({ notes: value });

  if (value !== undefined) {
    if (props.cloak.stored_autofill_id) {
      const payload = { [`autofill_${name}`]: value };
      if (name === "password") {
        payload.encrypted = false;
      } else if (userAccountVersion > 1) {
        payload.encrypted = true;
      }
      payload.encrypted_version = userAccountVersion;
      patchAutofill(payload);
    } else {
      createNewAutofill(`autofill_${name}`, value);
    }
  }
}

function createNewAutofill(name, value) {
  if (name === "phone") {
    name = "phone_number";
  }
  const autofillPayload = {
    collection: store.getters["authentication/collection"]("autofill"), //collection url
    collection_name: "autofill",
    user: props.cloak.user,
    [name]: value,
  };

  IdentityService.createAutofill(autofillPayload)
    .then(({ data }) => {
      const cloakPayload = {
        stored_autofill: data.url,
      };

      state.cloakCopyForUpdate = {
        ...state.cloakCopyForUpdate,
        stored_autofill: data,
      };

      if (state.cloakCopyForUpdate.id === props.cloak.id) {
        state.expectsRefresh = true;
      }

      return IdentityService.updateCloak(
        state.cloakCopyForUpdate.id,
        cloakPayload
      ).then(() => {
        emit("refresh", state.cloakCopyForUpdate);
      });
    })
    .finally(() => {
      state.loading = false;
    });
}

function deleteNotes() {
  state.loading = true;
  return updateAutofill("notes", "");
}

const notes = computed(() => {
  return (props.cloak && props.cloak.notes) || "";
});
</script>

<template>
  <section
    :key="`cloak-notes-${cloak.id}`"
    class="cloak-identifier-section"
  >
    <div class="cloak-identifier-section__group">
      <CloakInfoRow
        field="notes"
        placeholder="Add secure notes"
        :initial-value="notes"
        :loading="state.loading"
        :read-only="props.readOnly"
        :enter-ctrl="true"
        :identity-id="props.cloak.id"
        @save="(newVal) => save(newVal)"
        @delete="deleteNotes"
      />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.cloak-identifier-section {
  &__group {
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
}
</style>
