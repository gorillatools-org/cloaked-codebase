<script setup lang="ts">
import { onMounted, computed, ref } from "vue";
import CallGuardActivityList from "@/features/CallGuard/CallGuardActivityList.vue";
import CallGuardStatus from "@/features/CallGuard/CallGuardStatus.vue";
import CallGuardLoading from "@/features/CallGuard/CallGuardLoading.vue";
import CallGuardDownloadApp from "@/features/CallGuard/CallGuardDownloadApp.vue";
import store from "@/store";

const calls = computed(() => store.state.callGuard.calls || []);
const isSetupComplete = computed(
  () => store.getters["callGuard/isSetupComplete"]
);
const isLoading = computed(() => store.getters["callGuard/isLoading"]);
const isInitialized = ref(false);

onMounted(async () => {
  if (calls.value.length > 0) {
    isInitialized.value = true;
    return;
  }

  try {
    await store.dispatch("callGuard/fetchSetupStatus");
    if (isSetupComplete.value) {
      await store.dispatch("callGuard/fetchCalls");
    }
  } catch (error) {
    console.error(error);
  } finally {
    isInitialized.value = true;
  }
});
</script>

<template>
  <div class="page-call-guard">
    <div class="page-call-guard__content">
      <CallGuardActivityList
        v-if="isInitialized"
        :calls="calls"
        :is-setup-complete="isSetupComplete"
      />
      <CallGuardLoading v-else-if="isLoading || !isInitialized" />
    </div>

    <div
      v-if="isInitialized"
      class="page-call-guard__aside"
    >
      <CallGuardStatus
        :calls="calls"
        :is-setup-complete="isSetupComplete"
      />
      <CallGuardDownloadApp :is-setup-complete="isSetupComplete" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.page-call-guard {
  display: flex;
  flex-direction: column-reverse;
  height: 100%;
  padding: 0 8px 8px 0;
  gap: 8px;
  overflow-y: auto;

  @media (min-width: 1024px) {
    flex-direction: row;
    overflow-y: hidden;
    height: 100vh;
  }

  &__content {
    flex: 1;
    background-color: $color-primary-5;
    border-radius: 20px;
    overflow-y: auto;
    @include custom-scroll-bar;
    height: 100%;

    @media (max-width: 1024px) {
      opacity: 0;
      top: -9999px;
      left: -9999px;
      position: absolute;
    }
  }

  &__aside {
    width: 100%;
    flex-grow: 1;
    background-color: $color-primary-5;
    border-radius: 20px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 32px;

    @media (min-width: 1024px) {
      width: 406px;
      flex-grow: 0;
      overflow-y: auto;
      @include custom-scroll-bar;
    }
  }
}
</style>
