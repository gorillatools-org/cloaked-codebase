<script setup>
import inlineSvg from "@/features/InlineSvg";
import { useRoute } from "vue-router";
import { computed } from "vue";
import store from "@/store";
import CreateCard from "./WalletSettings/CreateCardButton";
import DefaultFundingSource from "./WalletSettings/DefaultFundingSourceButton.vue";
import SpendingLimit from "./WalletSettings/SpendingLimitButton.vue";
import AvailableSpendindButton from "./WalletSettings/AvailableSpendindButton.vue";
import CardInformationButton from "./WalletSettings/CardInformationButton.vue";
import FundingSourceButton from "./WalletSettings/FundingSourceButton.vue";
import IdentityIcon from "@/features/ui/IdentityIcon.vue";

const emit = defineEmits(["newCardIssued"]);
const props = defineProps({
  listType: { type: String, default: null },
  createCardDisabled: {
    type: Boolean,
    default: false,
  },
});

const route = useRoute();

function identity(id) {
  return store.state.localdb.db_cloaks.find((item) => item.id === id);
}

const card = computed(() => {
  if (route.params.id && store.state.cards.cards.results) {
    return store.state.cards.cards.results.find(
      (card) => card.id === route.params.id
    );
  }
  return "";
});

function openIdentity(identity) {
  if (
    !store.state.rightPanel.cloak ||
    store.state.rightPanel.cloak.id !== identity.id
  ) {
    store.dispatch("fetchPopulatedData", identity).then((data) => {
      store.commit("compose", null);
      store.dispatch("openCloakDetails", {
        cloak: data,
        skipNav: true,
      });
    });
  }
}

function openCard(card) {
  store.commit("addCard", card);
}

function openSetting() {
  store.commit("openSettings");
}
</script>

<template>
  <div class="settings">
    <header>
      <div class="title">
        <router-link
          v-if="route.params.id"
          to="/virtual-cards"
          class="back-button"
        >
          <inlineSvg name="chevron-left" />
        </router-link>

        <div class="icons">
          <div
            v-if="route.params.id && card && props.listType !== 'Canceled'"
            class="icon"
            @click="openCard(card)"
          >
            <inlineSvg name="cog" />
            <span>Settings</span>
          </div>

          <div
            v-if="!route.params.id && !card"
            class="icon"
            @click="openSetting(true)"
          >
            <inlineSvg name="cog" />
            <span>Wallet settings</span>
          </div>
        </div>
      </div>

      <div
        v-if="
          route.params.id &&
          card &&
          identity(card.identity_id) &&
          props.listType !== 'Canceled'
        "
        class="identity"
        @click="openIdentity(identity(card.identity_id))"
      >
        <IdentityIcon
          :identity="identity(card.identity_id)"
          :override="{ height: '32px', width: '32px' }"
        />
        <div class="info">
          <h1>{{ identity(card.identity_id)?.nickname || "(Unnamed)" }}</h1>

          <inlineSvg
            v-if="
              card.state === 'locked_by_user' ||
              (card.state === 'locked_by_system' &&
                props.listType !== 'Canceled')
            "
            name="lock-filled"
          />
        </div>
      </div>

      <div
        v-else-if="props.listType === 'Canceled' && route.params.id && card"
        class="identity"
      >
        <IdentityIcon
          :identity="identity(card.identity_id)"
          :override="{ height: '32px', width: '32px' }"
        />
        <div class="info">
          <h1>
            {{
              identity(card.identity_id)?.nickname ||
              card?.identity_name ||
              "(Unnamed)"
            }}
          </h1>
        </div>
      </div>
    </header>

    <div class="buttons">
      <CreateCard
        v-if="!route.params.id && !props.createCardDisabled"
        @new-card-issued="(cardId) => emit('newCardIssued', cardId)"
      />
      <AvailableSpendindButton
        v-if="route.params.id && props.listType !== 'Canceled'"
      />
      <SpendingLimit v-if="route.params.id && props.listType !== 'Canceled'" />
      <DefaultFundingSource v-if="!route.params.id" />
      <CardInformationButton v-if="!route.params.id" />
      <FundingSourceButton
        v-if="route.params.id && props.listType !== 'Canceled'"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.settings {
  width: 100%;
  margin-bottom: 48px;
  display: flex;
  flex-wrap: wrap;
  max-width: 100%;

  header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0;
    position: relative;
    height: 32px;

    .title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;

      .icons {
        display: flex;
        margin-left: auto;

        .icon {
          color: $color-primary-100;
          margin-left: 10px;
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          border-radius: 10px;
          padding: 8px 10px;

          &:first-child {
            margin-left: 0;
          }

          &:hover {
            cursor: pointer;
            background-color: $color-primary-10;
          }

          &::after {
            content: "";
            width: 0;
            height: 0;
            border-radius: 50%;
            background-color: $color-primary-100;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            transition: all 0.4s ease-in-out;
            z-index: -1;
          }

          svg {
            width: 18px;
            height: 18px;
            display: block;
          }

          span {
            margin-left: 5px;
            display: inline-block;
            font-size: 13px;
            font-style: normal;
            font-weight: 500;
          }

          &.active {
            color: $color-primary-1;

            &::after {
              width: 28px;
              height: 28px;
            }
          }
        }
      }

      .back-button {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        position: relative;

        svg {
          width: 14px;
          height: 14px;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          color: $color-primary-100;
        }

        &:hover {
          background-color: $color-primary-10;
          cursor: pointer;
        }
      }

      h1 {
        font-size: 18px;
        font-style: normal;
        font-weight: 600;
        line-height: normal;
        color: $color-primary-100;
      }
    }

    .identity {
      display: flex;
      align-items: center;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      cursor: pointer;

      .info {
        margin-left: 8px;
        display: flex;
        gap: 6px;
        align-items: center;

        h1 {
          font-size: 18px;
          font-style: normal;
          font-weight: 600;
          line-height: normal;
          color: $color-primary-100;
          max-width: 200px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        svg {
          width: 16px;
          height: 16px;
          color: $color-primary-100;
        }
      }
    }
  }

  .buttons {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    grid-gap: 10px;
    margin-top: 16px;
    width: 100%;

    @media (width >=1200px) {
      grid-template-columns: repeat(3, 1fr);
    }
  }
}
</style>
