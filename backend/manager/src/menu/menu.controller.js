const db = require('../../../config/db');

exports.getMenu = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM menu_items WHERE activo = 1 ORDER BY orden ASC'
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al cargar el menú' });
  }
};