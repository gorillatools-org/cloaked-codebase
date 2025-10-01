<script setup>
import InlineSvg from "@/features/InlineSvg.vue";
import { DATA_REMOVAL_STATUS } from "@/scripts/constants";
import store from "@/store";
import { format } from "@/scripts/format";
import BaseText from "@/library/BaseText.vue";
import { computed } from "vue";

const props = defineProps({
  brokerName: {
    type: String,
    required: true,
  },
  records: {
    type: Array,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  svgIcon: {
    type: String,
    required: true,
  },
});

function formatPhone(phone) {
  if (phone === "available") {
    return "Found on broker";
  }
  const formattedPhone = format.formatPhone(phone);
  if (formattedPhone) {
    return formattedPhone;
  }
  if (phone?.length) {
    return phone;
  }
  return "—";
}

function formatEmail(email) {
  if (email === "available") {
    return "Found on broker";
  }
  if (email?.length) {
    return email.toLowerCase();
  }
  return "—";
}

function formatGeneralText(text) {
  if (text === "available") {
    return "Found on broker";
  }
  if (text?.length) {
    return text;
  }
  return "—";
}

function showFoundOnBrokerModal() {
  store.dispatch("openModal", {
    header: "Found on Broker",
    paragraphs: [
      'When a piece of information is marked as "Found on Broker" this means that the information has been exposed but is not available for us to display,',
      "It is important to make sure that all records are removed, even if you cannot see the piece of information.",
    ],
    cancelText: "Got it",
  });
}

function getUniqueRecords(records) {
  const uniqueRecords = [];
  const recordSet = new Set();

  records.forEach((record) => {
    const recordString = JSON.stringify(record?.pii);
    if (!recordSet.has(recordString)) {
      recordSet.add(recordString);
      uniqueRecords.push(record);
    }
  });

  return uniqueRecords;
}

const uniqueRecords = computed(() => getUniqueRecords(props.records));
</script>

<template>
  <div class="people-wrapper">
    <div
      v-if="uniqueRecords.length"
      class="person-item"
    >
      <BaseText
        as="div"
        variant="body-small-medium"
        class="person-column header"
      >
        Name
      </BaseText>
      <BaseText
        as="div"
        variant="body-small-medium"
        class="person-column header"
      >
        Location
      </BaseText>
      <BaseText
        as="div"
        variant="body-small-medium"
        class="person-column header long"
      >
        Phone number
      </BaseText>
      <BaseText
        as="div"
        variant="body-small-medium"
        class="person-column header short"
      >
        Phone
      </BaseText>
      <BaseText
        as="div"
        variant="body-small-medium"
        class="person-column header long"
      >
        Email address
      </BaseText>
      <BaseText
        as="div"
        variant="body-small-medium"
        class="person-column header short"
      >
        Email
      </BaseText>
      <BaseText
        as="div"
        variant="body-small-medium"
        class="person-column header"
      >
        Relatives:
      </BaseText>
    </div>
    <div
      v-for="(record, index) in uniqueRecords"
      :key="index"
      class="person-item"
    >
      <div class="person-column person-name-row">
        <InlineSvg
          :name="svgIcon"
          :class="{
            scanning: props.status === DATA_REMOVAL_STATUS.SCANNING,
            'in-progress':
              props.status === DATA_REMOVAL_STATUS.REMOVAL_IN_PROGRESS,
            'no-records-found':
              props.status === DATA_REMOVAL_STATUS.NO_RECORDS_FOUND,
            removed: props.status === DATA_REMOVAL_STATUS.REMOVED,
          }"
        />
        <BaseText
          v-if="record?.pii?.full_name?.length"
          variant="body-small-medium"
          :class="{ clickable: record?.pii?.full_name === 'available' }"
          @click.stop="
            record?.pii?.full_name === 'available' && showFoundOnBrokerModal()
          "
        >
          {{ index + 1 }}.
          {{ formatGeneralText(record?.pii?.full_name?.toLowerCase()) }}
          <span class="info-circle">
            <InlineSvg
              v-if="record?.pii?.full_name === 'available'"
              name="question-info-circle-filled"
            />
          </span>
        </BaseText>
        <BaseText
          v-else
          variant="body-small-medium"
        >
          —
        </BaseText>
      </div>
      <div class="person-column">
        <BaseText
          v-for="(address, idx) in record?.pii?.addresses"
          :key="`${idx}-${address}`"
          as="div"
          variant="body-small-medium"
          class="person-location"
          :class="{ clickable: address === 'available' }"
          @click.stop="address === 'available' && showFoundOnBrokerModal()"
        >
          {{ formatGeneralText(address) }}
          <span class="info-circle">
            <InlineSvg
              v-if="address === 'available'"
              name="question-info-circle-filled"
            />
          </span>
        </BaseText>
      </div>
      <div class="person-column">
        <BaseText
          v-for="(phone, idx) in record?.pii?.phone_numbers"
          :key="`${idx}-${phone}`"
          variant="body-small-medium"
          class="person-phone-email"
          :class="{ clickable: phone === 'available' }"
          @click.stop="phone === 'available' && showFoundOnBrokerModal()"
        >
          {{ formatPhone(phone) }}
          <span class="info-circle">
            <InlineSvg
              v-if="phone === 'available'"
              class="info-circle"
              name="question-info-circle-filled"
            />
          </span>
        </BaseText>
      </div>
      <div class="person-column">
        <BaseText
          v-for="(email, idx) in record?.pii?.email_addresses"
          :key="`${idx}-${email}`"
          variant="body-small-medium"
          class="person-phone-email"
          :class="{ clickable: email === 'available' }"
          @click.stop="email === 'available' && showFoundOnBrokerModal()"
        >
          {{ formatEmail(email) }}
          <span class="info-circle">
            <InlineSvg
              v-if="email === 'available'"
              class="info-circle"
              name="question-info-circle-filled"
            />
          </span>
        </BaseText>
      </div>
      <div class="person-column person-relatives">
        <ul v-if="record?.pii?.relatives?.length">
          <BaseText
            v-for="relative in record?.pii?.relatives"
            :key="relative"
            variant="body-small-medium"
            as="li"
            :class="{ clickable: relative === 'available' }"
            @click.stop="relative === 'available' && showFoundOnBrokerModal()"
          >
            {{ formatGeneralText(relative) }}
            <span class="info-circle">
              <InlineSvg
                v-if="relative === 'available'"
                name="question-info-circle-filled"
              />
            </span>
          </BaseText>
        </ul>
        <BaseText
          v-else
          variant="body-small-medium"
        >
          —
        </BaseText>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.people-wrapper {
  justify-content: center;
  align-items: flex-start;
  flex-direction: column;
  color: $color-primary-100;
  gap: 16px;
  display: flex;
  overflow: hidden;
  width: 100%;
  margin-top: 40px;
}

.person-list {
  list-style-type: none;
  padding: 0;
}

.person-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  gap: 8px;

  .person-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    color: $color-primary-70;
    width: calc((100% - 30px) / 4); // 100% - gaps / 4 columns
    .person-phone-email {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      gap: 4px;
    }
    > svg {
      height: 19px;
      width: auto;
      &.in-progress {
        color: $color-warning;
      }
      &.no-records-found {
        color: $color-lt-green;
      }
      &.removed {
        color: $color-success;
      }
      &.scanning {
        color: $color-primary-10;
      }
    }

    &.header {
      color: $color-primary-100;
    }

    &.long {
      display: flex;
      @include line-clamp(1);
      @media (max-width: 1195px) {
        display: none;
      }
    }
    &.short {
      display: none;
      @media (max-width: 1195px) {
        display: flex;
        @include line-clamp(1);
      }
    }

    &.person-relatives {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
      ul {
        list-style-type: none;
        padding: 0;
        li {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: flex-start;
          gap: 4px;
        }
      }
    }

    &.person-name-row {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      gap: 8px;
      text-transform: capitalize;
      span {
        text-wrap: wrap;
        word-break: break-all;
      }
      > svg {
        flex-shrink: 0;
      }
    }

    .person-location {
      text-transform: capitalize;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
  }
}

.info-circle {
  cursor: pointer;
  color: $color-primary-100;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  > svg {
    height: 15px;
    width: auto;
  }
}

.clickable {
  cursor: pointer;
}
</style>
