const express = require('express');
const router = express.Router();
const { getDatosPantalla } = require('../controllers/pantallaController');

// Definimos la ruta GET /:id
router.get('/:id', getDatosPantalla);

module.exports = router;