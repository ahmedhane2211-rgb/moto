/**
 * Converts numbers to words in Arabic and English.
 * Supports up to billions with decimals (for currencies).
 */

const arabicWords = {
  units: ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة"],
  teens: ["عشرة", "إحدى عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"],
  tens: ["", "عشرة", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"],
  hundreds: ["", "مائة", "مائتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"],
  thousands: ["ألف", "ألفان", "آلاف"],
  millions: ["مليون", "مليونان", "ملايين"],
  billions: ["مليار", "ملياران", "مليارات"]
};

const englishWords = {
  units: ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"],
  teens: ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"],
  tens: ["", "Ten", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"],
  scales: ["", "Thousand", "Million", "Billion"]
};

function convertToArabic(number) {
  if (number === 0) return "صفر";
  
  let words = "";
  let n = Math.floor(number);
  
  if (n >= 1000000000) {
    const billion = Math.floor(n / 1000000000);
    words += (billion === 1 ? arabicWords.billions[0] : billion === 2 ? arabicWords.billions[1] : convertToArabic(billion) + " " + arabicWords.billions[2]) + " و";
    n %= 1000000000;
  }
  
  if (n >= 1000000) {
    const million = Math.floor(n / 1000000);
    words += (million === 1 ? arabicWords.millions[0] : million === 2 ? arabicWords.millions[1] : convertToArabic(million) + " " + arabicWords.millions[2]) + " و";
    n %= 1000000;
  }
  
  if (n >= 1000) {
    const thousand = Math.floor(n / 1000);
    words += (thousand === 1 ? arabicWords.thousands[0] : thousand === 2 ? arabicWords.thousands[1] : convertToArabic(thousand) + " " + arabicWords.thousands[2]) + " و";
    n %= 1000;
  }
  
  if (n >= 100) {
    words += arabicWords.hundreds[Math.floor(n / 100)] + " و";
    n %= 100;
  }
  
  if (n >= 20) {
    words += (n % 10 !== 0 ? arabicWords.units[n % 10] + " و" : "") + arabicWords.tens[Math.floor(n / 10)] + " و";
  } else if (n >= 10) {
    words += arabicWords.teens[n - 10] + " و";
  } else if (n > 0) {
    words += arabicWords.units[n] + " و";
  }
  
  // Clean up and format
  words = words.trim();
  if (words.endsWith("و")) words = words.slice(0, -1).trim();
  
  return words;
}

function convertToEnglish(number) {
  if (number === 0) return "Zero";
  
  const chunks = [];
  let n = Math.floor(number);
  
  while (n > 0) {
    chunks.push(n % 1000);
    n = Math.floor(n / 1000);
  }
  
  const words = chunks.map((chunk, i) => {
    if (chunk === 0) return "";
    
    let chunkWords = "";
    if (chunk >= 100) {
      chunkWords += englishWords.units[Math.floor(chunk / 100)] + " Hundred ";
      chunk %= 100;
    }
    
    if (chunk >= 20) {
      chunkWords += englishWords.tens[Math.floor(chunk / 10)] + (chunk % 10 !== 0 ? "-" + englishWords.units[chunk % 10] : "");
    } else if (chunk >= 10) {
      chunkWords += englishWords.teens[chunk - 10];
    } else if (chunk > 0) {
      chunkWords += englishWords.units[chunk];
    }
    
    return chunkWords.trim() + " " + englishWords.scales[i];
  }).reverse().join(" ").trim();
  
  return words;
}

export function numberToWords(number, lang = "ar") {
  const num = parseFloat(number);
  if (isNaN(num)) return "";
  
  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);
  
  if (lang === "ar") {
    let result = convertToArabic(integerPart);
    if (decimalPart > 0) {
      result += " و " + convertToArabic(decimalPart) + " قرشاً";
    }
    return result + " فقط لا غير";
  } else {
    let result = convertToEnglish(integerPart);
    if (decimalPart > 0) {
      result += " and " + convertToEnglish(decimalPart) + " Cents";
    }
    return result + " Only";
  }
}
