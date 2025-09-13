<script setup lang="ts">
import { type Component, ref } from "vue";
import TermsOfService from "@/features/VirtualCards/Subscription/application/steps/agreements/TermsOfService.vue";
import PrivacyPolicy from "@/features/VirtualCards/Subscription/application/steps/agreements/PrivacyPolicy.vue";
import ESign from "@/features/VirtualCards/Subscription/application/steps/agreements/E-Sign.vue";
import ChargeCardAgreement from "@/features/VirtualCards/Subscription/application/steps/agreements/ChargeCardAgreement.vue";
import RatesFees from "@/features/VirtualCards/Subscription/application/steps/agreements/RatesFees.vue";
import PrepaidAgreement from "@/features/VirtualCards/Subscription/application/steps/agreements/PrepaidAgreement.vue";
import PrepaidLongForm from "@/features/VirtualCards/Subscription/application/steps/agreements/PrepaidLongForm.vue";
import PrepaidShortForm from "@/features/VirtualCards/Subscription/application/steps/agreements/PrepaidShortForm.vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";

type Section = {
  name: string;
  component: Component;
  active: boolean;
};

type Props = {
  externalScroll?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  externalScroll: false,
});

const sections = ref<Section[]>([
  { name: "Rates & Fees", component: RatesFees, active: true },
  { name: "Terms of Service", component: TermsOfService, active: false },
  { name: "Privacy Policy", component: PrivacyPolicy, active: false },
  {
    name: "Charge Card Agreement",
    component: ChargeCardAgreement,
    active: false,
  },
  { name: "Prepaid Agreement", component: PrepaidAgreement, active: false },
  { name: "Prepaid - Long form", component: PrepaidLongForm, active: false },
  { name: "Prepaid - Short form", component: PrepaidShortForm, active: false },
  { name: "E-Sign", component: ESign, active: false },
]);

const toggleSection = (index: number) => {
  const prevIndex = sections.value.findIndex((section) => section.active);
  const openingSame = prevIndex === index;

  const willOpen = openingSame ? !sections.value[index].active : true;
  sections.value.forEach(
    (section, i) => (section.active = willOpen && i === index)
  );
};
</script>

<template>
  <div
    class="vc-agreements-list"
    :class="{ 'vc-agreements-list--external': props.externalScroll }"
  >
    <ul class="vc-agreements-list__sections">
      <li
        v-for="(section, index) in sections"
        :key="index"
        :class="[
          'vc-agreements-list__sections-item',
          'vc-agreements-list__item',
          `vc-agreements-list__item--${index}`,
          { 'vc-agreements-list__item--active': section.active },
        ]"
      >
        <div class="vc-agreements-list__item-container">
          <header
            class="vc-agreements-list__item-header"
            @click="toggleSection(index)"
          >
            <div class="vc-agreements-list__item-header-title-container">
              <BaseIcon
                name="tick-circle-filled"
                class="vc-agreements-list__item-header-icon"
              />
              <BaseText
                as="h2"
                variant="headline-6-bold"
                class="vc-agreements-list__item-header-title"
              >
                {{ section.name }}
              </BaseText>
            </div>
            <BaseIcon
              name="chevron-right"
              class="vc-agreements-list__item-header-icon vc-agreements-list__item-header-icon--chevron"
            />
          </header>

          <div class="vc-agreements-list__item-content">
            <component :is="section.component" />
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
@mixin custom-scrollbar() {
  $width: 6px;
  $thumb: $color-primary-100;
  $thumb-hover: $color-primary-70;
  $track: rgba($color-primary-50-light, 0.3);

  &::-webkit-scrollbar {
    width: $width;
    height: $width;
  }

  &::-webkit-scrollbar-track {
    background: $track;
    border-radius: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: $thumb;
    border-radius: 8px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: $thumb-hover !important;
  }

  scrollbar-gutter: stable both-edges;
}

$component-name: "vc-agreements-list";

.#{$component-name} {
  @include custom-scrollbar;

  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding-block: 30px;
  position: relative;
  scroll-behavior: auto;

  &--external {
    overflow: visible;
    padding-block: 0;
    height: auto;
  }

  &__sections {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-right: 16px;
  }

  &__item {
    &-container {
      background: $color-primary-5;
      border: 1px solid $color-base-black-15;
      border-radius: 30px;
      transition:
        border 0.2s ease-in-out,
        background 0.2s ease-in-out;

      .#{$component-name}__item--active & {
        border: 1px solid $color-primary-100;
        overflow: visible;
        max-height: none;
        box-shadow: 0 5px 20px 0 rgb(0 0 0 / 5%);
        background: rgba($color-base-white-80-light, 0.8);
        backdrop-filter: blur(13px);

        @at-root .theme-dark & {
          background: rgba($color-base-white-80-dark, 0.8);
        }
      }
    }

    &-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      padding: 16px;
      transition: padding 0.4s cubic-bezier(0.4, 0, 0.2, 1);

      .#{$component-name}__item--active & {
        padding-bottom: 0;
      }

      &-title-container {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      &-icon {
        color: $color-primary-100;
        font-size: 24px;

        &--chevron {
          font-size: 18px;
          transition: transform 0.2s ease-in-out;

          .#{$component-name}__item--active & {
            transform: rotate(90deg);
          }
        }
      }
    }

    &-content {
      max-height: 0;
      overflow: hidden;
      transition:
        max-height 0.2s cubic-bezier(0.4, 0, 0.2, 1),
        padding 0.2s cubic-bezier(0.4, 0, 0.2, 1),
        opacity 0.3s ease-in-out;
      padding-inline: 16px;
      padding-top: 0;
      padding-bottom: 0;
      opacity: 0;

      .#{ $component-name }__item--active & {
        max-height: 20000px;
        padding-block: 16px;
        opacity: 1;
        overflow: visible;
      }
    }
  }
}
</style>
