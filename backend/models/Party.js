const mongoose = require('mongoose');

const PartySchema = new mongoose.Schema({
  partyName: {
    type: String,
    required: [true, 'Party name is required'],
    trim: true,
  },
  gstin: {
    type: String,
    required: [true, 'GSTIN is required'],
    match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format'],
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
  },
  city: {
    type: String,
    required: [true, 'City is required'],
  },
  state: {
    type: String,
    required: [true, 'State is required'],
  },
  pincode: {
    type: String,
    match: [/^[0-9]{6}$/, 'Invalid pincode'],
  },
  phone: {
    type: String,
    match: [/^[0-9]{10}$/, 'Invalid phone number'],
  },
  email: {
    type: String,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { collection: 'parties' });

module.exports = mongoose.model('Party', PartySchema);
