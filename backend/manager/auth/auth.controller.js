// backend/manager/src/auth/auth.controller.js
const db = require('../../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro_manager';

exports.login = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const [rows] = await db.query(
      'SELECT * FROM usuarios WHERE (email = ? OR nombre_corto = ?) AND activo = 1', 
      [identifier, identifier]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    if (user.primer_login === 1) {
      return res.json({ 
        requirePasswordSetup: true,
        identifier: identifier 
      });
    }

    const token = jwt.sign(
      { 
        id: user.idUsuario, 
        role: user.rol, 
        name: user.nombre_corto 
      }, 
      JWT_SECRET, 
      { expiresIn: '8h' }
    );

    await db.query('UPDATE usuarios SET ultimo_acceso = NOW() WHERE idUsuario = ?', [user.idUsuario]);

    res.json({ token, user: { name: user.nombre_completo, role: user.rol } });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.firstLoginUpdate = async (req, res) => {
  const { identifier, newPassword } = req.body;

  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    const [result] = await db.query(
      `UPDATE usuarios 
       SET password_hash = ?, primer_login = 0, ultimo_acceso = NOW() 
       WHERE (email = ? OR nombre_corto = ?)`,
      [passwordHash, identifier, identifier]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'No se pudo actualizar. Usuario no encontrado.' });
    }

    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ? OR nombre_corto = ?', [identifier, identifier]);
    const user = rows[0];

    const token = jwt.sign(
      { id: user.idUsuario, role: user.rol, name: user.nombre_corto }, 
      JWT_SECRET, 
      { expiresIn: '8h' }
    );

    res.json({ token, message: 'Contraseña actualizada correctamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar contraseña' });
  }
};