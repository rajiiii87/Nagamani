// Convert number to words in Indian format
function numberToWords(num) {
  if (num === 0) return 'Zero Only';

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];

  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const scales = ['', 'Thousand', 'Lakh', 'Crore'];

  function convertToWords(n) {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    if (n < 1000) {
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertToWords(n % 100) : '');
    }
    return '';
  }

  const parts = [];
  let groupIndex = 0;

  while (num > 0) {
    let divisor = 1;
    if (groupIndex === 0) divisor = 1000;
    else if (groupIndex === 1) divisor = 100;
    else divisor = 10000;

    const part = num % divisor;
    if (part !== 0) {
      const words = convertToWords(part);
      if (groupIndex > 0 && groupIndex < scales.length) {
        parts.unshift(words + ' ' + scales[groupIndex]);
      } else if (groupIndex === 0) {
        parts.unshift(words);
      }
    }

    num = Math.floor(num / divisor);
    groupIndex++;
  }

  return parts.join(' ').trim() + ' Only';
}

// Calculate tax based on GST rate and supply type
function calculateTax(amount, gstRate, supplyType) {
  const taxes = {
    cgst: 0,
    sgst: 0,
    igst: 0,
  };

  if (supplyType === 'Intra-State') {
    const halfRate = gstRate / 2;
    taxes.cgst = (amount * halfRate) / 100;
    taxes.sgst = (amount * halfRate) / 100;
  } else if (supplyType === 'Inter-State') {
    taxes.igst = (amount * gstRate) / 100;
  }

  return taxes;
}

// Get current financial year (Indian format)
function getCurrentFinancialYear() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  if (month >= 3) {
    // April onwards is next fiscal year
    return `${year}-${String(year + 1).slice(-2)}`;
  } else {
    // Before April is current fiscal year
    return `${year - 1}-${String(year).slice(-2)}`;
  }
}

// Validate GSTIN format
function validateGSTIN(gstin) {
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin);
}

// Validate PAN format
function validatePAN(pan) {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
}

module.exports = {
  numberToWords,
  calculateTax,
  getCurrentFinancialYear,
  validateGSTIN,
  validatePAN,
};
