<script setup>
import { useAttrs } from "vue";
import Button from "@/features/Button.vue";
import AppModalContent from "@/features/ui/AppModalContent.vue";
import AppModalFooter from "@/features/ui/AppModalFooter.vue";
import AppModalImage from "@/features/ui/AppModalImage.vue";
import AppModal from "@/features/ui/AppModal.vue";
import AppModalTitle from "@/features/ui/AppModalTitle.vue";
import AppModalParagraph from "@/features/ui/AppModalParagraph.vue";
import { assetUrl } from "@/scripts/assets";
defineProps({
  username: {
    type: String,
    required: true,
  },
  isV1User: {
    type: Boolean,
    required: true,
  },
});
const attrs = useAttrs();
const emit = defineEmits(["input", "close"]);
</script>
<template>
  <AppModal v-bind="attrs">
    <AppModalContent>
      <AppModalImage
        :src="assetUrl('@/assets/images/migration-announcement.png')"
        alt="Security upgrade required"
      />
      <AppModalTitle>Security upgrade required</AppModalTitle>
      <AppModalParagraph>
        Hey {{ username }}, to continue using Cloaked, you’ll need to complete a
        quick security upgrade. To begin, you’ll need to download your secret
        key and use it to create a new master password.
      </AppModalParagraph>
      <AppModalParagraph>
        This process should take less than 5 minutes to complete.
      </AppModalParagraph>
      <AppModalFooter>
        <Button
          @click="
            emit('input', false);
            emit('close');
          "
        >
          {{ isV1User ? "Download and continue" : "Continue" }}
        </Button>
      </AppModalFooter>
    </AppModalContent>
  </AppModal>
</template>
