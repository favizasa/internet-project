const express = require('express');
const { pool } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { enviarCorreo } = require('../utils/mailer');

const router = express.Router();

router.post('/', requireAuth, requireRole('Cliente'), async (req, res) => {
  const { planId, sector, manzana, lote, referencia, horarioPreferido } = req.body;
  if (!planId || !referencia) {
    return res.status(400).json({ error: 'Complete los datos de instalación requeridos.' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO solicitudes_servicio (cliente_id, plan_id, sector, manzana, lote, referencia, horario_preferido)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.id, planId, sector, manzana, lote, referencia, horarioPreferido || 'Mañana']
    );

    const cliente = await pool.query(`SELECT nombre, correo FROM usuarios WHERE id = $1`, [req.user.id]);
    const plan = await pool.query(`SELECT nombre_plan FROM planes_internet WHERE id = $1`, [planId]);
    enviarCorreo(
      cliente.rows[0].correo,
      'Solicitud de instalación recibida',
      `<p>Hola ${cliente.rows[0].nombre},</p>
       <p>Tu solicitud del plan <b>${plan.rows[0]?.nombre_plan || ''}</b> fue registrada correctamente.</p>
       <p>Un asesor se pondrá en contacto contigo pronto para coordinar la instalación en <b>${sector} ${manzana} ${lote}</b>.</p>`
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al registrar la solicitud.' });
  }
});

// CU-07 Consultar estado de mis solicitudes
router.get('/mias', requireAuth, requireRole('Cliente'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, p.nombre_plan, p.precio_mensual
       FROM solicitudes_servicio s
       JOIN planes_internet p ON p.id = s.plan_id
       WHERE s.cliente_id = $1
       ORDER BY s.fecha_creacion DESC`,
      [req.user.id]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al consultar solicitudes.' });
  }
});

module.exports = router;
