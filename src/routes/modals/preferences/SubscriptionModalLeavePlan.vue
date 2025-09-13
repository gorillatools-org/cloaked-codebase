<script setup>
import AppModal from "@/features/ui/AppModal.vue";
import AppModalContent from "@/features/ui/AppModalContent.vue";
import AppModalTitle from "@/features/ui/AppModalTitle.vue";
import AppModalParagraph from "@/features/ui/AppModalParagraph.vue";
import AppModalFooter from "@/features/ui/AppModalFooter.vue";
import BaseButton from "@/library/BaseButton.vue";
import store from "@/store";
import { ref } from "vue";
import { useToast } from "@/composables/useToast.js";
import { usePlans } from "@/features/subscribe/composables/usePlans";
import { usePlanType } from "@/features/subscribe/composables/usePlanType.js";

const { activePlan } = usePlans();
const planType = usePlanType(activePlan);

const emit = defineEmits(["input"]);

const isCancellingSubscription = ref(false);

const { success, error } = useToast();

const onCancel = async () => {
  try {
    isCancellingSubscription.value = true;
    await store.dispatch("subscription/cancelSubscription");
    success("You are now on a limited plan");
    emit("input", false);
  } catch {
    error("Failed to cancel subscription");
  } finally {
    isCancellingSubscription.value = false;
  }
};
</script>

<template>
  <AppModal
    v-bind="$attrs"
    :has-outside-click-close="true"
    @input="$emit('input', $event)"
  >
    <AppModalContent>
      <AppModalTitle size="sm">Leave Cloaked {{ planType }} Plan</AppModalTitle>
      <AppModalParagraph>
        Your subscription is paid and managed by another Cloaked member.
      </AppModalParagraph>
      <AppModalFooter>
        <BaseButton
          variant="primary"
          background-color="danger"
          :icon="isCancellingSubscription ? 'spinner' : ''"
          @click="onCancel"
        >
          <template v-if="isCancellingSubscription">
            Downgrading to limited plan
          </template>
          <template v-else>Downgrade to limited plan</template>
        </BaseButton>
        <BaseButton
          variant="secondary"
          @click="$emit('input', false)"
        >
          Cancel
        </BaseButton>
      </AppModalFooter>
    </AppModalContent>
  </AppModal>
</template>
