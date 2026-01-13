// src/manager/auth/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');

router.post('/login', authController.login);

router.post('/first-login', authController.firstLoginUpdate);

module.exports = router;