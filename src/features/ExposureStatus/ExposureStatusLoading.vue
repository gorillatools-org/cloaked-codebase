<template>
  <div class="exposure-status-loading">
    <div class="exposure-status-loading__sections">
      <div
        v-for="sIdx in 2"
        :key="`skeleton-section-${sIdx}`"
        class="exposure-status-loading__section"
      >
        <div class="exposure-status-loading__section-title skeleton-box" />

        <div class="exposure-status-loading__items">
          <div
            v-for="n in 3"
            :key="`skeleton-item-${sIdx}-${n}`"
            class="exposure-status-loading__item"
          >
            <div class="exposure-status-loading__item-left">
              <div class="skeleton-circle exposure-status-loading__item-icon" />
              <div class="exposure-status-loading__item-lines">
                <div
                  class="skeleton-box"
                  style="width: 200px; height: 16px"
                />
                <div
                  class="skeleton-box"
                  style="height: 12px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.exposure-status-loading {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  height: 100%;
  width: 100%;
  background-color: $color-primary-5;
  z-index: 5;
  transition: opacity 0.5s ease;
  padding: 24px;

  &__header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: 920px;
    margin-top: 24px;
    gap: 12px;
  }

  &__header-icon {
    width: 24px;
    height: 24px;
  }

  &__header-right {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    margin-left: auto;
  }

  &__sections {
    width: 100%;
    max-width: 920px;
    margin-top: 16px;
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
  }

  &__section-title {
    width: 160px;
    height: 28px;
    border-radius: 8px;
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  &__item {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background-color: $color-primary-5;
    border: 1px solid $color-primary-10;
    border-radius: 12px;
    width: 100%;
  }

  &__item-left {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    width: 100%;
  }

  &__item-icon {
    width: 40px;
    height: 40px;
  }

  &__item-lines {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  &__item-progress {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    margin-right: 24px;
  }

  &__item-toggle {
    width: 40px;
    height: 40px;
  }

  &--hidden {
    opacity: 0;
    pointer-events: none;
  }

  /* Skeleton primitives */
  .skeleton-box,
  .skeleton-circle {
    display: inline-block;
    position: relative;
    overflow: hidden;
    background-color: $color-primary-10;
  }

  .skeleton-box {
    border-radius: 8px;
  }

  .skeleton-circle {
    border-radius: 50%;
  }

  .skeleton-box::after,
  .skeleton-circle::after {
    position: absolute;
    inset: 0;
    transform: translateX(-100%);
    background-image: linear-gradient(
      90deg,
      rgba($white, 0) 0,
      rgba($white, 0.2) 20%,
      rgba($white, 0.5) 60%,
      rgba($white, 0)
    );
    animation: shimmer 5s infinite;
    content: "";

    @at-root .theme-dark & {
      background-image: linear-gradient(
        90deg,
        rgba($color-background, 0) 0,
        rgba($color-background, 0.2) 20%,
        rgba($color-background, 0.5) 60%,
        rgba($color-background, 0)
      );
    }
  }

  @keyframes shimmer {
    100% {
      transform: translateX(100%);
    }
  }
}
</style>
