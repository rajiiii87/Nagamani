# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Currently, the API uses basic HTTP. For production, implement JWT authentication.

---

## Company Endpoints

### Create or Update Company Profile
```
POST /company
Content-Type: application/json

Request Body:
{
  "companyName": "Your Company Name",
  "gstin": "22AAAAA0000A1Z5",
  "fssaiNumber": "12345678901234",
  "panNumber": "AAAPA0000A",
  "address": "123 Main Street",
  "city": "Chennai",
  "state": "Tamil Nadu",
  "pincode": "600001",
  "phone": "9876543210",
  "email": "company@example.com",
  "bankName": "State Bank of India",
  "accountNumber": "1234567890",
  "ifscCode": "SBIN0001234"
}

Response:
{
  "message": "Company profile saved successfully",
  "company": { ... }
}
```

### Get Company Profile
```
GET /company

Response:
{
  "_id": "...",
  "companyName": "...",
  "gstin": "...",
  ...
}
```

---

## Party Endpoints

### Create Party
```
POST /parties
Content-Type: application/json

Request Body:
{
  "partyName": "Customer Business Name",
  "gstin": "22BBBBB0000B1Z5",
  "address": "456 Main Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "phone": "9876543211",
  "email": "customer@example.com"
}

Response:
{
  "message": "Party created successfully",
  "party": { ... }
}
```

### Get All Parties
```
GET /parties?search=query

Query Parameters:
- search (optional): Search by party name, GSTIN, or city

Response:
[
  {
    "_id": "...",
    "partyName": "...",
    "gstin": "...",
    ...
  }
]
```

### Get Party by ID
```
GET /parties/:id

Response:
{
  "_id": "...",
  "partyName": "...",
  ...
}
```

### Update Party
```
PUT /parties/:id
Content-Type: application/json

Request Body: { fields to update }

Response:
{
  "message": "Party updated successfully",
  "party": { ... }
}
```

### Delete Party
```
DELETE /parties/:id

Response:
{
  "message": "Party deleted successfully"
}
```

---

## Goods Endpoints

### Create Goods
```
POST /goods
Content-Type: application/json

Request Body:
{
  "goodsName": "Rice",
  "hsnCode": "1001",
  "gstRate": 5,
  "unit": "kg",
  "description": "White Rice, Premium Quality"
}

Response:
{
  "message": "Goods created successfully",
  "goods": { ... }
}
```

### Get All Goods
```
GET /goods?search=query

Query Parameters:
- search (optional): Search by goods name or HSN code

Response:
[
  {
    "_id": "...",
    "goodsName": "...",
    "hsnCode": "...",
    ...
  }
]
```

### Get Goods by ID
```
GET /goods/:id

Response:
{
  "_id": "...",
  "goodsName": "...",
  ...
}
```

### Update Goods
```
PUT /goods/:id
Content-Type: application/json

Request Body: { fields to update }

Response:
{
  "message": "Goods updated successfully",
  "goods": { ... }
}
```

### Delete Goods
```
DELETE /goods/:id

Response:
{
  "message": "Goods deleted successfully"
}
```

---

## Invoice Endpoints

### Create Invoice
```
POST /invoices
Content-Type: application/json

Request Body:
{
  "invoiceDate": "2026-01-25",
  "vehicleNumber": "MH12AB1234",
  "supplyType": "Intra-State",
  "partyId": "party_object_id",
  "lineItems": [
    {
      "goodsId": "goods_object_id",
      "quantity": 10,
      "bags": 2,
      "rate": 1000,
      "gstRate": 5
    }
  ],
  "notes": "Payment on delivery"
}

Response:
{
  "message": "Invoice created successfully",
  "invoice": {
    "invoiceNumber": "2025-26/INV/0001",
    "financialYear": "2025-26",
    "grandTotal": 11800,
    "amountInWords": "Eleven Thousand Eight Hundred Only",
    ...
  }
}
```

### Get All Invoices
```
GET /invoices?status=saved&financialYear=2025-26

Query Parameters:
- status (optional): draft, saved, printed, cancelled
- financialYear (optional): e.g., 2025-26
- partyId (optional): Filter by party

Response:
[
  {
    "invoiceNumber": "2025-26/INV/0001",
    "grandTotal": 11800,
    "status": "saved",
    ...
  }
]
```

### Get Invoice by ID
```
GET /invoices/:id

Response:
{
  "_id": "...",
  "invoiceNumber": "2025-26/INV/0001",
  "grandTotal": 11800,
  ...
}
```

### Update Invoice
```
PUT /invoices/:id
Content-Type: application/json

Request Body:
{
  "lineItems": [...],
  "supplyType": "Inter-State",
  "notes": "Updated notes"
}

Response:
{
  "message": "Invoice updated successfully",
  "invoice": { ... }
}
```

### Generate PDF
```
POST /invoices/:id/pdf

Response: Binary PDF file

Headers:
Content-Type: application/pdf
Content-Disposition: attachment; filename="invoice_2025-26_INV_0001.pdf"
```

### Mark Invoice as Printed
```
POST /invoices/:id/print

Response:
{
  "message": "Invoice marked as printed",
  "invoice": { status: "printed", ... }
}
```

### Cancel Invoice
```
POST /invoices/:id/cancel

Response:
{
  "message": "Invoice cancelled successfully",
  "invoice": { status: "cancelled", ... }
}
```

### Get Monthly Report
```
GET /invoices/monthly-report?financialYear=2025-26&month=2026-01

Query Parameters:
- financialYear (required): e.g., 2025-26
- month (optional): YYYY-MM format

Response:
{
  "totalInvoices": 5,
  "totalRevenue": 50000,
  "totalCGST": 2500,
  "totalSGST": 2500,
  "totalIGST": 0,
  "invoices": [...]
}
```

### Get Party-wise Report
```
GET /invoices/party-report?financialYear=2025-26&partyId=party_id

Query Parameters:
- financialYear (optional)
- partyId (optional): Filter by specific party

Response:
[
  {
    "partyName": "Customer Name",
    "gstin": "...",
    "invoiceCount": 3,
    "totalAmount": 30000,
    "totalTax": 1500
  }
]
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Invalid request or validation failed",
  "details": "Specific error message"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

---

## Validation Rules

### GSTIN Format
- 15 characters: `[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}`
- Example: `22AAAAA0000A1Z5`

### PAN Format
- 10 characters: `[A-Z]{5}[0-9]{4}[A-Z]{1}`
- Example: `AAAPA0000A`

### HSN Code
- 4-8 digits: `[0-9]{4,8}`
- Example: `1001`, `17019099`

### Phone Number
- 10 digits: `[0-9]{10}`
- Example: `9876543210`

### Pincode
- 6 digits: `[0-9]{6}`
- Example: `600001`

### GST Rates
- Allowed: 0, 5, 12, 18, 28

### Supply Types
- Intra-State
- Inter-State
- Non-Taxable

---

## Rate Limiting
Not implemented in current version. Recommended for production.

## CORS
Enabled for all origins in development. Configure as needed for production.
