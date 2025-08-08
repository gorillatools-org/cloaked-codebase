<script setup>
import InlineSvg from "@/features/InlineSvg";
import SidebarHeaderButton from "@/features/Sidebar/SidebarHeaderButton.vue";
import UiTooltip from "@/features/ui/ui-tooltip";
import { encode } from "@/scripts/hash";
import store from "@/store";
import router from "@/routes/router";
import IdentityService from "@/api/actions/identity-service";

import { nextTick, computed } from "vue";
import { cloakHelpers } from "@/scripts/cloakHelpers";

const props = defineProps({
  cloak: { type: Object, required: true },
});

const cloakedEmail = computed(() => {
  return cloakHelpers.getLatestDetailType("email", props.cloak) === "cloaked";
});

const cloakedPhone = computed(() => {
  return (
    cloakHelpers.getLatestDetailType("phone_number", props.cloak) === "cloaked"
  );
});

function showDeleteModal() {
  return store.dispatch("openModal", {
    header: "We get it, sometimes cloaks aren't meant to be",
    subheader: `Deleting this cloak means that ${
      props.cloak.nickname || "this contact"
    } will no longer be able to contact you
    unless you give them new contact information.`,
    paragraphs: [
      "It also means that we may not be able to help you sign in to any account associated with this cloak.",
    ],
    button: {
      text: "Yes, delete",
      danger: true,
      onClick: deleteCloak,
    },
  });
}

function deleteCloak() {
  store.dispatch("removeCloaks", [props.cloak.id]);
  store.dispatch("closeRightPanel");
  IdentityService.deleteCloak(props.cloak.id);
}

function toggleMute() {
  store.dispatch("updateCloaks", [
    {
      ...props.cloak,
      muted: !props.cloak.muted,
    },
  ]);
  IdentityService.updateMuteStatus(props.cloak.id, !props.cloak.muted);
}

function toggleFavorite() {
  const favoriteStatus = !props.cloak.favorited;
  store.dispatch("updateCloaks", [
    {
      ...props.cloak,
      favorited: favoriteStatus,
    },
  ]);
  const payload = { favorite: favoriteStatus };
  IdentityService.updateCloak(props.cloak.id, payload);
}

function handleActivityClick() {
  router.push({
    path: `/cloak/${encode(props.cloak.id)}/inbox/`,
  });
  nextTick(() => {
    store.dispatch("closeRightPanel");
  });
}

function toggleCompose() {
  store.commit("compose", props.cloak);
}

function formatCount(count) {
  if (count === 0) {
    return "";
  } else if (count > 99) {
    return "99+";
  } else {
    return count;
  }
}
</script>

<template>
  <section
    :key="cloak.id"
    class="cloak-actions header-actions"
  >
    <SidebarHeaderButton
      aria-id="GetActivityButton"
      wide
      tabindex="0"
      @click="handleActivityClick"
      @keydown.enter="handleActivityClick"
      @keydown.space="handleActivityClick"
    >
      <InlineSvg name="shelf-down-arrow" />
      Inbox
      <span class="unread-activities">
        {{ formatCount(cloak?.unread_activities?.all) }}
      </span>
    </SidebarHeaderButton>

    <UiTooltip
      aria-id="MuteButtonWrapper"
      align-x="right"
      max-width="210"
      :can-show="cloakedPhone || cloakedEmail"
    >
      <SidebarHeaderButton
        aria-id="MuteButton"
        :active="cloak && cloak.muted"
        :disabled="cloak && cloak.muted == null"
        tabindex="0"
        @click="toggleMute()"
        @keydown.enter="toggleMute()"
        @keydown.space="toggleMute()"
      >
        <InlineSvg
          v-if="cloak && cloak.muted"
          name="muted-filled"
        />
        <InlineSvg
          v-else
          name="bell"
        />
      </SidebarHeaderButton>

      <template #content>
        <div v-if="cloak && cloak.muted">
          This cloak is
          <strong>Ignored</strong>
          , which means you’ll never receive notifications or forwarded activity
          from it
        </div>

        <div v-else>
          <strong>Ignore</strong>
          if you never want to receive notifications or forwarded email or phone
          activity
        </div>
      </template>
    </UiTooltip>

    <UiTooltip
      aria-id="ComposeButtonWrapper"
      align-x="right"
      max-width="210"
      :can-show="cloakedEmail"
    >
      <SidebarHeaderButton
        aria-id="ComposeButton"
        :disabled="!cloakedEmail && !cloakedPhone"
        tabindex="0"
        @click="toggleCompose()"
        @keydown.enter="toggleCompose()"
        @keydown.space="toggleCompose()"
      >
        <InlineSvg name="compose" />
      </SidebarHeaderButton>

      <template #content>
        <div>
          <strong>Compose</strong>
          a new message with your Cloaked email address
        </div>
      </template>
    </UiTooltip>

    <UiTooltip
      align-x="right"
      max-width="210"
      aria-id="FavoriteButtonWrapper"
    >
      <SidebarHeaderButton
        aria-id="FavoriteButton"
        :active="cloak.favorited"
        tabindex="0"
        @click="toggleFavorite"
        @keydown.enter="toggleFavorite"
        @keydown.space="toggleFavorite"
      >
        <InlineSvg name="favorite" />
      </SidebarHeaderButton>

      <template #content>
        <div>
          <strong>Favorite</strong>
          the cloaks that you use most often in order to find them faster
        </div>
      </template>
    </UiTooltip>

    <UiTooltip
      v-if="cloak && !cloak.protected"
      aria-id="DeleteButtonWrapper"
    >
      <SidebarHeaderButton
        aria-id="DeleteButton"
        tabindex="0"
        @click="showDeleteModal()"
        @keydown.enter="showDeleteModal()"
        @keydown.space="showDeleteModal()"
      >
        <InlineSvg name="trash-outline" />
      </SidebarHeaderButton>

      <template #content>
        <div>
          Delete
          <span v-if="cloak.nickname">{{ cloak.nickname }}</span>
        </div>
      </template>
    </UiTooltip>
  </section>
</template>

<style lang="scss" scoped>
.cloak-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.unread-activities {
  font-size: 13px;
  line-height: 100%;
  font-weight: 500;
  color: $color-primary-50;
  border-radius: 12px;
  margin-left: 3px;
}
</style>
