# Database Schema Documentation

## Companies Collection
```json
{
  "_id": ObjectId,
  "companyName": "String (required, unique)",
  "gstin": "String (required, unique, validated)",
  "fssaiNumber": "String (optional)",
  "panNumber": "String (optional, validated)",
  "address": "String (required)",
  "city": "String (required)",
  "state": "String (required)",
  "pincode": "String (required, 6 digits)",
  "phone": "String (10 digits)",
  "email": "String (validated)",
  "bankName": "String",
  "accountNumber": "String",
  "ifscCode": "String",
  "createdAt": Date,
  "updatedAt": Date
}
```

## Parties Collection
```json
{
  "_id": ObjectId,
  "partyName": "String (required)",
  "gstin": "String (required, unique, validated)",
  "address": "String (required)",
  "city": "String (required)",
  "state": "String (required)",
  "pincode": "String (6 digits, optional)",
  "phone": "String (10 digits)",
  "email": "String (validated)",
  "createdAt": Date,
  "updatedAt": Date
}
```

## Goods Collection
```json
{
  "_id": ObjectId,
  "goodsName": "String (required, unique)",
  "hsnCode": "String (required, 4-8 digits)",
  "gstRate": "Number (0, 5, 12, 18, or 28)",
  "unit": "String (kg, piece, meter, liter, set, box, bag)",
  "description": "String (optional)",
  "createdAt": Date,
  "updatedAt": Date
}
```

## Invoices Collection
```json
{
  "_id": ObjectId,
  "invoiceNumber": "String (unique, format: 2025-26/INV/0001)",
  "financialYear": "String (format: YYYY-YY)",
  "invoiceDate": Date,
  "vehicleNumber": "String (optional)",
  "supplyType": "String (Intra-State, Inter-State, Non-Taxable)",
  "companyId": ObjectId (ref: Company),
  "partyId": ObjectId (ref: Party),
  "lineItems": [
    {
      "goodsId": ObjectId (ref: Goods),
      "description": "String",
      "hsnCode": "String",
      "quantity": "Number",
      "bags": "Number",
      "rate": "Number",
      "gstRate": "Number",
      "amount": "Number",
      "cgst": "Number",
      "sgst": "Number",
      "igst": "Number",
      "lineTotal": "Number"
    }
  ],
  "subtotal": "Number",
  "cgstTotal": "Number",
  "sgstTotal": "Number",
  "igstTotal": "Number",
  "grandTotal": "Number",
  "amountInWords": "String",
  "status": "String (draft, saved, printed, cancelled)",
  "notes": "String (optional)",
  "createdAt": Date,
  "updatedAt": Date
}
```

## Indexes
Create these indexes for better performance:

```javascript
// Companies
db.companies.createIndex({ gstin: 1 }, { unique: true })
db.companies.createIndex({ companyName: 1 })

// Parties
db.parties.createIndex({ gstin: 1 }, { unique: true })
db.parties.createIndex({ partyName: "text" })
db.parties.createIndex({ city: 1 })

// Goods
db.goods.createIndex({ goodsName: 1 }, { unique: true })
db.goods.createIndex({ hsnCode: 1 })
db.goods.createIndex({ goodsName: "text", hsnCode: "text" })

// Invoices
db.invoices.createIndex({ invoiceNumber: 1 }, { unique: true })
db.invoices.createIndex({ financialYear: 1 })
db.invoices.createIndex({ companyId: 1 })
db.invoices.createIndex({ partyId: 1 })
db.invoices.createIndex({ status: 1 })
db.invoices.createIndex({ invoiceDate: 1 })
db.invoices.createIndex({ invoiceDate: -1, financialYear: 1 })
```
