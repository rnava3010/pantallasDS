// UBICACIÓN: backend/manager/auth/auth.controller.js
const db = require('../../config/db'); // Ajusta esto según donde tengas tu conexión
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro_manager';

exports.login = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    // 1. Verificar usuario activo
    const [rows] = await db.query(
      'SELECT * FROM usuarios WHERE (email = ? OR nombre_corto = ?) AND activo = 1', 
      [identifier, identifier]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = rows[0];

    // 2. Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 3. Detectar Primer Login (ultimo_acceso IS NULL)
    if (user.ultimo_acceso === null) {
      return res.json({ 
        requirePasswordSetup: true,
        identifier: identifier 
      });
    }

    // 4. Generar Token
    const token = jwt.sign(
      { 
        id: user.idUsuario, 
        role: user.rol, 
        name: user.nombre_corto 
      }, 
      JWT_SECRET, 
      { expiresIn: '8h' }
    );

    // Actualizar último acceso
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
       SET password_hash = ?, ultimo_acceso = NOW() 
       WHERE (email = ? OR nombre_corto = ?) AND ultimo_acceso IS NULL`,
      [passwordHash, identifier, identifier]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'Error: Usuario no encontrado o ya activado.' });
    }

    // Autologin inmediato tras el cambio
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