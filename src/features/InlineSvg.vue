<script setup>
import { computed, defineAsyncComponent } from "vue";

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
});

const namePath = computed(() => props.name.split("/"));

const inlineSvg =
  namePath.value.length === 1
    ? defineAsyncComponent(
        () => import(`@/assets/icons/${namePath.value[0]}.svg`)
      )
    : defineAsyncComponent(
        () =>
          import(`@/assets/icons/${namePath.value[0]}/${namePath.value[1]}.svg`)
      );
</script>

<template>
  <Component
    :is="inlineSvg"
    :key="name"
  />
</template>
