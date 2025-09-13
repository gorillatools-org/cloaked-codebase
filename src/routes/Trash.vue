<script setup>
import { reactive } from "vue";
import IdentifierTrashList from "./Trash/IdentifiersTrashList.vue";
const TYPE = {
  IDENTITY: "identity",
  ACTIVITY: "activity",
};

const ui = reactive({
  type: TYPE.IDENTITY,
});

function setType(type) {
  ui.type = type;
}
</script>
<template>
  <div class="trash-container">
    <IdentifierTrashList
      v-if="ui.type === TYPE.IDENTITY"
      :types="TYPE"
      :type="ui.type"
      @set-type="setType"
    />
  </div>
</template>
<style lang="scss" scoped>
.trash-container {
  height: 100%;
}
</style>
