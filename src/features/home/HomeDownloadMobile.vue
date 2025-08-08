<script setup>
import store from "@/store";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";

function downloadMobile() {
  store.dispatch("toggleMobileAppModal", true);
}
</script>
<template>
  <section class="mobile-section">
    <img
      src="@/assets/images/logo-tile.png"
      alt="Cloaked Logo Tile"
      height="89"
      class="icon"
    />
    <BaseText
      as="h1"
      variant="headline-3-bold"
    >
      Download Cloaked for iOS and Android
    </BaseText>
    <BaseText
      as="h2"
      variant="headline-6-medium"
    >
      Hide your identity and inboxes anywhere you go.
    </BaseText>
    <BaseButton
      variant="secondary"
      fullWidth
      icon="arrow-down"
      @click="downloadMobile"
    >
      Download
    </BaseButton>
  </section>
</template>
<style lang="scss" scoped>
.mobile-section {
  color: $color-primary-100;
  display: flex;
  padding: 24px;
  flex-direction: column;
  align-items: center;
  align-self: stretch;
  border-radius: 16px;
  border: 1px solid $color-primary-10;

  .icon {
    margin-top: -25px;
    margin-bottom: -25px;
  }

  .button {
    margin-top: 24px;
    > svg {
      height: 16px;
      width: 16px;
    }
  }
}
</style>
