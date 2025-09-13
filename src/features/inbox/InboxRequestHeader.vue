<script setup>
import store from "@/store";
import InlineSvg from "@/features/InlineSvg.vue";
import { format } from "@/scripts/format";
import BaseText from "@/library/BaseText.vue";

const props = defineProps({
  contact: {
    type: Object,
    default: null,
  },
  identity: {
    type: Object,
    default: null,
  },
});

function openCloak() {
  if (props.identity.protected) {
    return;
  }
  if (
    !store.state.rightPanel.cloak ||
    store.state.rightPanel.cloak.id !== props.identity.id
  ) {
    store.dispatch("openCloakDetails", {
      cloak: props.identity,
    });
  }
}
</script>

<template>
  <section class="inbox-request-header">
    <div>
      <div class="user-icon">
        <InlineSvg name="user-icon-filled" />
      </div>
      <BaseText
        as="h1"
        variant="headline-4-bold"
      >
        {{ format.anonymPhone(props.contact?.original_phone) }}
      </BaseText>
      <BaseText
        variant="body-small-medium"
        as="h2"
      >
        {{ contact?.location || "Unknown Location" }}
      </BaseText>
      <button @click="openCloak">
        <BaseText variant="body-small-medium">
          View "{{ props.identity?.nickname }}" Identity
        </BaseText>
      </button>
    </div>
  </section>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.inbox-request-header {
  padding: 32px;
  display: flex;
  flex: 1;
  justify-content: center;
  color: $color-primary-100;
  width: 100%;

  > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .user-icon {
    background-color: $color-primary-10;
    color: $color-primary-100;
    border-radius: 999px;
    height: 80px;
    width: 80px;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      height: 35px;
      width: 33px;
    }
  }

  h1 {
    margin: 8px 0 4px;
    color: $color-accent;
  }

  h2 {
    margin: 0 0 8px;
    color: $color-primary-50;
  }

  button {
    padding: 4px 12px;
    background-color: $color-primary-5;
    color: $color-primary-100;
    border-radius: 999px;
    border: none;
    cursor: pointer;
  }
}
</style>
