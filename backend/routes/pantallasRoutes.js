const express = require('express');
const router = express.Router();
const { getDatosPantalla } = require('../controllers/pantallaController');

router.get('/:id', getDatosPantalla);

module.exports = router;