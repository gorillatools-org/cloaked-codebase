<script setup>
import store from "@/store";
import IdentityIcon from "@/features/ui/IdentityIcon.vue";

const props = defineProps({
  information: {
    type: Object,
    required: true,
  },
});

function identity(id) {
  const identity = store.state.localdb.db_cloaks.find((item) => item.id === id);
  return identity;
}

function convertToDollar(amount) {
  return (amount / 100)
    .toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })
    .replace(/(\.0+|(?<=\.\d)0+)$/, ""); // Removes .00 or trailing 0 in decimals
}

function status(status) {
  if (status === "pending") {
    return "Pending final amount";
  } else if (status === "settled") {
    return "Purchase";
  } else if (status === "refunded") {
    return "Refunded";
  } else if (status === "declined") {
    return "Declined";
  }
}
</script>

<template>
  <div
    v-if="props.information"
    class="information"
  >
    <IdentityIcon
      :identity="
        identity(props.information?.identity || props.information?.identity_id)
      "
      class="identity-icon"
    />
    <h1
      v-if="props.information?.status"
      :class="props.information?.status"
    >
      {{ convertToDollar(props.information?.display_amount) }}
    </h1>
    <p
      v-if="
        identity(props.information?.identity || props.information?.identity_id)
          ?.website_url
      "
    >
      {{
        identity(props.information?.identity || props.information?.identity_id)
          ?.website_url
      }}
    </p>
    <div
      v-if="props.information?.status"
      class="button"
      :class="props.information?.status"
    >
      {{ status(props.information?.status) }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.information {
  width: 100%;
  display: flex;
  justify-content: center;
  flex-flow: column wrap;
  align-items: center;
  margin-bottom: 24px;

  .identity-icon {
    width: 60px !important;
    height: 60px !important;
    border-radius: 50%;
    margin-bottom: 12px;
  }

  h1 {
    color: $color-primary-100;
    font-size: 32px;
    font-style: normal;
    font-weight: 600;
    line-height: 40px; /* 125% */

    &.refunded {
      &::before {
        content: "+ ";
      }

      color: $color-success;
    }

    &.pending {
      color: $color-primary-50;
    }

    &.declined {
      color: $color-alert;
      text-decoration: line-through;
    }
  }

  p {
    color: $color-primary-100;
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
  }

  .button {
    margin-top: 12px;
    padding: 8px 16px;
    color: $color-primary-1;
    background-color: $color-primary-100;
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    border-radius: 30px;

    &.pending {
      background-color: $color-primary-90;
      color: $color-primary-100;
    }

    &.refunded {
      background-color: $color-success;
      color: $white;
    }

    &.declined {
      background-color: $color-alert;
      color: $white;
    }
  }
}
</style>
