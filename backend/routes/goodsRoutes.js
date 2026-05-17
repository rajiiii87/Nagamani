const express = require('express');
const router = express.Router();
const goodsController = require('../controllers/goodsController');

router.post('/', goodsController.createGoods);
router.get('/', goodsController.getAllGoods);
router.get('/:id', goodsController.getGoodsById);
router.put('/:id', goodsController.updateGoods);
router.delete('/:id', goodsController.deleteGoods);

module.exports = router;
