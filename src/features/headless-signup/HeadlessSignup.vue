<template>
  <iframe
    allow="clipboard-read; clipboard-write"
    frameborder="0"
    class="headless-signup"
  />
</template>

<style lang="scss" scoped>
.headless-signup {
  background-color: green;
  position: fixed;
  z-index: 1000;
  top: -10px;
  left: -10px;
  border: none;
  width: 1px;
  height: 1px;
}
</style>
