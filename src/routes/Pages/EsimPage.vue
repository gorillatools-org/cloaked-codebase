<script setup>
import { onMounted, computed, reactive } from "vue";
import EsimService from "@/api/actions/esim-service.js";
import store from "@/store";
import InlineSvg from "@/features/InlineSvg.vue";
import { useToast } from "@/composables/useToast.js";
import AtomProgressBar from "@/library/AtomProgressBar.vue";
import { ESIM_STATE_DISPLAY, HELP_CENTER_BASE_URL } from "@/scripts/constants";
import EsimManualActivationModal from "@/features/eSim/EsimManualActivationModal.vue";
import { tools } from "@/scripts/tools";
import { format } from "@/scripts/format";
import BaseText from "@/library/BaseText.vue";

const toast = useToast();

const state = reactive({
  showModal: false,
  simId: null,
});

onMounted(() => {
  EsimService.getSims({ number: true }).then((response) => {
    state.simId = response?.data?.results[0]?.id;
    EsimService.getSimUsage(response?.data?.results[0]?.id);
  });
});

const esims = computed(() => {
  // NOTE: only show 1 esim for now
  return store.getters["esim/getEsims"]?.slice(0, 1);
});

const firstSim = computed(() => {
  // NOTE: only show 1 esim for now
  return esims.value[0];
});

const usageData = computed(() => {
  return store.getters["esim/getUsageData"](firstSim.value?.id);
});

function copyText(text) {
  tools.copyToClipboard(text);
  toast.success("Copied to clipboard");
}

function calculatePercentage(remaining, used) {
  remaining = parseInt(remaining) || 0;
  used = parseInt(used) || 0;
  return (remaining / (remaining + used)) * 100;
}
</script>
<template>
  <div class="esim-page-wrapper">
    <EsimManualActivationModal
      :visible="state.showModal"
      :sim-id="state.simId"
      @close="state.showModal = false"
    />
    <div class="icon-row">
      <InlineSvg
        name="esim-simcard-variant"
        class="background-icon"
      />
      <InlineSvg
        name="help"
        class="help-icon"
        @click="state.showModal = true"
      />
    </div>
    <section
      v-for="(esim, index) in esims"
      :key="esim.id"
      class="section-wrapper pointer"
      :class="{
        first: index === 0,
      }"
      @click="copyText(esim.msisdn)"
    >
      <div class="flex-row">
        <div class="flex-col">
          <div class="flex-row-center-start">
            <BaseText variant="headline-4-bold">
              {{ format.phone_format(esim.msisdn) }}
            </BaseText>
            <InlineSvg
              :name="
                esim.state === 'activated'
                  ? 'fuzzy-green-dot'
                  : 'fuzzy-orange-dot'
              "
            />
          </div>
          <BaseText
            as="div"
            variant="body-small-medium"
            class="subtitle"
          >
            Your eSIM is {{ ESIM_STATE_DISPLAY[esim.state] }}.
          </BaseText>
        </div>
        <InlineSvg name="copy" />
      </div>
    </section>

    <section class="section-wrapper">
      <div>
        <BaseText
          as="div"
          variant="headline-4-bold"
        >
          Cloaked eSIM best practices
        </BaseText>
        <BaseText
          as="div"
          variant="body-small-medium"
          class="subtitle"
        >
          Your Cloaked eSIM is separate from your cellular carrier and has its
          own limits for calls and data.
        </BaseText>
      </div>
      <div class="flex-row-center-start">
        <InlineSvg
          name="check-active"
          class="list-icon success"
        />
        <BaseText
          as="div"
          variant="body-small-medium"
        >
          Use your eSIM for secure calls and texts
        </BaseText>
      </div>
      <div class="flex-row-center-start">
        <InlineSvg
          name="x-circle"
          class="list-icon brand-one"
        />
        <BaseText
          as="div"
          variant="body-small-medium"
        >
          Don't use your eSIM for cellular data
        </BaseText>
      </div>
      <div class="flex-row-center-start">
        <InlineSvg
          name="lock-shield-filled"
          class="list-icon brand-three"
        />
        <BaseText
          as="div"
          variant="body-small-medium"
        >
          Keep your eSIM secure by only sharing it when necessary
        </BaseText>
      </div>
    </section>

    <section class="section-wrapper">
      <div>
        <BaseText
          as="div"
          variant="headline-4-bold"
        >
          When to use your eSIM number
        </BaseText>
        <BaseText
          as="div"
          variant="body-small-medium"
          class="subtitle"
        >
          Your Cloaked eSIM is an ultra-secure number that you should only share
          when sensitive information is at stake.
        </BaseText>
      </div>
      <div class="flex-row-center-start">
        <InlineSvg
          name="bank-filled"
          class="list-icon brand-six"
        />
        <BaseText
          as="div"
          variant="body-small-medium"
        >
          To secure financial accounts
        </BaseText>
      </div>
      <div class="flex-row-center-start">
        <InlineSvg
          name="hospital-plus"
          class="list-icon brand-one"
        />
        <BaseText
          as="div"
          variant="body-small-medium"
        >
          To protect medical data
        </BaseText>
      </div>
      <div class="flex-row-center-start">
        <InlineSvg
          name="chat-imessage"
          class="list-icon brand-three"
        />
        <BaseText
          as="div"
          variant="body-small-medium"
        >
          When iMessage is required
        </BaseText>
      </div>
      <div class="flex-row-center-start">
        <InlineSvg
          name="phone-check"
          class="list-icon lt-green"
        />
        <BaseText
          as="div"
          variant="body-small-medium"
        >
          When standard Cloaked numbers are rejected
        </BaseText>
      </div>
    </section>

    <div
      v-if="firstSim"
      class="flex-row data-wrapper"
    >
      <section class="section-wrapper no-gap">
        <BaseText
          as="div"
          variant="body-small-medium"
        >
          Available Data
        </BaseText>
        <BaseText
          as="div"
          variant="headline-3-bold"
        >
          {{
            `${format.formatNumbersBasedonLocale(
              usageData?.data?.remaining_data_in_mb || 0
            )}mb`
          }}
        </BaseText>

        <AtomProgressBar
          class="progress-bar"
          :percent="
            (usageData?.data?.remaining_data_in_mb /
              usageData?.data?.total_data_allowed_in_mb) *
            100
          "
          top-color="linear-gradient(100deg, #DD0EA3 20%, #FF4163 70%)"
          bottom-color="#FF416330"
          height="6px"
        />
      </section>

      <section class="section-wrapper no-gap">
        <BaseText
          as="div"
          variant="body-small-medium"
        >
          Available call time
        </BaseText>
        <BaseText
          as="div"
          variant="headline-3-bold"
        >
          {{
            `${format.formatNumbersBasedonLocale(
              usageData?.voice?.remaining || 0
            )}min`
          }}
        </BaseText>
        <AtomProgressBar
          class="progress-bar"
          :percent="
            calculatePercentage(
              usageData?.voice?.remaining,
              usageData?.voice?.used
            )
          "
          top-color="linear-gradient(100deg, #0CC4A0 20%, #11C3E9 70%)"
          bottom-color="#11C3E930"
          height="6px"
        />
      </section>
    </div>
    <BaseText
      v-if="firstSim"
      as="div"
      variant="caption-semibold"
      class="footer"
    >
      Call and data limits are refreshed on a monthly basis. Text messages are
      unlimited. To increase your data or call time,
      <a
        class="link"
        :href="HELP_CENTER_BASE_URL"
        target="_blank"
      >
        contact Cloaked support.
      </a>
    </BaseText>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.esim-page-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  padding: 24px;
  .icon-row {
    height: 500px;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: center;
    .help-icon {
      width: 20px;
      height: 20px;
      color: $color-primary-100;
      cursor: pointer;
      transition: all 0.3s ease;
      &:hover {
        transform: scale(1.05);
        transition: all 0.3s ease;
      }
    }
  }

  .section-wrapper {
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    padding: 24px;
    border: 1px solid $color-primary-10;
    border-radius: 12px;
    width: 100%;
    max-width: 640px;
    gap: 14px;
    background-color: $color-base-white-100;
    color: $color-primary-100;
    &.first {
      margin-top: -80px;
    }
    &.no-gap {
      gap: 0;
    }
  }
}

.flex-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
}
.flex-row-center-start {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
}
.flex-col {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 8px;
}

.pointer {
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    transform: scale(1.01);
    transition: all 0.3s ease;
  }
}

.subtitle {
  color: $color-primary-70;
  margin-top: 4px;
}

.data-wrapper {
  width: 100%;
  max-width: 640px;
}

.progress-bar {
  margin-top: 8px;
}

.footer {
  color: $color-primary-70;
  text-align: left;
  width: 100%;
  max-width: 640px;
  .link {
    text-decoration-line: underline;
    transition: all 0.3s ease;
    &:hover {
      color: $color-primary-100;
      transform: scale(1.05);
      transition: all 0.3s ease;
    }
  }
}

.list-icon {
  width: 24px;
  height: 24px;
  color: $color-primary-100;
  &.success {
    color: $color-success;
  }
  &.brand-one {
    color: $color-brand-1-100;
  }
  &.brand-three {
    color: $color-brand-3-100;
  }
  &.brand-six {
    color: $color-brand-6-100;
  }
  &.lt-green {
    color: $color-lt-green;
  }
}
</style>
