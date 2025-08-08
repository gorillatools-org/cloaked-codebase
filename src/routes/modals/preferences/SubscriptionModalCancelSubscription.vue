<script setup>
import AppModal from "@/features/ui/AppModal.vue";
import AppModalContent from "@/features/ui/AppModalContent.vue";
import AppModalTitle from "@/features/ui/AppModalTitle.vue";
import AppModalParagraph from "@/features/ui/AppModalParagraph.vue";
import AppModalFooter from "@/features/ui/AppModalFooter.vue";
import Button from "@/features/Button.vue";
import store from "@/store";
import { ref, toRef } from "vue";
import { useToast } from "@/composables/useToast.js";
import InlineSvg from "@/features/InlineSvg.vue";
import { useFormattedDate } from "@/composables/useFormattedDate";

defineProps({
  value: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["input"]);

const isCancellingSubscription = ref(false);

const { success, error } = useToast();

const onCancel = async () => {
  try {
    isCancellingSubscription.value = true;
    await store.dispatch("subscription/cancelSubscriptionRenewal");
    success("Your subscription was cancelled successfully");
    emit("input", false);
  } catch {
    error("Failed to cancel subscription");
  } finally {
    isCancellingSubscription.value = false;
  }
};

const subscriptionEndDate = useFormattedDate(
  toRef(() => store.getters["settings/getSubscription"]?.expires_date)
);
</script>

<template>
  <AppModal
    :value="value"
    :has-outside-click-close="true"
    @input="$emit('input', $event)"
  >
    <AppModalContent>
      <AppModalTitle size="sm">Confirm cancellation</AppModalTitle>
      <AppModalParagraph>
        If you cancel this subscription, your subscription will end on
        {{ subscriptionEndDate }} and you will no longer have access to $1
        million in identity theft insurance after this date. Please complete the
        feedback survey that opens once you cancel your subscription.
      </AppModalParagraph>
      <AppModalFooter>
        <Button
          type="secondary"
          @click="$emit('input', false)"
        >
          Not now
        </Button>
        <Button
          type="danger"
          @click="onCancel"
        >
          <template v-if="isCancellingSubscription">
            Cancelling
            <InlineSvg name="spinner" />
          </template>
          <template v-else>Confirm</template>
        </Button>
      </AppModalFooter>
    </AppModalContent>
  </AppModal>
</template>
