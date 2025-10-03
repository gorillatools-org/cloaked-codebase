import router from "@/routes/router";
import ImporterService from "@/api/actions/importer-service";
import ModalImportProcessing from "@/features/import/ModalImportProcessing.vue";
import { STORAGE_KEY_IMPORT_USED } from "./shared";
import { phone_format } from "@/scripts/format";
import { email as isEmail, url as isUrl } from "@/scripts/validation";
import moment from "moment";
import {
  withIssuesFixed,
  withPatchedValues,
} from "@/store/modules/accounts-importer/automatedFixes";
import {
  CUSTOM_FIELD_ADDRESS,
  CUSTOM_FIELD_AUTH_KEY,
  CUSTOM_FIELD_BANKING_INFO,
  CUSTOM_FIELD_DATE,
  CUSTOM_FIELD_IDENTIFICATION,
  CUSTOM_FIELD_TEXT,
  CUSTOM_FIELD_TO_TYPE_MAPPING,
  CUSTOM_FIELD_URL,
  FIELD_EMAIL,
  FIELD_FAVORITE,
  FIELD_NICKNAME,
  FIELD_NOTES,
  FIELD_PASSWORD,
  FIELD_PHONE_NUMBER,
  FIELD_TO_LABEL_MAPPING,
  FIELD_TOTP,
  FIELD_USERNAME,
  FIELD_WEBSITE,
  FILE_TYPE_1PUX,
  FILE_TYPE_CSV,
  FILE_UPLOAD_ERROR,
  FILE_UPLOAD_ERROR_FILE_TOO_LARGE,
  FILE_UPLOAD_ERROR_UNSUPPORTED,
  FILE_UPLOAD_LOADING,
  FILE_UPLOAD_READY,
  FILE_UPLOAD_SUCCESS,
  FILE_UPLOAD_SUCCESS_STATES,
  IMPORT_STATUS_FAILURE,
  IMPORT_STATUS_FINISHED,
  LABEL_EMAIL,
  LABEL_FAVORITE,
  LABEL_IGNORE,
  LABEL_NICKNAME,
  LABEL_NOTES,
  LABEL_PASSWORD,
  LABEL_PHONE_NUMBER,
  LABEL_TOTP,
  LABEL_USERNAME,
  LABEL_WEBSITE,
  NEXT_STATE_ALL_LABELED_AS_NOTES,
  NEXT_STATE_MISSING_NAME_AND_URL,
  NEXT_STATE_NO_IDENTITIES_SELECTED,
  NEXT_STATE_NOT_IMPORTED,
  NEXT_STATE_OK,
  NEXT_STATE_UNLABELED_COLUMNS,
  STATUS_DUPLICATE,
  STATUS_FIRST_DUPLICATE,
  STATUS_INVALID_EMAIL,
  STATUS_INVALID_URL,
  STATUS_MISSING_CREDENTIALS,
  STATUS_MISSING_CREDENTIALS_AND_URL,
  STATUS_MISSING_IDENTITY_NAME,
  STATUS_MISSING_URL,
  STATUS_READY,
  STATUSES_DUPLICATE,
  STATUSES_MISSING_INFO,
  STATUSES_READY,
  SUPPORTED_FILE_TYPES,
} from "@/store/modules/accounts-importer/shared";
import { withEncryptedCustomFields } from "@/scripts/customFields";
import { isValidDate } from "@/features/cloakDetails/CustomFields/CustomFieldForm/validations";
import { TOTP, URI } from "otpauth";
import { useToast } from "@/composables/useToast.js";

import { markRaw } from "vue";
const toast = useToast();

const MAX_FILE_SIZE_IN_MB = 24;

const readCsvContents = (file, parserOptions = {}) =>
  import("csv-parse/browser/esm").then(
    ({ parse }) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener("load", (event) => {
          parse(event.target.result, parserOptions, (err, records) => {
            if (err) {
              reject(err);
            } else {
              resolve(records);
            }
          });
        });
        reader.readAsText(file);
      })
  );

const read1PuxContents = () =>
  new Promise((resolve) => {
    resolve([]);
  });

export const addIdentityStatus = (identityFields, identityRecords) => {
  const result = [];
  const identitiesByEncodedValue = {};

  const nameColumnIndex = identityFields?.indexOf(FIELD_NICKNAME);
  const urlColumnIndex = identityFields?.indexOf(FIELD_WEBSITE);
  const emailColumnIndex = identityFields?.indexOf(FIELD_EMAIL);
  const usernameColumnIndex = identityFields?.indexOf(FIELD_USERNAME);
  const passwordColumnIndex = identityFields?.indexOf(FIELD_PASSWORD);
  const phoneNumberColumnIndex = identityFields?.indexOf(FIELD_PHONE_NUMBER);
  const favoriteColumnIndex = identityFields?.indexOf(FIELD_FAVORITE);

  const copyOfIdentityRecords = JSON.parse(JSON.stringify(identityRecords));

  copyOfIdentityRecords.forEach((record) => {
    // favorite flag shouldn't be considered when detecting duplicates
    const recordWithoutFavorites = [...record.record];
    recordWithoutFavorites[favoriteColumnIndex] = null;
    const encodedRecord = btoa(encodeURIComponent(recordWithoutFavorites));

    const statuses = [];
    if (identitiesByEncodedValue[encodedRecord]) {
      statuses.push(STATUS_DUPLICATE);
    }

    if (!record.record[nameColumnIndex]) {
      statuses.push(STATUS_MISSING_IDENTITY_NAME);
    } else if (
      !record.record[urlColumnIndex] &&
      (!record.record[passwordColumnIndex] ||
        (!record.record[usernameColumnIndex] &&
          !record.record[emailColumnIndex] &&
          !record.record[phoneNumberColumnIndex]))
    ) {
      statuses.push(STATUS_MISSING_CREDENTIALS_AND_URL);
    } else if (
      !record.record[passwordColumnIndex] ||
      (!record.record[usernameColumnIndex] &&
        !record.record[emailColumnIndex] &&
        !record.record[phoneNumberColumnIndex])
    ) {
      statuses.push(STATUS_MISSING_CREDENTIALS);
    } else if (!record.record[urlColumnIndex]) {
      statuses.push(STATUS_MISSING_URL);
    } else if (!isUrl(record.record[urlColumnIndex])) {
      statuses.push(STATUS_INVALID_URL);
    } else if (!isEmail(record.record[emailColumnIndex])) {
      statuses.push(STATUS_INVALID_EMAIL);
    } else {
      statuses.push(STATUS_READY);
    }

    const identity = { statuses, ...record };

    if (identitiesByEncodedValue[encodedRecord]) {
      identitiesByEncodedValue[encodedRecord].push(identity);
    } else {
      identitiesByEncodedValue[encodedRecord] = [identity];
    }
  });

  for (let encodedValue in identitiesByEncodedValue) {
    if (identitiesByEncodedValue[encodedValue].length > 1) {
      identitiesByEncodedValue[encodedValue][0].statuses.unshift(
        STATUS_FIRST_DUPLICATE
      );
    }

    identitiesByEncodedValue[encodedValue].forEach((identity) => {
      result.push(identity);
    });
  }

  return result;
};

export const getPrimaryStatus = (statuses) =>
  statuses[0] === STATUS_FIRST_DUPLICATE ? statuses[1] : statuses[0];

const INITIAL_IS_PARSING = false;
const INITIAL_PARSING_ERROR = null;
const INITIAL_IMPORT_FILE = null;
const INITIAL_IMPORTED_COLUMNS = [];
const INITIAL_IMPORTED_FIELDS = [];
const INITIAL_IMPORTED_RECORDS = [];
const INITIAL_IDENTITY_FIELDS = [];
const INITIAL_IDENTITY_RECORDS = [];
const INITIAL_SELECTED_IDENTITIES = [];
const INITIAL_IDENTITIES_PREPARED = false;
const INITIAL_IMPORT_STATUS = null;

const defaultState = () => ({
  isParsing: INITIAL_IS_PARSING,
  parsingError: INITIAL_PARSING_ERROR,
  importFile: INITIAL_IMPORT_FILE,
  importedColumns: INITIAL_IMPORTED_COLUMNS,
  importedFields: INITIAL_IMPORTED_FIELDS,
  importedRecords: INITIAL_IMPORTED_RECORDS,
  identityFields: INITIAL_IDENTITY_FIELDS,
  identityRecords: INITIAL_IDENTITY_RECORDS,
  selectedIdentities: INITIAL_SELECTED_IDENTITIES,
  identitiesPrepared: INITIAL_IDENTITIES_PREPARED,
  importStatus: INITIAL_IMPORT_STATUS,
});

export default {
  namespaced: true,
  state: defaultState(),
  mutations: {
    reset(state) {
      Object.assign(state, defaultState());
    },
    setIsParsing: (state, payload) => {
      state.isParsing = payload;
    },
    setParsingError: (state, payload) => {
      state.parsingError = payload;
    },
    setImportFile: (state, payload) => {
      state.importFile = payload;
    },
    setImportedColumns: (state, payload) => {
      state.importedColumns = payload;
    },
    setImportedFields: (state, payload) => {
      state.importedFields = payload;
    },
    setImportedRecords: (state, payload) => {
      state.importedRecords = payload;
    },
    setIdentityFields: (state, payload) => {
      state.identityFields = payload;
    },
    setIdentityRecords: (state, payload) => {
      state.identityRecords = payload;
    },
    setSelectedIdentities: (state, payload) => {
      state.selectedIdentities = payload;
    },
    setIdentitiesPrepared: (state, payload) => {
      state.identitiesPrepared = payload;
    },
    setImportStatus: (state, payload) => {
      state.importStatus = payload;
    },
  },
  actions: {
    reset({ commit }) {
      commit("reset");
    },
    remove: ({ commit }) => {
      commit("setIsParsing", INITIAL_IS_PARSING);
      commit("setParsingError", INITIAL_PARSING_ERROR);
      commit("setImportFile", INITIAL_IMPORT_FILE);
      commit("setImportedColumns", INITIAL_IMPORTED_COLUMNS);
      commit("setImportedFields", INITIAL_IMPORTED_FIELDS);
      commit("setImportedRecords", INITIAL_IMPORTED_RECORDS);
      commit("setIdentityFields", INITIAL_IDENTITY_FIELDS);
      commit("setIdentityRecords", INITIAL_IDENTITY_RECORDS);
      commit("setSelectedIdentities", INITIAL_SELECTED_IDENTITIES);
      commit("setIdentitiesPrepared", INITIAL_IDENTITIES_PREPARED);
      commit("setImportStatus", INITIAL_IMPORT_STATUS);
    },
    parseFile: async (context, file) => {
      let records = null;
      let error = null;

      if (file.type === FILE_TYPE_CSV) {
        try {
          records = await readCsvContents(file);
        } catch (err) {
          error = err;
          records = await readCsvContents(file, {
            relaxColumnCount: true,
            relax_quotes: true,
          });
        }
      } else if (file.type === FILE_TYPE_1PUX) {
        records = await read1PuxContents(file);
      }

      return withIssuesFixed(records, error);
    },
    importFile: async ({ commit, dispatch, getters }, file) => {
      if (!file || !SUPPORTED_FILE_TYPES.includes(file.type)) {
        commit("setParsingError", FILE_UPLOAD_ERROR_UNSUPPORTED);
        commit("setImportFile", file);
        return;
      }

      if (file.size / 1024 ** 2 > MAX_FILE_SIZE_IN_MB) {
        commit("setParsingError", FILE_UPLOAD_ERROR_FILE_TOO_LARGE);
        commit("setImportFile", file);
        return;
      }

      try {
        commit("setIsParsing", true);
        commit("setImportFile", file);

        let { records, error } = await dispatch("parseFile", file);
        commit("setParsingError", error);

        const columns = records[0];
        records.splice(0, 1);
        const findNotes = columns
          .map((f) => f.toLowerCase())
          .findIndex((f) => f.includes("note"));
        if (findNotes > -1 && findNotes === columns.length - 1) {
          records = records.map((r) => {
            if (r.length > columns.length) {
              const notNotes = r.slice(0, columns.length - 1);
              const notes = r
                .slice(columns.length - 1, r.length)
                .map((a) => a.trim())
                .join(", ");
              return [...notNotes, notes];
            }
            return r;
          });
        }
        const accountFields = getters.mapColumnsToCloakFields(columns);

        commit("setImportedColumns", columns);
        commit("setImportedFields", accountFields);
        commit(
          "setImportedRecords",
          records.map((item, index) => ({
            id: index.toString(),
            record: item,
          }))
        );
      } catch {
        commit("setParsingError", FILE_UPLOAD_ERROR);
      } finally {
        commit("setIsParsing", false);
      }
    },
    setColumnLabel({ state, commit }, { label, index }) {
      let newAccountFields = [...state.importedFields];

      if (label.isUnique) {
        newAccountFields = newAccountFields.map((field) =>
          field === label.value ? null : field
        );
      }

      newAccountFields[index] = label.value;
      commit("setImportedFields", newAccountFields);
      commit("setIdentitiesPrepared", false);
    },
    prepareIdentities({ state, commit, getters }) {
      if (state.identitiesPrepared) {
        return;
      }

      const identityFields = [...getters.IDENTITY_FIELDS];
      const indexMapping = state.importedFields.reduce(
        (result, field, index) => {
          if (field === LABEL_IGNORE) {
            return result;
          }

          if (getters.IDENTITY_FIELDS.includes(field)) {
            result[index] = identityFields.indexOf(field);
            return result;
          }

          if (getters.IDENTITY_CUSTOM_FIELDS.includes(field)) {
            identityFields.push(field);
            result[index] = identityFields.length - 1;
            return result;
          }
        },
        {}
      );

      let identityRecords = state.importedRecords.map((record) => {
        const values = new Array(identityFields.length).fill("");

        state.importedFields.forEach((field, index) => {
          if (field === LABEL_IGNORE) {
            return;
          }

          if (field === FIELD_NOTES) {
            values[indexMapping[index]] = [
              values[indexMapping[index]],
              record.record[index] ?? "",
            ]
              .join("\n")
              .trim();

            return;
          }

          values[indexMapping[index]] = record.record[index];
        });

        // special mapping rules are applied below
        const nameFieldIndex = identityFields.indexOf(FIELD_NICKNAME);
        const urlFieldIndex = identityFields.indexOf(FIELD_WEBSITE);

        if (!values[nameFieldIndex] && values[urlFieldIndex]) {
          values[nameFieldIndex] = values[urlFieldIndex];
        }

        const favoriteFieldIndex = identityFields.indexOf(FIELD_FAVORITE);
        values[favoriteFieldIndex] = [
          "TRUE",
          "true",
          true,
          "t",
          "YES",
          "yes",
          "y",
          "favorite",
          "1",
          1,
        ].includes(values[favoriteFieldIndex]);

        const usernameFieldIndex = identityFields.indexOf(FIELD_USERNAME);
        const emailFieldIndex = identityFields.indexOf(FIELD_EMAIL);
        if (!values[emailFieldIndex] && isEmail(values[usernameFieldIndex])) {
          values[emailFieldIndex] = values[usernameFieldIndex];
        }

        return { record: values, id: record.id };
      });

      const selectedIdentities = addIdentityStatus(
        identityFields,
        identityRecords
      )
        .filter((record) =>
          record.statuses.every(
            (status) =>
              ![STATUS_MISSING_IDENTITY_NAME, STATUS_DUPLICATE].includes(status)
          )
        )
        .map((record) => record.id);

      commit("setIdentityFields", identityFields);
      commit("setIdentityRecords", identityRecords);
      commit("setSelectedIdentities", selectedIdentities);
      commit("setIdentitiesPrepared", true);
    },
    getIdentityObject({ state }, id) {
      const { record } = state.identityRecords.find(
        (identity) => identity.id === id
      );

      return {
        [FIELD_NICKNAME]: record[state.identityFields.indexOf(FIELD_NICKNAME)],
        [FIELD_WEBSITE]: record[state.identityFields.indexOf(FIELD_WEBSITE)],
        [FIELD_USERNAME]: record[state.identityFields.indexOf(FIELD_USERNAME)],
        [FIELD_PASSWORD]: record[state.identityFields.indexOf(FIELD_PASSWORD)],
        [FIELD_EMAIL]: record[state.identityFields.indexOf(FIELD_EMAIL)],
        [FIELD_PHONE_NUMBER]:
          record[state.identityFields.indexOf(FIELD_PHONE_NUMBER)],
        [FIELD_NOTES]: record[state.identityFields.indexOf(FIELD_NOTES)],
        [FIELD_FAVORITE]: record[state.identityFields.indexOf(FIELD_FAVORITE)],
      };
    },
    patchIdentity({ state, commit }, { id, record }) {
      const existingRecordIndex = state.identityRecords.findIndex(
        (record) => record.id === id
      );

      const { record: existingRecord } =
        state.identityRecords[existingRecordIndex];

      const newRecord = [];
      for (let i = 0; i < existingRecord.length; i++) {
        newRecord[i] = record[i] ?? existingRecord[i];
      }

      const newRecords = JSON.parse(JSON.stringify(state.identityRecords));
      newRecords[existingRecordIndex] = { id, record: newRecord };

      commit("setIdentityRecords", newRecords);
    },
    async startImport({ dispatch, state, commit, getters }, params) {
      commit("recentlyImported/setImportStartTime", moment().toISOString(), {
        root: true,
      });
      dispatch(
        "openModal",
        {
          id: "import-processing",
          customTemplate: {
            template: markRaw(ModalImportProcessing),
            params: {
              id: "import-processing",
              numberOfIdentities: state.identityRecords.filter((identity) =>
                state.selectedIdentities.includes(identity.id)
              ).length,
              onImportMore: () => {
                router.push({ name: "Import" });
                dispatch("closeModal", {}, { root: true });
              },
              onDone: () => {
                dispatch("closeModal", {}, { root: true });
              },
            },
          },
        },
        { root: true }
      );

      const accounts = state.identityRecords
        .filter((identity) => state.selectedIdentities.includes(identity.id))
        .map((identity) => {
          const { id, record } = identity;

          return {
            name: record[state.identityFields.indexOf(FIELD_NICKNAME)],
            url: record[state.identityFields.indexOf(FIELD_WEBSITE)],
            email: record[state.identityFields.indexOf(FIELD_EMAIL)],
            username: record[state.identityFields.indexOf(FIELD_USERNAME)],
            password: record[state.identityFields.indexOf(FIELD_PASSWORD)],
            phone: phone_format(
              record[state.identityFields.indexOf(FIELD_PHONE_NUMBER)]
            ),
            notes: record[state.identityFields.indexOf(FIELD_NOTES)],
            is_favorite: record[state.identityFields.indexOf(FIELD_FAVORITE)],
            line_num: id,
            id: id,
            otp: "",
            category: "",
            firstname: "",
            lastname: "",
            address: null,
            tags: [],
            is_valid: true,
            encrypted: false,
            active: true,
            custom_field: state.identityFields
              .reduce((result, field, index) => {
                if (
                  getters.IDENTITY_CUSTOM_FIELDS.includes(field) &&
                  record[index]
                ) {
                  return [
                    ...result,
                    {
                      id: self.crypto.randomUUID(),
                      type: CUSTOM_FIELD_TO_TYPE_MAPPING[field],
                      label: FIELD_TO_LABEL_MAPPING[field],
                      value:
                        CUSTOM_FIELD_TO_TYPE_MAPPING[field] === "address"
                          ? {
                              city: "",
                              country: "",
                              postal_code: "",
                              state: "",
                              street_address: record[index]?.trim(),
                              type: "other",
                              unit: "",
                            }
                          : record[index]?.trim(),
                      isSecret: false,
                    },
                  ];
                }

                if (field === FIELD_TOTP) {
                  const value = record[index]?.trim();

                  if (!value) {
                    return result;
                  }

                  const isTotpUrl = value.startsWith("otpauth://");

                  let type = isTotpUrl ? "totp_url" : "totp_secret";
                  try {
                    isTotpUrl
                      ? URI.parse(value)
                      : new TOTP({
                          secret: value,
                        });
                  } catch {
                    type = "text";
                  }

                  return [
                    ...result,
                    withPatchedValues({
                      id: self.crypto.randomUUID(),
                      type,
                      value,
                      label: "One-time password",
                      isSecret: false,
                    }),
                  ];
                }

                return result;
              }, [])
              .map((customField) => {
                if (customField.type === "date") {
                  if (isValidDate(customField.value)) {
                    return withPatchedValues(customField);
                  }

                  customField.type = "text";
                  return customField;
                }

                if (customField.type === "url") {
                  if (isUrl(customField.value)) {
                    return withPatchedValues(customField);
                  }

                  customField.type = "text";
                  return customField;
                }

                return customField;
              }),
          };
        });

      const encryptedAccounts = await Promise.all(
        accounts.map((account) => withEncryptedCustomFields(account))
      );

      try {
        const payload = {
          accounts: encryptedAccounts,
          password_manager: params.source || "custom_csv",
        };
        const response = await ImporterService.createImport(payload);

        if (response.status === 201) {
          localStorage.setItem(STORAGE_KEY_IMPORT_USED, "true");
          dispatch("watchImportStatus", {
            taskId: response.data.task_id,
            importId: response.data.import_uuid,
            count: state.selectedIdentities.length,
          });
        } else {
          commit("setImportStatus", IMPORT_STATUS_FAILURE);
          setTimeout(() => {
            commit("setImportStatus", null);
          }, 6000);
        }
      } catch {
        commit("setImportStatus", IMPORT_STATUS_FAILURE);
        setTimeout(() => {
          commit("setImportStatus", null);
        }, 6000);
      } finally {
        dispatch("remove");
      }
    },
    watchImportStatus({ commit, dispatch }, { taskId, count, importId } = {}) {
      const STORAGE_KEY_LAST_TASK_ID = "LAST_TASK_ID";
      const STORAGE_KEY_LAST_IMPORT_ID = "LAST_IMPORT_ID";
      const STORAGE_KEY_LAST_IMPORT_COUNT = "LAST_IMPORT_COUNT";

      taskId = taskId || localStorage.getItem(STORAGE_KEY_LAST_TASK_ID);
      importId = importId || localStorage.getItem(STORAGE_KEY_LAST_IMPORT_ID);
      count =
        count || parseInt(localStorage.getItem(STORAGE_KEY_LAST_IMPORT_COUNT));

      if (!taskId || !importId || !count) {
        return;
      }

      localStorage.setItem(STORAGE_KEY_LAST_TASK_ID, taskId);
      localStorage.setItem(STORAGE_KEY_LAST_IMPORT_ID, importId);
      localStorage.setItem(STORAGE_KEY_LAST_IMPORT_COUNT, count);

      const stopWatchingImportStatus = () => {
        clearInterval(this.importStatusInteval);
        localStorage.removeItem(STORAGE_KEY_LAST_TASK_ID);
        localStorage.removeItem(STORAGE_KEY_LAST_IMPORT_COUNT);
        localStorage.removeItem(STORAGE_KEY_LAST_IMPORT_ID);
      };

      const updateStatus = async () => {
        try {
          const response = await ImporterService.getImportStatus(taskId);

          if (response.status !== 200) {
            stopWatchingImportStatus();
            commit("setImportStatus", null);
          }

          // TODO: update new toast setup to work with custom components (https://cloakedinc.atlassian.net/browse/ALL-3997)
          if (response.data.status === IMPORT_STATUS_FAILURE) {
            commit("setImportStatus", response.data.status);
            toast.error("Import failed");
            stopWatchingImportStatus();
            return;
          }

          if (response.data.status === IMPORT_STATUS_FINISHED) {
            // API responds with "FINISHED" status even on failure
            const recentlyImported = await dispatch(
              "recentlyImported/fetch",
              true,
              { root: true }
            );

            const wasSuccessful =
              recentlyImported?.[0]?.import_uuid === importId;
            commit(
              "setImportStatus",
              wasSuccessful ? response.data.status : IMPORT_STATUS_FAILURE
            );

            toast.success(
              `${count} ${count > 1 ? "items" : "item"} successfully imported`
            );

            clearInterval(this.importStatusInteval);
            setTimeout(() => {
              stopWatchingImportStatus();
              commit("setImportStatus", null);
            }, 6000);

            return;
          }

          toast.success(`Importing ${count} ${count > 1 ? "items" : "item"}`);
        } catch {
          stopWatchingImportStatus();
          commit("setImportStatus", null);
        }
      };

      updateStatus();
      clearInterval(this.importStatusInteval);
      this.importStatusInteval = setInterval(updateStatus, 10000);
    },
  },
  getters: {
    getFileName: (state) => state.importFile?.name || "",
    getFileType: (state, getters) => getters.getFileName.split(".").pop(),
    isInProgress: (state, getters) =>
      state.importFile &&
      FILE_UPLOAD_SUCCESS_STATES.includes(getters.getFileUploadState),
    getFileUploadState: (state, getters) => {
      if (state.isParsing) {
        return FILE_UPLOAD_LOADING;
      }

      if (state.parsingError) {
        return state.parsingError;
      }

      if (!state.isParsing && getters.getImportedRecords.length > 0) {
        return FILE_UPLOAD_SUCCESS;
      }

      return FILE_UPLOAD_READY;
    },
    getNextState: (state, getters) => (step) => {
      if (
        step === 1 &&
        !FILE_UPLOAD_SUCCESS_STATES.includes(getters.getFileUploadState)
      ) {
        return NEXT_STATE_NOT_IMPORTED;
      }

      if (step === 2) {
        if (getters.getImportedFields.some((field) => field === null)) {
          return NEXT_STATE_UNLABELED_COLUMNS;
        }

        if (getters.getImportedFields.every((field) => field === LABEL_NOTES)) {
          return NEXT_STATE_ALL_LABELED_AS_NOTES;
        }

        if (
          !getters.getImportedFields.some(
            (field) => field === FIELD_NICKNAME
          ) &&
          !getters.getImportedFields.some((field) => field === FIELD_WEBSITE)
        ) {
          return NEXT_STATE_MISSING_NAME_AND_URL;
        }
      }

      if (step === 3) {
        if (getters.getSelectedIdentities.length === 0) {
          return NEXT_STATE_NO_IDENTITIES_SELECTED;
        }
      }

      return NEXT_STATE_OK;
    },
    getColumnIndex: (state) => (columnTitle) =>
      state.importedFields.indexOf(columnTitle),
    getImportedColumns: (state) => state.importedColumns,
    getImportedFields: (state) => state.importedFields,
    getImportedRecords: (state) =>
      addIdentityStatus(state.importedFields, state.importedRecords),
    getIdentityFields: (state) => state.identityFields,
    getIdentityFieldIndex: (state, getters) => (columnTitle) =>
      getters.getIdentityFields.indexOf(columnTitle),
    getIdentities:
      (state, getters) =>
      (statuses, sortFunction, excludeStatuses = []) => {
        const identitiesWithStatusAndSelection = addIdentityStatus(
          state.identityFields,
          state.identityRecords
        );

        const filteredIdentities = statuses
          ? identitiesWithStatusAndSelection.filter(
              (identity) =>
                identity.statuses.some((status) => statuses.includes(status)) &&
                identity.statuses.every(
                  (status) => !excludeStatuses.includes(status)
                )
            )
          : identitiesWithStatusAndSelection;

        sortFunction =
          sortFunction ||
          ((a, b) => {
            const aStatus = getPrimaryStatus(a.statuses);
            const bStatus = getPrimaryStatus(b.statuses);

            if (
              (STATUSES_READY.includes(aStatus) &&
                STATUSES_READY.includes(bStatus)) ||
              (STATUSES_DUPLICATE.includes(aStatus) &&
                STATUSES_DUPLICATE.includes(bStatus)) ||
              (STATUSES_MISSING_INFO.includes(aStatus) &&
                STATUSES_MISSING_INFO.includes(bStatus))
            ) {
              const nameColumnIndex =
                getters.getIdentityFields.indexOf(FIELD_NICKNAME);

              if (a.record[nameColumnIndex] > b.record[nameColumnIndex]) {
                return 1;
              }

              if (b.record[nameColumnIndex] > a.record[nameColumnIndex]) {
                return -1;
              }

              return 0;
            }

            if (
              STATUSES_MISSING_INFO.includes(aStatus) &&
              STATUSES_READY.includes(bStatus)
            ) {
              return -1;
            }

            if (
              STATUSES_MISSING_INFO.includes(aStatus) &&
              STATUSES_DUPLICATE.includes(bStatus)
            ) {
              return -1;
            }

            if (
              STATUSES_READY.includes(aStatus) &&
              STATUSES_DUPLICATE.includes(bStatus)
            ) {
              return -1;
            }

            return 1;
          });

        return filteredIdentities.sort(sortFunction);
      },
    getSelectedIdentities: (state) => state.selectedIdentities,
    getImportStatus: (state) => state.importStatus,
    mapColumnsToCloakFields:
      (state, getters, rootState, rootGetters) => (columns) => {
        const unmappedCloakFields = [
          FIELD_NICKNAME,
          FIELD_EMAIL,
          FIELD_PASSWORD,
          FIELD_PHONE_NUMBER,
          FIELD_USERNAME,
          FIELD_NOTES,
          FIELD_WEBSITE,
          FIELD_FAVORITE,
          FIELD_TOTP,
        ];

        const CSV_COLUMNS_TO_IDENTITY_FIELDS = {
          name: FIELD_NICKNAME,
          title: FIELD_NICKNAME,
          username: FIELD_USERNAME,
          email: FIELD_EMAIL,
          login_username: FIELD_EMAIL,
          password: FIELD_PASSWORD,
          login_password: FIELD_PASSWORD,
          "phone number": FIELD_PHONE_NUMBER,
          phone: FIELD_PHONE_NUMBER,
          note: FIELD_NOTES,
          notes: FIELD_NOTES,
          url: FIELD_WEBSITE,
          login_url: FIELD_WEBSITE,
          website: FIELD_WEBSITE,
          favorite: FIELD_FAVORITE,
          ...(rootGetters.isV2User
            ? {
                totp: FIELD_TOTP,
                otp: FIELD_TOTP,
                passcode: FIELD_TOTP,
                "one-time passcode": FIELD_TOTP,
                "one-time password": FIELD_TOTP,
                "time-based passcode": FIELD_TOTP,
                "time-based password": FIELD_TOTP,
              }
            : {}),
        };

        const CSV_COLUMNS_TO_CUSTOM_FIELDS = {
          text: CUSTOM_FIELD_TEXT,
          address: CUSTOM_FIELD_ADDRESS,
          "authentication key": CUSTOM_FIELD_AUTH_KEY,
          "auth key": CUSTOM_FIELD_AUTH_KEY,
          "banking information": CUSTOM_FIELD_BANKING_INFO,
          "bank information": CUSTOM_FIELD_BANKING_INFO,
          identification: CUSTOM_FIELD_IDENTIFICATION,
          date: CUSTOM_FIELD_DATE,
          "secondary url": CUSTOM_FIELD_URL,
          website: CUSTOM_FIELD_URL,
        };

        const directlyMappedColumns =
          columns?.map((column) => {
            const cloakField =
              CSV_COLUMNS_TO_IDENTITY_FIELDS[column.toLowerCase()] ??
              CSV_COLUMNS_TO_CUSTOM_FIELDS[column.toLowerCase()];

            if (cloakField && unmappedCloakFields.includes(cloakField)) {
              unmappedCloakFields.splice(
                unmappedCloakFields.indexOf(cloakField),
                1
              );

              return cloakField;
            }

            if (
              cloakField &&
              getters.IDENTITY_CUSTOM_FIELDS.includes(cloakField)
            ) {
              return cloakField;
            }

            return null;
          }) || [];

        return directlyMappedColumns.map((item, index) => {
          if (item !== null) {
            return item;
          }

          const findIndirectlyMatchingField = (field) => {
            const matchingTerms = [
              ...Object.keys(CSV_COLUMNS_TO_IDENTITY_FIELDS),
              ...Object.keys(CSV_COLUMNS_TO_CUSTOM_FIELDS),
            ].filter(
              (key) =>
                CSV_COLUMNS_TO_IDENTITY_FIELDS[key] === field ||
                CSV_COLUMNS_TO_CUSTOM_FIELDS[key] === field
            );

            return columns[index]
              .split(/\s+|-|_/)
              .some((columnTitleWord) =>
                matchingTerms.some((matchingTerm) =>
                  matchingTerm
                    .split(/\s+|-|_/)
                    .some(
                      (matchingTermWord) =>
                        (matchingTermWord &&
                          columnTitleWord
                            .toLowerCase()
                            .includes(matchingTermWord.toLowerCase())) ||
                        (columnTitleWord &&
                          matchingTermWord
                            .toLowerCase()
                            .includes(columnTitleWord.toLowerCase()))
                    )
                )
              );
          };

          let indirectlyMatchingCloakField = unmappedCloakFields.find(
            findIndirectlyMatchingField
          );

          if (indirectlyMatchingCloakField) {
            unmappedCloakFields.splice(
              unmappedCloakFields.indexOf(indirectlyMatchingCloakField),
              1
            );
            return indirectlyMatchingCloakField;
          }

          indirectlyMatchingCloakField = getters.IDENTITY_CUSTOM_FIELDS.find(
            findIndirectlyMatchingField
          );

          return indirectlyMatchingCloakField ?? null;
        });
      },
    LABELS: (state, getters, rootState, rootGetters) => {
      const LABELS = [
        { label: LABEL_NICKNAME, value: FIELD_NICKNAME, isUnique: true },
        { label: LABEL_WEBSITE, value: FIELD_WEBSITE, isUnique: true },
        { label: LABEL_USERNAME, value: FIELD_USERNAME, isUnique: true },
        { label: LABEL_PASSWORD, value: FIELD_PASSWORD, isUnique: true },
        { label: LABEL_EMAIL, value: FIELD_EMAIL, isUnique: true },
        {
          label: LABEL_PHONE_NUMBER,
          value: FIELD_PHONE_NUMBER,
          isUnique: true,
        },
        { label: LABEL_NOTES, value: FIELD_NOTES, isUnique: false },
        // Hiding per DASH-268
        // { label: LABEL_DATE, value: FIELD_DATE, isUnique: true },
        { label: LABEL_FAVORITE, value: FIELD_FAVORITE, isUnique: true },
      ];

      if (!rootGetters.isV2User) {
        LABELS.push({
          label: LABEL_IGNORE,
          value: LABEL_IGNORE,
          isWarning: true,
        });
      }

      if (rootGetters.isV2User) {
        LABELS.push({ label: LABEL_TOTP, value: FIELD_TOTP, isUnique: true });
      }

      return LABELS;
    },
    IDENTITY_FIELDS: (state, getters, rootState, rootGetters) => {
      const IDENTITY_FIELDS = [
        FIELD_NICKNAME,
        FIELD_WEBSITE,
        FIELD_USERNAME,
        FIELD_PASSWORD,
        FIELD_EMAIL,
        FIELD_PHONE_NUMBER,
        FIELD_NOTES,
        FIELD_FAVORITE,
      ];

      if (rootGetters.isV2User) {
        IDENTITY_FIELDS.push(FIELD_TOTP);
      }

      return IDENTITY_FIELDS;
    },
    IDENTITY_CUSTOM_FIELDS: (state, getters, rootState, rootGetters) => {
      return rootGetters.isV2User
        ? [
            CUSTOM_FIELD_TEXT,
            CUSTOM_FIELD_ADDRESS,
            CUSTOM_FIELD_AUTH_KEY,
            CUSTOM_FIELD_BANKING_INFO,
            CUSTOM_FIELD_IDENTIFICATION,
            CUSTOM_FIELD_DATE,
            CUSTOM_FIELD_URL,
          ]
        : [];
    },
  },
};
