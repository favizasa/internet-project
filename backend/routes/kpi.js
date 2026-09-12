const express = require('express');
const { pool } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const XLSX = require('xlsx');

const router = express.Router();

// CU-12 Generar reportes e indicadores KPI (+ satisfacción del cliente vía encuestas)
router.get('/', requireAuth, requireRole('Administrador', 'Proveedor'), async (req, res) => {
  const { desde, hasta } = req.query;
  if (!desde || !hasta) {
    return res.status(400).json({ error: 'Debe indicar el rango de fechas (desde, hasta).' });
  }

  try {
    const ticketsResult = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE estado_ticket = 'Pendiente') AS pendientes,
         COUNT(*) FILTER (WHERE estado_ticket = 'En Proceso') AS en_proceso,
         COUNT(*) FILTER (WHERE estado_ticket = 'Resuelto') AS resueltos,
         COUNT(*) FILTER (WHERE estado_ticket = 'Escalado') AS escalados,
         COUNT(*) FILTER (WHERE estado_ticket = 'Resuelto' AND acciones_realizadas IS NOT NULL) AS resueltos_1ra_intervencion,
         COUNT(*) FILTER (WHERE estado_ticket IN ('Resuelto','Escalado')) AS total_cerrados,
         AVG(EXTRACT(EPOCH FROM (fecha_asignacion - fecha_creacion)) / 60)
           FILTER (WHERE fecha_asignacion IS NOT NULL) AS tat_minutos
       FROM tickets_soporte
       WHERE fecha_creacion BETWEEN $1 AND $2`,
      [desde, hasta]
    );

    const solicitudesResult = await pool.query(
      `SELECT COUNT(*) AS total_solicitudes
       FROM solicitudes_servicio
       WHERE fecha_creacion BETWEEN $1 AND $2`,
      [desde, hasta]
    );

    const encuestaResumen = await pool.query(
      `SELECT
         COUNT(*) AS total_encuestas,
         AVG(e.calificacion) AS promedio,
         COUNT(*) FILTER (WHERE e.calificacion = 5) AS c5,
         COUNT(*) FILTER (WHERE e.calificacion = 4) AS c4,
         COUNT(*) FILTER (WHERE e.calificacion = 3) AS c3,
         COUNT(*) FILTER (WHERE e.calificacion = 2) AS c2,
         COUNT(*) FILTER (WHERE e.calificacion = 1) AS c1
       FROM encuestas_satisfaccion e
       JOIN tickets_soporte t ON t.id = e.ticket_id
       WHERE t.fecha_creacion BETWEEN $1 AND $2`,
      [desde, hasta]
    );

    const comentariosResult = await pool.query(
      `SELECT e.calificacion, e.comentario, e.fecha_creacion AS fecha, t.codigo_hash, u.nombre AS cliente_nombre
       FROM encuestas_satisfaccion e
       JOIN tickets_soporte t ON t.id = e.ticket_id
       JOIN usuarios u ON u.id = t.cliente_id
       WHERE t.fecha_creacion BETWEEN $1 AND $2 AND e.comentario IS NOT NULL AND e.comentario <> ''
       ORDER BY e.fecha_creacion DESC
       LIMIT 20`,
      [desde, hasta]
    );

    const t = ticketsResult.rows[0];
    const enc = encuestaResumen.rows[0];
    const totalSolicitudes = Number(solicitudesResult.rows[0].total_solicitudes);
    const totalCerrados = Number(t.total_cerrados);

    const kpi = {
      totalSolicitudes,
      ticketsPendientes: Number(t.pendientes),
      ticketsProgreso: Number(t.en_proceso),
      ticketsResueltos: Number(t.resueltos),
      ticketsEscalados: Number(t.escalados),
      tasaResolucionPI: totalCerrados > 0
        ? Number(((Number(t.resueltos_1ra_intervencion) / totalCerrados) * 100).toFixed(1))
        : 0,
      tiempoAsignacionMinutos: t.tat_minutos ? Number(Number(t.tat_minutos).toFixed(1)) : 0,
      sinRegistros: totalSolicitudes === 0 && totalCerrados === 0,
      satisfaccion: {
        totalEncuestas: Number(enc.total_encuestas),
        promedio: enc.promedio ? Number(Number(enc.promedio).toFixed(2)) : 0,
        distribucion: {
          5: Number(enc.c5), 4: Number(enc.c4), 3: Number(enc.c3), 2: Number(enc.c2), 1: Number(enc.c1),
        },
        comentarios: comentariosResult.rows,
      },
    };

    return res.json(kpi);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al calcular los indicadores KPI.' });
  }
});

// Exportar reporte KPI a Excel (Tickets + Encuestas de satisfacción)
router.get('/exportar', requireAuth, requireRole('Administrador', 'Proveedor'), async (req, res) => {
  const { desde, hasta } = req.query;
  if (!desde || !hasta) return res.status(400).json({ error: 'Debe indicar el rango de fechas.' });

  try {
    const ticketsResult = await pool.query(
      `SELECT t.codigo_hash, t.categoria_falla, t.estado_ticket, t.fecha_creacion, t.fecha_cierre,
              u.nombre AS cliente_nombre, u.correo AS cliente_correo
       FROM tickets_soporte t
       JOIN usuarios u ON u.id = t.cliente_id
       WHERE t.fecha_creacion BETWEEN $1 AND $2
       ORDER BY t.fecha_creacion DESC`,
      [desde, hasta]
    );

    const encuestasResult = await pool.query(
      `SELECT t.codigo_hash, u.nombre AS cliente_nombre, e.calificacion, e.comentario, e.fecha_creacion
       FROM encuestas_satisfaccion e
       JOIN tickets_soporte t ON t.id = e.ticket_id
       JOIN usuarios u ON u.id = t.cliente_id
       WHERE t.fecha_creacion BETWEEN $1 AND $2
       ORDER BY e.fecha_creacion DESC`,
      [desde, hasta]
    );

    const wb = XLSX.utils.book_new();

    const hojaTickets = XLSX.utils.json_to_sheet(ticketsResult.rows.map(r => ({
      Codigo: r.codigo_hash,
      Categoria: r.categoria_falla,
      Estado: r.estado_ticket,
      Cliente: r.cliente_nombre,
      Correo: r.cliente_correo,
      FechaCreacion: r.fecha_creacion,
      FechaCierre: r.fecha_cierre,
    })));
    XLSX.utils.book_append_sheet(wb, hojaTickets, 'Tickets');

    const hojaEncuestas = XLSX.utils.json_to_sheet(encuestasResult.rows.map(r => ({
      Codigo: r.codigo_hash,
      Cliente: r.cliente_nombre,
      Calificacion: r.calificacion,
      Comentario: r.comentario,
      Fecha: r.fecha_creacion,
    })));
    XLSX.utils.book_append_sheet(wb, hojaEncuestas, 'Encuestas');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', `attachment; filename="reporte_kpi_${desde}_a_${hasta}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(buffer);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al generar el reporte Excel.' });
  }
});

module.exports = router;