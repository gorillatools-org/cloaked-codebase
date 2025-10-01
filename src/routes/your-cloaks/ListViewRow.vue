<script setup>
import { reactive, ref, computed, markRaw } from "vue";
import InlineSvg from "@/features/InlineSvg.vue";
import UiTooltip from "@/features/ui/ui-tooltip.vue";
import router from "@/routes/router";
import store from "@/store";
import { useToast } from "@/composables/useToast.js";
const toast = useToast();
import IdentityService from "@/api/actions/identity-service";
import CategoryService from "@/api/actions/category-service";
import AddEditNewCategory from "@/routes/modals/categories/AddEditNewCategory";
import { authDecrypt } from "@/scripts/actions/encryption";
import { getIdentityNickname } from "@/scripts/format";
import { posthogCapture } from "@/scripts/posthog.js";
import IdentityIcon from "@/features/ui/IdentityIcon.vue";
import UiMenu from "@/features/UiMenu/UiMenu.vue";
import UiMenuButton from "@/features/UiMenu/UiMenuButton.vue";
import UiMenuSeparator from "@/features/UiMenu/UiMenuSeparator.vue";
import { tools } from "@/scripts/tools";
import { hash } from "@/scripts/hash";
import BaseText from "@/library/BaseText.vue";
import BaseTextHiddenDots from "@/library/BaseTextHiddenDots.vue";

const emit = defineEmits(["select"]);

const props = defineProps({
  identity: {
    type: Object,
    default: null,
  },
  selected: {
    type: Boolean,
    default: false,
  },
});

const state = reactive({
  catMenuVisible: false,
});

const menuOpen = ref(false);

const tooltipText = ref("Click to copy");

const identity = computed(() => {
  return store.state.localdb.db_cloaks.find(
    (cloak) => cloak.id === props.identity.id
  );
});

const allCategories = computed(() => {
  return store.getters["getCategories"];
});

const isMuted = computed(() => {
  return identity.value.muted;
});

const isFavorited = computed(() => {
  return identity.value.favorited;
});

const hasCloakedPhoneOrEmail = computed(() => {
  return identity.value.is_cloaked_phone || identity.value.is_cloaked_email;
});

const currentCategoryId = computed(() => {
  if (identity.value?.categories) {
    return identity.value.categories[0];
  }
  return null;
});

const nickname = computed(() => {
  return getIdentityNickname(identity.value);
});

const phone = computed(() => {
  return identity.value.phone;
});

const email = computed(() => {
  return identity.value.email;
});

const username = computed(() => {
  return identity.value.username;
});

const hasPassword = computed(() => {
  return (
    identity.value.has_password ||
    identity.value.password ||
    identity.value.stored_password?.password ||
    identity.value.stored_autofill?.password
  );
});

const currentCategoryName = computed(() => {
  const currentCat = allCategories.value.find(
    (cat) => currentCategoryId.value === cat.id
  );
  if (currentCat) {
    return currentCat.name;
  }
  return null;
});

function toggleFavorite() {
  menuOpen.value = false;
  IdentityService.updateCloak(identity.value.id, {
    favorite: !identity.value.favorited,
  }).then(() => {
    if (identity.value.favorited) {
      toast.success("Identity removed from Favorites");
    } else {
      toast.success("Identity added to Favorites");
    }
    updateIdentity({ ...identity.value, favorited: !identity.value.favorited });
  });
}

function clickToCopyPassword() {
  if (hasPassword.value) {
    IdentityService.patchIdentityUpdatedAt(props.identity.id);
    store.dispatch("fetchPopulatedData", identity.value).then(async (data) => {
      const encryptedPassword =
        data.stored_password?.password || data.stored_autofill?.password || "";
      const decryptedPassword = await authDecrypt(encryptedPassword);
      tools.copyToClipboard(decryptedPassword);

      tooltipText.value = "Copied";
      posthogCapture("user_copied_identifier", {
        identifier: "password",
      });
    });
  }
}

function clickToCopy(field, value) {
  tools.copyToClipboard(value);
  tooltipText.value = "Copied";
  IdentityService.patchIdentityUpdatedAt(props.identity.id);
  posthogCapture("user_copied_identifier", {
    identifier: field,
  });
}

function resetTooltipText() {
  setTimeout(() => {
    tooltipText.value = "Click to copy";
  });
}

function navToInbox(identityId) {
  router.push({
    path: `/cloak/${hash.encode(identityId)}/inbox/`,
  });
}

function showCatMenu(show) {
  state.catMenuVisible = show;
}

function toggleMute() {
  menuOpen.value = false;
  if (hasCloakedPhoneOrEmail.value) {
    const payload = {
      identity_ids: [identity.value.id],
      mute: !identity.value.muted,
    };
    IdentityService.updateMuteState(payload).then(() => {
      if (identity.value.muted) {
        toast.success("Identity Unignored");
      } else {
        toast.success("Identity Ignored");
      }
      updateIdentity({ ...identity.value, muted: !identity.value.muted });
    });
  }
}

function openCompose() {
  menuOpen.value = false;
  store.commit("replyTo", {
    identity: identity.value,
  });
}

function openDetails() {
  menuOpen.value = false;
  store.dispatch("openCloakDetails", { cloak: identity.value });
}

function openCategoryAddModal() {
  menuOpen.value = false;
  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(AddEditNewCategory),
      props: {
        noRedirect: true,
        isVisible: true,
      },
      events: {
        addIdentity: (cat) => moveToCat(cat),
      },
    },
  });
}

function moveToCat(category) {
  menuOpen.value = false;
  state.catMenuVisible = false;
  CategoryService.addCloaksToCategory(category.id, [identity.value.id])
    .then(() => {
      toast.success(`Identity added to ${category.name}`);
      window.dispatchEvent(new CustomEvent("category:identities"));
      updateIdentity({ ...identity.value, categories: [category.id] });
    })
    .catch(() => {
      toast.error("Error adding identity to category");
    })
    .finally(() => {
      state.loading = false;
    });
}

function updateIdentity(newIdentityData) {
  return store.dispatch("updateCloaks", [newIdentityData]);
}

function confirmDelete() {
  menuOpen.value = false;
  return store.dispatch("openModal", {
    header: `Delete ${nickname.value}?`,
    paragraphs: [
      `Deleting this cloak means that ${nickname.value} will no longer be able to contact you unless you give them new contact information.`,
      "It also means that we won’t be able to help you sign in to any account associated with that information.",
    ],
    closeAfterOnClick: true,
    button: {
      text: "Yes, delete",
      danger: true,
      onClick: triggerDelete,
    },
  });
}

function triggerDelete() {
  store.dispatch("deleteCloakFromLocalDB", [identity.value.id]);
  return IdentityService.deleteCloak(identity.value.id)
    .then(() => {
      toast.success("Identity deleted");
    })
    .catch(() => {
      toast.error("Error deleting your identity.");
    });
}

function removeIdentityFromCategory() {
  menuOpen.value = false;
  state.catMenuVisible = false;
  toast.success(`Removing identity from "${currentCategoryName.value}"...`);
  CategoryService.removeCloaksFromCategory(currentCategoryId?.value, [
    identity?.value?.id,
  ])
    .then(() => {
      toast.success(`Identity removed!`);
    })
    .catch(() => {
      toast.error(
        `Error removing identity from "${currentCategoryName.value}"`
      );
    });
}
</script>

<template>
  <div
    class="list-view-item row"
    @click="openDetails"
  >
    <div class="row">
      <UiTooltip
        align-x="center"
        title="Select identity"
        position="bottom"
        class="identity-icon-wrapper"
        @click.prevent.stop="emit('select')"
        @mouseleave="resetTooltipText"
      >
        <IdentityIcon
          v-if="!props.selected"
          :identity="identity"
          :override="{ height: '28px', width: '28px', 'margin-right': '10px' }"
        />
        <div
          v-else
          class="selected-check"
        >
          <InlineSvg name="checkmark-plain" />
        </div>
      </UiTooltip>
      <UiTooltip
        align-x="center"
        title="View details"
        position="bottom"
        @click.prevent.stop="openDetails"
        @mouseleave="resetTooltipText"
      >
        <BaseText
          as="div"
          variant="body-3-semibold"
          class="column"
          :class="{ 'none-text': nickname === '(Unnamed)' }"
        >
          {{ nickname }}
        </BaseText>
      </UiTooltip>
    </div>

    <UiTooltip
      align-x="center"
      :title="tooltipText"
      position="bottom"
      :can-show="!!phone"
      @click.prevent.stop="clickToCopy('phone', phone)"
      @mouseleave="resetTooltipText"
    >
      <BaseText
        as="div"
        variant="body-3-semibold"
        class="column"
        :class="{ 'none-text': !phone }"
      >
        {{ phone || "None" }}
      </BaseText>
    </UiTooltip>
    <UiTooltip
      align-x="center"
      :title="tooltipText"
      position="bottom"
      :can-show="!!email"
      @click.prevent.stop="clickToCopy('email', email)"
      @mouseleave="resetTooltipText"
    >
      <BaseText
        as="div"
        variant="body-3-semibold"
        class="column"
        :class="{ 'none-text': !email }"
      >
        {{ email || "None" }}
      </BaseText>
    </UiTooltip>
    <UiTooltip
      align-x="center"
      :title="tooltipText"
      position="bottom"
      :can-show="!!username"
      @click.prevent.stop="clickToCopy('username', username)"
      @mouseleave="resetTooltipText"
    >
      <BaseText
        as="div"
        variant="body-3-semibold"
        class="column"
        :class="{ 'none-text': !username }"
      >
        {{ username || "None" }}
      </BaseText>
    </UiTooltip>

    <UiTooltip
      align-x="center"
      :title="tooltipText"
      position="bottom"
      :can-show="!!hasPassword"
      @click.prevent.stop="clickToCopyPassword()"
      @mouseleave="resetTooltipText"
    >
      <BaseTextHiddenDots
        v-if="!!hasPassword"
        as="div"
        variant="body-3-semibold"
        :count="8"
        class="column"
      />
      <BaseText
        v-else
        as="div"
        variant="body-3-semibold"
        class="column"
        :class="{ 'none-text': !hasPassword }"
      >
        {{ "None" }}
      </BaseText>
    </UiTooltip>

    <div>
      <div class="row actions">
        <UiTooltip
          :title="
            hasCloakedPhoneOrEmail
              ? isMuted
                ? 'Unignore identity'
                : 'Ignore identity'
              : 'Ignore not available'
          "
          class="action-icon-wrapper"
          align-x="center"
          position="bottom"
          :class="{ disabled: !hasCloakedPhoneOrEmail }"
          @click.prevent.stop="toggleMute"
        >
          <InlineSvg
            v-if="isMuted"
            key="muted-filled"
            name="muted-filled"
          />
          <InlineSvg
            v-else
            key="muted-noline-filled"
            name="muted-noline-filled"
          />
        </UiTooltip>
        <UiTooltip
          align-x="center"
          title="Go to inbox"
          position="bottom"
          class="action-icon-wrapper"
          @click.prevent.stop="navToInbox(identity.id)"
          @mouseleave="resetTooltipText"
        >
          <InlineSvg name="inbox-filled" />
        </UiTooltip>
        <UiMenu
          width="247px"
          max-height="300px"
          placement="bottom-end"
          has-content-click-close
        >
          <UiTooltip
            align-x="center"
            title="Options"
            position="bottom"
            class="action-icon-wrapper"
            @mouseleave="resetTooltipText"
          >
            <InlineSvg name="kabob-actionbar" />
          </UiTooltip>
          <template #content>
            <UiMenuButton
              title="View details"
              @click.prevent.stop="openDetails"
            >
              <!-- @mouseover="showCatMenu(false)" -->
              <template #icon>
                <InlineSvg name="blocks" />
              </template>
            </UiMenuButton>
            <UiMenuButton
              v-if="hasCloakedPhoneOrEmail"
              :title="isMuted ? 'Unignore' : 'Ignore'"
              @click.prevent.stop="toggleMute"
              @mouseover="showCatMenu(false)"
            >
              <template #icon>
                <InlineSvg :name="isMuted ? 'muted-filled' : 'bell'" />
              </template>
            </UiMenuButton>

            <UiMenuButton
              v-if="hasCloakedPhoneOrEmail"
              title="Compose message"
              @click.prevent.stop="openCompose"
              @mouseover="showCatMenu(false)"
            >
              <template #icon>
                <InlineSvg name="compose" />
              </template>
            </UiMenuButton>
            <UiMenuButton
              :title="
                isFavorited ? 'Remove from favorites' : 'Add to favorites'
              "
              @click.prevent.stop="toggleFavorite"
              @mouseover="showCatMenu(false)"
            >
              <template #icon>
                <InlineSvg
                  :name="isFavorited ? 'favorite-filled' : 'favorite'"
                />
              </template>
            </UiMenuButton>
            <UiMenu
              width="247px"
              max-height="205px"
              placement="left-end"
              :value="state.catMenuVisible"
              :offset-away="10"
              :offset-along="52"
              :has-content-click-close="true"
            >
              <UiMenuButton
                title="Move to"
                @mouseenter="showCatMenu(true)"
              >
                <template #icon>
                  <InlineSvg name="move" />
                </template>
                <template #secondaryIcon>
                  <InlineSvg name="chevron-right" />
                </template>
              </UiMenuButton>
              <template #content>
                <UiMenuButton
                  v-if="currentCategoryName"
                  :title="`Remove from &quot;${currentCategoryName}&quot;`"
                  @click.stop.prevent="removeIdentityFromCategory"
                >
                  <template #icon>
                    <InlineSvg name="minus-outline" />
                  </template>
                </UiMenuButton>
                <UiMenuButton
                  title="Create new category"
                  @click.stop.prevent="openCategoryAddModal"
                >
                  <template #icon>
                    <InlineSvg name="plus" />
                  </template>
                </UiMenuButton>
                <UiMenuSeparator v-if="allCategories.length" />
                <UiMenuButton
                  v-for="(category, idx) in allCategories"
                  :key="`${idx}-${category.name}`"
                  :title="category.name"
                  @click.prevent.stop="moveToCat(category)"
                >
                  <template #icon>
                    <InlineSvg
                      v-if="currentCategoryId == category.id"
                      name="check"
                    />
                  </template>
                </UiMenuButton>
              </template>
            </UiMenu>
            <UiMenuSeparator />
            <UiMenuButton
              title="Delete"
              :danger="true"
              @click.prevent.stop="confirmDelete"
              @mouseover="showCatMenu(false)"
            >
              <template #icon>
                <InlineSvg name="delete" />
              </template>
            </UiMenuButton>
          </template>
        </UiMenu>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.list-view-item {
  padding: 10px 16px;
  width: 100%;
  border: 1px solid $color-primary-10;
  border-radius: 8px;
  color: $color-primary-100;
  min-width: 730px;
  margin-bottom: 8px;
  transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
  &:hover {
    background-color: $color-primary-5;
    transform: scale(1.01) translate3d(0, 0, 0);
    transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
  }
}

.column {
  display: block;
  color: $color-primary-100;
  border-radius: 8px;
  background-color: transparent;
  padding: 8px;
  width: 200px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
  &:hover {
    background-color: $color-primary-10;
    transform: scale(1.01) translate3d(0, 0, 0);
    transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
  }
  &.none-text {
    color: $color-primary-50;
    &:hover {
      background-color: transparent;
    }
  }
}
.row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  &.actions {
    gap: 10px;
    .action-icon-wrapper {
      cursor: pointer;
      height: 30px;
      width: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: $color-primary-100;
      > svg {
        color: $color-primary-100;
        fill: $color-primary-100;
        > path {
          color: $color-primary-100;
          fill: $color-primary-100;
        }
      }
      &.disabled {
        opacity: 0.2;
      }
      &:hover {
        background-color: $color-primary-10;
      }
    }
  }
}

.identity-icon-wrapper {
  cursor: pointer;
}

.selected-check {
  transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);

  margin-right: 10px;
  height: 28px;
  width: 28px;
  border-radius: 50%;
  background-color: $color-primary-100;
  display: flex;
  align-items: center;
  justify-content: center;
  > svg {
    color: $color-base-white-100;
  }
}

@media (max-width: 1475px) {
  .column {
    width: 175px;
  }
}
@media (max-width: 1345px) {
  .column {
    width: 150px;
  }
}
@media (max-width: 1225px) {
  .column {
    width: 125px;
  }
}
@media (max-width: 1100px) {
  .column {
    width: 100px;
  }
}
</style>
