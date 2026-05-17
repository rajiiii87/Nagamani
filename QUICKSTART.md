# Quick Start Guide

## Installation (Windows)
1. Run `setup.bat` in the project root
2. Update `backend/.env` with your MongoDB URI
3. Start MongoDB
4. Open two command prompts:
   - Terminal 1: `cd backend && npm run dev`
   - Terminal 2: `cd frontend && npm start`

## Installation (Mac/Linux)
1. Run `bash setup.sh` in the project root
2. Update `backend/.env` with your MongoDB URI
3. Start MongoDB
4. Open two terminals:
   - Terminal 1: `cd backend && npm run dev`
   - Terminal 2: `cd frontend && npm start`

## First Time Setup

### Step 1: Configure Company Profile
- Navigate to "Company Profile" in the sidebar
- Fill in your company details:
  - Company Name
  - GSTIN (15 digits, format: 22AAAAA0000A1Z5)
  - FSSAI Number (optional, if food business)
  - PAN Number
  - Address, City, State, Pincode
  - Contact details
  - Bank details (optional)
- Click "Save Company Profile"
- These details will appear on all invoices

### Step 2: Add Parties (Customers)
- Go to "Parties" section
- Click "+ Add Party"
- Enter party details:
  - Party Name (business name)
  - GSTIN (validated)
  - Complete Address
  - City and State
  - Phone and Email
- Click "Save Party"
- You can add multiple parties for different invoices

### Step 3: Configure Goods & Items
- Go to "Goods & Items"
- Click "+ Add Goods"
- Enter goods information:
  - Goods Name (e.g., Rice, Wheat, Dal)
  - HSN Code (4-8 digits)
  - GST Rate (0%, 5%, 12%, 18%, or 28%)
  - Unit (kg, piece, meter, etc.)
  - Description (optional)
- Click "Save Goods"
- Create multiple goods for different product types

### Step 4: Create Your First Invoice
- Go to "New Invoice"
- Fill in invoice details:
  - Invoice Date (auto-filled with today)
  - Supply Type (choose one):
    - Intra-State (if buyer is in same state)
    - Inter-State (if buyer is in different state)
    - Non-Taxable (for exempt goods)
  - Vehicle Number (optional)
  - Select Party from dropdown
- Add Items:
  - Click the Goods Name field to select a good
  - HSN Code and GST % auto-fill
  - Enter Quantity, Bags (optional), and Rate
  - Click "+ Add Item" to add more items
- Review Tax Summary:
  - Subtotal calculated automatically
  - CGST/SGST or IGST calculated based on supply type
  - Grand Total shown with amount in words
- Click "Create Invoice"
- Invoice will be saved and assigned a unique number

### Step 5: View and Print Invoices
- Go to "All Invoices"
- Filter by:
  - Financial Year (default: current)
  - Status (Draft, Saved, Printed, Cancelled)
- Click on any invoice to see details
- Actions:
  - "Print" - Marks invoice as printed and locks it
  - "Cancel" - Cancels invoice if allowed
- Printed invoices cannot be edited

## GST Information

### GST Rates Supported
- 0% - Exempt goods (e.g., food items, medicines)
- 5% - Essential items
- 12% - Standard goods
- 18% - Most goods and services
- 28% - Luxury and sin goods

### Supply Types & Tax Calculation

**Intra-State Supply** (Same State)
- Tax split: CGST (half) + SGST (half)
- Example: 18% GST = 9% CGST + 9% SGST

**Inter-State Supply** (Different States)
- Tax: IGST (full rate)
- Example: 18% GST = 18% IGST

**Non-Taxable Supply**
- No GST applied

### Invoice Number Format
- Format: FY/INV/NNNN
- Example: 2025-26/INV/0001
- Auto-incremental within financial year
- Resets in new financial year (April)

## Features

### Dashboard
- Quick overview of total invoices, revenue, parties, and goods
- Quick access to common functions

### Company Profile
- Non-editable GSTIN for consistency
- Bank details for payment information
- Appears on all invoices

### Parties Management
- Searchable party list
- Auto-fill in invoices
- Easy to manage customer database

### Goods Management
- Searchable by name or HSN code
- Auto-fill HSN and GST in invoices
- Multiple units support

### Invoice Creation
- Real-time tax calculations
- Amount in English words
- Multiple items per invoice
- Print-ready format

### Reports
- Monthly GST summaries
- Party-wise sales reports
- Tax calculation reports

## Keyboard Shortcuts
- `Ctrl+S` in forms to save (browser standard)
- `Tab` to navigate between fields
- `Enter` to submit forms

## Tips & Tricks

1. **Search functionality**: Type in the search boxes to quickly find parties or goods
2. **Copy invoice**: Use a previous invoice as template by noting down items
3. **Bulk operations**: Create multiple parties and goods first for faster invoice creation
4. **Financial year**: System automatically manages FY. No manual configuration needed
5. **GSTIN format**: Always enter GSTIN in correct format for validation

## Troubleshooting

**Problem**: "Company profile not configured"
- Solution: Go to Company Profile and save details

**Problem**: "Cannot add party" or "Cannot add goods"
- Solution: Check that all required fields are filled and validation passes

**Problem**: "Duplicate GSTIN error"
- Solution: Each party must have unique GSTIN

**Problem**: "Invoice not saving"
- Solution: Ensure party is selected and at least one item is added

## Support & Issues

For issues or feature requests:
1. Check the README.md for detailed documentation
2. Review console errors (F12 in browser)
3. Check backend logs in terminal

---

**Happy Invoicing! 📄**
