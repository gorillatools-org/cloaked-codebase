<script setup>
import BaseText from "@/library/BaseText";

const props = defineProps({
  tableContent: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every((row) => {
        return row.header && row.content.every((cell) => cell.title);
      });
    },
  },
});
</script>

<template>
  <div class="table-content">
    <table>
      <tr
        v-for="tableRow in props.tableContent"
        :key="tableRow.header"
      >
        <th>
          <BaseText
            as="span"
            variant="body-small-medium"
          >
            {{ tableRow.header }}:
          </BaseText>
        </th>
        <td>
          <div
            v-for="tableData in tableRow.content"
            :key="tableData.title"
          >
            <BaseText
              as="p"
              variant="body-small-medium"
            >
              {{ tableData.title }}
              <span
                v-if="tableData.subtitle"
                class="td-subtitle"
              >
                {{ tableData.subtitle }}
              </span>
              <span
                v-if="tableData.original"
                class="td-subtitle"
              >
                &#60;{{ tableData.original }}&#62;
              </span>
            </BaseText>
          </div>
        </td>
      </tr>
    </table>
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.table-content {
  padding: 14px 0 0;
  display: flex;
  flex-direction: column;
  word-break: normal;

  table {
    text-align: left;
  }

  th {
    color: $color-primary-50;
    vertical-align: top;
    max-width: 72px;
  }

  tr:last-child {
    th,
    td {
      padding: 0 42px 0 0;
    }
  }

  td {
    padding: 0 0 14px;
    word-break: break-all;
    color: $color-primary-100;

    .td-subtitle {
      color: $color-primary-70;
      display: block;
      width: 100%;
    }
  }

  .modal-flex {
    display: flex;
    flex-direction: column;
  }
}
</style>
