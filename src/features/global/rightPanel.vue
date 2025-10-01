<script setup>
import CloakCreate from "@/routes/CloakCreate.vue";
import CloakDetails from "@/routes/CloakDetails.vue";
import CardPanel from "@/routes/CloakedCards/CardPanel.vue";
import store from "@/store";

import { onMounted, computed, watch } from "vue";

onMounted(() => {
  document.addEventListener("keydown", checkForSpecialKeys);
});

function checkForSpecialKeys($event) {
  if ($event?.key?.toLowerCase() === "escape") {
    if (!store.state.isMultiSelect && showRightPanel.value) {
      $event.stopPropagation();
      handleClosePanel();
    }
  }
}

function handleClosePanel() {
  store.dispatch("closeRightPanel");
}

async function handleCloakCreateDone(newCloak) {
  store.dispatch("openCloakDetails", { cloak: newCloak });
  store.dispatch("updateCloaks", [newCloak]);
  const newEvent = new CustomEvent("cloak:created");
  newEvent.data = newCloak;
  window.dispatchEvent(newEvent);
}

const showRightPanel = computed(() => {
  return store.getters.getRightPanelStatus;
});

const showCloakCreate = computed(() => {
  return store.getters.getCloakCreate;
});

const showCloakDetails = computed(() => {
  return store.getters.getCloakDetails;
});

const cloak = computed(() => {
  return store.getters.getCloak;
});

const showCardPanel = computed(() => {
  return store.getters.getCardPanel;
});

watch(
  () => showRightPanel.value,
  (value) => {
    if (value) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }
);
</script>

<template>
  <div>
    <section
      class="rightPanel"
      aria-id="RightPanel"
      :class="{ cards: showCardPanel }"
    >
      <CloakCreate
        v-if="showCloakCreate"
        @done="handleCloakCreateDone"
      />
      <CloakDetails
        v-else-if="showCloakDetails"
        :key="cloak && cloak.id"
      />
    </section>

    <CardPanel />

    <div
      class="overlay"
      @click="handleClosePanel"
    />
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.rightPanel {
  z-index: 451;
  position: fixed;
  top: 0;
  right: 0;
  width: 550px;
  height: 100vh;
  background: $color-base-white-100;
  border-left: 1px solid $color-primary-10;
  transition: all 0.4s ease;

  @include transform(translateX(550px));

  body.active-right-panel & {
    right: 0;
    transition: all 0.4s ease;

    @include transform(translateX(0));
  }

  &.cards {
    body.active-right-panel & {
      transition: all 0.4s ease;

      @include transform(translateX(-50px));
    }
  }
}

.overlay {
  z-index: 104;
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 100vh;
  background: rgba($black, 0.5);
  transition: all 0.4s ease;
  opacity: 0;
  visibility: hidden;

  body.active-right-panel & {
    opacity: 1;
    visibility: visible;
  }
}
</style>
