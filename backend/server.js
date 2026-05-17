const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Routes
const companyRoutes = require('./routes/companyRoutes');
const partyRoutes = require('./routes/partyRoutes');
const goodsRoutes = require('./routes/goodsRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');

app.use('/api/company', companyRoutes);
app.use('/api/parties', partyRoutes);
app.use('/api/goods', goodsRoutes);
app.use('/api/invoices', invoiceRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
