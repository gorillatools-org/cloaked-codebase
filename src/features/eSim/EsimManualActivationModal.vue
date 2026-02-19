<script setup>
import AppModalContent from "@/features/ui/AppModalContent.vue";
import AppModalParagraph from "@/features/ui/AppModalParagraph.vue";
import AppModalFooter from "@/features/ui/AppModalFooter.vue";
import AppModal from "@/features/ui/AppModal.vue";
import AppModalTitle from "@/features/ui/AppModalTitle.vue";
import AtomInputInternalLabels from "@/library/AtomInputInternalLabels.vue";
import ESimService from "@/api/actions/esim-service.js";
import { computed, reactive, watch } from "vue";
import BaseText from "@/library/BaseText.vue";
const props = defineProps({
  deviceType: {
    type: String,
    default: "ios",
  },
  simId: {
    type: [Number, null],
    required: true,
  },
  visible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close"]);

const state = reactive({
  loading: true,
  smdp: "",
  activationCode: "",
  smdpCodeCombo: "",
  deviceType: props.deviceType,
});

const steps = computed(() => {
  if (state.deviceType === "ios") {
    return {
      1: "Go to Settings > Cellular",
      2: 'Tap on "Add eSIM"',
      3: 'Tap "Scan QR Code"',
      4: 'Tap "Enter Details Manually"',
      5: 'Enter “SM-DP+ Address” and “Activation Code"',
    };
  }

  return {
    1: "Go to Settings > Network & Internet",
    2: "Tap “SIMs” > Tap “Add SIM”",
    3: "Tap “Set up an eSIM”",
    4: 'Tap "Try these troubleshooting steps"',
    5: 'Tap "Enter Details Manually"',
    6: 'Enter “Full String” or "SMDP and Activation Code"',
  };
});

const unwatchSimId = watch(
  () => props.simId,
  (newVal) => {
    if (newVal) {
      ESimService.getEsimProfile(props.simId)
        .then((resp) => {
          state.smdp = resp?.data?.profile?.activationCode.split("$")[1];
          state.activationCode = resp?.data?.profile?.matchingId;
          state.smdpCodeCombo = resp?.data?.profile?.activationCode;
          state.loading = false;
          unwatchSimId();
        })
        .catch(() => {
          state.loading = false;
        });
    }
  },
  { immediate: true }
);
</script>

<template>
  <AppModal
    :value="props.visible"
    @close="emit('close')"
  >
    <AppModalContent class="content-wrapper">
      <AppModalTitle>Didn't receive a notification?</AppModalTitle>
      <AppModalParagraph>
        Follow these steps to setup on your {{ state.deviceType }} device:
      </AppModalParagraph>
      <AppModalParagraph>
        <div class="toggle-widget">
          <BaseText
            as="div"
            variant="body-3-semibold"
            class="toggle-option"
            :class="{ active: state.deviceType === 'ios' }"
            @click="state.deviceType = 'ios'"
          >
            iOS
          </BaseText>
          <BaseText
            as="div"
            variant="body-3-semibold"
            class="toggle-option"
            :class="{ active: state.deviceType === 'android' }"
            @click="state.deviceType = 'android'"
          >
            Android
          </BaseText>
        </div>
      </AppModalParagraph>
      <AppModalParagraph class="steps-list">
        <div
          v-for="key in Object.keys(steps)"
          :key="key"
          class="step-wrapper"
        >
          <BaseText
            variant="body-3-semibold"
            class="number-key"
          >
            {{ key }}
          </BaseText>
          <BaseText variant="body-2-semibold">{{ steps[key] }}</BaseText>
        </div>
      </AppModalParagraph>
      <AppModalParagraph>
        <AtomInputInternalLabels
          v-if="state.deviceType === 'android'"
          readonly
          :value="state.smdpCodeCombo"
          :is-loading="state.loading"
          label="Full String"
        />
      </AppModalParagraph>
      <AppModalParagraph
        v-if="state.deviceType === 'android'"
        class="separator"
      >
        <BaseText variant="body-small-medium">OR</BaseText>
      </AppModalParagraph>
      <AppModalParagraph>
        <AtomInputInternalLabels
          readonly
          :value="state.smdp"
          :is-loading="state.loading"
          label="SM-DP+ Address"
        />
      </AppModalParagraph>
      <AppModalParagraph>
        <AtomInputInternalLabels
          readonly
          :value="state.activationCode"
          :is-loading="state.loading"
          label="Activation Code"
        />
      </AppModalParagraph>
      <AppModalFooter />
    </AppModalContent>
  </AppModal>
</template>
<style lang="scss" scoped>
/* stylelint-disable */
.separator {
  background: $color-primary-20;
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 1px;
  width: 70%;
  align-self: center;

  span {
    margin: 0 56px;
    background: $color-base-white-100;
    padding: 0 12px;
  }
}

.content-wrapper {
  border: 1px solid $color-primary-10;
  box-shadow: 0 0 100px 0 rgba($black, 0.5);
  backdrop-filter: blur(15px);
}

.toggle-widget {
  border-radius: 8px;
  background-color: $color-primary-5;
  display: flex;
  flex-direction: row;
  gap: 0;
  align-items: center;
  justify-content: center;
  width: 100%;

  .toggle-option {
    cursor: pointer;
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    border-radius: 8px;

    &.active {
      background-color: $color-base-white-100;
      color: $color-primary-100;
      box-shadow: 0 4px 15px 0 rgba($color-primary-100-light, 0.1);
      border: 1.5px solid $color-primary-10;
    }
  }
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .step-wrapper {
    color: $color-primary-100;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
    justify-content: flex-start;

    .number-key {
      text-align: center;
      color: $color-primary-1;
      background-color: $color-primary-100;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
