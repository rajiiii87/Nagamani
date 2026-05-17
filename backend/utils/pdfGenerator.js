const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generateInvoicePDF(invoiceData, companyData, partyData) {
  return new Promise((resolve, reject) => {
    try {
      const fileName = `invoice_${invoiceData.invoiceNumber.replace('/', '_')}.pdf`;
      const filePath = path.join(__dirname, '../../invoices', fileName);

      // Create invoices folder if doesn't exist
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const doc = new PDFDocument({ 
        margin: 40,
        size: 'A4',
        bufferPages: true
      });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // ORIGINAL stamp
      doc.fontSize(12).font('Helvetica-Bold').text('ORIGINAL', 480, 50, { align: 'right' });

      // Header - Company Name
      doc.fontSize(16).font('Helvetica-Bold').text(companyData.companyName, 50, 80);
      // Don't add "SRI THIRUPATHI TRADERS" - use company name only

      // Company details - Left side
      doc.fontSize(9).font('Helvetica');
      doc.text(`${companyData.address}`, 50, 100);
      doc.text(`${companyData.city} - ${companyData.pincode}`, 50, 113);
      doc.text(`${companyData.state}`, 50, 126);

      // Company details - Right side  
      doc.fontSize(9);
      doc.text(`GSTIN: ${companyData.gstin}`, 350, 100);
      doc.text(`TAX INVOICE`, 350, 113);
      doc.text(`FSSAI NO: ${companyData.fssaiNumber || '-'}`, 350, 126);

      // Divider line
      doc.moveTo(50, 140).lineTo(555, 140).stroke();

      // TO section
      doc.fontSize(9).font('Helvetica-Bold').text('To', 50, 150);
      doc.fontSize(10).font('Helvetica-Bold').text(partyData.partyName, 50, 165);
      doc.fontSize(9).font('Helvetica');
      doc.text(partyData.address, 50, 180);
      doc.text(`${partyData.city}, ${partyData.state}`, 50, 193);
      doc.text(`GSTIN: ${partyData.gstin}`, 50, 206);

      // Invoice details - Right side
      doc.fontSize(9).font('Helvetica-Bold');
      doc.text(`Invoice No. : ${invoiceData.invoiceNumber}`, 350, 165);
      doc.text(`Invoice Date: ${new Date(invoiceData.invoiceDate).toLocaleDateString('en-IN')}`, 350, 180);
      doc.text(`Vehicle No. : ${invoiceData.vehicleNumber || '-'}`, 350, 195);

      // Divider line
      doc.moveTo(50, 220).lineTo(555, 220).stroke();

      // Table Header
      const tableTop = 230;
      doc.fontSize(8).font('Helvetica-Bold');
      doc.text('Description of Goods', 50, tableTop);
      doc.text('HSN', 230, tableTop);
      doc.text('Qty', 280, tableTop);
      doc.text('Unit', 320, tableTop);
      doc.text('No.Bags', 365, tableTop);
      doc.text('Rate', 420, tableTop);
      doc.text('Amount', 480, tableTop);

      doc.moveTo(50, tableTop + 12).lineTo(555, tableTop + 12).stroke();

      // Table Content
      let yPosition = tableTop + 22;
      doc.font('Helvetica').fontSize(8);

      invoiceData.lineItems.forEach((item, index) => {
        const itemNameHeight = doc.heightOfString(item.description || item.goodsName || '', { width: 170 });
        const rowHeight = Math.max(itemNameHeight + 4, 15);

        doc.text(item.description || item.goodsName || '', 50, yPosition, { width: 170, height: rowHeight });
        doc.text(item.hsnCode || '', 230, yPosition, { width: 40 });
        doc.text((item.quantity || 0).toString(), 280, yPosition, { width: 35 });
        doc.text('Kg', 320, yPosition, { width: 40 });
        doc.text(item.bags ? item.bags.toString() : '0', 365, yPosition, { width: 40 });
        doc.text(parseFloat(item.rate || 0).toFixed(2), 420, yPosition, { width: 50 });
        doc.text(parseFloat(item.amount || 0).toFixed(2), 480, yPosition, { width: 60 });

        yPosition += rowHeight + 2;
      });

      // Totals section
      // ================= TOTALS SECTION =================
const totalsY = yPosition + 10;
doc.moveTo(50, totalsY - 5).lineTo(555, totalsY - 5).stroke();

// Column config
const labelX = 350;
const labelWidth = 100;
const amountX = 460;
const amountWidth = 90;

doc.fontSize(8).font('Helvetica');

// -------- Gross --------
doc.text('Gross Amount', labelX, totalsY, {
  width: labelWidth,
  align: 'left'
});
doc.text(
  parseFloat(invoiceData.subtotal || 0).toFixed(2),
  amountX,
  totalsY,
  {
    width: amountWidth,
    align: 'right'
  }
);

let taxY = totalsY + 12;

// -------- CGST / SGST / IGST --------
if (
  invoiceData.supplyType === 'Intra-State' ||
  invoiceData.supplyType === 'Intra-State (CGST + SGST)'
) {
  doc.text('CGST', labelX, taxY, { width: labelWidth });
  doc.text(
    parseFloat(invoiceData.cgstTotal || 0).toFixed(2),
    amountX,
    taxY,
    { width: amountWidth, align: 'right' }
  );

  taxY += 12;

  doc.text('SGST', labelX, taxY, { width: labelWidth });
  doc.text(
    parseFloat(invoiceData.sgstTotal || 0).toFixed(2),
    amountX,
    taxY,
    { width: amountWidth, align: 'right' }
  );
}
else if (
  invoiceData.supplyType === 'Inter-State' ||
  invoiceData.supplyType === 'Inter-State (IGST)'
) {
  doc.text('IGST', labelX, taxY, { width: labelWidth });
  doc.text(
    parseFloat(invoiceData.igstTotal || 0).toFixed(2),
    amountX,
    taxY,
    { width: amountWidth, align: 'right' }
  );
}

taxY += 14;

// -------- Grand Total --------
doc.fontSize(9).font('Helvetica-Bold');

doc.text('Total Amount', labelX, taxY, {
  width: labelWidth,
  align: 'left'
});
doc.text(
  parseFloat(invoiceData.grandTotal || 0).toFixed(2),
  amountX,
  taxY,
  {
    width: amountWidth,
    align: 'right'
  }
);

// ================= AMOUNT IN WORDS =================
const amountWordsY = taxY + 20;

doc.fontSize(8).font('Helvetica-Bold');
doc.text('Amount in Words:', 50, amountWordsY);

doc.font('Helvetica-Oblique');
doc.text(
  invoiceData.amountInWords || '',
  50,
  amountWordsY + 10,
  {
    width: 500,
    align: 'left'
  }
);

      // Disclaimer and bank details
      const disclaimerY = amountWordsY + 25;
      doc.fontSize(7).font('Helvetica');
      // doc.text('DISCLAIMER Whereby Voluntarily forego Our all type of undoubtable claim or enforceable right in respect of Brand Name printed in this bag', 50, disclaimerY, { width: 450 });
      // doc.text('Goods Sold Bear Unregistered Brand', 50, disclaimerY + 30, { width: 450 });
      // doc.text('Note : Subject to Virudhunagar Jurisdiction only.', 50, disclaimerY + 42, { width: 450 });

      // Bank details - Bottom
      const bankY = disclaimerY + 55;
      doc.fontSize(7);
      doc.text('Bank', 50, bankY);
      doc.text(`: ${companyData.bankName }`, 80, bankY);
      doc.text('Branch', 50, bankY + 10);
      doc.text(`: ${companyData.branchName || 'Virudhunagar' }`, 80, bankY + 10);
      doc.text('A/c. No', 50, bankY + 20);
      doc.text(`: ${companyData.accountNumber }`, 80, bankY + 20);
      doc.text('IFSC', 50, bankY + 30);
      doc.text(`: ${companyData.ifscCode }`, 80, bankY + 30);
      // doc.text('E.G. O.E', 50, bankY + 40);

      // Signature section
      doc.fontSize(8).font('Helvetica-Bold');
      doc.text(`For ${companyData.companyName}`, 380, bankY + 20);
      doc.fontSize(6).font('Helvetica');
      doc.text('(Authorised Signatory)', 400, bankY + 60);

      doc.end();

      stream.on('finish', () => {
        resolve(filePath);
      });
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  generateInvoicePDF,
};
