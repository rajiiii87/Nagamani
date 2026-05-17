const Invoice = require('../models/Invoice');
const { getCurrentFinancialYear } = require('./taxCalculator');

async function generateInvoiceNumber() {
  const fy = getCurrentFinancialYear();
  const lastInvoice = await Invoice.findOne({ financialYear: fy })
    .sort({ invoiceNumber: -1 });

  let nextNumber = 1;
  if (lastInvoice) {
    const lastNum = parseInt(lastInvoice.invoiceNumber.split('/').pop());
    nextNumber = lastNum + 1;
  }

  const invoiceNumber = `${fy}/INV/${String(nextNumber).padStart(4, '0')}`;
  return invoiceNumber;
}

async function checkDuplicateInvoice(companyId, partyId, invoiceDate, lineItems) {
  // Only check for duplicates if submitted within 5 minutes with exact same items
  // This prevents accidental duplicate submission of the exact same invoice
  const invoiceDateStart = new Date(invoiceDate);
  invoiceDateStart.setMinutes(invoiceDateStart.getMinutes() - 5);
  
  const invoiceDateEnd = new Date(invoiceDate);
  invoiceDateEnd.setMinutes(invoiceDateEnd.getMinutes() + 5);

  // Check if exact same invoice exists (same party, same date, same line items)
  const existingInvoices = await Invoice.find({
    companyId,
    partyId,
    invoiceDate: {
      $gte: invoiceDateStart,
      $lte: invoiceDateEnd,
    }
  });

  // If no invoices in the time window, it's not a duplicate
  if (existingInvoices.length === 0) {
    return false;
  }

  // Check if line items match exactly
  for (const existing of existingInvoices) {
    if (existing.lineItems.length === lineItems.length) {
      const itemsMatch = existing.lineItems.every((existingItem, index) => {
        const newItem = lineItems[index];
        return existingItem.goodsId.toString() === (newItem.goodsId?.toString() || newItem.goodsId) &&
               existingItem.quantity === newItem.quantity &&
               parseFloat(existingItem.rate).toFixed(2) === parseFloat(newItem.rate).toFixed(2);
      });
      if (itemsMatch) {
        return true; // Exact duplicate found
      }
    }
  }

  return false; // Similar invoice exists but items are different
}

module.exports = {
  generateInvoiceNumber,
  checkDuplicateInvoice,
};
