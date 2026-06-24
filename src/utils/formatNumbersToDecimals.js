export const formatNumbersToDecimals = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return "0.00";
  }

  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};
