<script setup>
import IdentitySharingButton from "@/features/cloakDetails/IdentitySharing/IdentitySharingButton.vue";
import IdentitySharingModalPublished from "@/features/cloakDetails/IdentitySharing/IdentitySharingModal/IdentitySharingModalPublished.vue";
import IdentitySharingModalCreate from "@/features/cloakDetails/IdentitySharing/IdentitySharingModal/IdentitySharingModalCreate.vue";
import IdentitySharingModalExpired from "@/features/cloakDetails/IdentitySharing/IdentitySharingModal/IdentitySharingModalExpired.vue";
import IdentitySharingModalDelete from "@/features/cloakDetails/IdentitySharing/IdentitySharingModal/IdentitySharingModalDelete.vue";
const props = defineProps({
  identity: {
    type: Object,
    default: () => ({}),
  },
  activeModal: {
    type: String,
    default: "",
  },
  value: {
    type: Boolean,
    default: false,
  },
  isTooltipOpen: {
    type: Boolean,
    default: false,
  },
  isShared: {
    type: Boolean,
    default: false,
  },
  hasAnnouncementTooltip: {
    type: Boolean,
    default: false,
  },
  sharing: {
    type: Object,
    default: null,
  },
  permissions: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  isGeneratingLink: {
    type: Boolean,
    default: false,
  },
  isGeneratingPassword: {
    type: Boolean,
    default: false,
  },
});
defineEmits([
  "input",
  "set-active-modal",
  "set-is-tooltip-open",
  "update-sharing",
  "expired",
  "create",
  "update",
  "delete",
  "generate-new-link",
  "generate-new-password",
]);
</script>

<template>
  <div>
    <IdentitySharingButton
      :is-loading="props.isLoading"
      :is-active="props.value"
      :is-shared="props.isShared"
      :has-announcement-tooltip="props.hasAnnouncementTooltip"
      :value="props.isTooltipOpen"
      @input="$emit('set-is-tooltip-open', $event)"
      @click="props.hasAnnouncementTooltip || $emit('input', true)"
    />
    <div v-if="props.value">
      <IdentitySharingModalPublished
        v-if="props.activeModal === 'IdentitySharingModalPublished'"
        without-overlay
        :is-loading="props.isLoading"
        :identity="identity"
        :sharing="props.sharing"
        :is-generating-link="props.isGeneratingLink"
        :is-generating-password="props.isGeneratingPassword"
        :value="props.value"
        @input="$emit('input', $event)"
        @expired="$emit('expired', $event)"
        @update="$emit('update')"
        @update-sharing="
          (newShareData) => $emit('update-sharing', newShareData)
        "
        @open-create="$emit('set-active-modal', 'IdentitySharingModalCreate')"
        @open-delete="$emit('set-active-modal', 'IdentitySharingModalDelete')"
        @generate-new-link="$emit('generate-new-link')"
        @generate-new-password="$emit('generate-new-password')"
      />
      <IdentitySharingModalExpired
        v-else-if="props.activeModal === 'IdentitySharingModalExpired'"
        without-overlay
        :identity="identity"
        :is-loading="props.isLoading"
        :value="props.value"
        @input="$emit('input', $event)"
        @open-create="$emit('set-active-modal', 'IdentitySharingModalCreate')"
      />
      <IdentitySharingModalDelete
        v-else-if="props.activeModal === 'IdentitySharingModalDelete'"
        without-overlay
        :is-loading="props.isLoading"
        :value="props.value"
        @input="$emit('input', $event)"
        @delete="$emit('delete')"
        @open-published="
          $emit('set-active-modal', 'IdentitySharingModalPublished')
        "
      />
      <IdentitySharingModalCreate
        v-else
        without-overlay
        :is-loading="props.isLoading"
        :is-shared="props.isShared"
        :identity="identity"
        :sharing="props.sharing"
        :permissions="props.permissions"
        :value="props.value"
        @input="$emit('input', $event)"
        @create="$emit('create')"
        @update="$emit('update')"
        @update-sharing="
          (newShareData) => $emit('update-sharing', newShareData)
        "
        @open-published="
          $emit('set-active-modal', 'IdentitySharingModalPublished')
        "
      />
    </div>
    <div v-if="props.value">
      <Teleport to="#root">
        <Transition
          name="identity-sharing-background"
          appear
        >
          <div class="identity-sharing-background" />
        </Transition>
      </Teleport>
    </div>
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.identity-sharing-background {
  position: fixed;
  inset: 0;
  background: rgba($black, 0.5);
  opacity: 1;
  z-index: 1000;
}

.identity-sharing-background-enter-active,
.identity-sharing-background-leave-active {
  transition: opacity 0.45s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.identity-sharing-background-enter,
.identity-sharing-background-leave-to {
  opacity: 0;
}
</style>
