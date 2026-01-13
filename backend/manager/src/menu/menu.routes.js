const express = require('express');
const router = express.Router();
const menuController = require('./menu.controller');

router.get('/', menuController.getMenu);

module.exports = router;