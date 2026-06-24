/**
 * Converts a number into Arabic words.
 * @param {number} number The number to convert.
 * @returns {string} The number in Arabic words.
 */
function numberToArabicWords(number) {
  const num = parseInt(number, 10);
  if (isNaN(num)) return "ليس رقمًا صالحًا";

  if (num < 0) return "الأرقام السالبة غير مدعومة";
  if (num === 0) return "صفر";

  const ones = [
    "",
    "واحد",
    "اثنان",
    "ثلاثة",
    "أربعة",
    "خمسة",
    "ستة",
    "سبعة",
    "ثمانية",
    "تسعة",
  ];
  const tens = [
    "",
    "",
    "عشرون",
    "ثلاثون",
    "أربعون",
    "خمسون",
    "ستون",
    "سبعون",
    "ثمانون",
    "تسعون",
  ];
  const hundreds = [
    "",
    "مئة",
    "مئتان",
    "ثلاثمئة",
    "أربعمئة",
    "خمسمئة",
    "ستمئة",
    "سبعمئة",
    "ثمانمئة",
    "تسعمئة",
  ];
  const thousands = {
    singular: "ألف",
    dual: "ألفان",
    plural: "آلاف",
    accusative: "ألفًا",
  };
  const millions = {
    singular: "مليون",
    dual: "مليونان",
    plural: "ملايين",
    accusative: "مليونًا",
  };
  const billions = {
    singular: "مليار",
    dual: "ملياران",
    plural: "مليارات",
    accusative: "مليارًا",
  };

  /**
   * Converts a chunk of up to 3 digits (0-999) into Arabic words.
   * @param {number} n The 3-digit number chunk.
   */
  function convertChunk(n) {
    if (n === 0) return "";

    let result = [];
    const h = Math.floor(n / 100);
    const remainder = n % 100;

    if (h > 0) {
      result.push(hundreds[h]);
    }

    if (remainder > 0) {
      if (remainder < 10) {
        result.push(ones[remainder]);
      } else if (remainder === 10) {
        result.push("عشرة");
      } else if (remainder === 11) {
        result.push("أحد عشر");
      } else if (remainder === 12) {
        result.push("اثنا عشر");
      } else if (remainder < 20) {
        result.push(ones[remainder % 10] + " عشر");
      } else {
        const o = remainder % 10;
        const t = Math.floor(remainder / 10);
        if (o > 0) {
          result.push(ones[o]);
        }
        result.push(tens[t]);
      }
    }

    if (remainder > 20 && remainder % 10 > 0) {
      const lastTwo = result.slice(-2);
      const joined = lastTwo[0] + " و" + lastTwo[1];
      result.splice(-2, 2, joined);
    }

    return result.join(" و");
  }

  if (num < 1000) {
    return convertChunk(num);
  }

  const chunks = [];
  let tempNum = num;
  while (tempNum > 0) {
    chunks.push(tempNum % 1000);
    tempNum = Math.floor(tempNum / 1000);
  }

  const placeValues = [null, thousands, millions, billions];
  let resultParts = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunkValue = chunks[i];
    if (chunkValue === 0) continue;

    const place = placeValues[i];

    if (!place) {
      resultParts.push(convertChunk(chunkValue));
      continue;
    }

    if (chunkValue === 1) {
      resultParts.push(place.singular);
    } else if (chunkValue === 2) {
      resultParts.push(place.dual);
    } else if (chunkValue >= 3 && chunkValue <= 10) {
      resultParts.push(convertChunk(chunkValue) + " " + place.plural);
    } else if (chunkValue >= 11 && chunkValue <= 99) {
      resultParts.push(convertChunk(chunkValue) + " " + place.accusative);
    } else {
      resultParts.push(convertChunk(chunkValue) + " " + place.singular);
    }
  }

  return resultParts.reverse().join(" و").trim();
}

/**
 * Converts a number into English words.
 * @param {number} number The number to convert.
 * @returns {string} The number in English words.
 */
function numberToEnglishWords(number) {
  const num = parseInt(number, 10);
  if (isNaN(num)) return "Not a valid number";

  if (num < 0) return "Negative numbers not supported";
  if (num === 0) return "zero";

  const ones = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
  ];
  const teens = [
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];
  const hundreds = "hundred";
  const thousands = "thousand";
  const millions = "million";
  const billions = "billion";

  /**
   * Converts a chunk of up to 3 digits (0-999) into English words.
   * @param {number} n The 3-digit number chunk.
   */
  function convertChunk(n) {
    if (n === 0) return "";

    let result = [];
    const h = Math.floor(n / 100);
    const remainder = n % 100;

    if (h > 0) {
      result.push(ones[h] + " " + hundreds);
    }

    if (remainder > 0) {
      if (remainder < 10) {
        result.push(ones[remainder]);
      } else if (remainder >= 10 && remainder < 20) {
        result.push(teens[remainder - 10]);
      } else {
        const o = remainder % 10;
        const t = Math.floor(remainder / 10);
        if (o > 0) {
          result.push(tens[t] + "-" + ones[o]);
        } else {
          result.push(tens[t]);
        }
      }
    }

    return result.join(" and ");
  }

  if (num < 1000) {
    return convertChunk(num);
  }

  const chunks = [];
  let tempNum = num;
  while (tempNum > 0) {
    chunks.push(tempNum % 1000);
    tempNum = Math.floor(tempNum / 1000);
  }

  const placeValues = [null, thousands, millions, billions];
  let resultParts = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunkValue = chunks[i];
    if (chunkValue === 0) continue;

    const place = placeValues[i];

    if (!place) {
      resultParts.push(convertChunk(chunkValue));
      continue;
    }

    resultParts.push(convertChunk(chunkValue) + " " + place);
  }

  return resultParts.reverse().join(", ").trim();
}

export { numberToEnglishWords };
export default numberToArabicWords;
