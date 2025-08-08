import moment from "moment";

export const humanize = (timestamp) => {
  return moment(timestamp).fromNow();
};

export const formatFullDayDateTime = (timestamp, format = moment.ISO_8601) => {
  return moment(timestamp, format).format("LLLL");
};

export const formatAbbreviatedDayDateTime = (
  timestamp,
  format = moment.ISO_8601
) => {
  return moment(timestamp, format).format("LL");
};

export const timestamp = {
  humanize,
  formatFullDayDateTime,
  formatAbbreviatedDayDateTime,
};
