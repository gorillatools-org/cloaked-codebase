<script setup>
import { computed, onMounted, ref } from "vue";
import store from "@/store";
import PreferencesPanel from "@/routes/modals/preferences/PreferencesPanel.vue";
import BaseButton from "@/library/BaseButton.vue";
import ModalTemplate from "@/features/ModalTemplate.vue";
import { useToast } from "@/composables/useToast.js";
import CustomEmailService from "@/api/actions/custom-email-service.js";
import InlineSvg from "@/features/InlineSvg.vue";
import { tools } from "@/scripts/tools";
import PersonalServices from "@/api/settings/personal-services";

const rightPanel = computed(() => {
  return store.state.ui.preference.right;
});

const toast = useToast();

const domains = ref("");

const userProfile = computed(() => {
  return store.state.profile?.email_type;
});

const show = ref(false);

const currentDomain = ref(null);

const input = ref("");

function close() {
  if (currentDomain.value !== null) {
    CustomEmailService.deleteEmailDomain(currentDomain.value.id)
      .then(() => {
        show.value = false;
        input.value = "";
        getDomains();

        setTimeout(() => {
          currentDomain.value = null;
        }, 200);
      })
      .catch((error) => {
        toast.error(error.response.data);
      });
  } else {
    show.value = false;
    currentDomain.value = null;
    input.value = "";
  }
}

function updateEmailDomain(value) {
  PersonalServices.updateUserProfile({ email_domain: value })
    .then(() => {
      getDomains();
      store.dispatch("setEmailTypeSetting", value);
    })
    .catch((error) => {
      toast.error(error.response.data);
    });
}

function deleteEmailDomain(id) {
  CustomEmailService.deleteEmailDomain(id)
    .then(() => {
      getDomains();
    })
    .catch((error) => {
      toast.error(error.response.data);
    });
}

function postNewDomain(domain) {
  CustomEmailService.postNewDomain(domain)
    .then((response) => {
      currentDomain.value = response.data;
    })
    .catch((error) => {
      toast.error(error.response.data);
    });
}

function verifyDomain(id) {
  CustomEmailService.verifyDomain(id)
    .then((response) => {
      if (response.data.verified) {
        getDomains();
        show.value = false;
        currentDomain.value = null;
        input.value = "";
      } else {
        toast.error("Domain not verified");
      }
    })
    .catch((error) => {
      toast.error(error.response.data);
    });
}

function getDomains() {
  CustomEmailService.getDomains()
    .then((response) => {
      domains.value = response.data;
    })
    .catch((error) => {
      toast.error(error.response.data);
    });
}
const handleCopyClick = (value) => {
  tools.copyToClipboard(value);
  toast.success("Copied to clipboard");
};

onMounted(() => {
  getDomains();
});
</script>

<template>
  <PreferencesPanel v-if="!rightPanel">
    <div class="custom-email">
      <div class="title">
        <h1>Custom email domain</h1>
        <p>Choose a domain default to use when generating Cloaked emails.</p>
      </div>

      <div class="domains">
        <div
          class="domain"
          :class="{ active: userProfile === null }"
        >
          <p>Default Cloaked email</p>
          <span
            class="radio"
            @click="updateEmailDomain(null)"
          />
        </div>

        <div
          v-for="domain in domains.results"
          :key="domain.id"
          class="domain"
          :class="{ active: userProfile === domain.id }"
        >
          <p>{{ domain.domain }}</p>
          <inlineSvg
            name="trash-outline"
            class="trash"
            @click="deleteEmailDomain(domain.id)"
          />
          <span
            class="radio"
            @click="updateEmailDomain(domain.id)"
          />
        </div>
      </div>

      <BaseButton
        variant="primary"
        @click="show = true"
      >
        Add new domain
      </BaseButton>
    </div>

    <ModalTemplate
      :show="show"
      :width="currentDomain === null ? '500px' : 'fit-content'"
      @close="close"
    >
      <template #header>
        <h1 v-if="currentDomain === null">Enter domain name</h1>
        <h1 v-if="currentDomain !== null">Verify domain</h1>
      </template>
      <template #body>
        <div class="modal-content">
          <div
            v-if="currentDomain === null"
            class="input-area"
          >
            <input
              v-model="input"
              type="text"
              placeholder="Enter domain"
            />
          </div>
          <div v-else>
            <table class="table-area">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Host</th>
                  <th>Value</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>{{ currentDomain.mx.type }}</td>
                  <td @click="handleCopyClick(currentDomain.mx.host)">
                    <div>
                      <p>{{ currentDomain.mx.host }}</p>
                      <InlineSvg name="copy" />
                    </div>
                  </td>
                  <td @click="handleCopyClick(currentDomain.mx.data)">
                    <div>
                      <p>{{ currentDomain.mx.data }}</p>
                      <InlineSvg name="copy" />
                    </div>
                  </td>
                </tr>

                <tr>
                  <td>{{ currentDomain.dkim1.type }}</td>
                  <td @click="handleCopyClick(currentDomain.dkim1.host)">
                    <div>
                      <p>{{ currentDomain.dkim1.host }}</p>
                      <InlineSvg name="copy" />
                    </div>
                  </td>
                  <td @click="handleCopyClick(currentDomain.dkim1.data)">
                    <div>
                      <p>{{ currentDomain.dkim1.data }}</p>
                      <InlineSvg name="copy" />
                    </div>
                  </td>
                </tr>

                <tr>
                  <td>{{ currentDomain.dkim2.type }}</td>
                  <td @click="handleCopyClick(currentDomain.dkim2.host)">
                    <div>
                      <p>{{ currentDomain.dkim2.host }}</p>
                      <InlineSvg name="copy" />
                    </div>
                  </td>
                  <td @click="handleCopyClick(currentDomain.dkim2.data)">
                    <div>
                      <p>{{ currentDomain.dkim2.data }}</p>
                      <InlineSvg name="copy" />
                    </div>
                  </td>
                </tr>

                <tr>
                  <td>{{ currentDomain.cname.type }}</td>
                  <td @click="handleCopyClick(currentDomain.cname.host)">
                    <div>
                      <p>{{ currentDomain.cname.host }}</p>
                      <InlineSvg name="copy" />
                    </div>
                  </td>
                  <td @click="handleCopyClick(currentDomain.cname.data)">
                    <div>
                      <p>{{ currentDomain.cname.data }}</p>
                      <InlineSvg name="copy" />
                    </div>
                  </td>
                </tr>

                <tr>
                  <td>{{ currentDomain.dmarc.type }}</td>
                  <td @click="handleCopyClick(currentDomain.dmarc.host)">
                    <div>
                      <p>{{ currentDomain.dmarc.host }}</p>
                      <InlineSvg name="copy" />
                    </div>
                  </td>
                  <td @click="handleCopyClick(currentDomain.dmarc.data)">
                    <div>
                      <p>{{ currentDomain.dmarc.data }}</p>
                      <InlineSvg name="copy" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

      <template #footer>
        <BaseButton
          variant="secondary"
          @click="close"
        >
          Cancel
        </BaseButton>
        <BaseButton
          v-if="currentDomain === null"
          variant="primary"
          :disabled="!input"
          @click="postNewDomain(input)"
        >
          Add domain
        </BaseButton>
        <BaseButton
          v-else
          variant="primary"
          @click="verifyDomain(currentDomain.id)"
        >
          Verify
        </BaseButton>
      </template>
    </ModalTemplate>
  </PreferencesPanel>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.custom-email {
  .title {
    margin-bottom: 30px;

    h1 {
      font-weight: 500;
      font-size: 24px;
      line-height: 36px;
      color: $color-primary-100;
    }
    p {
      margin-top: 16px;
      font-weight: 400;
      font-size: 14px;
      line-height: 21px;
      color: $color-primary-70;
    }
  }

  .domains {
    margin-bottom: 30px;

    .domain {
      border-bottom: 2px solid $color-primary-5;
      position: relative;

      &:first-child {
        border-top: 2px solid $color-primary-5;
      }

      &:hover {
        .trash {
          opacity: 1;
          visibility: visible;
        }
      }

      &.active {
        .radio {
          &:after {
            content: "";
            width: 100%;
            height: 100%;
            background-color: $color-primary-100;
            border-radius: 50%;
            display: block;
          }
        }
      }

      p {
        padding: 20px 10px;
        color: $color-primary-100;
        font-size: 15px;
        font-weight: 500;
      }

      .trash {
        position: absolute;
        right: 55px;
        top: 50%;
        transform: translateY(-50%);
        width: 36px;
        height: 36px;
        color: $color-primary-100;
        padding: 8px;
        border-radius: 50%;
        opacity: 0;
        visibility: hidden;
        svg {
          width: 12px;
          width: auto;
        }

        &:hover {
          cursor: pointer;
          background-color: $color-primary-10;
        }
      }

      .radio {
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 2px solid $color-primary-100;
        padding: 2px;

        &:hover {
          cursor: pointer;
        }
      }
    }
  }
}

.input-area {
  input {
    padding: 8px 12px;
    height: 60px;
    background-color: $color-primary-5;
    border-radius: 10px;
    border: none;
    width: 100%;
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    color: $color-primary-100;

    &:focus {
      outline: 1px solid $color-primary-100;
    }
  }
}

.table-area {
  table-layout: fixed;

  th {
    font-weight: 500;
    font-size: 14px;
    line-height: 21px;
    color: $color-primary-70;
    text-align: left;
    padding: 10px 0;
  }

  td {
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    color: $color-primary-100;
    padding: 10px 0;
    word-wrap: break-word;
    div {
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      width: 100%;
      padding: 10px;
      border: 1px solid transparent;
      svg {
        flex-shrink: 0;
      }
      &:hover {
        border: 1px solid $color-primary-100;
        border-radius: 8px;
      }
    }
  }

  td,
  th {
    border-bottom: 1px solid $color-primary-5;

    &:first-child {
      width: 70px;
    }

    &:last-child {
      width: 223px;
      padding-left: 30px;
    }
  }
}
</style>
