<script setup>
import {
  HELP_CENTER_BASE_URL,
  HELP_CENTER_IMPORT_URL,
} from "@/scripts/constants";
import store from "@/store";
import { computed } from "vue";
import ModalTemplate from "@/features/ModalTemplate.vue";
import Button from "@/features/Button.vue";

defineProps({ params: { type: Object, default: null } });
const visibleModals = computed(() => store.state.modal.visibleModals);
</script>

<template>
  <ModalTemplate
    key="modal-quick-help"
    :show="visibleModals[params.id]"
    class="modal-quick-help"
    :width="768"
  >
    <template #header>
      <h1 class="modal-quick-help__heading">Password import quick help</h1>
    </template>
    <template #body>
      <div class="modal-quick-help__csv-example">
        <div class="modal-quick-help__subheading">
          Example of a correctly formatted CSV file:
        </div>
        <a
          href="/cloaked-sample.csv"
          class="modal-quick-help__download-template"
        >
          Download template
        </a>
      </div>
      <img
        src="@/assets/images/import/quick-help/csv-example.jpg"
        alt="CSV Example"
        class="modal-quick-help__image modal-quick-help__image--csv-example"
      />
      <div class="modal-quick-help__elements">
        <div class="modal-quick-help__subheading">
          Explanations of interface elements:
        </div>
        <div class="modal-quick-help__elements-item">
          <div class="modal-quick-help__elements-item-left">
            <img
              src="@/assets/images/import/quick-help/column-mapped.jpg"
              alt="Column mapped"
              class="modal-quick-help__image modal-quick-help__image--column-mapped"
            />
          </div>
          <div>
            <strong>Each column describe metadata</strong>
            used for autofilling your credentials on each identity’s website.
            The first line of your .CSV file should include these columns:
            <i>
              name, url, username, password, email, phone, notes, and favorite.
            </i>
          </div>
        </div>
        <div class="modal-quick-help__elements-item">
          <div class="modal-quick-help__elements-item-left">
            <img
              src="@/assets/images/import/quick-help/column-required.jpg"
              alt="Column required"
              class="modal-quick-help__image modal-quick-help__image--column-required"
            />
          </div>
          <div>
            <strong>
              Required columns will appear on columns that don’t match our
              currently supported metadata.
            </strong>
            You must choose a label OR choose “ignore column”.
          </div>
        </div>
        <div class="modal-quick-help__elements-item">
          <div class="modal-quick-help__elements-item-left">
            <img
              src="@/assets/images/import/quick-help/tag-needs-review.jpg"
              alt="Tag needs review"
              class="modal-quick-help__image"
            />
            <img
              src="@/assets/images/import/quick-help/tag-duplicate.jpg"
              alt="Tag duplicate"
              class="modal-quick-help__image"
            />
          </div>
          <div>
            <strong>
              Some identities may show as “Needs review” or “Duplicate”.
            </strong>
            You can still import those identities as is, but additional
            information may be required to log in on those websites using
            autofill.
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="modal-quick-help__footer">
        <div class="modal-quick-help__footer-help">
          Still need some help?
          <a
            :href="HELP_CENTER_BASE_URL"
            target="_blank"
            class="modal-quick-help__chat"
          >
            Chat with us
          </a>
          or
          <a
            :href="HELP_CENTER_IMPORT_URL"
            target="_blank"
            class="modal-quick-help__articles"
          >
            check out our help articles
          </a>
        </div>
        <Button @click="params.onGoBack()">Got it</Button>
      </div>
    </template>
  </ModalTemplate>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.modal-quick-help {
  & &__heading {
    font-style: normal;
    font-weight: 500;
    font-size: 24px !important;
    line-height: 36px !important;
    color: $color-primary-100;
  }

  &__subheading {
    font-style: normal;
    font-weight: 500;
    font-size: 15px;
    line-height: 23px;
    color: $color-primary-70;
  }

  & &__download-template {
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 23px;
    text-decoration: underline;
    color: $color-primary-100;

    &:hover {
      opacity: 0.8;
    }
  }

  &__csv-example {
    display: flex;
    justify-content: space-between;
    margin: 24px 0 18px;
  }

  &__image {
    padding: 0;
    border-radius: 8px;

    &--csv-example {
      border: 0.5px solid #babcbd !important;
      filter: drop-shadow(0 4px 10px rgb(0 0 0 / 9%));
      border-radius: 4px !important;
      overflow: hidden;
    }

    &--column-mapped,
    &--column-required {
      box-shadow:
        0 0 12px rgb(0 0 0 / 4%),
        0 1px 4px rgb(1 2 24 / 8%);
    }
  }

  &__elements {
    margin-top: 36px;

    &-item {
      display: flex;
      margin-top: 16px;
      font-style: normal;
      font-size: 15px;
      line-height: 23px;
      color: $color-primary-70;

      strong {
        color: $color-primary-100;
        font-weight: 600;
      }

      i {
        font-style: normal;
        color: $color-primary-100;
      }

      &-left {
        width: 230px;
        margin-right: 24px;
        flex-shrink: 0;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
      }
    }
  }

  &__footer {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &-help {
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 18px;
      color: $color-primary-100;
    }
  }

  &__chat,
  & &__articles {
    text-decoration: underline;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
