const Invoice = require('../models/Invoice');
const Company = require('../models/Company');
const Party = require('../models/Party');
const {
  numberToWords,
  calculateTax,
  getCurrentFinancialYear,
} = require('../utils/taxCalculator');
const { generateInvoiceNumber, checkDuplicateInvoice } = require('../utils/invoiceHelper');
const { generateInvoicePDF } = require('../utils/pdfGenerator');

exports.createInvoice = async (req, res) => {
  try {
    const {
      invoiceDate,
      vehicleNumber,
      supplyType,
      partyId,
      lineItems,
      notes,
    } = req.body;

    // Get company
    const company = await Company.findOne();
    if (!company) {
      return res.status(400).json({ message: 'Company profile not configured' });
    }

    // Get party
    const party = await Party.findById(partyId);
    if (!party) {
      return res.status(400).json({ message: 'Party not found' });
    }

    // Validate line items
    if (!lineItems || lineItems.length === 0) {
      return res.status(400).json({ message: 'At least one item is required' });
    }

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();
    const fy = getCurrentFinancialYear();

    // Check for duplicate
    const isDuplicate = await checkDuplicateInvoice(company._id, partyId, invoiceDate, lineItems);
    if (isDuplicate) {
      return res.status(400).json({ message: 'Duplicate invoice detected' });
    }

    // Calculate totals
    let subtotal = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;

    const processedItems = lineItems.map((item) => {
      const lineAmount = item.quantity * item.rate;
      const taxes = calculateTax(lineAmount, item.gstRate, supplyType);

      subtotal += lineAmount;
      cgstTotal += taxes.cgst;
      sgstTotal += taxes.sgst;
      igstTotal += taxes.igst;

      return {
        ...item,
        amount: lineAmount,
        cgst: taxes.cgst,
        sgst: taxes.sgst,
        igst: taxes.igst,
        lineTotal: lineAmount + taxes.cgst + taxes.sgst + taxes.igst,
      };
    });

    const grandTotal = subtotal + cgstTotal + sgstTotal + igstTotal;
    const amountInWords = numberToWords(Math.round(grandTotal));

    const invoice = new Invoice({
      invoiceNumber,
      financialYear: fy,
      invoiceDate: new Date(invoiceDate),
      vehicleNumber,
      supplyType,
      companyId: company._id,
      partyId,
      lineItems: processedItems,
      subtotal,
      cgstTotal,
      sgstTotal,
      igstTotal,
      grandTotal,
      amountInWords,
      notes,
      status: 'draft',
    });

    await invoice.save();
    await invoice.populate('partyId companyId');

    res.status(201).json({
      message: 'Invoice created successfully',
      invoice,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllInvoices = async (req, res) => {
  try {
    const { partyId, financialYear, status } = req.query;
    let query = {};

    if (partyId) query.partyId = partyId;
    if (financialYear) query.financialYear = financialYear;
    if (status) {
      query.status = status;
    } else {
      // By default, exclude cancelled invoices
      query.status = { $ne: 'cancelled' };
    }

    const invoices = await Invoice.find(query)
      .populate('partyId', 'partyName gstin')
      .sort({ createdAt: -1 });

    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('partyId')
      .populate('companyId');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.status === 'printed' || invoice.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot edit locked invoice' });
    }

    const { lineItems, supplyType, vehicleNumber, notes } = req.body;

    if (lineItems) {
      let subtotal = 0;
      let cgstTotal = 0;
      let sgstTotal = 0;
      let igstTotal = 0;

      const processedItems = lineItems.map((item) => {
        const lineAmount = item.quantity * item.rate;
        const taxes = calculateTax(lineAmount, item.gstRate, supplyType || invoice.supplyType);

        subtotal += lineAmount;
        cgstTotal += taxes.cgst;
        sgstTotal += taxes.sgst;
        igstTotal += taxes.igst;

        return {
          ...item,
          amount: lineAmount,
          cgst: taxes.cgst,
          sgst: taxes.sgst,
          igst: taxes.igst,
          lineTotal: lineAmount + taxes.cgst + taxes.sgst + taxes.igst,
        };
      });

      const grandTotal = subtotal + cgstTotal + sgstTotal + igstTotal;

      invoice.lineItems = processedItems;
      invoice.subtotal = subtotal;
      invoice.cgstTotal = cgstTotal;
      invoice.sgstTotal = sgstTotal;
      invoice.igstTotal = igstTotal;
      invoice.grandTotal = grandTotal;
      invoice.amountInWords = numberToWords(Math.round(grandTotal));
    }

    if (supplyType) invoice.supplyType = supplyType;
    if (vehicleNumber) invoice.vehicleNumber = vehicleNumber;
    if (notes) invoice.notes = notes;

    invoice.updatedAt = new Date();
    await invoice.save();

    res.status(200).json({ message: 'Invoice updated successfully', invoice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.generatePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('partyId')
      .populate('companyId');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const filePath = await generateInvoicePDF(invoice, invoice.companyId, invoice.partyId);

    res.download(filePath, `invoice_${invoice.invoiceNumber.replace('/', '_')}.pdf`);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.printInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status: 'printed', updatedAt: new Date() },
      { new: true }
    ).populate('partyId').populate('companyId');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.status(200).json({ message: 'Invoice marked as printed', invoice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled', updatedAt: new Date() },
      { new: true }
    );

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.status(200).json({ message: 'Invoice cancelled successfully', invoice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMonthlyReport = async (req, res) => {
  try {
    const { financialYear, month } = req.query;

    if (!financialYear) {
      return res.status(400).json({ message: 'Financial year is required' });
    }

    let query = { financialYear, status: { $ne: 'cancelled' } };

    if (month) {
      const [year, monthNum] = month.split('-');
      const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(monthNum), 0);
      query.invoiceDate = { $gte: startDate, $lte: endDate };
    }

    const invoices = await Invoice.find(query).populate('partyId');

    let totalRevenue = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;

    invoices.forEach((inv) => {
      totalRevenue += inv.grandTotal;
      totalCGST += inv.cgstTotal || 0;
      totalSGST += inv.sgstTotal || 0;
      totalIGST += inv.igstTotal || 0;
    });

    res.status(200).json({
      totalInvoices: invoices.length,
      totalRevenue,
      totalCGST,
      totalSGST,
      totalIGST,
      invoices,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPartyWiseReport = async (req, res) => {
  try {
    const { financialYear, partyId } = req.query;

    let query = { status: { $ne: 'cancelled' } };
    if (financialYear) query.financialYear = financialYear;
    if (partyId) query.partyId = partyId;

    const invoices = await Invoice.find(query).populate('partyId');

    const report = {};
    invoices.forEach((inv) => {
      const key = inv.partyId._id;
      if (!report[key]) {
        report[key] = {
          partyName: inv.partyId.partyName,
          gstin: inv.partyId.gstin,
          invoiceCount: 0,
          totalAmount: 0,
          totalTax: 0,
        };
      }
      report[key].invoiceCount += 1;
      report[key].totalAmount += inv.subtotal;
      report[key].totalTax += (inv.cgstTotal || 0) + (inv.sgstTotal || 0) + (inv.igstTotal || 0);
    });

    res.status(200).json(Object.values(report));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
