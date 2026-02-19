<script setup>
import { ref } from "vue";
import InlineSvg from "@/features/InlineSvg.vue";
import DataDeleteScanResultsTableRowMore from "@/features/data-delete/DataDeleteScanResultsTableRowMore.vue";
import BaseText from "@/library/BaseText.vue";

defineProps({
  record: {
    type: Object,
    required: true,
  },
});

const isExpanded = ref(false);

const emit = defineEmits(["expanded", "delete"]);

const onToggleExpanded = () => {
  isExpanded.value = !isExpanded.value;

  if (isExpanded.value) {
    emit("expanded");
  }
};
</script>

<template>
  <div class="scan-results-table-row">
    <div class="scan-results-table-row__data">
      <BaseText
        as="div"
        variant="body-small-medium"
        class="scan-results-table-row__data-title"
      >
        Site
      </BaseText>
      <BaseText
        as="div"
        variant="body-3-semibold"
        class="scan-results-table-row__data-text"
      >
        {{ record.brokerName }}
      </BaseText>
    </div>

    <div
      v-if="record.full_name"
      class="scan-results-table-row__data"
    >
      <BaseText
        as="div"
        variant="body-small-medium"
        class="scan-results-table-row__data-title"
      >
        Name
      </BaseText>
      <BaseText
        as="div"
        variant="body-3-semibold"
        class="scan-results-table-row__data-text scan-results-table-row__data-text--name"
      >
        {{
          record.age && record.age !== "available"
            ? `${record.full_name}, Age ${record.age}`
            : record.full_name
        }}
      </BaseText>
    </div>
    <div
      v-else
      class="scan-results-table-row__data scan-results-table-row__data--empty"
    >
      <BaseText
        as="div"
        variant="body-3-semibold"
      >
        -
      </BaseText>
    </div>

    <div
      v-if="record.addresses?.length"
      class="scan-results-table-row__data"
    >
      <BaseText
        as="div"
        variant="body-small-medium"
        class="scan-results-table-row__data-title"
      >
        Locations
      </BaseText>
      <ul>
        <BaseText
          v-for="(address, index) in record.addresses"
          :key="index"
          as="li"
          variant="body-3-semibold"
          class="scan-results-table-row__data-text scan-results-table-row__data-text--blurred"
        >
          {{ address }}
        </BaseText>
      </ul>
    </div>
    <div
      v-else
      class="scan-results-table-row__data scan-results-table-row__data--empty"
    >
      <BaseText
        as="div"
        variant="body-3-semibold"
      >
        -
      </BaseText>
    </div>

    <div
      v-if="record.relatives?.length"
      class="scan-results-table-row__data"
    >
      <BaseText
        as="div"
        variant="body-small-medium"
        class="scan-results-table-row__data-title"
      >
        Relatives
      </BaseText>
      <ul>
        <BaseText
          v-for="(relative, index) in record.relatives"
          :key="index"
          as="li"
          variant="body-3-semibold"
          class="scan-results-table-row__data-text"
          :class="{
            'scan-results-table-row__data-text--name': relative !== 'available',
          }"
        >
          {{ relative }}
        </BaseText>
      </ul>
    </div>
    <div
      v-else
      class="scan-results-table-row__data scan-results-table-row__data--empty"
    >
      <BaseText
        as="div"
        variant="body-3-semibold"
      >
        -
      </BaseText>
    </div>

    <div
      v-if="record.phone_numbers?.length"
      class="scan-results-table-row__data"
    >
      <BaseText
        as="div"
        variant="body-small-medium"
        class="scan-results-table-row__data-title"
      >
        Phones
      </BaseText>
      <ul>
        <BaseText
          v-for="(phone, index) in record.phone_numbers"
          :key="index"
          as="li"
          variant="body-3-semibold"
          class="scan-results-table-row__data-text scan-results-table-row__data-text--blurred"
        >
          {{ phone }}
        </BaseText>
      </ul>
    </div>
    <div
      v-else
      class="scan-results-table-row__data scan-results-table-row__data--empty"
    >
      <BaseText
        as="div"
        variant="body-3-semibold"
      >
        -
      </BaseText>
    </div>

    <div
      class="scan-results-table-row__data scan-results-table-row__data--alert"
    >
      <BaseText
        as="div"
        variant="body-small-medium"
        class="scan-results-table-row__data-title"
      >
        Status
      </BaseText>
      <BaseText
        as="div"
        variant="body-3-semibold"
        class="scan-results-table-row__data-text scan-results-table-row__data-text--alert"
      >
        Exposed
      </BaseText>
    </div>
    <div class="scan-results-table-row__more">
      <button
        class="scan-results-table-row__more-button"
        :class="{
          'scan-results-table-row__more-button--expanded': isExpanded,
        }"
        @click="onToggleExpanded"
      >
        <template v-if="isExpanded">Hide</template>
        <template v-else>Details</template>
        <InlineSvg
          name="chevron"
          class="scan-results-table-row__more-button-icon"
        />
      </button>
      <DataDeleteScanResultsTableRowMore
        v-if="isExpanded"
        class="scan-results-table-row__more-section--mobile"
        :record="record"
        @delete="$emit('delete')"
      />
    </div>
    <DataDeleteScanResultsTableRowMore
      v-if="isExpanded"
      class="scan-results-table-row__more-section--desktop"
      :record="record"
      @delete="$emit('delete')"
    />
  </div>
</template>

<style lang="scss" scoped>
.scan-results-table-row {
  @media all and (min-width: $screen-xl) {
    display: grid;
    grid-template-columns: 160fr 120fr 115fr 130fr 108fr 70fr 60fr;
    gap: 16px;
    padding: 16px;
  }

  &__data {
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 16px;
    position: relative;

    @media all and (min-width: $screen-xl) {
      display: block;
      padding: 0;
    }

    &::after {
      position: absolute;
      bottom: 0;
      left: 16px;
      right: 16px;
      content: "";

      @at-root .theme-dark & {
        border-bottom: 1px solid rgba($color-primary-100-dark, 0.3);
      }

      @at-root .theme-light & {
        border-bottom: 1px solid rgba($color-primary-100-light, 0.3);
      }

      @at-root .scan-results-table-row__data:last-child::after {
        display: none;
      }

      @media all and (min-width: $screen-xl) {
        display: none !important;
      }
    }

    &-title {
      text-transform: uppercase;

      @media all and (min-width: $screen-xl) {
        display: none;
      }
    }

    &-text {
      word-break: break-word;

      &--alert {
        color: $color-alert;
      }

      &--blurred {
        filter: blur(4px);
      }

      &--name {
        text-transform: capitalize;
      }
    }

    &--alert {
      @media all and (min-width: $screen-xl) {
        grid-row: 1;
        grid-column: 7/8;
      }
    }

    &--empty {
      display: none;

      @media all and (min-width: $screen-xl) {
        display: block;
      }
    }
  }

  &__more {
    padding: 16px;

    @media all and (min-width: $screen-xl) {
      grid-row: 1;
      grid-column: 6/7;
      padding: 0;
    }

    &-button {
      width: 100%;
      background-color: transparent;
      border: none;
      color: $color-primary-100;
      font-size: 13px;
      font-style: normal;
      font-weight: 500;
      line-height: normal;
      text-decoration-line: underline;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2px;
      padding: 0;

      @media all and (min-width: $screen-xl) {
        justify-content: flex-start;
      }

      &:hover {
        opacity: 0.9;
      }

      &-icon {
        @at-root .scan-results-table-row__more-button--expanded & {
          transform: rotate(180deg);
        }
      }
    }

    &-section {
      &--mobile {
        @media all and (min-width: $screen-xl) {
          display: none;
        }
      }

      &--desktop {
        display: none;
        grid-column: 1/8;

        @media all and (min-width: $screen-xl) {
          display: grid;
        }
      }
    }
  }
}
</style>
