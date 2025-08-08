<script setup>
import IconThumb from "@/assets/icons/icon-thumb.svg";
import { onBeforeUnmount, reactive } from "vue";

const props = defineProps({
  source: {
    type: String,
    required: true,
  },
});

const state = reactive({
  isHelpful: null,
  whatWentWrong: null,
  whatWentWrongDescription: "",
  isSubmitted: false,
});
function onSubmit() {
  state.isSubmitted = true;

  fetch("https://hooks.zapier.com/hooks/catch/1765241/b0esrao/", {
    method: "POST",
    body: JSON.stringify({
      source: props.source,
      wasHelpful: state.isHelpful ? "Yes" : "No",
      reason: state.isHelpful
        ? ""
        : state.whatWentWrong === "unclear"
          ? "The instructions are inaccurate or misleading"
          : state.whatWentWrongDescription.trim(),
      dateTime: new Date().toISOString(),
    }),
  });
}
function onIsHelpful() {
  state.isHelpful = true;
  onSubmit();
}
onBeforeUnmount(() => {
  if (state.isHelpful === false && !state.isSubmitted) {
    onSubmit();
  }
});
</script>

<template>
  <div class="feedback-for-guide">
    <transition
      name="feedback"
      mode="out-in"
    >
      <div
        v-if="state.isHelpful === null"
        key="screen-1"
        class="feedback-for-guide__initial"
      >
        Was this helpful?
        <button
          class="feedback-for-guide__button"
          @click="onIsHelpful"
        >
          <IconThumb class="feedback-for-guide__icon-up" />
          Yes
        </button>
        <button
          class="feedback-for-guide__button"
          @click="state.isHelpful = false"
        >
          <IconThumb class="feedback-for-guide__icon-down" />
          No
        </button>
      </div>
      <div
        v-else-if="state.isHelpful === true || state.isSubmitted"
        key="screen-2"
      >
        Thanks for your feedback!
      </div>
      <form
        v-else
        key="screen-3"
        class="feedback-for-guide__form"
      >
        <fieldset class="feedback-for-guide__form-fieldset">
          <legend>Sorry about that. What was the problem?</legend>
          <label class="feedback-for-guide__label">
            <input
              type="radio"
              class="feedback-for-guide__radio"
              @input="state.whatWentWrong = 'unclear'"
            />
            The instructions are inaccurate or misleading
          </label>
          <label class="feedback-for-guide__label">
            <input
              type="radio"
              value="other"
              class="feedback-for-guide__radio"
              @input="state.whatWentWrong = 'other'"
            />
            Something else
          </label>
          <textarea
            v-show="state.whatWentWrong === 'other'"
            :value="state.whatWentWrongDescription"
            placeholder="Describe the problem"
            class="feedback-for-guide__textarea"
            rows="4"
            @input="(event) => (state.whatWentWrongDescription = event)"
          />
        </fieldset>
        <button
          type="submit"
          class="feedback-for-guide__submit"
          @click.prevent="onSubmit"
        >
          Submit
        </button>
      </form>
    </transition>
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.feedback-for-guide {
  margin-top: 24px;
  font-weight: 500;
  font-size: 14px;
  line-height: 21px;
  color: $color-primary-100;

  &__initial {
    display: flex;
    align-items: center;
  }

  &__button {
    margin-left: 12px;
    display: flex;
    align-items: center;
    border: none;
    background: $color-primary-1;
    color: $color-primary-100;
    box-shadow:
      0 0 12px rgb(0 0 0 / 4%),
      0 1px 4px rgb(1 2 24 / 8%);
    border-radius: 36px;
    padding: 6px 14px 6px 10px;
    cursor: pointer;

    &:first-child {
      margin-left: 16px;
    }

    &:hover {
      background: $color-primary-5;
    }
  }

  &__icon-up,
  &__icon-down {
    margin-right: 4px;
  }

  &__icon-down {
    transform: rotate(180deg);
  }

  &__form {
    &-fieldset {
      display: flex;
      flex-direction: column;
      border: none;
      padding: 0;
    }
  }

  &__label {
    font-weight: 400;
    margin-top: 15px;
    cursor: pointer;
    display: flex;
    align-items: center;
  }

  &__radio {
    border: 2px solid #6251f8;
    border-radius: 20px;
    height: 20px;
    width: 20px;
    margin: 0 8px 0 0;

    &:checked {
      border: 6px solid #6251f8;
    }
  }

  &__textarea {
    margin-top: 15px;
    padding: 12px;
    background: $color-primary-5;
    border-radius: 8px;
    border: none;
    font-family: $global-font;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    color: $color-primary-50;
  }

  &__submit {
    margin-top: 15px;
    background: $color-primary-100;
    border-radius: 999px;
    border: none;
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
    color: $color-primary-1;
    cursor: pointer;
    padding: 11px 16px;

    &:hover {
      opacity: 0.9;
    }
  }

  .feedback-enter-active,
  .feedback-leave-active {
    transition: all 0.15s ease-out;
  }

  .feedback-leave-to {
    transform: translateY(-25px);
    opacity: 0;
  }

  .feedback-enter {
    transform: translateY(25px);
    opacity: 0;
  }
}
</style>
