<script setup>
import { ref, onMounted } from "vue";
import store from "@/store";
import CardsServices from "@/api/actions/cards-services.js";
import InlineSvg from "@/features/InlineSvg.vue";

const cardList = ref([]);
function identity(id) {
  const identity = store.state.localdb.db_cloaks.find((item) => item.id === id);
  return identity;
}
function convert_dollars(value) {
  if (value) {
    return (value / 100).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
  }
}
onMounted(async () => {
  const cards = await CardsServices.getCardList();
  cardList.value = cards.data.results;
});

function openCard(card) {
  store.dispatch("openCardPanel");
  store.commit("currentCard", card);
}
</script>

<template>
  <section class="page">
    <div class="title">
      <h1>All Cloaked cards</h1>
    </div>

    <div class="list">
      <div
        v-for="card in cardList"
        :key="card.id"
        class="item"
      >
        <div class="card">
          <div class="available">
            <svg viewBox="0 0 36 36">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                :stroke-dasharray="`${
                  (card.transaction_period_limit / card.spent_period) * 100
                }, 100`"
              />
            </svg>

            <div class="text">
              <div class="value">
                {{
                  convert_dollars(
                    card.transaction_period_limit - card.spent_period
                  )
                }}
              </div>
              <div class="title">available</div>
            </div>
          </div>

          <div class="price">
            <div class="value">
              {{ convert_dollars(card.transaction_period_limit) }}
            </div>
            <div class="title">
              {{ card.type }}
            </div>
          </div>

          <div
            class="view"
            @click="openCard(card)"
          >
            <span>View card info</span>
          </div>

          <InlineSvg
            name="mastercard"
            class="mastercard"
          />
        </div>

        <div class="identity">
          <div
            v-if="identity(card.identity_id)"
            class="icon"
            :style="{
              backgroundImage: `url(${identity(card.identity_id).logo_url})`,
            }"
          />
          <div
            v-else
            class="icon"
          />

          <div class="text">
            <div class="name">
              <span v-if="identity(card.identity_id)">
                {{ identity(card.identity_id).nickname }}
              </span>
              <span v-else>Deleted identity</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
section.page {
  width: 100%;
  padding: 24px 24px;
  .title {
    h1 {
      margin-bottom: 48px;
      color: $color-primary-100;
      font-weight: 500;
      font-size: 32px;
      line-height: 48px;
    }
  }
  .list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(375px, 1fr));
    grid-gap: 12px;
    .card {
      border-radius: 20px;
      background-color: $color-primary-100;
      width: 100%;
      height: 225px;
      padding: 24px;
      position: relative;
      .available {
        width: 110px;
        height: 110px;
        position: absolute;
        top: 24px;
        left: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        svg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: auto;
          color: $color-primary-1;
        }
        .text {
          text-align: center;
          color: $color-primary-1;
          .value {
            font-size: 15px;
            font-style: normal;
            font-weight: 600;
            line-height: normal;
          }
          .title {
            font-size: 13px;
            font-style: normal;
            font-weight: 400;
            line-height: normal;
          }
        }
      }
      .price {
        position: absolute;
        top: 24px;
        right: 24px;
        text-align: right;
        color: $color-primary-1;
        .value {
          font-size: 32px;
          font-style: normal;
          font-weight: 600;
          line-height: 40px; /* 125% */
        }
        .text {
          font-size: 15px;
          font-style: normal;
          font-weight: 400;
          line-height: normal;
          margin-top: 2px;
        }
      }
      .view {
        position: absolute;
        bottom: 24px;
        left: 24px;
        color: $color-primary-1;
        font-size: 12px;
        font-style: normal;
        font-weight: 500;
        line-height: normal;
        text-decoration-line: underline;
        &:hover {
          cursor: pointer;
        }
      }
      .mastercard {
        position: absolute;
        right: 24px;
        bottom: 24px;
        width: 52px;
        height: auto;
      }
    }
    .identity {
      margin-top: 16px;
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      .icon {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background-color: $color-primary-20;
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
      }
      .text {
        margin-left: 12px;
        .name {
          font-size: 15px;
          font-weight: 600;
          color: $color-primary-100;
        }
      }
    }
  }
}
</style>
