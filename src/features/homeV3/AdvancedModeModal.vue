<script setup>
import AppModal from "@/features/ui/AppModal.vue";
import AppModalContent from "@/features/ui/AppModalContent.vue";
import InlineSvg from "@/features/InlineSvg.vue";
import BaseButton from "@/library/BaseButton.vue";

const props = defineProps({
  value: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["close", "goToAdvancedMode"]);
</script>

<template>
  <AppModal
    :value="props.value"
    @close="emit('close')"
  >
    <AppModalContent
      class="modal-wrapper"
      width="779px"
    >
      <div class="gradient-orange" />
      <div
        class="close"
        @click="$emit('close')"
      >
        <InlineSvg name="modal-x" />
      </div>
      <div class="modal-content">
        <div class="left">
          <h1>Advanced mode is true privacy power</h1>
          <h3>Enable incredible advanced privacy features at no cost:</h3>
        </div>
        <div class="right">
          <div class="benefits">
            <InlineSvg
              name="user-plus"
              style="color: #b3d900"
            />
            <p>
              Create new account information directly in your browser with the
              Chrome and Brave Extension (Safari on mobile).
            </p>
          </div>
          <div class="benefits">
            <InlineSvg
              name="key-filled"
              style="color: #faa542"
            />
            <p>Autofill and save password anywhere</p>
          </div>
          <div class="benefits">
            <InlineSvg
              name="lock-shield-filled"
              style="color: #ff550c"
            />
            <p>Stop data brokers and trackers from gathering info about you</p>
          </div>
          <div class="benefits">
            <InlineSvg name="plus" />
            <p>So much more - try it out today!</p>
          </div>
        </div>
      </div>
      <div class="footer">
        <BaseButton
          size="lg"
          variant="cloaked-gradient"
          @click="$emit('goToAdvancedMode')"
        >
          Enable advanced features
        </BaseButton>
      </div>
    </AppModalContent>
  </AppModal>
</template>

<style lang="scss" scoped>
.modal-wrapper {
  position: relative;
  padding: 48px 36px;
  border-radius: 24px;
  text-align: center;
  background-color: $color-base-white-100-dark;
  overflow: hidden;

  .gradient-orange {
    opacity: 0.8;
    background:
      linear-gradient(to bottom right, #8dbbff 0%, #ff4949 29%, #ff7a00 50%)
        bottom right / 50% 50% no-repeat,
      linear-gradient(to bottom left, #8dbbff 0%, #ff4949 29%, #ff7a00 50%)
        bottom left / 50% 50% no-repeat,
      linear-gradient(to top left, #8dbbff 0%, #ff4949 29%, #ff7a00 50%) top
        left / 50% 50% no-repeat,
      linear-gradient(to top right, #8dbbff 0%, #ff4949 29%, #ff7a00 50%) top
        right / 50% 50% no-repeat;
    filter: blur(146.71080017089844px);
    position: absolute;
    left: -414px;
    top: -98.933px;
    width: 734.655px;
    height: 263.109px;
  }
}

.close {
  position: absolute;
  top: 0;
  right: 0;
  padding: 20px 28px;
  color: $color-primary-100-dark;
  z-index: 1;
  cursor: pointer;
  transform: scale(1.3);
}

.modal-content {
  position: relative;
  z-index: 2;
  color: $color-primary-100-dark;
  display: flex;
  gap: 36px;
  justify-content: space-between;
  padding-top: 10px;

  .left {
    display: flex;
    flex-direction: column;
    gap: 20px;
    text-align: start;
    width: 51%;

    h1 {
      font-size: 32px;
      font-weight: 600;
      line-height: 40px;
      color: $color-primary-100-dark;
    }

    h3 {
      font-size: 15px;
      font-weight: 600;
      line-height: 22.5px;
      color: $color-primary-100-dark;
    }
  }

  .right {
    display: flex;
    flex-direction: column;
    gap: 20px;
    text-align: left;
    width: 49%;

    .benefits {
      display: flex;
      gap: 10px;
      align-items: start;

      svg {
        width: 16px;
        height: 16px;
        margin: 4px;
        color: $color-primary-100-dark;
      }

      p {
        font-size: 14px;
        font-weight: 500;
        line-height: 21px;
        width: 100%;
      }

      a {
        font-size: 12px;
        font-weight: 400;
        line-height: 18px;
        text-decoration-line: underline;
        cursor: pointer;
      }
    }
  }
}

.footer {
  display: flex;
  justify-content: start;

  button {
    color: $white;
    font-size: 14px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
  }
}
</style>
