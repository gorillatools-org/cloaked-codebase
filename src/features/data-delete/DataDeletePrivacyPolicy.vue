<script setup>
import InlineSvg from "@/features/InlineSvg.vue";
import BaseText from "@/library/BaseText.vue";
</script>

<template>
  <div class="data-delete-privacy-policy">
    <InlineSvg
      name="data-delete/shield"
      class="data-delete-privacy-policy__icon"
    />
    <BaseText
      as="p"
      variant="body-small-medium"
      class="data-delete-privacy-policy__text"
    >
      <slot>Your information is never stored.</slot>
      <!--      <a-->
      <!--        class="data-delete-privacy-policy__link"-->
      <!--        :href=WEBSITE_PRIVACY_POLICY_URL-->
      <!--        target="_blank"-->
      <!--        >Privacy policy ›</a-->
      <!--      >-->
    </BaseText>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.data-delete-privacy-policy {
  &__icon {
    display: block;
    margin: auto;
  }

  &__text {
    text-align: center;
    opacity: 0.9;
    margin-top: 8px;
    color: $color-primary-100;

    @media all and (min-width: $screen-xl) {
      font-size: 15px;
    }
  }

  //&__link {
  //  text-decoration: underline;
  //  cursor: pointer;
  //
  //  &:hover {
  //    opacity: 0.8;
  //  }
  //}
}
</style>
