import React, { useState, useEffect } from 'react';
import { partyAPI } from '../utils/api';
import { validateGSTIN, validatePhone, validateEmail } from '../utils/helpers';

const PartyManagement = () => {
  const [parties, setParties] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    partyName: '',
    gstin: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchParties();
  }, [searchTerm]);

  const fetchParties = async () => {
    try {
      const response = await partyAPI.getAll(searchTerm);
      setParties(response.data);
    } catch (error) {
      console.error('Error fetching parties:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.partyName.trim()) newErrors.partyName = 'Party name is required';
    if (!formData.gstin.trim()) newErrors.gstin = 'GSTIN is required';
    else if (!validateGSTIN(formData.gstin)) newErrors.gstin = 'Invalid GSTIN format';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
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
      if (editingId) {
        await partyAPI.update(editingId, formData);
        setMessage('Party updated successfully');
      } else {
        await partyAPI.create(formData);
        setMessage('Party created successfully');
      }
      setFormData({
        partyName: '',
        gstin: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        email: '',
      });
      setShowModal(false);
      setEditingId(null);
      fetchParties();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error saving party');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (party) => {
    setFormData(party);
    setEditingId(party._id);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      partyName: '',
      gstin: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      phone: '',
      email: '',
    });
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this party?')) return;

    try {
      await partyAPI.delete(id);
      setMessage('Party deleted successfully');
      fetchParties();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error deleting party');
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Parties / Customers</h2>
        <button className="btn" onClick={() => setShowModal(true)}>+ Add Party</button>
      </div>

      {message && (
        <div className={message.includes('successfully') ? 'success' : 'error'}>
          {message}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by name, city, or GSTIN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        />
      </div>

      {parties.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          No parties found
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Party Name</th>
              <th>GSTIN</th>
              <th>City</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {parties.map((party) => (
              <tr key={party._id}>
                <td>{party.partyName}</td>
                <td>{party.gstin}</td>
                <td>{party.city}</td>
                <td>{party.phone || '-'}</td>
                <td style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn"
                    onClick={() => handleEdit(party)}
                    style={{ padding: '5px 10px', fontSize: '12px', backgroundColor: '#3b82f6' }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(party._id)}
                    style={{ padding: '5px 10px', fontSize: '12px' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal open">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingId ? 'Edit Party' : 'Add New Party'}</h2>
              <span
                className="modal-close"
                onClick={handleCloseModal}
              >
                ×
              </span>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Party Name *</label>
                <input
                  type="text"
                  name="partyName"
                  value={formData.partyName}
                  onChange={handleChange}
                  placeholder="Enter party/business name"
                />
                {errors.partyName && <div className="error">{errors.partyName}</div>}
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

              <div className="form-group">
                <label>Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter complete address"
                  rows="2"
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
                  <label>Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="600001"
                  />
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

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="party@example.com"
                />
                {errors.email && <div className="error">{errors.email}</div>}
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      partyName: '',
                      gstin: '',
                      address: '',
                      city: '',
                      state: '',
                      pincode: '',
                      phone: '',
                      email: '',
                    });
                    setErrors({});
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Party'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartyManagement;
