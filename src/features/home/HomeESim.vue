<script setup>
import InlineSvg from "@/features/InlineSvg.vue";
import store from "@/store";
import { computed } from "vue";
import router from "@/routes/router";
import { ESIM_STATE_DISPLAY } from "@/scripts/constants";
import { useToast } from "@/composables/useToast.js";
import { tools } from "@/scripts/tools";
import { format } from "@/scripts/format";
import BaseText from "@/library/BaseText.vue";
const toast = useToast();
const esim = computed(() => {
  // NOTE: only show 1 esim for now
  return store.getters["esim/getEsims"][0];
});

function goToEsimPage() {
  router.push({ name: "Esim" });
}

function copyText(text) {
  tools.copyToClipboard(text);
  toast.success("Copied to clipboard");
}
</script>
<template>
  <div class="page-wrapper">
    <div class="header-row">
      <BaseText
        variant="headline-3-bold"
        as="h1"
      >
        eSIM Numbers
      </BaseText>
      <BaseText
        variant="body-3-semibold"
        as="span"
        underline
        class="toggle"
        @click="goToEsimPage"
      >
        Manage eSIM
      </BaseText>
    </div>
    <section
      class="section-wrapper pointer"
      @click="copyText(esim.msisdn)"
    >
      <div class="flex-row">
        <div class="flex-col">
          <div class="flex-row-center-start">
            <BaseText variant="headline-4-bold">
              {{ format.phone_format(esim.msisdn) }}
            </BaseText>
            <InlineSvg name="fuzzy-green-dot" />
          </div>
          <BaseText
            variant="body-small-medium"
            as="div"
          >
            Your eSIM is {{ ESIM_STATE_DISPLAY[esim.state] }}.
          </BaseText>
        </div>
        <InlineSvg name="copy" />
      </div>
    </section>
  </div>
</template>
<style scoped lang="scss">
.page-wrapper {
  margin-bottom: 48px;
}

.header-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  color: $color-primary-100;

  .toggle {
    cursor: pointer;
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
  margin-top: 16px;
  gap: 14px;
  background-color: $color-base-white-100;
  cursor: pointer;
  transition: all 0.3s ease;
  color: $color-primary-100;

  &:hover {
    transform: scale(1.01);
    transition: all 0.3s ease;
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
</style>
