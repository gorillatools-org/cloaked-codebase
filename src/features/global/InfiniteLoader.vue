<script setup>
import { ref, watch } from "vue";
import { vElementVisibility } from "@vueuse/components";

const isVisible = ref(false);

const emit = defineEmits(["loadMore"]);

const props = defineProps({
  loading: Boolean,
  allDataFetched: Boolean,
});

function onElementVisibility(status) {
  if (props.allDataFetched) return;
  if (status && !props.loading && !props.allDataFetched) {
    emit("loadMore");
  }
  isVisible.value = status;
}

watch(
  () => props.loading,
  (loading) => {
    if (!loading && isVisible.value && !props.allDataFetched) {
      emit("loadMore");
    }
  }
);
</script>

<template>
  <div
    v-element-visibility="onElementVisibility"
    class="infinite-loader"
  >
    <div
      v-if="isVisible && loading"
      class="loading"
      :class="{ loaded: props.allDataFetched, visible: isVisible }"
    >
      <span />
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.infinite-loader {
  height: 50px;
  width: 100%;

  .visible {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    min-height: 10px;
  }

  .loading {
    // matches dimensions of cloak card
    width: 100%;
    height: 35px;
    display: flex;
    justify-content: center;
    align-items: center;

    > span {
      width: 15px;
      height: 15px;
      margin: 10px;
      display: inline-block;
      border: 3px solid $color-primary-70;
      border-top-color: transparent;
      border-radius: 50%;

      @include animation(spin linear 0.7s infinite);
      @include transition(all 0.3s ease);

      .loaded & {
        opacity: 0;
        visibility: hidden;

        @include transition-delay(0.2s);
      }

      @keyframes spin {
        from {
          @include transform(rotate(0));
        }

        to {
          transform: rotate(360deg);
        }
      }
    }
  }
}
</style>
