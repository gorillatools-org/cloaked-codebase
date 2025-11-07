<script setup>
import inlineSvg from "@/features/InlineSvg";

const props = defineProps({
  icon: {
    type: String,
    default: "clap",
  },
  clickable: {
    type: Boolean,
    default: false,
  },
  text: {
    type: String,
    default: "Text is needed",
  },
  title: {
    type: String,
    default: "Title is needed",
  },
  subtext: {
    type: String,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <div
    class="button"
    :class="{ clickable: clickable, loading: props.loading }"
  >
    <div class="icon">
      <inlineSvg
        :key="props.icon"
        :name="props.icon"
      />
    </div>

    <div class="text">
      <p>{{ props.text }}</p>
      <h1>{{ props.title }}</h1>
      <p
        v-if="props.subtext"
        class="subtext"
      >
        {{ props.subtext }}
      </p>
      <slot v-else />
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.button {
  width: 100%;
  border-radius: 20px;
  color: $color-primary-100;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  border: 1px solid $color-base-black-10;
  padding: 16px;
  display: flex;
  gap: 16px;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-items: flex-start;
  overflow: hidden;

  @media (width >= 1200px) {
    gap: 0;
    flex-direction: column;
  }

  &.clickable {
    cursor: pointer;

    &:hover {
      background-color: $color-primary-10;
    }
  }

  &.loading {
    cursor: default;
    position: relative;

    .icon {
      background-color: $color-base-black-10;
      border-radius: 50%;
      mask: linear-gradient(-60deg, #000 30%, #0005, #000 70%) right/300% 100%;
      background-repeat: no-repeat;

      @include animation(shimmer 1s infinite);

      svg {
        opacity: 0;
      }
    }

    .text {
      h1 {
        position: relative;
        text-indent: 100%;
        white-space: nowrap;
        overflow: hidden;

        &::before {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 100%;
          height: 80%;
          background-color: $color-base-black-10;
          border-radius: 20px;
          mask: linear-gradient(-60deg, #000 30%, #0005, #000 70%) right/300%
            100%;
          background-repeat: no-repeat;

          @include animation(shimmer 1s infinite);
        }
      }

      p {
        position: relative;
        text-indent: 100%;
        white-space: nowrap;
        overflow: hidden;

        &::before {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 80%;
          height: 70%;
          background-color: $color-base-black-10;
          border-radius: 20px;
          mask: linear-gradient(-60deg, #000 30%, #0005, #000 70%) right/300%
            100%;
          background-repeat: no-repeat;

          @include animation(shimmer 1s infinite);
        }

        &:last-of-type {
          &::before {
            width: 90%;
          }
        }
      }
    }

    &:hover {
      background-color: transparent;
    }

    @keyframes shimmer {
      100% {
        mask-position: left;
      }
    }
  }

  .icon {
    width: 29px;
    height: 29px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 95%;
      height: auto;
      max-height: 80%;
      color: $color-primary-100;
    }
  }

  p {
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    display: inline-block;

    &:first-child {
      margin-bottom: 4px;
    }
  }

  .subtext {
    margin-top: 6px;
  }

  .text {
    flex-grow: 1;
    width: 100%;

    h1 {
      font-size: 18px;
      font-style: normal;
      font-weight: 600;
      line-height: normal;

      &::first-letter {
        text-transform: uppercase;
      }
    }
  }
}
</style>
