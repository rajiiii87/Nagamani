import React, { useState, useEffect, useCallback } from 'react';
import { invoiceAPI } from '../utils/api';
import { formatCurrency } from '../utils/helpers';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ status: '', financialYear: getCurrentFinancialYear() });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPrintView, setShowPrintView] = useState(false);
  const [message, setMessage] = useState('');
  const [paperSize] = useState('A4');

  function getCurrentFinancialYear() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    return month >= 3 ? `${year}-${String(year + 1).slice(-2)}` : `${year - 1}-${String(year).slice(-2)}`;
  }

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const query = {
        financialYear: filter.financialYear,
      };
      
      // Only include status filter if it's set and not empty
      if (filter.status && filter.status !== '') {
        query.status = filter.status;
      }
      
      const response = await invoiceAPI.getAll(query);
      setInvoices(response.data);
    } catch (error) {
      setMessage('Error fetching invoices');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handlePrint = async (id) => {
    try {
      const response = await invoiceAPI.getById(id);
      const invoice = response.data;
      setSelectedInvoice(invoice);
      setShowPrintView(true);
    } catch (error) {
      setMessage('Error loading invoice for printing');
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      setMessage('Generating PDF...');
      await invoiceAPI.generatePDF(id);
      setMessage('PDF downloaded successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error downloading PDF');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  /**
   * Opens a brand-new popup window, writes the invoice HTML into it,
   * injects @page rules for the chosen paper size (A4 / A5),
   * and triggers window.print() — completely isolated from the app shell.
   * This prevents the browser from printing the URL bar, tab title, etc.
   */
  const handlePrintInvoice = (invoice, size = paperSize) => {
    const pageDimensions = {
      A4: { width: '210mm', height: '297mm' },
      A5: { width: '148mm', height: '210mm' },
    };
    const { width, height } = pageDimensions[size] || pageDimensions['A4'];

    // Build line items rows
    const lineItemsHTML = (invoice.lineItems || [])
      .map(
        (item, index) => `
        <tr>
          <td class="cell center">${index + 1}</td>
          <td class="cell">${item.description || item.goodsName || ''}</td>
          <td class="cell center">${item.hsnCode || ''}</td>
          <td class="cell center">${item.quantity || ''}</td>
          <td class="cell center">${item.bags || '-'}</td>
          <td class="cell right">₹${parseFloat(item.rate || 0).toFixed(2)}</td>
          <td class="cell right bold">₹${parseFloat(item.amount || 0).toFixed(2)}</td>
        </tr>`
      )
      .join('');

    // Build tax rows conditionally
    const cgst =
      (invoice.cgstTotal || 0) > 0
        ? `<div class="total-row"><span class="total-label">CGST</span><span class="total-value">₹${parseFloat(invoice.cgstTotal).toFixed(2)}</span></div>`
        : '';
    const sgst =
      (invoice.sgstTotal || 0) > 0
        ? `<div class="total-row"><span class="total-label">SGST</span><span class="total-value">₹${parseFloat(invoice.sgstTotal).toFixed(2)}</span></div>`
        : '';
    const igst =
      (invoice.igstTotal || 0) > 0
        ? `<div class="total-row"><span class="total-label">IGST</span><span class="total-value">₹${parseFloat(invoice.igstTotal).toFixed(2)}</span></div>`
        : '';

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    /* ── Page Setup ───────────────────────────────────────────────── */
    @page {
      size: ${width} ${height};
      margin: 12mm 12mm 12mm 12mm;
    }

    /* ── Reset ────────────────────────────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: ${size === 'A5' ? '10px' : '12px'};
      color: #1f2937;
      background: #fff;
      width: ${width};
    }

    /* ── Header ───────────────────────────────────────────────────── */
    .header {
      background-color: #1e3a8a;
      color: white;
      padding: ${size === 'A5' ? '12px 16px' : '20px 24px'};
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-radius: 6px 6px 0 0;
    }
    .header h1 { font-size: ${size === 'A5' ? '16px' : '22px'}; font-weight: 700; margin-bottom: 4px; }
    .header .gstin { font-size: ${size === 'A5' ? '9px' : '11px'}; opacity: 0.85; }
    .header .invoice-label { font-size: ${size === 'A5' ? '13px' : '17px'}; font-weight: 700; }

    /* ── Body ─────────────────────────────────────────────────────── */
    .body { border: 1px solid #e5e7eb; padding: ${size === 'A5' ? '12px' : '18px'}; }

    /* ── Bill To ──────────────────────────────────────────────────── */
    .bill-to { margin-bottom: ${size === 'A5' ? '10px' : '16px'}; padding-bottom: ${size === 'A5' ? '10px' : '16px'}; border-bottom: 1px solid #e5e7eb; }
    .section-label { font-size: 9px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
    .party-name { font-size: ${size === 'A5' ? '12px' : '14px'}; font-weight: 700; color: #1f2937; margin-bottom: 2px; }
    .party-detail { font-size: ${size === 'A5' ? '9px' : '11px'}; color: #6b7280; line-height: 1.5; }

    /* ── Invoice Meta ─────────────────────────────────────────────── */
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: ${size === 'A5' ? '10px' : '16px'};
    }
    .meta-right { text-align: right; }
    .meta-key { font-size: 9px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
    .meta-val { font-size: ${size === 'A5' ? '11px' : '13px'}; font-weight: 600; color: #1f2937; margin-bottom: 8px; }

    /* ── Table ────────────────────────────────────────────────────── */
    table { width: 100%; border-collapse: collapse; margin-bottom: ${size === 'A5' ? '10px' : '14px'}; }
    thead tr { background: #f3f4f6; border-bottom: 2px solid #e5e7eb; }
    thead th {
      padding: ${size === 'A5' ? '6px 8px' : '10px 12px'};
      font-size: ${size === 'A5' ? '8px' : '10px'};
      font-weight: 700;
      color: #374151;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    thead th:first-child { text-align: left; }
    thead th:nth-child(2) { text-align: left; }
    thead th:nth-child(n+3) { text-align: center; }
    thead th:nth-child(6), thead th:nth-child(7) { text-align: right; }

    .cell { padding: ${size === 'A5' ? '6px 8px' : '10px 12px'}; border-bottom: 1px solid #e5e7eb; }
    .cell.center { text-align: center; }
    .cell.right { text-align: right; }
    .cell.bold { font-weight: 600; }

    /* ── Amount in Words ──────────────────────────────────────────── */
    .amount-words {
      background: #f9fafb;
      border-radius: 4px;
      padding: ${size === 'A5' ? '8px' : '12px'};
      margin-bottom: ${size === 'A5' ? '10px' : '14px'};
    }
    .amount-words .label { font-size: 9px; font-weight: 700; color: #374151; margin-bottom: 3px; }
    .amount-words .value { font-size: ${size === 'A5' ? '9px' : '11px'}; color: #374151; font-style: italic; }

    /* ── Totals ───────────────────────────────────────────────────── */
    .totals-wrap { display: flex; justify-content: flex-end; margin-bottom: ${size === 'A5' ? '10px' : '16px'}; }
    .totals-box { width: ${size === 'A5' ? '200px' : '280px'}; }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: ${size === 'A5' ? '6px 0' : '9px 0'};
      border-bottom: 1px solid #e5e7eb;
      font-size: ${size === 'A5' ? '10px' : '12px'};
    }
    .total-label { font-weight: 600; }
    .grand-total {
      display: flex;
      justify-content: space-between;
      padding: ${size === 'A5' ? '8px 0' : '12px 0'};
      border-top: 2px solid #e5e7eb;
      font-size: ${size === 'A5' ? '13px' : '15px'};
      font-weight: 700;
      color: #f59e0b;
    }

    /* ── Footer ───────────────────────────────────────────────────── */
    .terms { border-top: 1px solid #e5e7eb; padding-top: ${size === 'A5' ? '8px' : '12px'}; margin-top: ${size === 'A5' ? '8px' : '12px'}; }
    .terms .label { font-size: 9px; font-weight: 700; color: #6b7280; margin-bottom: 3px; }
    .terms .value { font-size: ${size === 'A5' ? '8px' : '10px'}; color: #6b7280; }
    .bank-sign-row {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 20px;
}

.small-text {
  width: 48%;
  font-size: ${size === 'A5' ? '10px' : '11px'};
  line-height: 1.6;
}

.sign-right {
  text-align: right;
}
    .sign-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: ${size === 'A5' ? '12px' : '20px'}; }
    .sign-text { font-size: ${size === 'A5' ? '9px' : '11px'}; color: #6b7280; }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div>
      <h1>${invoice.companyId?.companyName || 'Company'}</h1>
      <div class="gstin">${invoice.companyId?.gstin || ''}</div>
    </div>
    <div class="invoice-label">TAX INVOICE</div>
  </div>

  <!-- Body -->
  <div class="body">

    <!-- Bill To -->
    <div class="bill-to">
      <div class="section-label">Bill To</div>
      <div class="party-name">${invoice.partyId?.partyName || ''}</div>
      <div class="party-detail">${invoice.partyId?.address || ''}</div>
      <div class="party-detail">${invoice.partyId?.city || ''}, ${invoice.partyId?.state || ''}</div>
      <div class="party-detail">GSTIN: ${invoice.partyId?.gstin || ''}</div>
    </div>

    <!-- Meta -->
    <div class="meta-grid">
      <div>
        <div class="meta-key">Invoice No</div>
        <div class="meta-val">${invoice.invoiceNumber || ''}</div>
        <div class="meta-key">Supply Type</div>
        <div class="meta-val">${invoice.supplyType || 'Non Taxable'}</div>
      </div>
      <div class="meta-right">
        <div class="meta-key">Date</div>
        <div class="meta-val">${new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}</div>
        <div class="meta-key">Vehicle Number</div>
        <div class="meta-val">${invoice.vehicleNumber || '-'}</div>
      </div>
    </div>

    <!-- Items -->
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Description</th>
          <th>HSN</th>
          <th>Qty</th>
          <th>Bags</th>
          <th style="text-align:right">Rate</th>
          <th style="text-align:right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${lineItemsHTML}
      </tbody>
    </table>

    <!-- Amount in Words -->
    <div class="amount-words">
      <div class="label">Amount in Words</div>
      <div class="value">${invoice.amountInWords || 'N/A'}</div>
    </div>

    <!-- Totals -->
    <div class="totals-wrap">
      <div class="totals-box">
        <div class="total-row">
          <span class="total-label">Subtotal</span>
          <span>₹${parseFloat(invoice.subtotal || 0).toFixed(2)}</span>
        </div>
        ${cgst}${sgst}${igst}
        <div class="grand-total">
          <span>Grand Total</span>
          <span>₹${parseFloat(invoice.grandTotal || 0).toFixed(2)}</span>
        </div>
      </div>
    </div>

    <!-- Terms -->
    <div class="terms">
      <div class="label">Terms &amp; Conditions:</div>
      <div class="value">${selectedInvoice.companyId?.notes || "We declare that the above mentioned are true and correct."}</div>
    </div>
    <!-- Signature row -->
<div class="bank-sign-row">

  <!-- Left Side -->
  <div class="small-text">
    <p><strong>Bank Name:</strong> TamilNadu Mercantile Bank</p>
    <p><strong>Account Number:</strong> ${selectedInvoice.companyId?.accountNumber || ''}</p>
    <p><strong>IFSC Code:</strong> ${selectedInvoice.companyId?.ifscCode || ''}</p>
  </div>

  <!-- Right Side -->
  <div class="small-text sign-right">
    <p>For ${selectedInvoice.companyId?.companyName || ''}</p>

    <div style="height:30px;"></div>

    <p><strong>Authorized Signatory</strong></p>
  </div>

</div>

  <script>
    window.onload = function () {
      window.print();
      // Close the popup after printing
      window.onfocus = function () { window.close(); };
    };
  </script>
</body>
</html>`;

    const printWindow = window.open('', '_blank', `width=900,height=700,scrollbars=yes`);
    if (!printWindow) {
      alert('Popup blocked! Please allow popups for this site to print invoices.');
      return;
    }
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handlePrintConfirm = async (id) => {
    try {
      await invoiceAPI.print(id);
      setMessage('Invoice marked as printed');
      setShowPrintView(false);
      setSelectedInvoice(null);
      fetchInvoices();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error marking invoice as printed');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this invoice?')) return;
    try {
      await invoiceAPI.cancel(id);
      setMessage('Invoice cancelled successfully');
      fetchInvoices();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error cancelling invoice');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'badge-warning',
      saved: 'badge-success',
      printed: 'badge-success',
      cancelled: 'badge-danger',
    };
    return badges[status] || 'badge-warning';
  };

  return (
    <div className="card">
      <h2>All Invoices</h2>
      {message && (
        <div className={message.includes('Error') ? 'error' : 'success'}>
          {message}
        </div>
      )}
      <div className="form-row" style={{ marginBottom: '20px' }}>
        <div className="form-group">
          <label>Financial Year</label>
          <input
            type="text"
            value={filter.financialYear}
            onChange={(e) => setFilter(prev => ({ ...prev, financialYear: e.target.value }))}
            placeholder="e.g., 2025-26"
          />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select
            value={filter.status}
            onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="">-- All Status --</option>
            <option value="draft">Draft</option>
            <option value="saved">Saved</option>
            <option value="printed">Printed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        {/* <div className="form-group">
          <label>Paper Size</label>
          <select
            value={paperSize}
            onChange={(e) => setPaperSize(e.target.value)}
          >
            <option value="A4">A4</option>
            <option value="A5">A5</option>
          </select>
        </div> */}
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : invoices.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          No invoices found
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Party</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice._id} style={{ cursor: 'pointer' }}>
                <td
                  style={{ color: '#1e3a8a', fontWeight: '600' }}
                  onClick={() => setSelectedInvoice(invoice)}
                >
                  {invoice.invoiceNumber}
                </td>
                <td>{invoice.partyId?.partyName}</td>
                <td>{formatCurrency(invoice.grandTotal)}</td>
                <td>{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                <td>
                  <span className={`badge ${getStatusBadge(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </td>
                <td>
                  <button
                    className="btn"
                    onClick={() => handlePrint(invoice._id)}
                    style={{ padding: '5px 10px', fontSize: '12px', marginRight: '5px', backgroundColor: '#3b82f6' }}
                    title="Print Invoice"
                  >
                    Print
                  </button>
                  <button
                    className="btn"
                    onClick={() => handleDownloadPDF(invoice._id)}
                    style={{ padding: '5px 10px', fontSize: '12px', marginRight: '5px', backgroundColor: '#10b981' }}
                    title="Download PDF"
                  >
                    PDF
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleCancel(invoice._id)}
                    style={{ padding: '5px 10px', fontSize: '12px' }}
                    disabled={invoice.status === 'cancelled'}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showPrintView && selectedInvoice && (
        <div className="modal open" style={{ display: 'block', zIndex: 1000 }}>
          <div style={{
            backgroundColor: 'white',
            margin: '20px auto',
            padding: '40px',
            maxWidth: '850px',
            borderRadius: '8px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
          }}>
            {/* Top Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowPrintView(false)}
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                ← Back to Invoices
              </button>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {/* Paper size selector inside modal too */}
                {/* <select
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value)}
                  style={{ padding: '8px 12px', fontSize: '14px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                >
                  <option value="A4">A4</option>
                  <option value="A5">A5</option>
                </select> */}
                <button
                  className="btn"
                  onClick={() => handleDownloadPDF(selectedInvoice._id)}
                  style={{ padding: '8px 16px', fontSize: '14px', backgroundColor: '#10b981' }}
                >
                  ⬇ Download PDF
                </button>
                <button
                  className="btn"
                  onClick={() => handlePrintInvoice(selectedInvoice, paperSize)}
                  style={{ padding: '8px 16px', fontSize: '14px', backgroundColor: '#3b82f6' }}
                >
                  🖨 Print Invoice
                </button>
              </div>
            </div>

            {/* Preview (screen only) */}
            <div style={{
              backgroundColor: '#1e3a8a',
              color: 'white',
              padding: '30px',
              marginBottom: '20px',
              borderRadius: '8px 8px 0 0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h1 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: 'bold' }}>
                    {selectedInvoice.companyId?.companyName || 'Company'}
                  </h1>
                  <p style={{ margin: '0', fontSize: '14px' }}>{selectedInvoice.companyId?.gstin}</p>
                </div>
                <div style={{ textAlign: 'right', fontSize: '18px', fontWeight: 'bold' }}>TAX INVOICE</div>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '20px', border: '1px solid #e5e7eb' }}>
              <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' }}>
                <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#6b7280', fontSize: '12px' }}>BILL TO</p>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold', color: '#1f2937' }}>
                  {selectedInvoice.partyId?.partyName}
                </h3>
                <p style={{ margin: '0', fontSize: '13px', color: '#6b7280' }}>{selectedInvoice.partyId?.address}</p>
                <p style={{ margin: '0', fontSize: '13px', color: '#6b7280' }}>
                  {selectedInvoice.partyId?.city}, {selectedInvoice.partyId?.state}
                </p>
                <p style={{ margin: '0', fontSize: '13px', color: '#6b7280' }}>GSTIN: {selectedInvoice.partyId?.gstin}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '30px' }}>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '12px', color: '#6b7280' }}>Invoice No</p>
                  <p style={{ margin: '0 0 15px 0', fontSize: '14px', fontWeight: 'bold', color: '#1f2937' }}>
                    {selectedInvoice.invoiceNumber}
                  </p>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '12px', color: '#6b7280' }}>Supply Type</p>
                  <p style={{ margin: '0', fontSize: '14px', color: '#1f2937' }}>{selectedInvoice.supplyType || 'Intra-State'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '12px', color: '#6b7280' }}>Date</p>
                  <p style={{ margin: '0 0 15px 0', fontSize: '14px', fontWeight: 'bold', color: '#1f2937' }}>
                    {new Date(selectedInvoice.invoiceDate).toLocaleDateString('en-IN')}
                  </p>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '12px', color: '#6b7280' }}>Vehicle Number</p>
                  <p style={{ margin: '0', fontSize: '14px', color: '#1f2937' }}>{selectedInvoice.vehicleNumber || '-'}</p>
                </div>
              </div>

              <table style={{ width: '100%', marginBottom: '20px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb', backgroundColor: '#f3f4f6' }}>
                    {['#', 'Description', 'HSN', 'Qty', 'Bags', 'Rate', 'Amount'].map((h, i) => (
                      <th key={i} style={{ padding: '12px', textAlign: i >= 5 ? 'right' : i >= 2 ? 'center' : 'left', fontWeight: 'bold', fontSize: '12px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.lineItems?.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px', fontSize: '13px' }}>{index + 1}</td>
                      <td style={{ padding: '12px', fontSize: '13px' }}>{item.description || item.goodsName}</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>{item.hsnCode}</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>{item.quantity}</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>{item.bags || '-'}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px' }}>₹{parseFloat(item.rate || 0).toFixed(2)}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold' }}>₹{parseFloat(item.amount || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '4px' }}>
                <p style={{ margin: '0', fontSize: '12px', fontWeight: 'bold', color: '#374151' }}>AMOUNT IN WORDS</p>
                <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#374151', fontStyle: 'italic' }}>
                  {selectedInvoice.amountInWords || 'N/A'}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <div style={{ width: '350px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ fontWeight: '600', fontSize: '13px' }}>Subtotal</span>
                    <span style={{ fontSize: '13px' }}>₹{parseFloat(selectedInvoice.subtotal || 0).toFixed(2)}</span>
                  </div>
                  {(selectedInvoice.cgstTotal || 0) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
                      <span style={{ fontWeight: '600', fontSize: '13px' }}>CGST</span>
                      <span style={{ fontSize: '13px' }}>₹{parseFloat(selectedInvoice.cgstTotal).toFixed(2)}</span>
                    </div>
                  )}
                  {(selectedInvoice.sgstTotal || 0) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
                      <span style={{ fontWeight: '600', fontSize: '13px' }}>SGST</span>
                      <span style={{ fontSize: '13px' }}>₹{parseFloat(selectedInvoice.sgstTotal).toFixed(2)}</span>
                    </div>
                  )}
                  {(selectedInvoice.igstTotal || 0) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
                      <span style={{ fontWeight: '600', fontSize: '13px' }}>IGST</span>
                      <span style={{ fontSize: '13px' }}>₹{parseFloat(selectedInvoice.igstTotal).toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', fontSize: '16px', fontWeight: 'bold', color: '#f59e0b', borderTop: '2px solid #e5e7eb' }}>
                    <span>Grand Total</span>
                    <span>₹{parseFloat(selectedInvoice.grandTotal || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
                <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '12px', color: '#6b7280' }}>Terms & Conditions:</p>
                <p style={{ margin: '0', fontSize: '11px', color: '#6b7280' }}>{selectedInvoice.companyId?.notes}</p>
              </div>
              
              <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  <p style={{ margin: '0' }}>Bank Details:</p>
                  <p style={{ margin: '0' }}>Bank Name: TamilNadu Mercantile Bank</p>
                  <p style={{ margin: '0' }}>Account Number: {selectedInvoice.companyId?.accountNumber}</p>
                  <p style={{ margin: '0' }}>IFSC Code: {selectedInvoice.companyId?.ifscCode}</p>
                </div>
                <div style={{ textAlign: 'right', fontSize: '12px', color: '#6b7280' }}>
                  <p style={{ margin: '0' }}>For {selectedInvoice.companyId?.companyName}</p>
                  <br></br>
                  <br></br>
                  <br></br>
                  <p style={{ margin: '0' }}>Authorized Signatory</p>
                </div>
              </div>

              <div style={{ marginTop: '30px', display: 'flex', gap: '10px', justifyContent: 'center', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => { setShowPrintView(false); setSelectedInvoice(null); }}
                  style={{ padding: '10px 20px' }}
                >
                  Close
                </button>
                <button
                  className="btn"
                  onClick={() => handlePrintConfirm(selectedInvoice._id)}
                  style={{ padding: '10px 20px', backgroundColor: '#10b981' }}
                >
                  ✓ Confirm Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;
