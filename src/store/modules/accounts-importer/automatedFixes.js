import {
  FILE_UPLOAD_ERROR_ALTERNATE_DELIMITERS,
  FILE_UPLOAD_WARNING,
  FILE_UPLOAD_WARNING_EXTRA_COLUMNS,
  FILE_UPLOAD_WARNING_EXTRA_FIELDS,
  FILE_UPLOAD_WARNING_HAS_TABLE_HEAD,
} from "@/store/modules/accounts-importer/shared";
import moment from "moment/moment";

const hasTableHead = (records) =>
  records?.[0]?.length === 1 && records?.[1]?.length > 1;

const hasExtraColumns = (records) =>
  records?.slice(1).some((record) => record?.length < records?.[0]?.length) &&
  records?.slice(1).every((record) => record?.length <= records?.[0]?.length);

const hasExtraFields = (records) =>
  records?.slice(1).some((record) => record?.length > records?.[0]?.length);

const hasAlternateDelimiters = (records) =>
  records?.[0]?.length === 1 && records?.[0]?.[0]?.length > 10;

const getParsingError = (records, csvParseWarning) => {
  if (hasTableHead(records)) {
    return FILE_UPLOAD_WARNING_HAS_TABLE_HEAD;
  }

  if (hasExtraColumns(records)) {
    return FILE_UPLOAD_WARNING_EXTRA_COLUMNS;
  }

  if (hasExtraFields(records)) {
    return FILE_UPLOAD_WARNING_EXTRA_FIELDS;
  }

  if (hasAlternateDelimiters(records)) {
    return FILE_UPLOAD_ERROR_ALTERNATE_DELIMITERS;
  }

  if (csvParseWarning) {
    return FILE_UPLOAD_WARNING;
  }

  return null;
};

const withTableHeadFixed = (records) => {
  return records.slice(1);
};

const withEmptyLeadingValuesFixed = (records) => {
  const maxLength = records.reduce(
    (result, record) => Math.max(result, record.length),
    0
  );

  const minTrailingValues = records.reduce((result, record) => {
    let trailingValues = 0;

    for (let i = maxLength - 1; i >= 0; i--) {
      if (record[i]) {
        break;
      }

      trailingValues = trailingValues + 1;
    }

    return Math.min(result, trailingValues);
  }, maxLength);

  return records.map((record) =>
    record.slice(0, maxLength - minTrailingValues)
  );
};

const withEmptyTrailingValuesFixed = (records) => {
  const maxLength = records.reduce(
    (result, record) => Math.max(result, record.length),
    0
  );

  const minLeadingValues = records.reduce((result, record) => {
    let leadingValues = 0;

    for (let i = 0; i < maxLength - 1; i++) {
      if (record[i]) {
        break;
      }

      leadingValues = leadingValues + 1;
    }

    return Math.min(result, leadingValues);
  }, maxLength);

  return records.map((record) => record.slice(minLeadingValues, maxLength));
};

const withShiftedValuesFixed = (records) => {
  const columnsCopy = JSON.parse(JSON.stringify(records[0]));

  while (columnsCopy.length && !columnsCopy[0]) {
    columnsCopy.shift();
  }

  while (columnsCopy.length && !columnsCopy[columnsCopy.length - 1]) {
    columnsCopy.pop();
  }

  const expectedRecordLength = columnsCopy.length;

  return records.map((record) => {
    let leadingValues = 0;
    let trailingValues = 0;

    for (let i = 0; i < record.length - 1; i++) {
      if (record[i]) {
        break;
      }

      leadingValues = leadingValues + 1;
    }

    for (let i = record.length - 1; i >= 0; i--) {
      if (record[i]) {
        break;
      }

      trailingValues = trailingValues + 1;
    }

    return record.length - leadingValues - trailingValues ===
      expectedRecordLength
      ? record.slice(leadingValues, record.length - trailingValues)
      : record;
  });
};

const withMissingFieldsFixed = (records) => {
  const maxLength = records.reduce(
    (result, record) => Math.max(result, record.length),
    0
  );

  return records.map((record) =>
    record.length === maxLength
      ? record
      : [...record, ...new Array(maxLength - record.length).fill("")]
  );
};

export const withIssuesFixed = (records, csvParseError) => {
  let recordsWithIssuesFixed = JSON.parse(JSON.stringify(records));

  if (hasTableHead(recordsWithIssuesFixed)) {
    recordsWithIssuesFixed = withTableHeadFixed(recordsWithIssuesFixed);
  }

  recordsWithIssuesFixed = withMissingFieldsFixed(
    withShiftedValuesFixed(
      withEmptyLeadingValuesFixed(
        withEmptyTrailingValuesFixed(recordsWithIssuesFixed)
      )
    )
  );

  return {
    records: recordsWithIssuesFixed,
    error: getParsingError(records, csvParseError),
  };
};

export const withPatchedValues = (customField) => {
  const fieldCopy = JSON.parse(JSON.stringify(customField));

  if (
    fieldCopy.type === "url" &&
    !(
      fieldCopy.value.startsWith("http://") ||
      fieldCopy.value.startsWith("https://")
    )
  ) {
    fieldCopy.value = `https://${fieldCopy.value}`;
  }

  if (fieldCopy.type === "date") {
    fieldCopy.value = moment(fieldCopy.value).format("YYYY-MM-DD");
  }

  return fieldCopy;
};
