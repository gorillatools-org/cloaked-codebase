<script setup>
import UiHeader from "@/features/eSim/UiHeader.vue";
import UiButton from "@/features/eSim/UiButton.vue";
import UiButtonRow from "@/features/eSim/UiButtonRow.vue";
import UiPageWrapper from "@/features/eSim/UiPageWrapper.vue";
import InlineSvg from "@/features/InlineSvg";
import AtomInputInternalLabels from "@/library/AtomInputInternalLabels.vue";
import { PH_SCREEN_EVENT_ESIM_COMPLETE_ESIM_SCREEN } from "@/scripts/posthogEvents";
import router from "@/routes/router";
import { format } from "@/scripts/format";
const props = defineProps({
  newNumber: {
    type: String,
    required: true,
  },
});
</script>
<template>
  <UiPageWrapper
    show-logo
    logo="cloaked-esim-logo"
    :screen-event="PH_SCREEN_EVENT_ESIM_COMPLETE_ESIM_SCREEN"
    :esim-step="8"
  >
    <UiHeader
      left-align
      max-width="450px"
    >
      <h2>Your Cloaked eSIM setup is complete!</h2>
      <h5>Your eSIM is now ready to use.</h5>
      <AtomInputInternalLabels
        label="Your eSIM Number"
        type="text"
        center
        :placeholder="format.phone_format(props.newNumber)"
        :value="format.phone_format(props.newNumber)"
        :disabled="true"
        readonly
      />
    </UiHeader>
    <InlineSvg name="esim-simcheck" />
    <UiButtonRow>
      <div class="button-row-col">
        <UiButton
          gradient
          @click="router.push({ name: 'Home' })"
        >
          Finish
        </UiButton>
        <div
          class="esim-button"
          @click="router.push({ name: 'Esim' })"
        >
          Manage eSIM
        </div>
      </div>
    </UiButtonRow>
  </UiPageWrapper>
</template>
<style lang="scss" scoped>
.button-row-col {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 24px;
  width: 100%;

  .esim-button {
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    color: $color-primary-100;
    cursor: pointer;
    text-decoration: underline;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
      transition: transform 0.3s ease;
    }
  }
}
</style>
