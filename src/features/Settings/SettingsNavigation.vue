<script setup>
import { computed, onBeforeMount } from "vue";
import store from "@/store";
import MenuItem from "@/features/Settings/SettingsNavigationMenuItem.vue";
import { useDisplay } from "@/composables/useDisplay";
import SubscriptionService from "@/api/settings/subscription-services";
import { useEncryptionGate } from "@/composables/useEncryptionGate";
import { useBasicMode } from "@/composables/useBasicMode";

const { isMobile } = useDisplay();

onBeforeMount(() => {
  // NOTE: purposefully querying backend every time in case users subscription changes
  SubscriptionService.getSubscription();
});

const hasDDScan = computed(() => {
  return (
    store.getters["dataDelete/enrollmentData"]?.enrollmentDataFetched ?? false
  );
});

const { isEncryptionAvailable } = useEncryptionGate();
const { isBasicModeEnabled } = useBasicMode();

const items = computed(() => {
  let items = [
    {
      name: "Account",
      to: { name: "settings.account" },
    },
    {
      name: "Personal information",
      to: { name: "settings.personal-information" },
    },
    {
      name: "Forwarding",
      to: { name: "settings.forwarding" },
    },
  ];

  if (hasDDScan.value) {
    items.push({
      name: "Data Removal & Identity Monitoring",
      to: { name: "settings.dataRemoval" },
    });
  }

  if (store.state.settings.subscription !== null) {
    items.push({
      name: "Subscription",
      to: { name: "settings.subscription" },
    });
  }
  if (
    store.state.authentication?.user?.encryption_status === 1 ||
    store.getters.isV2User
  ) {
    items.push({
      name: "Recovery kit",
      to: { name: "settings.recovery" },
    });
  }
  if (store.state.authentication?.user?.cloaked_card_kyc_configured === true) {
    items.push({
      name: "Cloaked Pay",
      to: { name: "settings.cloaked-cards" },
    });
  }
  if (store.state.authentication?.user?.flags?.email_custom_domain) {
    items.push({
      name: "Email",
      to: { name: "settings.email" },
    });
  }

  if (!isEncryptionAvailable.value) {
    items = items.filter(
      (item) =>
        !["Personal information", "Forwarding", "Recovery kit"].includes(
          item.name
        )
    );
  }

  // Hide identity-related features for Basic Mode users
  if (isBasicModeEnabled.value) {
    items = items.filter(
      (item) => !["Personal information", "Forwarding"].includes(item.name)
    );
  }

  items.push({
    name: "Permissions",
    to: { name: "settings.permissions" },
  });

  return items;
});
</script>
<template>
  <nav
    class="settings-navigation"
    :class="{ 'desktop-only': !isMobile }"
  >
    <div class="settings-navigation__items">
      <MenuItem
        v-for="(item, index) in items"
        :key="index"
        :aria-id="`${item?.to?.name || ''}`"
        :link="item.to"
        :name="item.name"
      />
    </div>
  </nav>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.settings-navigation {
  background: $color-base-white-100;
  border-right: 1px solid $color-primary-10;
  display: flex;
  flex-direction: column;
  max-width: 280px;
  flex: 1 0 0;
  position: absolute;
  top: -9999px;
  left: -9999px;
  visibility: hidden;
  opacity: 0;

  &.desktop-only {
    top: auto;
    left: auto;
    visibility: visible;
    opacity: 1;
    position: static;
  }

  &__items {
    flex: 1 1 0;
    padding: 40px 20px;
    gap: 6px;
    display: flex;
    flex-direction: column;
    overflow: auto;
  }
}
</style>
