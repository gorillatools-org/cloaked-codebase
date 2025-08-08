<template>
  <div class="checkout-card">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.checkout-card {
  padding: 24px 16px;
  border-radius: 16px;
  background: rgb(255 255 255 / 10%);
  display: flex;
  flex-direction: column;
  row-gap: 36px;

  @media all and (min-width: $screen-md) {
    padding: 24px;
  }

  & + & {
    margin-top: 36px;
  }
}
</style>
