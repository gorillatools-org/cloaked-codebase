<script setup>
defineProps({
  cards: { type: Number, default: 4 },
});
</script>

<template>
  <div class="results-cards-skeleton">
    <div class="results-cards-skeleton__email">
      <div class="results-cards-skeleton__email-sm" />
      <div class="results-cards-skeleton__email-lg" />
    </div>

    <div class="results-cards-skeleton__list-title" />

    <hr class="results-cards-skeleton__divider" />

    <ul class="results-cards-skeleton__cards">
      <li
        v-for="card in cards"
        :key="card"
        class="results-cards-skeleton__card"
      >
        <div class="results-cards-skeleton__header">
          <div class="results-cards-skeleton__avatar" />
          <div class="results-cards-skeleton__head-col">
            <div
              class="results-cards-skeleton__line results-cards-skeleton__line--title"
            />
            <div
              class="results-cards-skeleton__line results-cards-skeleton__line--meta"
            />
          </div>
        </div>

        <div class="results-cards-skeleton__pills">
          <div class="results-cards-skeleton__pill" />
          <div class="results-cards-skeleton__pill" />
        </div>

        <hr class="results-cards-skeleton__divider" />

        <div class="results-cards-skeleton__foot">
          <div class="results-cards-skeleton__mini" />
          <div class="results-cards-skeleton__dot" />
        </div>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
@mixin skeleton {
  @at-root .theme-dark & {
    @include base-skeleton(
      $color-primary-10-light,
      0.1,
      $color-primary-10-dark,
      0.5
    );
  }

  @at-root .theme-light & {
    @include base-skeleton($color-primary-10);
  }
}

.results-cards-skeleton {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__email {
    display: flex;
    flex-direction: column;
    gap: 19px;
  }

  &__email-lg {
    width: min(420px, 85%);
    height: 28px;
    border-radius: 999px;
    margin: 0 auto;

    @include skeleton;

    @media all and (min-width: $screen-xl) {
      margin: 0;
    }
  }

  &__email-sm {
    width: min(200px, 45%);
    height: 21.6px;
    border-radius: 999px;
    display: none;

    @include skeleton;

    @media all and (min-width: $screen-xl) {
      display: block;
    }
  }

  &__list-title {
    width: 50%;
    height: 16px;
    border-radius: 999px;
    margin: 0 auto;

    @include skeleton;

    @media all and (min-width: $screen-xl) {
      margin: 0;
    }
  }

  &__cards {
    list-style: none;
    padding: 7px 0 0;
    margin: 0;
    display: grid;
    gap: 16px;
  }

  &__card {
    border-radius: 30px;
    padding: 20px;
    display: grid;
    row-gap: 12px;

    @include skeleton;

    @at-root .theme-dark & {
      @include base-skeleton(
        $color-primary-30-light,
        0.1,
        $color-primary-10-dark,
        0.5
      );
    }
  }

  &__header {
    display: grid;
    grid-template-columns: 44px 1fr;
    gap: 12px;
    align-items: center;
  }

  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: 999px;
    background-color: white !important;
    opacity: 1 !important;

    @include skeleton;
  }

  &__head-col {
    display: grid;
    gap: 9px;
  }

  &__line {
    height: 14px;
    border-radius: 999px;
    background-color: white !important;
    opacity: 1 !important;

    @include skeleton;
  }

  &__line--title {
    width: 55%;
    height: 24px;
    background-color: white !important;
    opacity: 1 !important;
  }

  &__line--meta {
    width: 45%;
    background-color: white !important;
    opacity: 1 !important;
  }

  &__pills {
    display: flex;
    gap: 8px;
    flex-direction: column;
    opacity: 1 !important;
  }

  &__pill {
    width: 90px;
    height: 22px;
    border-radius: 999px;
    background-color: white !important;
    opacity: 1 !important;

    @include skeleton;
  }

  &__divider {
    width: 100%;
    margin-top: 2px;
    height: 1px;

    @include skeleton;
  }

  &__foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 999px;
    width: 100px !important;
    opacity: 1 !important;
    background-color: white !important;
    margin-top: -9px !important;
    height: 30px !important;

    @include skeleton;
  }
}
</style>
