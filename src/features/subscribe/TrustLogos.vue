<script setup>
import InlineSvg from "@/features/InlineSvg.vue";
</script>

<template>
  <div class="trust-badges">
    <InlineSvg
      name="bbb-accredited-business-a-plus-badge"
      class="trust-badges__icon"
    />
    <InlineSvg
      name="pcmag-rated-excellent-badge"
      class="trust-badges__icon"
    />
  </div>
</template>

<style scoped lang="scss">
.trust-badges__icon {
  height: 50px;
  display: block;
}

.trust-badges {
  display: flex;
  align-items: center;
  gap: 20px;
  justify-content: center;
}

@media all and (min-width: $screen-xl) {
  .trust-badges {
    justify-content: left;
    flex-wrap: wrap;
  }
}
</style>
