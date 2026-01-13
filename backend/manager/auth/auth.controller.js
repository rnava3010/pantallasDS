const db = require('../../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro_manager';

exports.login = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    // 1. Buscamos usuario + Nombre del Rol usando LEFT JOIN
    const sql = `
      SELECT u.*, np.nombre_rol 
      FROM usuarios u
      LEFT JOIN niveles_permiso np ON u.rol = np.id
      WHERE (u.email = ? OR u.nombre_corto = ?) AND u.activo = 1
    `;
    
    const [rows] = await db.query(sql, [identifier, identifier]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = rows[0];

    // 2. Validamos contraseña
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 3. Verificamos si requiere cambio de contraseña (Primer Login)
    if (user.primer_login === 1) {
      return res.json({ 
        requirePasswordSetup: true,
        identifier: identifier 
      });
    }

    // 4. Generamos Token
    const token = jwt.sign(
      { 
        id: user.idUsuario, 
        role: user.rol, 
        name: user.nombre_corto 
      }, 
      JWT_SECRET, 
      { expiresIn: '8h' }
    );

    // 5. Actualizamos último acceso
    await db.query('UPDATE usuarios SET ultimo_acceso = NOW() WHERE idUsuario = ?', [user.idUsuario]);

    // 6. Enviamos respuesta con el nombre del rol
    res.json({ 
      token, 
      user: { 
        name: user.nombre_completo, 
        role: user.rol, // Mantenemos el ID por si se necesita para lógica interna
        roleName: user.nombre_rol || 'Sin Rol Asignado' // Enviamos el nombre para mostrar en pantalla
      } 
    });

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

    // 1. Actualizamos contraseña y quitamos el flag de primer login
    const [result] = await db.query(
      `UPDATE usuarios 
       SET password_hash = ?, primer_login = 0, ultimo_acceso = NOW() 
       WHERE (email = ? OR nombre_corto = ?)`,
      [passwordHash, identifier, identifier]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'No se pudo actualizar. Usuario no encontrado.' });
    }

    // 2. Obtenemos el usuario actualizado CON el nombre del rol
    const sql = `
      SELECT u.*, np.nombre_rol 
      FROM usuarios u
      LEFT JOIN niveles_permiso np ON u.rol = np.id
      WHERE u.email = ? OR u.nombre_corto = ?
    `;
    const [rows] = await db.query(sql, [identifier, identifier]);
    const user = rows[0];

    // 3. Generamos token para autologin
    const token = jwt.sign(
      { id: user.idUsuario, role: user.rol, name: user.nombre_corto }, 
      JWT_SECRET, 
      { expiresIn: '8h' }
    );

    // 4. Respondemos con token y datos de usuario (incluyendo roleName)
    res.json({ 
      token, 
      user: { 
        name: user.nombre_completo, 
        role: user.rol,
        roleName: user.nombre_rol || 'Sin Rol Asignado'
      },
      message: 'Contraseña actualizada correctamente' 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar contraseña' });
  }
};