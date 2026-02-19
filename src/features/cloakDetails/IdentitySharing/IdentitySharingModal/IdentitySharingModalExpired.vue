<script setup>
import { useAttrs } from "vue";
import AppModal from "@/features/ui/AppModal.vue";
import AppModalContent from "@/features/ui/AppModalContent.vue";
import AppModalTitle from "@/features/ui/AppModalTitle.vue";
import Button from "@/features/Button.vue";
import AppModalFooter from "@/features/ui/AppModalFooter.vue";
import IdentitySharingTerms from "@/features/cloakDetails/IdentitySharing/IdentitySharingModal/IdentitySharingTerms.vue";
import IdentityIcon from "@/features/ui/IdentityIcon.vue";
import AppModalCustomWrapper from "@/features/ui/AppModalCustomWrapper.vue";

defineProps({
  identity: {
    type: Object,
    default: () => ({}),
  },
});
defineEmits(["input", "open-create"]);
const attrs = useAttrs();
</script>

<template>
  <AppModal v-bind="attrs">
    <AppModalContent class="identity-sharing-expired">
      <AppModalCustomWrapper class="identity-sharing-expired__head">
        <IdentityIcon
          :identity="identity"
          :override="{ width: '72px', height: '72px' }"
        />
      </AppModalCustomWrapper>
      <AppModalTitle class="identity-sharing-expired__title">
        Your share link has expired
      </AppModalTitle>
      <IdentitySharingTerms />
      <AppModalFooter with-border>
        <Button
          type="secondary"
          @click="$emit('input', false)"
        >
          Close
        </Button>
        <Button @click="$emit('open-create')">Generate new share link</Button>
      </AppModalFooter>
    </AppModalContent>
  </AppModal>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.identity-sharing-expired {
  &__head {
    margin-top: 32px;
  }

  &__title {
    margin-top: 16px;
  }
}
</style>
