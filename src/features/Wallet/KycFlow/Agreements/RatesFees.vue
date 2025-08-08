<template>
  <div>
    <table>
      <thead>
        <tr>
          <th colspan="2">Fees</th>
        </tr>
      </thead>

      <tbody>
        <tr>
          <td>Finance Charge(s)</td>
          <td>None</td>
        </tr>
        <tr>
          <td>
            Transaction Fees
            <ul>
              <li>Foreign Transaction</li>
            </ul>
          </td>
          <td>None</td>
        </tr>
        <tr>
          <td>
            Penalty Fees
            <ul>
              <li>Late Payment</li>
              <li>Returned Payment</li>
            </ul>
          </td>
          <td>None</td>
        </tr>
      </tbody>
    </table>

    <p>
      Billing Rights: Information on your rights to dispute transactions and how
      to exercise those rights is provided in your account agreement.
    </p>
    <p>
      Cloaked Pay availability is included in your subscription to Cloaked,
      which includes all Cloaked core and Cloaked Pay products and services. If
      you are eligible for Cloaked Pay, you can gain Cloaked Pay access with an
      active and paid Cloaked subscription.
    </p>
  </div>
</template>

<style scoped lang="scss">
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
  font-weight: 400;

  &:first-child {
    margin-top: 0;
  }
}
</style>
