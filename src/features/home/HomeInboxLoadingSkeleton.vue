<script setup></script>

<template>
  <div class="loading-skel-wrapper">
    <div
      v-for="index in 5"
      :key="index"
      class="skeleton-row"
    >
      <div class="small-circle" />
      <div class="col">
        <div class="long-oval" />
        <div class="short-oval" />
      </div>

      <div class="right-most-oval" />
    </div>
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.loading-skel-wrapper {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  border: 1px solid $color-primary-10;
}

.skeleton-row {
  --linear-gradient: linear-gradient(
      -90deg,
      rgb(255 255 255 / 40%) 30%,
      rgb(255 255 255 / 90%),
      rgb(255 255 255 / 40%) 70%
    )
    right/300% 100%;

  @at-root .theme-dark & {
    --linear-gradient: linear-gradient(
        -90deg,
        rgb(25 30 35 / 20%) 30%,
        rgb(25 30 35 / 70%),
        rgb(25 30 35 / 20%) 70%
      )
      right/300% 100%;
  }

  border-radius: 12px;
  height: 64px;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  background-color: $color-base-white-100;
  border-bottom: 1px solid $color-primary-10;
  gap: 12px;
  padding: 10px;
  padding-top: 20px;

  $total_elements: 5; // however many are needed on screen
  $opacity_step: calc(1 / $total_elements);

  @for $i from 1 through $total_elements {
    &:nth-child(#{$i}) {
      opacity: 1 - ($opacity_step * ($i - 1));
    }
  }

  .small-circle {
    background-color: $color-primary-10;
    border-radius: 50%;
    height: 16px;
    width: 16px;
  }
}

.col {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 5px;
  flex-grow: 1;

  .long-oval {
    height: 11px;
    width: 100%;
    border-radius: 30px;
    background-color: $color-primary-30;
    mask: var(--linear-gradient);
    background-repeat: no-repeat;
    animation: shimmer 1s infinite;
    animation-delay: 1s;
  }

  .short-oval {
    height: 11px;
    width: 60%;
    border-radius: 30px;
    background-color: $color-primary-30;
    mask: var(--linear-gradient);
    background-repeat: no-repeat;
    animation: shimmer 1s infinite;
    animation-delay: 2s;
  }
}

.right-most-oval {
  margin-left: 48px;
  height: 11px;
  width: 10%;
  border-radius: 30px;
  background-color: $color-primary-30;
  mask: var(--linear-gradient);
  background-repeat: no-repeat;
  animation: shimmer 1s infinite;
  animation-delay: 2s;
}

@media (width <= 1050px) {
  .skeleton-row .ovals-group .long-oval {
    width: 150px;
  }

  .skeleton-row .ovals-group .short-oval {
    width: 64px;
  }

  .skeleton-row .skel-group .short-oval {
    width: 64px;
  }
}

@keyframes shimmer {
  100% {
    mask-position: left;
  }
}
</style>
