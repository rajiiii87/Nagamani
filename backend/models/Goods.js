const mongoose = require('mongoose');

const GoodsSchema = new mongoose.Schema({
  goodsName: {
    type: String,
    required: [true, 'Goods name is required'],
    trim: true,
    unique: true,
  },
  hsnCode: {
    type: String,
    required: [true, 'HSN code is required'],
    match: [/^[0-9]{4,8}$/, 'Invalid HSN code'],
  },
  gstRate: {
    type: Number,
    required: [true, 'GST rate is required'],
    enum: [0, 5, 12, 18, 28],
  },
  unit: {
    type: String,
    default: 'kg',
    enum: ['kg', 'piece', 'meter', 'liter', 'set', 'box', 'bag'],
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { collection: 'goods' });

module.exports = mongoose.model('Goods', GoodsSchema);
