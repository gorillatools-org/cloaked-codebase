<script setup>
import Key from "@/assets/icons/key-orange.svg";
import store from "@/store";
import { computed } from "vue";
import ModalTemplate from "@/features/ModalTemplate.vue";
import BaseButton from "@/library/BaseButton.vue";

defineProps({ params: { type: Object, default: null } });
const visibleModals = computed(() => store.state.modal.visibleModals);
</script>

<template>
  <ModalTemplate
    key="modal-missing-labels"
    :show="visibleModals[params.id]"
    class="modal-missing-labels"
    :width="512"
  >
    <template #header>
      <div class="modal-missing-labels__header">
        <Key class="modal-missing-labels__icon" />
        <h1>Some autofill information missing</h1>
      </div>
    </template>
    <template #body>
      <div>
        <p>
          To autofill identities using the Cloaked extension or mobile app, you
          will need to add the following labels.
        </p>
        <ul class="modal-missing-labels__list">
          <li class="modal-missing-labels__list-item">URL</li>
          <li class="modal-missing-labels__list-item">Password</li>
          <li class="modal-missing-labels__list-item">
            Email address, Username, or Phone number
          </li>
        </ul>
      </div>
    </template>
    <template #footer>
      <BaseButton
        variant="secondary"
        @click="params.onGoBack()"
      >
        Make Changes
      </BaseButton>
      <BaseButton
        variant="primary"
        @click="params.onContinue()"
      >
        Continue Anyway
      </BaseButton>
    </template>
  </ModalTemplate>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.modal-missing-labels {
  &__header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  &__icon {
    margin-bottom: 16px;
  }

  &__list {
    list-style-type: disc !important;
    padding: 12px 12px 12px 32px !important;
    margin: 16px 0 !important;
    border: 1px solid #babcbd;
    border-radius: 8px;

    &-item {
      font-weight: 400;
      font-size: 14px;
      line-height: 21px;
      color: $color-primary-100;
      margin-top: 2px;

      &:first-child {
        margin-top: 0;
      }
    }
  }
}
</style>
