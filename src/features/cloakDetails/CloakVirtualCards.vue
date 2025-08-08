<script setup>
import { ref, reactive, markRaw, computed } from "vue";
import store from "@/store";
import GenerateCard from "@/features/modals/Wallet/GenerateCard.vue";
import InputSpinner from "@/features/InputSpinner.vue";
import router from "@/routes/router";
import { useRoute } from "vue-router";
import UiMenu from "@/features/UiMenu/UiMenu.vue";
import UiMenuButton from "@/features/UiMenu/UiMenuButton.vue";
import CloakInfoRowButton from "@/features/cloakDetails/CloakInfoRowButton.vue";
import InlineSvg from "@/features/InlineSvg.vue";
import { vOnClickOutside } from "@vueuse/components";

const route = useRoute();

const props = defineProps({
  cloak: { type: Object, default: null },
  readOnly: Boolean,
});

const state = reactive({
  isMenuOpen: false,
});

const emit = defineEmits(["refreshApi"]);

const loading = ref(false);
const generating = ref(false);

const collection = computed(() => {
  return store.state.authentication?.user?.card_collections;
});

const collectionsActive = computed(() => {
  return (
    collection.value?.status === "active" ||
    collection.value?.status === "pending"
  );
});

function generateIdentityCard() {
  if ((store.state.cards?.fundingSources?.results?.length ?? 0) === 0) {
    router.push("settings/cloaked-cards");
    return;
  }

  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(GenerateCard),
      props: {
        isVisible: true,
        id: store.state.rightPanel?.cloak?.id,
      },
      events: {
        newCardIssued: (card) => newCardIssued(card),
      },
    },
  });
}

function lastCharacters(string, length) {
  return string.substring(string.length - length, string.length);
}

function openCard(id) {
  if (store.state.rightPanel.active && route.params.id === id) {
    store.dispatch("closeRightPanel");
  } else {
    router.push({
      path: `/wallet/card/${id}`,
    });
  }
}

function newCardIssued(card) {
  store.dispatch("updateCloakCard", {
    id: store.state.rightPanel?.cloak?.id,
    cloaked_card: card,
  });
  emit("refreshApi");
}
</script>

<template>
  <section>
    <header>
      <h3 class="title">
        <span>Cloaked Pay</span>
      </h3>
    </header>
    <div class="block">
      <label>Card</label>

      <div
        class="information"
        :class="{ active: state.isMenuOpen }"
      >
        <div class="input">
          <div class="icon">
            <InputSpinner v-if="loading" />
            <InlineSvg
              v-if="props.cloak.cloaked_card && !loading"
              name="card"
            />
            <InlineSvg
              v-else-if="
                !props.cloak.cloaked_card && !loading && !collectionsActive
              "
              name="plus"
            />
            <InlineSvg
              v-else-if="
                !props.cloak.cloaked_card && !loading && collectionsActive
              "
              name="lock"
            />
          </div>

          <div class="text">
            <span
              v-if="props.cloak.cloaked_card && !loading"
              class="data"
            >
              &#x2022;&#x2022;&#x2022;&#x2022; &#x2022;&#x2022;&#x2022;&#x2022;
              &#x2022;&#x2022;&#x2022;&#x2022;
              {{ lastCharacters(props.cloak?.cloaked_card?.pan, 4) }}
            </span>
            <span
              v-else-if="
                !props.cloak.cloaked_card && !loading && !collectionsActive
              "
            >
              Generate new card
            </span>
            <span
              v-else-if="
                !props.cloak.cloaked_card && !loading && collectionsActive
              "
            >
              Card generation disabled
            </span>
            <span
              v-else-if="loading"
              class="loading"
            >
              <span v-if="loading && !generating">Loading...</span>
              <span v-else-if="loading && generating">Generating card...</span>
            </span>
          </div>

          <div class="buttons">
            <button
              v-if="
                !props.cloak.cloaked_card &&
                !loading &&
                !props.readOnly &&
                !collectionsActive
              "
              class="generate"
              @click="generateIdentityCard"
            >
              Generate
            </button>

            <UiMenu
              v-if="props.cloak.cloaked_card && !loading"
              v-on-click-outside="() => (state.isMenuOpen = false)"
              width="188px"
              placement="bottom-end"
              :value="state.isMenuOpen"
            >
              <CloakInfoRowButton
                icon
                :active="state.isMenuOpen"
                @click="state.isMenuOpen = !state.isMenuOpen"
              >
                <InlineSvg name="kabob" />
              </CloakInfoRowButton>

              <template #content>
                <UiMenuButton
                  title="View"
                  @click="openCard(props.cloak.cloaked_card.id)"
                >
                  <template #icon>
                    <InlineSvg name="eye" />
                  </template>
                </UiMenuButton>
              </template>
            </UiMenu>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
header {
  padding: 20px 20px 8px;

  .title {
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
    color: $color-primary-100;
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.block {
  padding: 0 24px 20px;
  display: flex;
  gap: 4px;
  align-items: center;

  label {
    display: inline-block;
    font-size: 12px;
    line-height: 18px;
    color: $color-primary-50;
    width: 80px;
  }

  .information {
    width: calc(100% - 84px);
    border: 1px solid transparent;
    border-radius: 20px;

    &:hover,
    &.active {
      border: 1px solid $color-primary-10;

      .input {
        .buttons {
          opacity: 1;
          visibility: visible;
        }
      }
    }
  }

  .input {
    padding: 20px 20px 20px 40px;
    height: 44px;
    position: relative;
    display: flex;
    align-items: center;

    .text {
      font-size: 12px;
      line-height: 18px;
      text-overflow: ellipsis;

      span {
        white-space: nowrap;
        overflow: hidden;
        color: $color-primary-50;

        &.data {
          color: $color-primary-100;
        }
      }
    }

    .icon {
      position: absolute;
      top: 50%;
      left: 10px;
      transform: translateY(-50%);
      color: $color-primary-100;
      width: 26px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;

      svg {
        width: 12px;
        height: 12px;
      }
    }

    .buttons {
      position: absolute;
      top: 50%;
      right: 4px;
      transform: translateY(-50%);
      display: flex;
      gap: 10px;
      opacity: 0;
      visibility: hidden;

      .generate {
        min-width: 36px;
        height: 36px;
        background: $color-primary-100;
        border-radius: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 500;
        font-size: 12px;
        line-height: 18px;
        border: none;
        padding: 0 17px;
        color: $color-primary-1;
        transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);

        &:hover {
          transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
          background-color: $color-primary-10;
          color: $color-primary-100;
          cursor: pointer;
        }
      }
    }
  }
}
</style>
