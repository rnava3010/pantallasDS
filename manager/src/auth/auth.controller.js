// src/manager/auth/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');

// Ruta para intentar loguearse
router.post('/login', authController.login);

// Ruta para establecer la contraseña inicial
router.post('/first-login', authController.firstLoginUpdate);

module.exports = router;