const Goods = require('../models/Goods');

exports.createGoods = async (req, res) => {
  try {
    const { goodsName, hsnCode, gstRate, unit, description } = req.body;

    if (!goodsName || !hsnCode || gstRate === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (![0, 5, 12, 18, 28].includes(gstRate)) {
      return res.status(400).json({ message: 'Invalid GST rate' });
    }

    const existingGoods = await Goods.findOne({ goodsName });
    if (existingGoods) {
      return res.status(400).json({ message: 'Goods with this name already exists' });
    }

    const goods = new Goods({
      goodsName, hsnCode, gstRate, unit, description
    });

    await goods.save();
    res.status(201).json({ message: 'Goods created successfully', goods });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllGoods = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { goodsName: { $regex: search, $options: 'i' } },
          { hsnCode: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const goods = await Goods.find(query);
    res.status(200).json(goods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getGoodsById = async (req, res) => {
  try {
    const goods = await Goods.findById(req.params.id);
    if (!goods) {
      return res.status(404).json({ message: 'Goods not found' });
    }
    res.status(200).json(goods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateGoods = async (req, res) => {
  try {
    const { gstRate } = req.body;

    if (gstRate && ![0, 5, 12, 18, 28].includes(gstRate)) {
      return res.status(400).json({ message: 'Invalid GST rate' });
    }

    const goods = await Goods.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!goods) {
      return res.status(404).json({ message: 'Goods not found' });
    }

    res.status(200).json({ message: 'Goods updated successfully', goods });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteGoods = async (req, res) => {
  try {
    const goods = await Goods.findByIdAndDelete(req.params.id);
    if (!goods) {
      return res.status(404).json({ message: 'Goods not found' });
    }
    res.status(200).json({ message: 'Goods deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
