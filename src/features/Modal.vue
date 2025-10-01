<script setup>
import PreferencesInput from "@/routes/modals/preferences/PreferencesInput.vue";
import { onBeforeUnmount, reactive, computed, onMounted } from "vue";
import store from "@/store";
import ModalTemplate from "@/features/ModalTemplate.vue";
import BaseButton from "@/library/BaseButton.vue";
import BaseText from "@/library/BaseText.vue";

const state = reactive({
  loadingOnClick: false,
  inputValue: "",
});

onMounted(() => {
  window.document.addEventListener("keydown", handleKeyPress);
});

onBeforeUnmount(() => {
  window.document.removeEventListener("keydown", handleKeyPress);
});

const modals = computed(() => store.state.modal.modals);
const visibleModals = computed(() => store.state.modal.visibleModals);

function handleClickAction($event, modal) {
  if (typeof modal.button.onClick === "function") {
    const maybePromise = modal.button.onClick($event);

    if (modal.closeAfterOnClick && maybePromise instanceof Promise) {
      state.loadingOnClick = true;

      return maybePromise
        .then(() => {
          state.loadingOnClick = false;
          handleCloseModal(modal, true);
        })
        .finally(() => {
          state.loadingOnClick = false;
        });
    }
  }

  handleCloseModal(modal, true);
}

function handleKeyPress($event) {
  if ($event?.key?.toLowerCase() === "escape") {
    handleCloseModal();
  }
  if ($event?.key?.toLowerCase() === "enter") {
    $event.stopPropagation();
    $event.preventDefault();
    const topModal = modals.value[modals.value.length - 1];
    if (topModal && topModal.button && topModal.button.onClick) {
      topModal.button.onClick($event);
      handleCloseModal();
    }
  }
}

function handleCloseModal(modal, fromMainCTA = false) {
  if (state.loadingOnClick) {
    return;
  }

  const doNotCallCancelAction =
    fromMainCTA && !modal?.button?.triggerCancelActionAfterMainCTA;

  if (typeof modal?.cancelAction === "function" && !doNotCallCancelAction) {
    modal.cancelAction();
  }

  state.inputValue = "";
  if (modal?.preventClose) {
    return;
  }
  store.dispatch("closeModal", modal);
}

function isPrimaryBtnDisabled(modal) {
  /* We need this because our modal props
      don't change dynamically, ie if button changes from
      disabled to enabled, without this, the button
      stays disabled */
  if (state.loadingOnClick) {
    return true;
  } else if (state.inputValue) {
    /* For example, buttons that need to change from disabled
        to enabled based on the existance of a password */
    return false;
  } else if (modal.button?.disabled) {
    return true;
  } else {
    return false;
  }
}

function renameEvents(customTemplate) {
  const eventsObject = { ...customTemplate.events };
  const eventNames = Object.keys(eventsObject);
  eventNames.forEach((eventName) => {
    const firstLetter = eventName.charAt(0).toUpperCase();
    eventsObject[`on${firstLetter}${eventName.substring(1)}`] =
      eventsObject[eventName];
  });
  return { ...eventsObject, ...customTemplate.props };
}
</script>

<template>
  <div class="global-modal">
    <template v-for="modal in modals">
      <component
        v-bind="renameEvents(modal.customTemplate)"
        :is="modal.customTemplate.template"
        v-if="modal.customTemplate"
        :key="modal.id"
        :params="modal.customTemplate.params"
      />

      <ModalTemplate
        v-else
        :key="modal?.id"
        :show-close-in-header="modal.showCloseInHeader"
        :show="visibleModals[modal.id]"
        :width="modal.width"
        :prevent-close="modal.preventClose"
        @close="() => handleCloseModal(modal)"
      >
        <template #header>
          <BaseText
            v-if="modal.header"
            as="h1"
            variant="headline-4-bold"
          >
            {{ modal.header }}
          </BaseText>
        </template>

        <template #body>
          <div
            v-if="modal.paragraphs || modal.subheader"
            class="modal-paragraph-wrapper"
          >
            <!-- eslint-disable vue/no-v-html -->
            <p
              v-if="modal.subheader"
              v-html="modal.subheader"
            />
            <p
              v-for="paragraph in modal.paragraphs"
              :key="paragraph"
              v-html="paragraph"
            />
            <!-- eslint-enable vue/no-v-html -->
          </div>
        </template>

        <template #input>
          <PreferencesInput
            v-if="!!modal.input"
            :value="state.inputValue"
            :label="modal?.input?.label || undefined"
            :type="modal?.input?.type || 'text'"
            :placeholder="modal?.input?.placeholder || ''"
            :disabled="modal?.input?.disabled || false"
            :error="modal?.input?.error"
            @input="
              (e) => {
                state.inputValue = e;
                modal?.input?.handleInput(e);
              }
            "
            @focus="
              modal?.input?.handleFocus
                ? modal?.input?.handleFocus(state.inputValue)
                : undefined
            "
            @blur="
              modal?.input?.handleFocus
                ? modal?.input?.handleBlur(state.inputValue)
                : undefined
            "
          />
        </template>

        <template
          v-if="!modal.hideFooter"
          #footer
        >
          <BaseButton
            v-if="modal.showCancel"
            aria-id="CancelButton"
            variant="secondary"
            :disabled="state.loadingOnClick"
            :icon="modal.cancelIcon || 'close'"
            @click="() => handleCloseModal(modal)"
          >
            {{ modal.cancelText || "Cancel" }}
          </BaseButton>

          <BaseButton
            v-if="modal.button && modal.button.text"
            aria-id="ConfirmButton"
            :variant="modal.button.danger ? 'danger' : 'primary'"
            :disabled="isPrimaryBtnDisabled(modal)"
            :loading="state.loadingOnClick"
            :icon="modal.button.icon"
            @click="handleClickAction($event, modal)"
          >
            {{ modal.button.text }}
          </BaseButton>
        </template>
      </ModalTemplate>
    </template>
  </div>
</template>
<style lang="scss" scoped>
.modal-paragraph-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 16px;
}

.full-width {
  width: 100%;
}
</style>
