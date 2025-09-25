<script setup>
defineProps({ rows: { type: Number, default: 5 } });
</script>

<template>
  <div class="services-skeleton">
    <div class="services-skeleton__title" />
    <ul class="services-skeleton__list">
      <li
        v-for="row in rows"
        :key="row"
        class="services-skeleton__row"
      >
        <span class="services-skeleton__dot" />
        <span class="services-skeleton__line" />
      </li>
    </ul>
    <div class="services-skeleton__more" />
  </div>
</template>

<style lang="scss" scoped>
@mixin skeleton {
  @at-root .theme-dark & {
    @include base-skeleton(
      $color-primary-30-light,
      0.1,
      $color-primary-10-dark,
      0.5
    );
  }

  @at-root .theme-light & {
    @include base-skeleton($color-primary-10);
  }
}

.services-skeleton {
  border-radius: 16px;
  padding-top: 6px;
  display: grid;
  row-gap: 27px;

  &__title {
    width: 35%;
    height: 16px;
    border-radius: 999px;

    @include skeleton;
  }

  &__list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    row-gap: 16px;
  }

  &__row {
    display: grid;
    align-items: center;
    grid-template-columns: 10px 1fr;
    column-gap: 5px;
  }

  &__dot {
    width: 6px;
    height: 6px;
    justify-self: center;
  }

  &__line {
    height: 14px;
    width: 80%;
    border-radius: 999px;

    @include skeleton;
  }

  &__more {
    width: 45%;
    height: 20px;
    margin-top: -10px;
    border-radius: 999px;

    @include skeleton;
  }
}
</style>
