const Company = require('../models/Company');
const { validateGSTIN, validatePAN } = require('../utils/taxCalculator');

exports.createOrUpdateCompany = async (req, res) => {
  try {
    const {
      companyName, gstin, fssaiNumber, panNumber, address,
      city, state, pincode, phone, email, bankName,
      accountNumber, ifscCode
    } = req.body;

    // Validation
    if (!companyName || !gstin || !address || !city || !state || !pincode) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!validateGSTIN(gstin)) {
      return res.status(400).json({ message: 'Invalid GSTIN format' });
    }

    if (panNumber && !validatePAN(panNumber)) {
      return res.status(400).json({ message: 'Invalid PAN format' });
    }

    let company = await Company.findOne();

    if (company) {
      // Update existing
      Object.assign(company, {
        companyName, gstin, fssaiNumber, panNumber, address,
        city, state, pincode, phone, email, bankName,
        accountNumber, ifscCode,
        updatedAt: new Date()
      });
    } else {
      // Create new
      company = new Company({
        companyName, gstin, fssaiNumber, panNumber, address,
        city, state, pincode, phone, email, bankName,
        accountNumber, ifscCode
      });
    }

    await company.save();
    res.status(200).json({ message: 'Company profile saved successfully', company });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCompany = async (req, res) => {
  try {
    const company = await Company.findOne();
    if (!company) {
      return res.status(404).json({ message: 'Company profile not found' });
    }
    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
