<script setup>
import HomeIdentityDisplay from "@/features/home/HomeIdentityDisplay.vue";
import IdentityService from "@/api/actions/identity-service";
import store from "@/store";
import { posthogCapture } from "@/scripts/posthog.js";
import { format } from "@/scripts/format";
import BaseText from "@/library/BaseText.vue";

const topIdentityList = [
  { name: "Amazon", website: "amazon.com", icon: "amazon" },
  { name: "Google", website: "google.com", icon: "google" },
  { name: "Facebook", website: "facebook.com", icon: "facebook" },
  { name: "Temu", website: "temu.com", icon: "temu" },
  { name: "X (Twitter)", website: "x.com", icon: "twitter" },
  { name: "Walmart", website: "walmart.com", icon: "walmart" },
  { name: "Discord", website: "discord.com", icon: "discord" },
  { name: "Reddit", website: "reddit.com", icon: "reddit" },
  { name: "Coinbase", website: "coinbase.com", icon: "coinbase" },
  { name: "TikTok", website: "tiktok.com", icon: "tiktok" },
];

function createCloak(listItem) {
  posthogCapture("user_clicked_topidentities", {
    name: listItem.name,
  });

  const payload = {
    app_ref: listItem.name,
    nickname: listItem.name,
    website_url: new URL(format.standardizeUrl(listItem.website)),
    category: "website",
  };

  IdentityService.createIdentity(payload).then(({ data }) => {
    openCloakDetails(data);
  });

  function openCloakDetails(newCloak) {
    store.dispatch("openCloakDetails", { cloak: newCloak });
    store.dispatch("updateCloaks", [newCloak]);
    const newEvent = new CustomEvent("cloak:created");
    newEvent.data = newCloak;
    window.dispatchEvent(newEvent);
  }
}
</script>
<template>
  <section class="identities">
    <BaseText
      as="h1"
      variant="headline-3-bold"
    >
      Create a new identity
    </BaseText>
    <BaseText
      as="h2"
      variant="headline-6-medium"
      class="subtitle"
    >
      The most popular identities created on Cloaked. Click to create one for
      yourself.
    </BaseText>
    <div class="identity-group">
      <div class="identity-list-wrapper">
        <HomeIdentityDisplay
          v-for="(data, idx) in topIdentityList.slice(0, 5)"
          :key="`${data.name}-${idx}`"
          :name="data.name"
          :website="data.website"
          :icon="data.icon"
          @click-create="createCloak(data)"
        />
      </div>
      <div class="identity-list-wrapper">
        <HomeIdentityDisplay
          v-for="(data, idx) in topIdentityList.slice(5, 10)"
          :key="`${data.name}-${idx}`"
          :name="data.name"
          :website="data.website"
          :icon="data.icon"
          @click-create="createCloak(data)"
        />
      </div>
    </div>
  </section>
</template>
<style lang="scss" scoped>
.subtitle {
  padding: 0;
  margin-top: 9px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 6.5px;
}

.identity-group {
  margin-top: 24px;
  border-radius: 16px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  width: 100%;
  border: 1px solid $color-primary-10;
  padding: 0 18px 24px;
  min-width: 480px;

  .identity-list-wrapper {
    width: calc(50% - 12px);
    margin-top: 17px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}
</style>
