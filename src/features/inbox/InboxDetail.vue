<script setup>
import { useRoute } from "vue-router";
import { onBeforeMount, reactive } from "vue";
import InboxService from "@/api/actions/inbox-service";
import { decode } from "@/scripts/hash";
import router from "@/routes/router";
import inlineSvg from "@/features/InlineSvg";

const route = useRoute();

const state = reactive({
  thread: [],
  threadCount: 0,
  loading: false,
  identity: null,
});

onBeforeMount(() => {
  const hashedId = route?.params?.id;
  const realId = decode(hashedId);
  fetchActivity(realId);
});

function fetchActivity(id) {
  state.loading = true;
  InboxService.getActivityDetails(id)
    .then(({ data }) => {
      state.threadCount = data.thread_count;
      const activityType = data.email ? "emails" : "messages";
      router.push({ path: `/inbox/${activityType}/${data.thread_id}/` });
    })
    .catch(() => {
      state.loading = false;
    });
}
</script>

<template>
  <div class="loading-skeleton">
    <inlineSvg name="loading-small" />
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.loading-skeleton {
  position: fixed;
  left: 240px;
  height: calc(100vh - 60px);
  width: calc(100vw - 240px);
  z-index: -1;
  background-color: $color-base-white-100;
  display: flex;
  align-content: flex-start;
  flex-wrap: wrap;
  color: $color-primary-50;
  padding-top: 40px;

  svg {
    width: 40px;
    height: 40px;
  }
}
</style>
