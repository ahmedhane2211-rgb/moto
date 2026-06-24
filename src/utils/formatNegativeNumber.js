/**
 * تنسيق الأرقام السالبة بحيث تظهر بين قوسين وباللون الأحمر
 * @param {number} value - الرقم المراد تنسيقه
 * @param {string} color - اللون الافتراضي للرقم (الأخضر للموجب، الأحمر للسالب)
 * @returns {Object} كائن يحتوي على الرقم المنسق والكلاس
 */
export const formatNegativeNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return {
      formatted: "-",
      color: "black",
      isNegative: false,
    };
  }

  const numValue = parseFloat(value);

  if (isNaN(numValue)) {
    return {
      formatted: value,
      color: "black",
      isNegative: false,
    };
  }

  if (numValue < 0) {
    return {
      formatted: `(${Math.abs(numValue)})`,
      color: "red",
      isNegative: true,
    };
  }

  return {
    formatted: numValue,
    isNegative: false,
  };
};

/**
 * مكون React لعرض الأرقام مع التنسيق التلقائي
 */
export const NegativeNumberDisplay = ({ value, className = "" }) => {
  const { formatted, color } = formatNegativeNumber(value);

  return (
    <span style={{ color }} className={className}>
      {formatted}
    </span>
  );
};
