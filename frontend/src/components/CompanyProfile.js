import React, { useState, useEffect } from 'react';
import { companyAPI } from '../utils/api';
import { validateGSTIN, validatePAN, validatePhone, validateEmail } from '../utils/helpers';

const CompanyProfile = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    gstin: '',
    fssaiNumber: '',
    panNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      const response = await companyAPI.get();
      setFormData(response.data);
    } catch (error) {
      console.log('No company profile found');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.gstin.trim()) newErrors.gstin = 'GSTIN is required';
    else if (!validateGSTIN(formData.gstin)) newErrors.gstin = 'Invalid GSTIN format';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    if (formData.panNumber && !validatePAN(formData.panNumber))
      newErrors.panNumber = 'Invalid PAN format';
    if (formData.phone && !validatePhone(formData.phone))
      newErrors.phone = 'Invalid phone number';
    if (formData.email && !validateEmail(formData.email))
      newErrors.email = 'Invalid email';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await companyAPI.createOrUpdate(formData);
      setMessage('Company profile saved successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error saving company profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <form onSubmit={handleSubmit}>
        <h2>Company Profile</h2>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Configure your company details. These will appear on all invoices.
        </p>

        {message && (
          <div className={message.includes('saved') ? 'success' : 'error'}>
            {message}
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label>Company Name *</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Enter company name"
            />
            {errors.companyName && <div className="error">{errors.companyName}</div>}
          </div>

          <div className="form-group">
            <label>GSTIN *</label>
            <input
              type="text"
              name="gstin"
              value={formData.gstin}
              onChange={handleChange}
              placeholder="22AAAAA0000A1Z5"
            />
            {errors.gstin && <div className="error">{errors.gstin}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>FSSAI Number</label>
            <input
              type="text"
              name="fssaiNumber"
              value={formData.fssaiNumber}
              onChange={handleChange}
              placeholder="Enter FSSAI number"
            />
          </div>

          <div className="form-group">
            <label>PAN Number</label>
            <input
              type="text"
              name="panNumber"
              value={formData.panNumber}
              onChange={handleChange}
              placeholder="AAAAA0000A"
            />
            {errors.panNumber && <div className="error">{errors.panNumber}</div>}
          </div>
        </div>

        <div className="form-group form-row-full">
          <label>Address *</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter complete address"
            rows="3"
          />
          {errors.address && <div className="error">{errors.address}</div>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>City *</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Enter city"
            />
            {errors.city && <div className="error">{errors.city}</div>}
          </div>

          <div className="form-group">
            <label>State *</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="Enter state"
            />
            {errors.state && <div className="error">{errors.state}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Pincode *</label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="600001"
            />
            {errors.pincode && <div className="error">{errors.pincode}</div>}
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="9876543210"
            />
            {errors.phone && <div className="error">{errors.phone}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="company@example.com"
            />
            {errors.email && <div className="error">{errors.email}</div>}
          </div>
        </div>

        <h3 style={{ marginTop: '30px', color: '#1e3a8a' }}>Bank Details (Optional)</h3>

        <div className="form-row">
          <div className="form-group">
            <label>Bank Name</label>
            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              placeholder="Enter bank name"
            />
          </div>

          <div className="form-group">
            <label>Account Number</label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              placeholder="Enter account number"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>IFSC Code</label>
            <input
              type="text"
              name="ifscCode"
              value={formData.ifscCode}
              onChange={handleChange}
              placeholder="SBIN0001234"
            />
          </div>
        </div>

        <div style={{ marginTop: '30px' }}>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Saving...' : 'Save Company Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyProfile;
