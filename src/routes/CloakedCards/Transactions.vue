<script setup>
import { onMounted } from "vue";
import CardsServices from "@/api/actions/cards-services";

onMounted(() => {
  CardsServices.getTransactions();
});
</script>

<template>
  <section class="page">
    <div class="title">
      <h1>Transactions</h1>
    </div>

    <img
      src="https://media3.giphy.com/media/9HQRIttS5C4Za/giphy.gif?cid=ecf05e472dgw7fiwbxh2o3gdb4w9eoxnp5092td95kyys3q4&ep=v1_gifs_search&rid=giphy.gif&ct=g"
      alt="Loading"
    />
  </section>
</template>

<style scoped lang="scss">
/* stylelint-disable */
section.page {
  width: 100%;
  padding: 24px 32px;
  .title {
    margin-bottom: 48px;
    color: $color-primary-100;
    font-weight: 500;
    font-size: 32px;
    line-height: 48px;
  }
}
img {
  padding: 0;
  background-color: transparent;
  max-width: auto;
  max-height: auto;
}
</style>
