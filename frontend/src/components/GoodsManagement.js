import React, { useState, useEffect } from 'react';
import { goodsAPI } from '../utils/api';

const GoodsManagement = () => {
  const [goods, setGoods] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    goodsName: '',
    hsnCode: '',
    gstRate: 0,
    unit: 'kg',
    description: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchGoods();
  }, [searchTerm]);

  const fetchGoods = async () => {
    try {
      const response = await goodsAPI.getAll(searchTerm);
      setGoods(response.data);
    } catch (error) {
      console.error('Error fetching goods:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.goodsName.trim()) newErrors.goodsName = 'Goods name is required';
    if (!formData.hsnCode.trim()) newErrors.hsnCode = 'HSN code is required';
    else if (!/^[0-9]{4,8}$/.test(formData.hsnCode)) newErrors.hsnCode = 'HSN code must be 4-8 digits';
    if (formData.gstRate === undefined || formData.gstRate === '' || formData.gstRate === null)
      newErrors.gstRate = 'GST rate is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;
    if (name === 'gstRate') {
      finalValue = value === '' ? '' : parseInt(value, 10);
    }
    setFormData(prev => ({ ...prev, [name]: finalValue }));
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
        await goodsAPI.update(editingId, formData);
        setMessage('Goods updated successfully');
      } else {
        await goodsAPI.create(formData);
        setMessage('Goods created successfully');
      }
      setFormData({
        goodsName: '',
        hsnCode: '',
        gstRate: 0,
        unit: 'kg',
        description: '',
      });
      setShowModal(false);
      setEditingId(null);
      fetchGoods();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error saving goods');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditingId(item._id);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      goodsName: '',
      hsnCode: '',
      gstRate: 0,
      unit: 'kg',
      description: '',
    });
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goods?')) return;

    try {
      await goodsAPI.delete(id);
      setMessage('Goods deleted successfully');
      fetchGoods();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error deleting goods');
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Goods & Items</h2>
        <button className="btn" onClick={() => setShowModal(true)}>+ Add Goods</button>
      </div>

      {message && (
        <div className={message.includes('successfully') ? 'success' : 'error'}>
          {message}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by goods name or HSN code..."
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

      {goods.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          No goods found. Create your first goods item.
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Goods Name</th>
              <th>HSN Code</th>
              <th>GST Rate</th>
              <th>Unit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {goods.map((item) => (
              <tr key={item._id}>
                <td>{item.goodsName}</td>
                <td>{item.hsnCode}</td>
                <td>
                  <span className={`badge badge-${item.gstRate === 0 ? 'success' : 'warning'}`}>
                    {item.gstRate}%
                  </span>
                </td>
                <td>{item.unit}</td>
                <td style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn"
                    onClick={() => handleEdit(item)}
                    style={{ padding: '5px 10px', fontSize: '12px', backgroundColor: '#3b82f6' }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(item._id)}
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
              <h2>{editingId ? 'Edit Goods' : 'Add New Goods'}</h2>
              <span
                className="modal-close"
                onClick={handleCloseModal}
              >
                ×
              </span>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Goods Name *</label>
                <input
                  type="text"
                  name="goodsName"
                  value={formData.goodsName}
                  onChange={handleChange}
                  placeholder="e.g., Rice, Wheat, Dal"
                />
                {errors.goodsName && <div className="error">{errors.goodsName}</div>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>HSN Code *</label>
                  <input
                    type="text"
                    name="hsnCode"
                    value={formData.hsnCode}
                    onChange={handleChange}
                    placeholder="e.g., 1001, 1701"
                  />
                  {errors.hsnCode && <div className="error">{errors.hsnCode}</div>}
                </div>

                <div className="form-group">
                  <label>GST Rate * </label>
                  <select
                    name="gstRate"
                    value={formData.gstRate}
                    onChange={handleChange}
                  >
                    <option value="">-- Select GST Rate --</option>
                    <option value={0}>0% (No Tax)</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                  {errors.gstRate && <div className="error">{errors.gstRate}</div>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Unit</label>
                  <select name="unit" value={formData.unit} onChange={handleChange}>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="piece">Piece</option>
                    <option value="meter">Meter</option>
                    <option value="liter">Liter</option>
                    <option value="set">Set</option>
                    <option value="box">Box</option>
                    <option value="bag">Bag</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Optional description"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      goodsName: '',
                      hsnCode: '',
                      gstRate: 0,
                      unit: 'kg',
                      description: '',
                    });
                    setErrors({});
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Goods'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoodsManagement;
