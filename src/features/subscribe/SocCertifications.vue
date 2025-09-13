<script setup>
import InlineSvg from "@/features/InlineSvg.vue";
</script>

<template>
  <div class="soc-certifications">
    <ul class="soc-certifications__list">
      <li class="soc-certifications__list-item">
        <InlineSvg
          name="shield-lightening"
          class="soc-certifications__icon"
        />
        SOC 2 Type 2 2024
      </li>
      <li class="soc-certifications__list-item">
        <InlineSvg
          name="shield-lightening"
          class="soc-certifications__icon"
        />
        SOC 2 Type 1 2023
      </li>
      <li class="soc-certifications__list-item">
        <InlineSvg
          name="shield-lightening"
          class="soc-certifications__icon"
        />
        ISO 27701 Certified
      </li>
    </ul>
    <p class="soc-certifications__text">
      Cloaked is independently audited and secured with state of the art
      encryption. Once your account is encrypted you’re the only one who can
      access it.
    </p>
  </div>
</template>

<style scoped lang="scss">
.soc-certifications {
  &__list {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 12px 8px;

    &-item {
      padding: 12px 20px;
      display: flex;
      align-items: center;
      flex-shrink: 0;
      gap: 8px;
      font-size: 10px;
      font-style: normal;
      font-weight: 600;
      line-height: normal;
      background: $color-base-black-5;
      border-radius: 100px;
      backdrop-filter: blur(22px);

      @media screen and (min-width: $screen-md) {
        padding: 12px 24px;
        font-size: 13px;
      }
    }
  }

  &__icon {
    width: 16px;
    height: 16px;

    @media screen and (min-width: $screen-md) {
      width: 20px;
      height: 20px;
    }
  }

  &__text {
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    text-align: center;
    margin-top: 24px;
  }
}
</style>
