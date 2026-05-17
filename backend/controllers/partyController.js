const Party = require('../models/Party');
const { validateGSTIN } = require('../utils/taxCalculator');

exports.createParty = async (req, res) => {
  try {
    const { partyName, gstin, address, city, state, pincode, phone, email } = req.body;

    if (!partyName || !gstin || !address || !city || !state) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!validateGSTIN(gstin)) {
      return res.status(400).json({ message: 'Invalid GSTIN format' });
    }

    const existingParty = await Party.findOne({ gstin });
    if (existingParty) {
      return res.status(400).json({ message: 'Party with this GSTIN already exists' });
    }

    const party = new Party({
      partyName, gstin, address, city, state, pincode, phone, email
    });

    await party.save();
    res.status(201).json({ message: 'Party created successfully', party });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllParties = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { partyName: { $regex: search, $options: 'i' } },
          { gstin: { $regex: search, $options: 'i' } },
          { city: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const parties = await Party.find(query);
    res.status(200).json(parties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPartyById = async (req, res) => {
  try {
    const party = await Party.findById(req.params.id);
    if (!party) {
      return res.status(404).json({ message: 'Party not found' });
    }
    res.status(200).json(party);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateParty = async (req, res) => {
  try {
    const party = await Party.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!party) {
      return res.status(404).json({ message: 'Party not found' });
    }

    res.status(200).json({ message: 'Party updated successfully', party });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteParty = async (req, res) => {
  try {
    const party = await Party.findByIdAndDelete(req.params.id);
    if (!party) {
      return res.status(404).json({ message: 'Party not found' });
    }
    res.status(200).json({ message: 'Party deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
