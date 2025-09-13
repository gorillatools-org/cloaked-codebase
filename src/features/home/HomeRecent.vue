<script setup>
import { computed } from "vue";
import store from "@/store";
import AtomIdentityMiniCards from "@/library/AtomIdentityMiniCards.vue";
import BaseText from "@/library/BaseText.vue";

const recentlyUsed = computed(() => {
  if (store.state.localdb?.db_cloaks) {
    return [...store.state.localdb.db_cloaks]
      .sort((a, b) => {
        return new Date(a.updated_at) < new Date(b.updated_at) ? 1 : -1;
      })
      .filter((c) => !c.protected)
      .slice(0, 10);
  }
  return [];
});
</script>
<template>
  <section
    v-if="recentlyUsed.length"
    class="recents"
  >
    <BaseText
      as="h1"
      variant="headline-3-bold"
    >
      Recent Identities
    </BaseText>
    <AtomIdentityMiniCards
      :identities="recentlyUsed"
      posthog-event="user_clicked_homepagerecentidentity"
      :preview-fields="['nickname', 'updated_at']"
    />
  </section>
</template>
