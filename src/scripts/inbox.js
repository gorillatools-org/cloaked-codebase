import moment from "moment";

export const getTimeDisplay = (dateTime) => {
  const today = moment().startOf("day");
  const yesterday = moment().subtract(24, "hours").startOf("day");
  const lastYear = moment().subtract(1, "year").startOf("day");
  const dateTimeMoment = moment(dateTime);
  if (dateTimeMoment.isAfter(today)) {
    return dateTimeMoment.format("h:mm A");
  } else if (
    dateTimeMoment.isAfter(yesterday) &&
    dateTimeMoment.isBefore(today)
  ) {
    return `Yesterday ${dateTimeMoment.format("h:mm a")}`;
  } else if (
    dateTimeMoment.isBefore(yesterday) &&
    dateTimeMoment.isAfter(lastYear)
  ) {
    return dateTimeMoment.format("MMM Do");
  } else {
    return dateTimeMoment.format("MMM YYYY");
  }
};

export const getTimeDisplayInboxList = (dateTime, small = false) => {
  const today = moment().startOf("day");
  const yesterday = moment().subtract(24, "hours").startOf("day");
  const lastYear = moment().subtract(1, "year").startOf("day");
  const dateTimeMoment = moment(dateTime);
  if (dateTimeMoment.isAfter(today)) {
    return dateTimeMoment.format("h:mm A");
  } else if (
    dateTimeMoment.isAfter(yesterday) &&
    dateTimeMoment.isBefore(today)
  ) {
    return "Yesterday";
  } else if (
    dateTimeMoment.isBefore(yesterday) &&
    dateTimeMoment.isAfter(lastYear)
  ) {
    return small
      ? dateTimeMoment.format("MMM D")
      : dateTimeMoment.format("MMMM D");
  } else {
    return dateTimeMoment.format("MMM YYYY");
  }
};

export const getHourMinDisplay = (dateTime) => {
  return moment(dateTime).format("h:mm A");
};

export const isSameDay = (dateTime1, dateTime2) => {
  return moment(dateTime1).isSame(dateTime2, "day");
};

export const getDateDisplay = (dateTime) => {
  const today = moment().startOf("day");
  const yesterday = moment().subtract(24, "hours").startOf("day");
  const lastYear = moment().subtract(1, "year").startOf("day");
  const dateTimeMoment = moment(dateTime);
  if (dateTimeMoment.isAfter(today)) {
    return "Today";
  } else if (
    dateTimeMoment.isAfter(yesterday) &&
    dateTimeMoment.isBefore(today)
  ) {
    return `Yesterday`;
  } else if (
    dateTimeMoment.isBefore(yesterday) &&
    dateTimeMoment.isAfter(lastYear)
  ) {
    return dateTimeMoment.format("dddd, MMMM Do");
  } else {
    return dateTimeMoment.format("MMMM D, YYYY");
  }
};

export const getContactName = (senderContact) => {
  let firstName = "";
  let lastName = "";
  if (senderContact) {
    const { first_name, last_name } = senderContact;
    if (first_name && first_name.toLowerCase() !== "unknown") {
      firstName = first_name;
    }
    if (last_name && last_name.toLowerCase() !== "via cloaked") {
      lastName = last_name;
    }
  }
  return { firstName, lastName };
};

export const getFullContactNameStr = (contact) => {
  let { firstName, lastName } = getContactName(contact);
  firstName = firstName ? firstName : "";
  lastName = lastName ? lastName : "";
  let fullName = firstName;
  if (fullName.length && lastName.length) {
    fullName += " ";
  }
  fullName += lastName;
  return fullName;
};

export const getSenderInitialsFromEmail = (email) => {
  let fullName = "";
  if (email.sender_contact) {
    const { firstName, lastName } = getContactName(email.sender_contact);
    fullName = `${firstName && firstName[0] ? firstName[0] : ""}${
      lastName && lastName[0] ? lastName[0] : ""
    }`;
  }

  if (!fullName && email.sender_name) {
    const [firstName, lastName] = email.sender_name.split(" ");
    fullName = `${firstName && firstName[0] ? firstName[0] : ""}${
      lastName && lastName[0] ? lastName[0] : ""
    }`;
  }

  return fullName;
};

export const isImage = (url) => {
  const extensions = [".jpg", ".gif", ".jpeg", ".png", ".webp", ".heic"];
  let supported = false;
  extensions.map((ext) => {
    if (url.toLowerCase().includes(ext)) {
      supported = true;
    }
  });
  return supported;
};

export const displayRecipients = (recipients) => {
  const displayArray = [];
  if (!recipients) {
    return "";
  }
  recipients.forEach((recipient) => {
    if (recipient.name) {
      displayArray.push(recipient.name);
    } else if (recipient.email) {
      displayArray.push(recipient.email);
    }
  });
  return displayArray.join(", ");
};

export const inbox = {
  getTimeDisplay,
  getTimeDisplayInboxList,
  getHourMinDisplay,
  isSameDay,
  getDateDisplay,
  getContactName,
  getFullContactNameStr,
  getSenderInitialsFromEmail,
  isImage,
  displayRecipients,
};
