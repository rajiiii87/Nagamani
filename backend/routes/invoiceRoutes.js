const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

router.post('/', invoiceController.createInvoice);
router.get('/', invoiceController.getAllInvoices);
router.get('/monthly-report', invoiceController.getMonthlyReport);
router.get('/party-report', invoiceController.getPartyWiseReport);
router.get('/:id', invoiceController.getInvoiceById);
router.put('/:id', invoiceController.updateInvoice);
router.post('/:id/pdf', invoiceController.generatePDF);
router.post('/:id/print', invoiceController.printInvoice);
router.post('/:id/cancel', invoiceController.cancelInvoice);

module.exports = router;
