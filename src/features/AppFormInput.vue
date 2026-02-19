<script setup>
defineEmits(["input", "keydown"]);
</script>

<template>
  <label
    class="app-form-input"
    :class="{
      'app-form-input--error': $attrs.error,
      'app-form-input--success': $attrs.success,
    }"
  >
    <slot />
    <span class="app-form-input__wrapper">
      <slot name="before-input" />
      <div
        v-if="$attrs['is-button']"
        class="app-form-input__input app-form-input__button"
        :class="{ 'app-form-input__input--label': !!$attrs.label }"
      >
        <span
          v-if="$attrs.label"
          class="label"
        >
          {{ $attrs.label }}
        </span>
        <span>{{ $attrs.value }}</span>
        <span><slot name="after-input" /></span>
      </div>
      <div v-else>
        <span
          v-if="$attrs.label"
          class="label"
        >
          {{ $attrs.label }}
        </span>
        <input
          :value="$attrs.value"
          v-bind="$attrs"
          class="app-form-input__input"
          :class="{
            'app-form-input__input--label': !!$attrs.label,
            'app-form-input__input--no-decoration': $attrs.type === 'email',
          }"
          @input.stop="$emit('input', $event.target.value)"
          @keydown="$emit('keydown', $event)"
        />

        <slot name="after-input" />
      </div>
    </span>
    <slot name="after" />
  </label>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.app-form-input {
  display: block;
  color: $color-primary-100;
  font-family: $global-font;
  font-size: 13px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;

  &__wrapper {
    display: block;
    position: relative;
  }

  &__button {
    cursor: pointer;
    align-items: center;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  &__input {
    width: 100%;
    padding: 18px 16px;
    border-radius: 16px;
    border: 1px solid $color-primary-30;
    color: $color-primary-100;
    font-family: $global-font;
    font-size: 15px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    background: $color-base-white-100;
    text-transform: capitalize;

    &--label {
      padding-bottom: 15px !important;
      padding-top: 33px !important;
    }

    &--no-decoration {
      text-transform: none;
    }

    &::placeholder {
      font-weight: 400;
      color: $color-primary-100;
      opacity: 0.4;
    }

    @media (width >= 700px) {
      padding: 28px 20px;
    }

    &:hover {
      border: 1px solid $color-primary-50;
    }

    &:focus {
      outline: 2px solid $color-primary-100;
    }

    &:disabled {
      border: 1px solid $color-primary-30;
      background-color: $color-primary-5;
      cursor: not-allowed;
    }

    @at-root .app-form-input--error & {
      border: 1px solid $color-alert;

      &:focus {
        outline: 2px solid $color-alert;
      }
    }

    @at-root .app-form-input--success & {
      border: 1px solid $color-success;

      &:focus {
        outline: 2px solid $color-success;
      }
    }
  }
}

.label {
  position: absolute;
  top: 15px;
  left: 20px;
  font-size: 10px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  color: $color-primary-50;
}
</style>
