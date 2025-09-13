<script setup>
import Processing from "@/assets/icons/import/feedback/processing.svg";
import Finished from "@/assets/icons/import/feedback/finished.svg";
import Error from "@/assets/icons/import/feedback/error.svg";
import Tip from "@/features/ui/Tip";
import {
  IMPORT_STATUS_FAILURE,
  IMPORT_STATUS_FINISHED,
} from "@/store/modules/accounts-importer/shared.js";
import { computed, watch, ref } from "vue";
import store from "@/store";
import ModalTemplate from "@/features/ModalTemplate.vue";
import Button from "@/features/Button.vue";
const props = defineProps({ params: { type: Object, default: null } });
const hasImportSucceeded = ref(null);
const visibleModals = computed(() => store.state.modal.visibleModals);
const importStatus = computed(
  () => store.getters["accountsImporter/getImportStatus"]
);
const icon = computed(() => {
  if (hasImportSucceeded.value === null) {
    return Processing;
  }

  return hasImportSucceeded.value ? Finished : Error;
});
const title = computed(() => {
  if (hasImportSucceeded.value === null) {
    return `Importing ${props.params.numberOfIdentities} ${
      props.params.numberOfIdentities > 1 ? "identities" : "identity"
    }...`;
  }

  return hasImportSucceeded.value
    ? "Your import is complete!"
    : "We couldn't import your file";
});
const subheader = computed(() => {
  if (hasImportSucceeded.value === null) {
    return "Most imports take about 5 minutes to complete. You’ll receive an email when your import is done.";
  }

  return hasImportSucceeded.value
    ? "Your import has been completed. If you’re finished, click “Done” or you can import another file."
    : "Sorry, we were unable to process your import. Please check your internet connection and file for any errors and try again.";
});

watch(
  importStatus,
  (value) => {
    if (hasImportSucceeded.value !== null) {
      return;
    }

    if (value === IMPORT_STATUS_FINISHED) {
      hasImportSucceeded.value = true;
    }

    if (value === IMPORT_STATUS_FAILURE) {
      hasImportSucceeded.value = false;
    }
  },
  { immediate: true, deep: true }
);
</script>

<template>
  <ModalTemplate
    key="modal-import-processing"
    :show="visibleModals[params.id]"
    class="modal-import-processing"
    :width="512"
  >
    <template #header>
      <div class="modal-import-processing__header">
        <Component
          :is="icon"
          class="modal-import-processing__icon"
        />
        <h1>{{ title }}</h1>
      </div>
    </template>
    <template #body>
      <div>
        <p class="modal-import-processing__subheader">
          {{ subheader }}
        </p>
        <Tip
          v-if="hasImportSucceeded !== false"
          type="info"
          class="modal-import-processing__tip"
        >
          <div>
            <strong>Suggestion:</strong>
            Delete the import file from your computer to keep your information
            secure.
          </div>
        </Tip>
      </div>
    </template>
    <template #footer>
      <template v-if="hasImportSucceeded !== false">
        <Button
          type="secondary"
          @click="params.onImportMore()"
        >
          Import More
        </Button>
        <Button @click="params.onDone()">Done</Button>
      </template>
      <template v-else>
        <Button
          type="secondary"
          @click="params.onDone()"
        >
          Cancel
        </Button>
        <Button @click="params.onImportMore()">Start Over</Button>
      </template>
    </template>
  </ModalTemplate>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.modal-import-processing {
  &__header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  &__icon {
    margin-bottom: 16px;
    width: 72px;
    height: 72px;
  }

  & &__subheader {
    margin-bottom: 16px;
  }

  &__tip {
    margin: 24px 0 8px;
    font-weight: 400;

    strong {
      font-weight: 500;
    }
  }
}
</style>
