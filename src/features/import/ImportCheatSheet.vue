<script setup>
import BaseButton from "@/library/BaseButton.vue";
import Ping from "@/assets/icons/ping.svg";
import { HAS_SEEN_IMPORTER_CHEAT_SHEET } from "@/scripts/userFlags";
import UserService from "@/api/actions/user-service";
import { computed, useAttrs } from "vue";
import store from "@/store";

const props = defineProps({
  withPing: {
    type: Boolean,
    default: false,
  },
});

const attrs = useAttrs();

function onClick() {
  if (props.withPing) {
    UserService.setFlag({
      name: HAS_SEEN_IMPORTER_CHEAT_SHEET,
      value: true,
    });
  }
}

const isPingVisible = computed(() => {
  return (
    !store.getters.getFlag(HAS_SEEN_IMPORTER_CHEAT_SHEET) && props.withPing
  );
});
</script>
<template>
  <span class="import-cheat-sheet">
    <BaseButton
      v-bind="attrs"
      variant="secondary"
      icon="help"
      @click="onClick"
    >
      Help
    </BaseButton>
    <Transition name="ping">
      <Ping
        v-if="isPingVisible"
        class="import-cheat-sheet__ping"
      />
    </Transition>
  </span>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.import-cheat-sheet {
  position: relative;
  display: inline-block;

  @keyframes ping {
    0% {
      transform: translate3d(-50%, -50%, 0);
    }

    25% {
      transform: translate3d(-50%, calc(-50% - 3px), 0);
    }

    75% {
      transform: translate3d(-50%, calc(-50% + 3px), 0);
    }

    100% {
      transform: translate3d(-50%, -50%, 0);
    }
  }

  .button__text {
    display: flex;
    align-items: center;
  }

  &__help {
    path {
      fill: $color-primary-100;
    }
  }

  &__ping {
    position: absolute;
    z-index: 100;
    top: 100%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
    animation: ping infinite 1000ms linear;
    pointer-events: none;
  }
}

.ping-enter-active,
.ping-leave-active {
  transition: opacity 0.3s ease;
}

.ping-enter,
.ping-leave-to {
  opacity: 0;
}

.ping-enter-to,
.ping-leave {
  opacity: 1;
}
</style>
