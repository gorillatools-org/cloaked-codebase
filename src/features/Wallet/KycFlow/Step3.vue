<script setup>
import { ref } from "vue";
import { WEBSITE_PAY_AGREEMENTS_URL } from "@/scripts/constants";
import FormContainer from "./FormContainer.vue";
import TermsOfService from "./Agreements/TermsOfService.vue";
import PrivacyPolicy from "./Agreements/PrivacyPolicy.vue";
import ESign from "./Agreements/E-Sign.vue";
import ChargeCardAgreement from "./Agreements/ChargeCardAgreement.vue";
import RatesFees from "./Agreements/RatesFees.vue";
import PrepaidAgreement from "./Agreements/PrepaidAgreement.vue";
import PrepaidLongForm from "./Agreements/PrepaidLongForm.vue";
import PrepaidShortForm from "./Agreements/PrepaidShortForm.vue";

const selections = ref([
  {
    id: 1,
    name: "Terms of Service",
    active: true,
  },
  {
    id: 2,
    name: "Privacy Policy",
    active: false,
  },
  {
    id: 3,
    name: "Charge Card Agreement",
    active: false,
  },
  {
    id: 4,
    name: "Rates & Fees",
    active: false,
  },
  {
    id: 5,
    name: "Prepaid Agreement",
    active: false,
  },
  {
    id: 6,
    name: "Prepaid - Long form",
    active: false,
  },
  {
    id: 7,
    name: "Prepaid - Short form",
    active: false,
  },
  {
    id: 8,
    name: "E-Sign",
    active: false,
  },
]);

const currentSelection = ref(1);

function changeSelection(id) {
  selections.value.forEach((selection) => {
    selection.active = false;
    if (selection.id === id) {
      selection.active = true;
      currentSelection.value = id;
    }
  });
}
</script>

<template>
  <div>
    <FormContainer icon="doc-search">
      <h1>By submitting this application you agree to the following:</h1>

      <div class="text">
        <div class="container">
          <div class="description">
            <p>
              The issuing bank for Cloaked Cards is Patriot Bank. To help the
              government fight the funding of terrorism and money laundering
              activities, federal law requires all financial institutions, like
              Patriot Bank, to obtain, verify, and record information that
              identifies each person who opens an account. What this means for
              you: when you open a Cloaked Pay account, we will ask for your
              name, address, date of birth, and other information that will
              allow us to identify you. We may also ask to see a copy of your
              driver’s licenses or other identifying documents.
            </p>
          </div>

          <div class="agreements">
            <ul class="selections">
              <li
                v-for="selection in selections"
                :key="selection.id"
                :class="{ active: selection.active }"
              >
                <span @click="changeSelection(selection.id)">
                  {{ selection.name }}
                </span>
              </li>
            </ul>

            <div class="selection">
              <TermsOfService v-if="currentSelection === 1" />
              <PrivacyPolicy v-if="currentSelection === 2" />
              <ChargeCardAgreement v-if="currentSelection === 3" />
              <RatesFees v-if="currentSelection === 4" />
              <PrepaidAgreement v-if="currentSelection === 5" />
              <PrepaidLongForm v-if="currentSelection === 6" />
              <PrepaidShortForm v-if="currentSelection === 7" />
              <ESign v-if="currentSelection === 8" />
            </div>
          </div>
        </div>
      </div>
      <div class="legal">
        <a
          :href="WEBSITE_PAY_AGREEMENTS_URL"
          target="_blank"
        >
          Cloaked Pay Agreements
        </a>
      </div>
    </FormContainer>
  </div>
</template>

<style lang="scss" scoped>
h1 {
  color: $color-primary-100;
  font-size: 24px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}

.text {
  width: 100%;
  display: flex;
  overflow: auto;
  background-color: $color-primary-5;
  margin-top: 24px;
  height: calc(100vh - 452px);
  border-radius: 6px;

  @include custom-scroll-bar;

  .container {
    padding: 24px;
    height: max-content;
    width: 100%;
  }

  p {
    font-size: 15px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    color: $color-primary-100;
  }

  .agreements {
    margin-top: 20px;

    .selections {
      display: -webkit-inline-box;
      overflow: auto hidden;
      width: 100%;
      padding: 15px 0;

      &::-webkit-scrollbar {
        height: 0;
      }

      li {
        font-size: 13px;
        font-weight: 600;
        color: $color-primary-100;
        cursor: pointer;
        height: 20px;
        margin-left: 16px;
        position: relative;

        &:first-child {
          margin-left: 0;
        }

        &.active {
          &::after {
            content: "";
            position: absolute;
            bottom: -13px;
            left: 0;
            width: 100%;
            height: 3px;
            background-color: $color-primary-100;
            pointer-events: none;
          }
        }

        a {
          display: flex;
          align-items: center;
          color: $color-primary-100;
          text-decoration: none;

          svg {
            margin-left: 6px;
            width: 10px;
            height: 10px;
          }
        }
      }
    }

    .selection {
      margin-top: 16px;
      color: $color-primary-100;

      .text-group {
        * {
          font-size: 12px;
          font-style: normal;
          font-weight: 400;
          margin-top: 20px;

          &:first-child {
            margin-top: 0;
          }

          a {
            color: $color-primary-100;
            text-decoration: underline;
          }
        }
      }
    }
  }
}

.legal {
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  color: $color-primary-100;
  text-align: center;
  width: 100%;
  position: absolute;
  bottom: -110px;
  left: 0;

  a {
    display: inline-block;
    border-bottom: 1px solid;

    &:hover {
      color: $color-primary-70;
    }
  }
}
</style>
