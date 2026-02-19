<script setup>
import Stepper from "@/features/ui/stepper";
import Back from "@/assets/icons/back-modal-full.svg";
import UiTooltip from "@/features/ui/ui-tooltip";
import ModalMissingLabels from "@/features/import/ModalMissingLabels";
import { IMPORT_OPTION_CSV } from "@/store/modules/accounts-importer/shared.js";
import {
  NEXT_STATE_UNLABELED_COLUMNS,
  NEXT_STATE_ALL_LABELED_AS_NOTES,
  NEXT_STATE_MISSING_NAME_AND_URL,
  FIELD_WEBSITE,
  FIELD_PASSWORD,
  FIELD_EMAIL,
  FIELD_USERNAME,
  FIELD_PHONE_NUMBER,
  STATUSES_MISSING_INFO,
  STATUS_DUPLICATE,
} from "@/store/modules/accounts-importer/shared.js";
import UserService from "@/api/actions/user-service";
import {
  STEP_IMPORT_COMPLETED,
  STEP_IMPORT_STARTED,
} from "@/scripts/userFlags";
import BaseButton from "@/library/BaseButton.vue";
import ImportCheatSheet from "@/features/import/ImportCheatSheet.vue";
import ModalItemsNeedReview from "@/features/import/ModalItemsNeedReview.vue";
import {
  computed,
  onMounted,
  onUnmounted,
  reactive,
  watch,
  markRaw,
} from "vue";
import router from "@/routes/router";
import { useRoute } from "vue-router";
import store from "@/store";
import { onBeforeRouteLeave } from "vue-router";
import { HELP_CENTER_IMPORT_URL } from "@/scripts/constants";

const route = useRoute();
let previousRoute = null;

const state = reactive({
  sourceCache: null,
});
onBeforeRouteLeave((to, from, next) => {
  if (
    !store.getters["getModals"].some(
      (modal) => modal.id === "import-processing"
    )
  ) {
    store.dispatch("closeModal");
  }
  next();
});

const nextState = computed(() =>
  store.getters["accountsImporter/getNextState"](route.meta.step)
);
const routeSource = computed(() => route.params.source);
const selectedIdentities = computed(
  () => store.getters["accountsImporter/getSelectedIdentities"]
);
const isInProgress = computed(
  () => store.getters["accountsImporter/isInProgress"]
);
watch(
  () => routeSource.value,
  (value) => {
    if (value) {
      state.sourceCache = value;
    }
  },
  { deep: true }
);
function onClose() {
  store.dispatch("accountsImporter/remove");
  router.push({ name: previousRoute || "All" });
}
function openCancelImportModal(callback) {
  store.dispatch("openModal", {
    header: "Cancel this import?",
    subheader:
      "Cloaked will not save uploaded identities until you have labeled and confirmed them as a final step.",
    showCancel: true,
    cancelText: "Take me back",
    width: 512,
    button: {
      text: "Cancel this import",
      onClick: callback,
      danger: true,
    },
  });
}
function onBack() {
  const backRouteMap = {
    1: { name: "ImportSource" },
    2: { name: "ImportUpload", params: { source: IMPORT_OPTION_CSV } },
    3: { name: "ImportMapping" },
  };
  if (isInProgress.value && route.meta.step === 1) {
    openCancelImportModal(() => {
      store.dispatch("accountsImporter/remove");
      router.push(backRouteMap[route.meta.step]);
    });

    return;
  }

  router.push(backRouteMap[route.meta.step]);
}

function onNext() {
  const nextRouteMap = {
    1: { name: "ImportMapping" },
    2: { name: "ImportReview" },
    3: { name: "All" },
  };

  if (route.meta.step === 1) {
    UserService.setFlag({
      name: STEP_IMPORT_STARTED,
      value: Date.now(),
    });
  }

  if (route.meta.step === 2) {
    const importedFields = store.getters["accountsImporter/getImportedFields"];

    if (
      !importedFields.includes(FIELD_WEBSITE) ||
      !importedFields.includes(FIELD_PASSWORD) ||
      (!importedFields.includes(FIELD_EMAIL) &&
        !importedFields.includes(FIELD_USERNAME) &&
        !importedFields.includes(FIELD_PHONE_NUMBER))
    ) {
      store.dispatch("openModal", {
        id: "missing-labels",
        customTemplate: {
          template: markRaw(ModalMissingLabels),
          params: {
            id: "missing-labels",
            onContinue: () => {
              store.dispatch("closeModal");
              router.push(nextRouteMap[route.meta.step]);
            },
            onGoBack: () => store.dispatch("closeModal"),
          },
        },
      });

      return;
    }
  }

  if (route.meta.step === 3) {
    const finishImport = () => {
      store.dispatch("accountsImporter/startImport", {
        source: state.sourceCache,
      });

      UserService.setFlag({
        name: STEP_IMPORT_COMPLETED,
        value: Date.now(),
      });
    };

    if (
      store.getters["accountsImporter/getIdentities"](
        STATUSES_MISSING_INFO,
        null,
        [STATUS_DUPLICATE]
      ).length > 0
    ) {
      store.dispatch("openModal", {
        id: "items-need-review",
        customTemplate: {
          template: markRaw(ModalItemsNeedReview),
          params: {
            id: "items-need-review",
            onContinue: async () => {
              await store.dispatch("closeModal");
              router.push(nextRouteMap[route.meta.step]);
              finishImport();
            },
            onGoBack: () => store.dispatch("closeModal"),
          },
        },
      });

      return;
    }

    finishImport();
  }

  router.push(nextRouteMap[route.meta.step]);
}

function onHelp() {
  window.open(`${HELP_CENTER_IMPORT_URL}`, "_blank");
}
function checkForEscape(event) {
  if (event?.key?.toLowerCase() === "escape") {
    if (route.name === "ImportReviewIdentityEdit") {
      return;
    }

    if (store.state.modal.modals.length > 0) {
      return;
    }

    if (isInProgress.value) {
      openCancelImportModal(onClose);
    } else {
      onClose();
    }
  }
}
onMounted(() => {
  previousRoute = store.getters["settings/getPrevRouteName"];
  document.addEventListener("keydown", checkForEscape);
});
onUnmounted(() => {
  document.removeEventListener("keydown", checkForEscape);
});
</script>

<template>
  <div class="page-import">
    <div class="page-import__header">
      <div class="page-import__header-left">
        <button
          v-if="route.meta.step > 0"
          class="page-import__button"
          @click="onBack"
        >
          <Back />
        </button>
      </div>
      <div class="page-import__header-center">
        <Stepper
          :value="route.meta.step"
          :steps="[
            'Choose source',
            'Upload file',
            'Choose labels',
            'Review & import',
          ]"
          class="import__stepper"
        />
      </div>
      <div class="page-import__header-right">
        <ImportCheatSheet
          :with-ping="route.meta.step === 2"
          @click="onHelp"
        />
        <UiTooltip
          v-if="route.meta.step > 0"
          position="bottom"
          align-x="right"
          width="200"
          :class="{ 'import__tooltip--disabled': nextState !== 'OK' }"
        >
          <BaseButton
            class="import__button-next"
            :disabled="nextState !== 'OK'"
            @click="onNext"
          >
            {{
              route.meta.step === 3
                ? `Import ${selectedIdentities.length} ${
                    selectedIdentities.length === 1 ? "identity" : "identities"
                  }`
                : "Continue"
            }}
          </BaseButton>
          <template #content>
            <template v-if="nextState === NEXT_STATE_UNLABELED_COLUMNS">
              Add a label to each column to continue
            </template>
            <template v-else-if="nextState === NEXT_STATE_ALL_LABELED_AS_NOTES">
              All columns can't be labeled "Add to notes". Choose a different
              column label to continue
            </template>
            <template v-else-if="nextState === NEXT_STATE_MISSING_NAME_AND_URL">
              You must have one column labeled "URL" or "Identity name" to
              continue
            </template>
          </template>
        </UiTooltip>
      </div>
    </div>
    <div class="page-import__content">
      <div class="page-import__wrapper">
        <router-view />
      </div>
    </div>
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.page-import {
  display: flex;
  flex-direction: column;
  height: calc(100% - 8px) !important;
  background-color: $color-primary-1;
  margin: 0 8px 8px 0;
  border-radius: 20px;

  &__header {
    height: 84px;
    border-bottom: 1px solid $color-primary-10;
    display: grid;
    grid-template-columns: 1fr minmax(150px, 520px) minmax(290px, 1fr);
    align-items: center;
    padding: 0 24px;
    flex-shrink: 0;
    background-color: $color-primary-1;
  }

  &__header-left {
    justify-self: left;
  }

  &__header-center {
    justify-self: center;
  }

  &__header-right {
    justify-self: right;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 100%;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    color: $color-primary-100;

    &:hover {
      opacity: 0.7;
    }
  }

  &__content {
    flex: 1;
    overflow: hidden;
    padding: 0 24px;
  }

  &__wrapper {
    height: 100%;
    overflow: auto;
    padding: 24px 0;
    @include custom-scroll-bar;
  }
}

.import {
  &__step-title {
    font-weight: 500;
    font-size: 20px;
    line-height: 30px;
    color: $color-primary-100;
  }

  &__button-next {
    margin-left: 12px;
  }

  &__stepper {
    .stepper__item {
      margin-left: 42px;

      @media all and (min-width: 850px) {
        margin-left: 50px;
      }

      &:first-child {
        margin-left: 16px;
      }

      &-text {
        display: none;

        @media all and (min-width: 850px) {
          display: block;
        }
      }
    }
  }

  &__tooltip {
    &--disabled {
      cursor: not-allowed;
    }
  }
}
</style>
