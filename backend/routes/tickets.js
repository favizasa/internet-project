const express = require('express');
const { pool } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { enviarCorreo } = require('../utils/mailer');

const router = express.Router();

function generarCodigoTicket() {
  return '#' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

router.post('/', requireAuth, requireRole('Cliente'), async (req, res) => {
  const { categoriaFalla, descripcion, evidenciaUrl } = req.body;
  if (!categoriaFalla || !descripcion) {
    return res.status(400).json({ error: 'Complete los campos requeridos.' });
  }

  try {
    const tecnico = await pool.query(`
      SELECT u.id
      FROM usuarios u
      LEFT JOIN tickets_soporte t ON t.tecnico_id = u.id AND t.estado_ticket IN ('Pendiente', 'En Proceso')
      WHERE u.rol = 'Soporte'
      GROUP BY u.id
      ORDER BY COUNT(t.id) ASC
      LIMIT 1
    `);
    const tecnicoId = tecnico.rows[0]?.id || null;

    const result = await pool.query(
      `INSERT INTO tickets_soporte (codigo_hash, cliente_id, tecnico_id, categoria_falla, descripcion, evidencia_url, estado_ticket, fecha_asignacion)
       VALUES ($1, $2, $3, $4, $5, $6, 'Pendiente', now())
       RETURNING *`,
      [generarCodigoTicket(), req.user.id, tecnicoId, categoriaFalla, descripcion, evidenciaUrl || null]
    );

    const cliente = await pool.query(`SELECT nombre, correo FROM usuarios WHERE id = $1`, [req.user.id]);
    enviarCorreo(
      cliente.rows[0].correo,
      `Ticket registrado: ${result.rows[0].codigo_hash}`,
      `<p>Hola ${cliente.rows[0].nombre},</p>
       <p>Tu reporte de <b>${categoriaFalla}</b> fue registrado con el código <b>${result.rows[0].codigo_hash}</b>.</p>
       <p>Un técnico ya fue asignado y se pondrá en contacto pronto.</p>`
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al registrar el ticket.' });
  }
});

router.get('/mios', requireAuth, requireRole('Cliente'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, e.calificacion, e.comentario AS comentario_encuesta
       FROM tickets_soporte t
       LEFT JOIN encuestas_satisfaccion e ON e.ticket_id = t.id
       WHERE t.cliente_id = $1
       ORDER BY t.fecha_creacion DESC`,
      [req.user.id]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al consultar tickets.' });
  }
});

router.get('/bandeja', requireAuth, requireRole('Soporte', 'Administrador'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, u.nombre AS cliente_nombre, u.correo AS cliente_correo
      FROM tickets_soporte t
      JOIN usuarios u ON u.id = t.cliente_id
      ORDER BY
        CASE t.estado_ticket WHEN 'Pendiente' THEN 0 WHEN 'En Proceso' THEN 1 ELSE 2 END,
        t.fecha_creacion ASC
    `);
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al consultar la bandeja de tickets.' });
  }
});

router.patch('/:id/iniciar', requireAuth, requireRole('Soporte'), async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE tickets_soporte SET estado_ticket = 'En Proceso' WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Ticket no encontrado.' });
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al iniciar la atención del ticket.' });
  }
});


router.patch('/:id/finalizar', requireAuth, requireRole('Soporte'), async (req, res) => {
  const { diagnosticoTecnico, accionesRealizadas, requiereVisita, evidenciaResolucionUrl } = req.body;
  if (!diagnosticoTecnico || !accionesRealizadas) {
    return res.status(400).json({ error: 'Complete el diagnóstico y las acciones realizadas.' });
  }

  const nuevoEstado = requiereVisita ? 'Escalado' : 'Resuelto';

  try {
    const result = await pool.query(
      `UPDATE tickets_soporte
       SET diagnostico_tecnico = $1,
           acciones_realizadas = $2,
           estado_ticket = $3::estado_ticket,
           evidencia_resolucion_url = $4,
           fecha_cierre = CASE WHEN $3::text = 'Resuelto' THEN now() ELSE fecha_cierre END
       WHERE id = $5
       RETURNING *`,
      [diagnosticoTecnico, accionesRealizadas, nuevoEstado, evidenciaResolucionUrl || null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Ticket no encontrado.' });

    const infoCliente = await pool.query(
      `SELECT u.nombre, u.correo FROM tickets_soporte t JOIN usuarios u ON u.id = t.cliente_id WHERE t.id = $1`,
      [req.params.id]
    );
    enviarCorreo(
      infoCliente.rows[0].correo,
      nuevoEstado === 'Resuelto' ? 'Tu ticket fue resuelto' : 'Tu ticket requiere visita técnica',
      `<p>Hola ${infoCliente.rows[0].nombre},</p>
       <p><b>Diagnóstico:</b> ${diagnosticoTecnico}</p>
       <p><b>Acciones realizadas:</b> ${accionesRealizadas}</p>
       ${nuevoEstado === 'Escalado' ? '<p>Se coordinará una visita técnica a tu domicilio.</p>' : '<p>¡Gracias por tu paciencia!</p>'}`
    );

    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al finalizar el ticket.' });
  }
});

router.post('/:id/encuesta', requireAuth, requireRole('Cliente'), async (req, res) => {
  const { calificacion, comentario } = req.body;
  if (!calificacion || calificacion < 1 || calificacion > 5) {
    return res.status(400).json({ error: 'La calificación debe estar entre 1 y 5 estrellas.' });
  }

  try {
    const ticket = await pool.query(
      `SELECT * FROM tickets_soporte WHERE id = $1 AND cliente_id = $2`,
      [req.params.id, req.user.id]
    );
    if (ticket.rows.length === 0) return res.status(404).json({ error: 'Ticket no encontrado.' });
    if (ticket.rows[0].estado_ticket !== 'Resuelto') {
      return res.status(400).json({ error: 'Solo se puede calificar un ticket que ya fue resuelto.' });
    }

    const result = await pool.query(
      `INSERT INTO encuestas_satisfaccion (ticket_id, calificacion, comentario)
       VALUES ($1, $2, $3)
       ON CONFLICT (ticket_id) DO UPDATE SET calificacion = $2, comentario = $3
       RETURNING *`,
      [req.params.id, calificacion, comentario || null]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al registrar la encuesta.' });
  }
});

module.exports = router;