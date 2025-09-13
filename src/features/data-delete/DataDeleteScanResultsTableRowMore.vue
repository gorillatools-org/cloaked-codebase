<script setup>
import InlineSvg from "@/features/InlineSvg.vue";
import BaseButton from "@/library/BaseButton.vue";
import BaseText from "@/library/BaseText.vue";
import { useDisplay } from "@/composables/useDisplay.js";

defineProps({
  record: {
    type: Object,
    required: true,
  },
});

defineEmits(["delete"]);

const { isMobile } = useDisplay();
</script>

<template>
  <div class="scan-results-table-row-more">
    <section v-if="record.infoTypes?.length">
      <BaseText
        as="h3"
        variant="body-3-semibold"
        class="scan-results-table-row-more__title"
      >
        This site also exposes your:
      </BaseText>
      <ul class="scan-results-table-row-more__list-exposed">
        <BaseText
          v-for="(infoType, index) in record.infoTypes"
          :key="index"
          as="li"
          variant="body-3-semibold"
          class="scan-results-table-row-more__list-exposed-item"
        >
          <InlineSvg
            name="tip-warning"
            class="scan-results-table-row-more__warning"
          />
          {{ infoType }}
        </BaseText>
        <BaseText
          as="li"
          variant="body-3-semibold"
          class="scan-results-table-row-more__list-exposed-item"
        >
          + And more
        </BaseText>
      </ul>
    </section>
    <section>
      <BaseText
        as="h3"
        variant="body-3-semibold"
        class="scan-results-table-row-more__title"
      >
        This info puts you at risk of:
      </BaseText>
      <ul class="scan-results-table-row-more__list-risks">
        <BaseText
          as="li"
          variant="body-3-semibold"
        >
          Identity theft
        </BaseText>
        <BaseText
          as="li"
          variant="body-3-semibold"
        >
          Robocalls
        </BaseText>
        <BaseText
          as="li"
          variant="body-3-semibold"
        >
          Email spam
        </BaseText>
        <BaseText
          as="li"
          variant="body-3-semibold"
        >
          Hackers
        </BaseText>
        <BaseText
          as="li"
          variant="body-3-semibold"
        >
          Stalkers and creeps
        </BaseText>
        <BaseText
          as="li"
          variant="body-3-semibold"
        >
          Companies buying your data
        </BaseText>
      </ul>
    </section>
    <section>
      <BaseText
        as="h3"
        variant="body-3-semibold"
        class="scan-results-table-row-more__title"
      >
        To protect yourself:
      </BaseText>
      <BaseText
        as="p"
        variant="body-3-semibold"
        class="scan-results-table-row-more__text"
      >
        Cloaked can automatically remove all of your sensitive personal
        information from the web and all major data brokers. Subscribe today to
        protect yourself.
      </BaseText>
    </section>
    <BaseButton
      variant="primary"
      size="lg"
      icon="arrow-right"
      class="scan-results-table-row-more__cta"
      :full-width="!isMobile"
      @click="$emit('delete')"
    >
      Delete your online data
    </BaseButton>
  </div>
</template>

<style lang="scss" scoped>
.scan-results-table-row-more {
  display: flex;
  flex-direction: column;

  @media all and (min-width: $screen-xl) {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    padding: 24px 8px;
  }

  &__title {
    margin-top: 24px;
  }

  &__warning {
    color: $color-alert;
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  &__list-exposed {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;

    &-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  &__list-risks {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
    list-style-type: disc;
    padding-left: 20px;
  }

  &__text {
    margin-top: 8px;
  }

  &__cta {
    margin: 24px 0 16px;
    width: 100%;
    max-width: 360px;
    align-self: center;

    @media all and (min-width: $screen-xl) {
      grid-column: 1/4;
      justify-self: center;
    }
  }
}
</style>
