const mongoose = require('mongoose');

const InvoiceLineItemSchema = new mongoose.Schema({
  goodsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goods',
    required: true,
  },
  description: String,
  hsnCode: String,
  quantity: {
    type: Number,
    required: true,
    min: 0.01,
  },
  bags: {
    type: Number,
    default: 0,
  },
  rate: {
    type: Number,
    required: true,
    min: 0,
  },
  gstRate: {
    type: Number,
    required: true,
    enum: [0, 5, 12, 18, 28],
  },
  amount: {
    type: Number,
    required: true,
  },
  cgst: Number,
  sgst: Number,
  igst: Number,
  lineTotal: Number,
});

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    unique: true,
    required: true,
  },
  financialYear: {
    type: String,
    required: true,
  },
  invoiceDate: {
    type: Date,
    default: Date.now,
  },
  vehicleNumber: String,
  supplyType: {
    type: String,
    enum: ['Intra-State', 'Inter-State', 'Non-Taxable'],
    default: 'Intra-State',
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  partyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Party',
    required: true,
  },
  lineItems: [InvoiceLineItemSchema],
  subtotal: Number,
  cgstTotal: Number,
  sgstTotal: Number,
  igstTotal: Number,
  grandTotal: Number,
  amountInWords: String,
  status: {
    type: String,
    enum: ['draft', 'saved', 'printed', 'cancelled'],
    default: 'saved',
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { collection: 'invoices' });

module.exports = mongoose.model('Invoice', InvoiceSchema);
