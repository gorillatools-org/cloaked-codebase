<template>
  <div>
    <p>
      Below is a list of all fees for Cloaked Pay Prepaid Cards. All fees
      assessed by us are deducted from the available balance in your card
      account. If your card account does not have sufficient funds available to
      cover a fee, the amount of such fee will be deducted from any funds
      subsequently loaded to your card account. The fees that apply to your card
      account are as follows:
    </p>
    <p>
      Cloaked charges a subscription fee, as provided at sign-up, for access to
      an array of Cloaked products and services. This fee is not specific to
      your Card use.
    </p>
    <table>
      <thead>
        <tr>
          <th>All Fees</th>
          <th>Amount</th>
          <th>Details</th>
        </tr>
      </thead>

      <tbody>
        <tr>
          <td colspan="3">Get Started</td>
        </tr>

        <tr>
          <td>Card Purchase</td>
          <td>$0</td>
          <td>Fee charged for purchase of the Cloaked Pay Prepaid Card.</td>
        </tr>

        <tr>
          <td>Secondary Card Purchase Fee</td>
          <td>$0</td>
          <td>
            Fee charged for purchase of secondary Cloaked Pay Prepaid Card.
          </td>
        </tr>

        <tr>
          <td colspan="3">Monthly Usage</td>
        </tr>

        <tr>
          <td>Monthly Fee</td>
          <td>$0</td>
          <td>
            Cloaked Card availability is included in your subscription to
            Cloaked, which includes all Cloaked core and Cloaked Card products
            and services. If you are eligible for Cloaked Card, you can gain
            Cloaked Card access with an active and paid Cloaked subscription.
          </td>
        </tr>

        <tr>
          <td colspan="3">Add Money</td>
        </tr>

        <tr>
          <td>Funding from a Bank Account</td>
          <td>$0</td>
          <td />
        </tr>

        <tr>
          <td colspan="3">Information</td>
        </tr>

        <tr>
          <td>Automated & Live Agent Phone Calls</td>
          <td>$0</td>
          <td>No fee for each customer service contact with a live agent.</td>
        </tr>

        <tr>
          <td>Email and Text Message Alerts</td>
          <td>$0</td>
          <td>Standard text messaging rates may apply.</td>
        </tr>

        <tr>
          <td>Mobile Application</td>
          <td>$0</td>
          <td>Standard data rates and service carrier fees may apply.</td>
        </tr>

        <tr>
          <td>Mailed Periodic Statement Fee</td>
          <td>$0</td>
          <td>One request per month is included at no charge.</td>
        </tr>

        <tr>
          <td colspan="3">Using your card outside the U.S.</td>
        </tr>

        <tr>
          <td>Foreign Transaction Fee</td>
          <td>$0</td>
          <td>
            You may be charged a fee by any retailers or financial institutions
            involved in your transaction.
          </td>
        </tr>

        <tr>
          <td colspan="3">Other</td>
        </tr>

        <tr>
          <td>Inactivity Fee</td>
          <td>$0</td>
          <td />
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid $color-primary-100;

  thead {
    th {
      text-align: left;
      padding: 10px;
      border-bottom: 1px solid $color-primary-100;
      font-weight: 600;
    }
  }

  tbody {
    tr {
      td {
        padding: 10px;
        border-bottom: 1px solid $color-primary-100;
        border-left: 1px solid $color-primary-100;

        &:first-of-type {
          border-left: none;
        }

        ul {
          margin-top: 15px !important;
          margin-left: 15px;

          li {
            margin-top: 5px;
            position: relative;

            &::before {
              content: "";
              position: absolute;
              top: 50%;
              left: -15px;
              width: 5px;
              height: 5px;
              border-radius: 50%;
              background-color: $color-primary-100;
              transform: translateY(-50%);
            }

            &:first-child {
              margin-top: 0;
            }
          }
        }
      }
    }
  }
}

* {
  margin-top: 20px;
  font-size: 12px;
  font-style: normal;
  line-height: 16.8px;
  font-weight: 500;

  &:first-child {
    margin-top: 0;
  }
}
</style>
