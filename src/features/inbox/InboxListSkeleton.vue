<script setup></script>

<template>
  <div style="overflow: hidden">
    <div
      v-for="index in 20"
      :key="index"
      class="skeleton-row"
    >
      <div class="skel-group">
        <div class="small-circle" />
        <div class="big-circle" />
        <div class="short-oval" />
      </div>
      <div class="ovals-group">
        <div class="long-oval" />
        <div class="short-oval" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
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

  height: 50px;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: $color-base-white-100;
  border-bottom: 1px solid $color-primary-10;

  $total_elements: 20; // however many are needed on screen
  $opacity_step: calc(1 / $total_elements);

  @for $i from 1 through $total_elements {
    &:nth-child(#{$i}) {
      opacity: 1 - ($opacity_step * ($i - 1));
    }
  }

  .skel-group {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
    flex: 1;

    .small-circle {
      border: 1px solid $color-primary-30;
      border-radius: 50%;
      height: 12px;
      width: 12px;
    }

    .big-circle {
      height: 32px;
      width: 32px;
      border-radius: 50%;
      background-color: $color-primary-10;
    }

    .short-oval {
      height: 10px;
      width: 128px;
      border-radius: 20px;
      background-color: $color-primary-30;
      mask: var(--linear-gradient);
      background-repeat: no-repeat;
      animation: shimmer 1s infinite;
    }
  }

  .ovals-group {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
    flex: 3;

    .long-oval {
      height: 10px;
      width: 300px;
      border-radius: 20px;
      background-color: $color-primary-30;
      mask: var(--linear-gradient);
      background-repeat: no-repeat;
      animation: shimmer 1s infinite;
      animation-delay: 1s;
    }

    .short-oval {
      height: 10px;
      width: 128px;
      border-radius: 20px;
      background-color: $color-primary-30;
      mask: var(--linear-gradient);
      background-repeat: no-repeat;
      animation: shimmer 1s infinite;
      animation-delay: 2s;
    }
  }
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
