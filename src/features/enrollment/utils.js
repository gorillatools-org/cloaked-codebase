export const getFormattedSsnValue = (value) => {
  const [area, group] = value?.split("-") ?? "";

  if (value?.length === 3 && area?.length === 3) {
    return `${value}-`;
  }

  if (value?.length === 6 && area?.length === 3 && group?.length === 2) {
    return `${value}-`;
  }

  return value;
};

export const getFormattedDateOfBirthValue = (value) => {
  const [month, day] = value?.split("-") ?? "";

  if (value?.length === 2 && month?.length === 2) {
    return `${value}-`;
  }

  if (value?.length === 5 && month?.length === 2 && day?.length === 2) {
    return `${value}-`;
  }

  return value;
};
