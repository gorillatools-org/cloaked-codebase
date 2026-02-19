<template>
  <div>
    <table>
      <tbody>
        <tr>
          <td>Annual fee</td>
          <td>$0*</td>
        </tr>
        <tr>
          <td>Per purchase</td>
          <td>$0</td>
        </tr>
        <tr>
          <td>ATM withdrawal</td>
          <td>
            $0 in-network
            <br />
            $0 out-of-network
          </td>
        </tr>
        <tr>
          <td>Cash reload</td>
          <td>$0</td>
        </tr>
        <tr>
          <td>ATM balance inquiry (in-network or out-of-network)</td>
          <td>N/A</td>
        </tr>
        <tr>
          <td>Customer service (automated or live agent)</td>
          <td>$0 per call</td>
        </tr>
        <tr>
          <td>Inactivity</td>
          <td>$0</td>
        </tr>
      </tbody>
    </table>

    <p>
      *Cloaked Pay Prepaid Card availability is included in your subscription to
      Cloaked, which includes all Cloaked core and Cloaked Pay products and
      services. If you are eligible for Cloaked Pay, you can gain Cloaked Pay
      access with an active and paid Cloaked subscription.
    </p>
    <p>No overdraft/credit feature.</p>
    <p>Your funds are not FDIC insured.</p>
    <p>
      For general information about prepaid accounts, visit cfpb.gov/prepaid.
      Find details and conditions for all fees and services in the cardholder
      agreement.
    </p>
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
