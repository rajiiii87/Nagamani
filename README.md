# GST-Compliant Billing / Invoice Management System

A comprehensive, production-ready billing and invoicing system designed specifically for Indian GST compliance. Built with Node.js/Express backend and React frontend.

## Features

### 1. **Company Profile Management**
- Configure company details (name, GSTIN, FSSAI, PAN)
- Non-editable GST details for consistency
- Bank account information storage
- Multi-invoice compatibility

### 2. **Party (Customer) Management**
- Create and manage customer details
- GSTIN validation
- Search functionality
- Reusable party details across invoices

### 3. **Goods & Items Management**
- Create goods with HSN codes
- Configurable GST rates (0%, 5%, 12%, 18%, 28%)
- Auto-fill functionality on invoice creation
- Support for multiple units (kg, piece, meter, liter, etc.)

### 4. **Invoice Generation**
- Auto-incremental invoice numbers (FY format: 2025-26/INV/0001)
- GST-compliant tax calculations
- Real-time amount in words conversion
- Support for multiple supply types:
  - Intra-State (CGST + SGST)
  - Inter-State (IGST)
  - Non-Taxable

### 5. **Tax Calculations**
- HSN-based GST rates
- Automatic tax splitting based on supply type
- Accurate calculations for complex invoices
- Validation against duplicate invoices

### 6. **Reports**
- Monthly GST reports
- Party-wise sales reports
- Tax summary reports
- Year-wise and month-wise data organization

### 7. **Invoice Status Management**
- Draft → Saved → Printed workflow
- Invoice cancellation support
- PDF generation and download
- Print-ready format

## Technology Stack

### Backend
- **Framework**: Express.js (Node.js)
- **Database**: MongoDB
- **PDF Generation**: PDFKit
- **Validation**: Joi
- **Authentication**: JWT (optional enhancement)

### Frontend
- **Framework**: React 18
- **HTTP Client**: Axios
- **Styling**: CSS (fully responsive)
- **State Management**: React Hooks

## Project Structure

```
billing/
├── backend/
│   ├── models/
│   │   ├── Company.js
│   │   ├── Party.js
│   │   ├── Goods.js
│   │   └── Invoice.js
│   ├── controllers/
│   │   ├── companyController.js
│   │   ├── partyController.js
│   │   ├── goodsController.js
│   │   └── invoiceController.js
│   ├── routes/
│   │   ├── companyRoutes.js
│   │   ├── partyRoutes.js
│   │   ├── goodsRoutes.js
│   │   └── invoiceRoutes.js
│   ├── utils/
│   │   ├── taxCalculator.js
│   │   ├── invoiceHelper.js
│   │   └── pdfGenerator.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.js
    │   │   ├── CompanyProfile.js
    │   │   ├── PartyManagement.js
    │   │   ├── GoodsManagement.js
    │   │   ├── InvoiceForm.js
    │   │   └── InvoiceList.js
    │   ├── hooks/
    │   │   └── useApi.js
    │   ├── utils/
    │   │   ├── api.js
    │   │   └── helpers.js
    │   ├── styles/
    │   │   ├── global.css
    │   │   └── layout.css
    │   ├── App.js
    │   ├── index.js
    │   └── package.json
    ├── public/
    │   └── index.html
    └── package.json
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gst-invoice
NODE_ENV=development
JWT_SECRET=your_secure_secret_key
```

5. Start MongoDB (if running locally):
```bash
mongod
```

6. Run backend server:
```bash
npm run dev
```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm start
```

The frontend will open at `http://localhost:3000`

## Usage Guide

### 1. Configure Company Profile
- Go to "Company Profile" section
- Enter company details (GSTIN is non-editable once set)
- Save company information
- These details will appear on all invoices

### 2. Add Parties (Customers)
- Go to "Parties" section
- Click "Add Party"
- Enter GSTIN-validated party details
- Save for future use

### 3. Configure Goods & Items
- Go to "Goods & Items" section
- Click "Add Goods"
- Enter good name, HSN code, and GST rate
- Items are searchable and reusable

### 4. Create Invoice
- Go to "New Invoice"
- Select invoice date (defaults to today)
- Choose supply type (Intra-State/Inter-State/Non-Taxable)
- Select party from dropdown
- Add items with quantities and rates
- System auto-calculates taxes and totals
- Save invoice

### 5. View & Manage Invoices
- Go to "All Invoices"
- Filter by status or financial year
- View invoice details
- Print invoices (marks as printed)
- Cancel invoices if needed

### 6. Generate Reports
- Go to "Reports"
- Select month for monthly GST reports
- View party-wise sales summary
- Download report data

## API Endpoints

### Company API
```
POST   /api/company              - Create/Update company
GET    /api/company              - Get company profile
```

### Party API
```
POST   /api/parties              - Create party
GET    /api/parties              - List parties (search supported)
GET    /api/parties/:id          - Get party details
PUT    /api/parties/:id          - Update party
DELETE /api/parties/:id          - Delete party
```

### Goods API
```
POST   /api/goods                - Create goods
GET    /api/goods                - List goods (search supported)
GET    /api/goods/:id            - Get goods details
PUT    /api/goods/:id            - Update goods
DELETE /api/goods/:id            - Delete goods
```

### Invoice API
```
POST   /api/invoices             - Create invoice
GET    /api/invoices             - List invoices (filters: status, FY)
GET    /api/invoices/:id         - Get invoice details
PUT    /api/invoices/:id         - Update invoice
POST   /api/invoices/:id/pdf     - Generate PDF
POST   /api/invoices/:id/print   - Mark as printed
POST   /api/invoices/:id/cancel  - Cancel invoice
GET    /api/invoices/monthly-report - Monthly GST report
GET    /api/invoices/party-report   - Party-wise report
```

## GST Compliance Features

### Tax Calculation Rules
- **Intra-State Supply**: 
  - CGST = GST Rate ÷ 2
  - SGST = GST Rate ÷ 2

- **Inter-State Supply**: 
  - IGST = GST Rate

- **Non-Taxable**: 
  - No tax applied

### Invoice Number Format
- Format: FY/INV/NNNN (e.g., 2025-26/INV/0001)
- Auto-incremental within financial year
- Resets on new financial year

### Data Organization
- Year-wise and month-wise storage
- Financial year basis (April to March)
- Party-wise tracking
- Tax summary capabilities

### Validations
- GSTIN format validation (15 digits)
- PAN format validation (10 characters)
- Phone number validation (10 digits)
- Email validation
- Duplicate invoice prevention
- Mandatory field enforcement

## Deployment

### Backend Deployment (Heroku Example)
```bash
cd backend
heroku create your-app-name
git push heroku main
```

### Frontend Deployment (Vercel Example)
```bash
cd frontend
npm run build
# Deploy 'build' folder to Vercel
```

### Environment Variables for Production
Backend:
```
PORT=5000
MONGODB_URI=<your-atlas-uri>
NODE_ENV=production
JWT_SECRET=<strong-secret>
```

## Future Enhancements

1. **Authentication & Authorization**
   - User login and role-based access
   - Multi-user support with permissions

2. **Advanced Reports**
   - Custom date range reports
   - Tax audit reports
   - GSTR-1 export format

3. **Inventory Management**
   - Stock tracking
   - Low stock alerts
   - Inventory reports

4. **E-Invoice Integration**
   - Government e-invoice API integration
   - QR code generation
   - Digital signature support

5. **Mobile App**
   - React Native mobile application
   - Offline invoice creation

6. **Accounting Integration**
   - Tally integration
   - GST software API integration
   - Bank reconciliation

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection URI in `.env`
- Verify firewall settings

### CORS Errors
- Ensure backend is running on port 5000
- Check `cors` middleware in `server.js`
- Verify frontend proxy setting

### Port Already in Use
```bash
# Kill process on port
netstat -ano | findstr :5000  # Windows
lsof -i :5000                  # Mac/Linux
```

## License

MIT License - Free to use and modify

## Support

For issues, feature requests, or contributions, please create an issue or pull request.

## Disclaimer

This system is designed for GST compliance in India. Always verify with your tax professional or GST authority for the latest regulations and requirements.
