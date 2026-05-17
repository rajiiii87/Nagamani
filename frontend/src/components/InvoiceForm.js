import React, { useState, useEffect } from 'react';
import { invoiceAPI, partyAPI, goodsAPI, companyAPI } from '../utils/api';
import { formatCurrency, numberToWords } from '../utils/helpers';

const InvoiceForm = () => {
  const [formData, setFormData] = useState({
    invoiceDate: new Date().toISOString().split('T')[0],
    vehicleNumber: '',
    supplyType: 'Intra-State',
    partyId: '',
    lineItems: [{ goodsId: '', quantity: 1, bags: 0, rate: 0, gstRate: 0, hsnCode: '' }],
    notes: '',
  });

  const [parties, setParties] = useState([]);
  const [goods, setGoods] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [calculations, setCalculations] = useState({
    subtotal: 0,
    cgstTotal: 0,
    sgstTotal: 0,
    igstTotal: 0,
    grandTotal: 0,
    amountInWords: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [companiesRes, partiesRes, goodsRes] = await Promise.all([
        companyAPI.get(),
        partyAPI.getAll(''),
        goodsAPI.getAll(''),
      ]);

      setCompany(companiesRes.data);
      setParties(partiesRes.data);
      setGoods(goodsRes.data);
    } catch (error) {
      setMessage('Error loading initial data');
    }
  };

  const calculateTotals = (items, supplyType) => {
    let subtotal = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;

    items.forEach((item) => {
      const amount = (item.quantity || 0) * (item.rate || 0);
      subtotal += amount;

      if (supplyType === 'Intra-State') {
        const halfRate = (item.gstRate || 0) / 2;
        cgstTotal += (amount * halfRate) / 100;
        sgstTotal += (amount * halfRate) / 100;
      } else if (supplyType === 'Inter-State') {
        igstTotal += (amount * (item.gstRate || 0)) / 100;
      }
    });

    const grandTotal = subtotal + cgstTotal + sgstTotal + igstTotal;

    setCalculations({
      subtotal,
      cgstTotal,
      sgstTotal,
      igstTotal,
      grandTotal,
      amountInWords: numberToWords(Math.round(grandTotal)),
    });
  };

  useEffect(() => {
    calculateTotals(formData.lineItems, formData.supplyType);
  }, [formData.lineItems, formData.supplyType]);

  const handleLineItemChange = (index, field, value) => {
    const newItems = [...formData.lineItems];

    if (field === 'goodsId') {
      const selectedGoods = goods.find((g) => g._id === value);
      if (selectedGoods) {
        newItems[index] = {
          ...newItems[index],
          goodsId: value,
          gstRate: selectedGoods.gstRate,
          hsnCode: selectedGoods.hsnCode,
        };
      } else {
        newItems[index][field] = value;
      }
    } else {
      newItems[index][field] = field === 'quantity' || field === 'rate' || field === 'bags' 
        ? parseFloat(value) || 0 
        : value;
    }

    setFormData(prev => ({ ...prev, lineItems: newItems }));
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        { goodsId: '', quantity: 1, bags: 0, rate: 0, gstRate: 0, hsnCode: '' }
      ]
    }));
  };

  const removeLineItem = (index) => {
    if (formData.lineItems.length > 1) {
      setFormData(prev => ({
        ...prev,
        lineItems: prev.lineItems.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!company) {
      setMessage('Please configure company profile first');
      return;
    }

    if (!formData.partyId) {
      setMessage('Please select a party');
      return;
    }

    if (formData.lineItems.length === 0) {
      setMessage('Please add at least one item');
      return;
    }
    
    setLoading(true);
    try {
      const invoiceData = {
        invoiceDate: formData.invoiceDate,
        vehicleNumber: formData.vehicleNumber,
        supplyType: formData.supplyType,
        partyId: formData.partyId,
        lineItems: formData.lineItems.map(item => ({
          goodsId: item.goodsId,
          description: goods.find(g => g._id === item.goodsId)?.goodsName || '',
          hsnCode: item.hsnCode,
          quantity: item.quantity,
          bags: item.bags,
          rate: item.rate,
          gstRate: item.gstRate,
        })),
        notes: formData.notes,
      };

      const response = await invoiceAPI.create(invoiceData);
      setMessage(`Invoice ${response.data.invoice.invoiceNumber} created successfully`);
      
      // Reset form
      setFormData({
        invoiceDate: new Date().toISOString().split('T')[0],
        vehicleNumber: '',
        supplyType: 'Intra-State',
        partyId: '',
        lineItems: [{ goodsId: '', quantity: 1, bags: 0, rate: 0, gstRate: 0, hsnCode: '' }],
        notes: '',
      });

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error creating invoice');
    } finally {
      setLoading(false);
    }
  };

  if (!company) {
    return (
      <div className="card">
        <p style={{ color: '#dc2626' }}>Please configure company profile first to create invoices.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Create New Invoice</h2>

      {message && (
        <div className={message.includes('successfully') ? 'success' : 'error'}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Invoice Date *</label>
            <input
              type="date"
              value={formData.invoiceDate}
              onChange={(e) => setFormData(prev => ({ ...prev, invoiceDate: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>Supply Type *</label>
            <select
              value={formData.supplyType}
              onChange={(e) => setFormData(prev => ({ ...prev, supplyType: e.target.value }))}
            >
              <option value="Intra-State">Intra-State (CGST + SGST)</option>
              <option value="Inter-State">Inter-State (IGST)</option>
              <option value="Non-Taxable">Non-Taxable</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Vehicle Number</label>
            <input
              type="text"
              value={formData.vehicleNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, vehicleNumber: e.target.value }))}
              placeholder="e.g., MH12AB1234"
            />
          </div>

          <div className="form-group">
            <label>Party / Customer *</label>
            <select
              value={formData.partyId}
              onChange={(e) => setFormData(prev => ({ ...prev, partyId: e.target.value }))}
            >
              <option value="">-- Select Party --</option>
              {parties.map((party) => (
                <option key={party._id} value={party._id}>
                  {party.partyName} ({party.gstin})
                </option>
              ))}
            </select>
          </div>
        </div>

        <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#1e3a8a' }}>Goods / Items</h3>

        <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
          <table className="table" style={{ marginBottom: 0 }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Goods Name</th>
                <th>HSN</th>
                <th>Qty</th>
                <th>Bags</th>
                <th>Rate</th>
                <th>GST %</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {formData.lineItems.map((item, index) => {
                const itemAmount = (item.quantity || 0) * (item.rate || 0);

                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <select
                        value={item.goodsId}
                        onChange={(e) => handleLineItemChange(index, 'goodsId', e.target.value)}
                        style={{ width: '100%', padding: '5px' }}
                      >
                        <option value="">-- Select --</option>
                        {goods.map((g) => (
                          <option key={g._id} value={g._id}>
                            {g.goodsName}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.hsnCode}
                        disabled
                        style={{ backgroundColor: '#f3f4f6', width: '100%', padding: '5px' }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                        min="0"
                        step="0.01"
                        style={{ width: '100%', padding: '5px' }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.bags}
                        onChange={(e) => handleLineItemChange(index, 'bags', e.target.value)}
                        min="0"
                        style={{ width: '100%', padding: '5px' }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => handleLineItemChange(index, 'rate', e.target.value)}
                        min="0"
                        step="0.01"
                        style={{ width: '100%', padding: '5px' }}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 'bold' }}>{item.gstRate}%</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {formatCurrency(itemAmount)}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => removeLineItem(index)}
                        style={{ padding: '5px 10px', fontSize: '12px' }}
                        disabled={formData.lineItems.length === 1}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={addLineItem}
          style={{ marginBottom: '20px' }}
        >
          + Add Item
        </button>

        <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#1e3a8a' }}>Tax Summary</h3>

        <div style={{
          backgroundColor: '#f9fafb',
          padding: '15px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Subtotal:</span>
            <strong>{formatCurrency(calculations.subtotal)}</strong>
          </div>

          {formData.supplyType === 'Intra-State' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>CGST:</span>
                <strong>{formatCurrency(calculations.cgstTotal)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>SGST:</span>
                <strong>{formatCurrency(calculations.sgstTotal)}</strong>
              </div>
            </>
          )}

          {formData.supplyType === 'Inter-State' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>IGST:</span>
              <strong>{formatCurrency(calculations.igstTotal)}</strong>
            </div>
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '15px',
            paddingTop: '15px',
            borderTop: '2px solid #d1d5db'
          }}>
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Grand Total:</span>
            <strong style={{ fontSize: '16px', color: '#1e3a8a' }}>
              {formatCurrency(calculations.grandTotal)}
            </strong>
          </div>

          <div style={{ marginTop: '15px', fontSize: '12px', color: '#6b7280' }}>
            <strong>In Words:</strong> {calculations.amountInWords}
          </div>
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Terms & conditions, delivery notes, etc."
            rows="3"
          />
        </div>

        <div style={{ marginTop: '30px' }}>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Creating Invoice...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;
