const express = require('express');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/tickets', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT latitud, longitud FROM tickets_soporte
       WHERE latitud IS NOT NULL AND longitud IS NOT NULL`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener puntos de tickets.' });
  }
});

router.get('/solicitudes', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT latitud, longitud FROM solicitudes_servicio
       WHERE latitud IS NOT NULL AND longitud IS NOT NULL`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener puntos de solicitudes.' });
  }
});

router.get('/planes', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nombre_plan, tipo_tecnologia, velocidad_mbps, precio_mensual, latitud, longitud
       FROM planes_internet
       WHERE latitud IS NOT NULL AND longitud IS NOT NULL AND estado_activo = true`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener planes.' });
  }
});

module.exports = router;