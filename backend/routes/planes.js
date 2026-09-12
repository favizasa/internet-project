const express = require('express');
const { pool } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  const { zona, tipo, precioMax } = req.query;

  let query = `
    SELECT p.id, p.nombre_plan, p.tipo_tecnologia, p.velocidad_mbps, p.precio_mensual,
           p.zona_cobertura, p.soporte, p.imagen_url, p.estado_activo, p.latitud, p.longitud,
           w.razon_social AS wisp
    FROM planes_internet p
    JOIN proveedores_wisp w ON w.id = p.proveedor_id
    WHERE p.estado_activo = TRUE
  `;
  const params = [];

  if (zona) {
    params.push(`%${zona}%`);
    query += ` AND p.zona_cobertura ILIKE $${params.length}`;
  }
  if (tipo && tipo !== 'TODOS') {
    params.push(tipo);
    query += ` AND p.tipo_tecnologia = $${params.length}`;
  }
  if (precioMax) {
    params.push(precioMax);
    query += ` AND p.precio_mensual <= $${params.length}`;
  }
  query += ' ORDER BY p.precio_mensual ASC';

  try {
    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al consultar los planes.' });
  }
});

router.get('/mios', requireAuth, requireRole('Proveedor'), async (req, res) => {
  try {
    const proveedor = await pool.query('SELECT id FROM proveedores_wisp WHERE usuario_id = $1', [req.user.id]);
    if (proveedor.rows.length === 0) {
      return res.status(400).json({ error: 'Este usuario no tiene una ficha de proveedor asociada.' });
    }
    const result = await pool.query(
      `SELECT id, nombre_plan, tipo_tecnologia, velocidad_mbps, precio_mensual, zona_cobertura, soporte, imagen_url, estado_activo, latitud, longitud
       FROM planes_internet WHERE proveedor_id = $1 ORDER BY fecha_creacion DESC`,
      [proveedor.rows[0].id]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al consultar sus planes.' });
  }
});

// CU-11: Registrar nuevo plan (solo Proveedor dueño o Administrador)
router.post('/', requireAuth, requireRole('Proveedor', 'Administrador'), async (req, res) => {
  const { nombrePlan, tipoTecnologia, velocidadMbps, precioMensual, zonaCobertura, soporte, imagenUrl, latitud, longitud } = req.body;

  if (!nombrePlan || !velocidadMbps || !precioMensual || !zonaCobertura) {
    return res.status(400).json({ error: 'Complete todos los campos obligatorios del plan.' });
  }

  try {
    const proveedor = await pool.query('SELECT id FROM proveedores_wisp WHERE usuario_id = $1', [req.user.id]);
    if (proveedor.rows.length === 0) {
      return res.status(400).json({ error: 'Este usuario no tiene una ficha de proveedor asociada.' });
    }

    const result = await pool.query(
      `INSERT INTO planes_internet (proveedor_id, nombre_plan, tipo_tecnologia, velocidad_mbps, precio_mensual, zona_cobertura, soporte, imagen_url, latitud, longitud)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [proveedor.rows[0].id, nombrePlan, tipoTecnologia || 'Fibra', velocidadMbps, precioMensual, zonaCobertura, soporte || null, imagenUrl || null, latitud || null, longitud || null]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al registrar el plan.' });
  }
});

// CU-11: Editar un plan existente (datos + imagen)
router.put('/:id', requireAuth, requireRole('Proveedor', 'Administrador'), async (req, res) => {
  const { nombrePlan, tipoTecnologia, velocidadMbps, precioMensual, zonaCobertura, soporte, imagenUrl, latitud, longitud } = req.body;

  try {
    if (req.user.rol !== 'Administrador') {
      const proveedor = await pool.query('SELECT id FROM proveedores_wisp WHERE usuario_id = $1', [req.user.id]);
      const plan = await pool.query('SELECT proveedor_id FROM planes_internet WHERE id = $1', [req.params.id]);
      if (plan.rows.length === 0) return res.status(404).json({ error: 'Plan no encontrado.' });
      if (proveedor.rows.length === 0 || plan.rows[0].proveedor_id !== proveedor.rows[0].id) {
        return res.status(403).json({ error: 'No puede editar planes que no le pertenecen.' });
      }
    }

    const result = await pool.query(
      `UPDATE planes_internet
       SET nombre_plan = $1, tipo_tecnologia = $2, velocidad_mbps = $3, precio_mensual = $4,
           zona_cobertura = $5, soporte = $6, imagen_url = COALESCE($7, imagen_url),
           latitud = $8, longitud = $9
       WHERE id = $10 RETURNING *`,
      [nombrePlan, tipoTecnologia, velocidadMbps, precioMensual, zonaCobertura, soporte || null, imagenUrl || null, latitud || null, longitud || null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Plan no encontrado.' });
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al editar el plan.' });
  }
});

router.patch('/:id/estado', requireAuth, requireRole('Proveedor', 'Administrador'), async (req, res) => {
  const { estadoActivo } = req.body;
  try {
    const result = await pool.query(
      'UPDATE planes_internet SET estado_activo = $1 WHERE id = $2 RETURNING *',
      [estadoActivo, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Plan no encontrado.' });
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al actualizar el estado del plan.' });
  }
});

router.delete('/:id', requireAuth, requireRole('Proveedor', 'Administrador'), async (req, res) => {
  try {
    if (req.user.rol !== 'Administrador') {
      const proveedor = await pool.query('SELECT id FROM proveedores_wisp WHERE usuario_id = $1', [req.user.id]);
      const plan = await pool.query('SELECT proveedor_id FROM planes_internet WHERE id = $1', [req.params.id]);
      if (plan.rows.length === 0) return res.status(404).json({ error: 'Plan no encontrado.' });
      if (proveedor.rows.length === 0 || plan.rows[0].proveedor_id !== proveedor.rows[0].id) {
        return res.status(403).json({ error: 'No puede eliminar planes que no le pertenecen.' });
      }
    }
    await pool.query('DELETE FROM planes_internet WHERE id = $1', [req.params.id]);
    return res.json({ eliminado: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al eliminar el plan.' });
  }
});

module.exports = router;