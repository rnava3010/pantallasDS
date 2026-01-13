const db = require('../../../config/db');

exports.getSummary = async (req, res) => {
  try {
    // Asumimos que obtenemos el ID del usuario del Token
    const userId = req.user.id;

    // 1. Obtener la Sucursal del Usuario
    // Primero necesitamos saber a qué sucursal pertenece este usuario
    const [userRows] = await db.query('SELECT idSucursal FROM usuarios WHERE idUsuario = ?', [userId]);
    
    if (userRows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
    const idSucursal = userRows[0].idSucursal;

    // 2. Info de la Sucursal + Clima (JOIN con cache clima)
    const [sucursalRows] = await db.query(`
      SELECT s.nombre, s.direccion, s.ciudad_clima, c.json_clima 
      FROM cat_sucursales s
      LEFT JOIN tbl_cache_clima c ON s.idSucursal = c.idSucursal
      WHERE s.idSucursal = ?`, 
      [idSucursal]
    );

    // 3. Próximo Evento (Solo el más cercano que sea futuro o actual)
    const [eventoRows] = await db.query(`
      SELECT e.nombre_evento, e.cliente_nombre, e.fecha_inicio, a.nombre as nombre_area
      FROM tbl_eventos e
      JOIN cat_areas a ON e.idArea = a.idArea
      WHERE e.idSucursal = ? 
        AND e.estatus = 'ACTIVO' 
        AND e.fecha_fin >= NOW()
      ORDER BY e.fecha_inicio ASC
      LIMIT 1`, 
      [idSucursal]
    );

    // 4. Conteo de Terminales por Tipo
    const [terminalesRows] = await db.query(`
      SELECT tipo_pantalla, COUNT(*) as total
      FROM cat_terminales
      WHERE idSucursal = ?
      GROUP BY tipo_pantalla`, 
      [idSucursal]
    );

    // 5. Conteo de Avisos Activos
    const [avisosRows] = await db.query(`
      SELECT COUNT(*) as total 
      FROM tbl_avisos 
      WHERE idSucursal = ? AND activo = 1`, 
      [idSucursal]
    );

    // Armamos la respuesta
    res.json({
      sucursal: sucursalRows[0],
      proximoEvento: eventoRows.length > 0 ? eventoRows[0] : null,
      terminales: terminalesRows,
      totalAvisos: avisosRows[0].total
    });

  } catch (error) {
    console.error("Error en Dashboard Summary:", error);
    res.status(500).json({ message: 'Error al cargar resumen' });
  }
};