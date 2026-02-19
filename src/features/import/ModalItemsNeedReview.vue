<script setup>
import Key from "@/assets/icons/key-orange.svg";
import store from "@/store";
import { computed } from "vue";
import ModalTemplate from "@/features/ModalTemplate.vue";
import Button from "@/features/Button.vue";
defineProps({ params: { type: Object, default: null } });
const visibleModals = computed(() => store.state.modal.visibleModals);
</script>

<template>
  <ModalTemplate
    key="modal-items-need-review"
    :show="visibleModals[params.id]"
    class="modal-items-need-review"
    :width="512"
  >
    <template #header>
      <div class="modal-items-need-review__header">
        <Key class="modal-items-need-review__icon" />
        <h1>Some autofill information missing</h1>
      </div>
    </template>
    <template #body>
      <div class="modal-items-need-review__body">
        <p>
          For the best experience with the Cloaked extension or mobile app, you
          may want to add additional credentials to the items marked as “Needs
          review”.
        </p>
        <p>You may still finish your import with missing information.</p>
      </div>
    </template>
    <template #footer>
      <Button
        type="secondary"
        @click="params.onGoBack()"
      >
        Make Changes
      </Button>
      <Button @click="params.onContinue()">Import Anyway</Button>
    </template>
  </ModalTemplate>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.modal-items-need-review {
  text-align: left;

  &__header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  &__body {
    margin-bottom: 16px;
  }

  &__icon {
    margin-bottom: 16px;
  }
}
</style>
