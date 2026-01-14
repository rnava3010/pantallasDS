const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro_manager';

module.exports = (req, res, next) => {
  // Leer el token del header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. No hay token.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // Guardamos los datos del usuario en la petición
    next(); // Dejamos pasar
  } catch (error) {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};