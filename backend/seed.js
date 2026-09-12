require('dotenv').config();
const bcrypt = require('bcrypt');
const { pool } = require('./db');

async function seed() {
  try {
    const passwordHash = await bcrypt.hash('123456', 10);

    console.log('Creando usuarios...');

    // ---------- Administrador ----------
    const admin = await pool.query(
      `INSERT INTO usuarios (nombre, tipo_documento, numero_documento, celular, correo, contrasenia_hash, rol)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      ['Ricardo Gálvez', 'DNI', '10000001', '999000001', 'admin@wisp.com', passwordHash, 'Administrador']
    );

    // ---------- Soporte ----------
    const soporte1 = await pool.query(
      `INSERT INTO usuarios (nombre, tipo_documento, numero_documento, celular, correo, contrasenia_hash, rol)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      ['Kenyer Bacilio', 'DNI', '10000002', '999000002', 'soporte@wisp.com', passwordHash, 'Soporte']
    );
    const soporte2 = await pool.query(
      `INSERT INTO usuarios (nombre, tipo_documento, numero_documento, celular, correo, contrasenia_hash, rol)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      ['Renzo Rengifo', 'DNI', '10000003', '999000003', 'soporte2@wisp.com', passwordHash, 'Soporte']
    );

    // ---------- Proveedor ----------
    const proveedorUsuario = await pool.query(
      `INSERT INTO usuarios (nombre, tipo_documento, numero_documento, celular, correo, contrasenia_hash, rol)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      ['Fabian Ñiquen (WISP Ventanilla Net)', 'RUC', '20600001001', '999000004', 'proveedor@wisp.com', passwordHash, 'Proveedor']
    );

    const proveedor = await pool.query(
      `INSERT INTO proveedores_wisp (usuario_id, ruc, razon_social, zona_cobertura_texto, estado_licencia)
       VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [proveedorUsuario.rows[0].id, '20600001001', 'WISP Ventanilla Net S.A.C.', 'Pachacútec - Ventanilla', 'Activo']
    );

    // ---------- Clientes ----------
    const clientesData = [
      ['Saul Hernandez', '70000001', '987000001', 'cliente1@wisp.com'],
      ['María Torres', '70000002', '987000002', 'cliente2@wisp.com'],
      ['Jorge Salazar', '70000003', '987000003', 'cliente3@wisp.com'],
      ['Lucía Ramos', '70000004', '987000004', 'cliente4@wisp.com'],
    ];
    const clientesIds = [];
    for (const [nombre, doc, cel, correo] of clientesData) {
      const r = await pool.query(
        `INSERT INTO usuarios (nombre, tipo_documento, numero_documento, celular, correo, contrasenia_hash, rol)
         VALUES ($1,'DNI',$2,$3,$4,$5,'Cliente') RETURNING id`,
        [nombre, doc, cel, correo, passwordHash]
      );
      clientesIds.push(r.rows[0].id);
    }

    console.log('Creando planes de internet...');

    const planesData = [
      ['Plan Fibra Hogar 100', 'Fibra', 100, 79.90, 'Sector E - Pachacútec'],
      ['Plan Antena Básico 20', 'Antena', 20, 49.90, 'Sector B - Pachacútec'],
      ['Plan Fibra Pro 200', 'Fibra', 200, 99.90, 'Sector C - Ventanilla'],
      ['Plan Híbrido 50', 'Híbrido', 50, 64.90, 'Sector D - Pachacútec'],
    ];
    const planesIds = [];
    for (const [nombre, tipo, vel, precio, zona] of planesData) {
      const r = await pool.query(
        `INSERT INTO planes_internet (proveedor_id, nombre_plan, tipo_tecnologia, velocidad_mbps, precio_mensual, zona_cobertura, soporte, estado_activo)
         VALUES ($1,$2,$3,$4,$5,$6,'24/7',true) RETURNING id`,
        [proveedor.rows[0].id, nombre, tipo, vel, precio, zona]
      );
      planesIds.push(r.rows[0].id);
    }

    console.log('Creando solicitudes de servicio...');

    for (let i = 0; i < clientesIds.length; i++) {
      await pool.query(
        `INSERT INTO solicitudes_servicio (cliente_id, plan_id, sector, manzana, lote, referencia, horario_preferido, fecha_creacion)
         VALUES ($1,$2,$3,$4,$5,$6,$7, now() - interval '${i * 7} days')`,
        [clientesIds[i], planesIds[i % planesIds.length], `Sector ${String.fromCharCode(65 + i)}`, `Mz ${i + 1}`, `Lt ${i + 5}`, 'Casa de dos pisos, fachada celeste', 'Mañana']
      );
    }

    console.log('Creando tickets en distintos estados...');

    const categorias = ['Sin señal / Pérdida de Enlace', 'Lentitud / Micro-cortes', 'Falla de Equipamiento'];

    // Tickets Pendientes
    for (let i = 0; i < 2; i++) {
      await pool.query(
        `INSERT INTO tickets_soporte (codigo_hash, cliente_id, tecnico_id, categoria_falla, descripcion, estado_ticket, fecha_asignacion, fecha_creacion)
         VALUES ($1,$2,$3,$4,$5,'Pendiente', now(), now() - interval '${i} days')`,
        ['#' + Math.random().toString(36).substring(2, 8).toUpperCase(), clientesIds[i], soporte1.rows[0].id, categorias[i % 3], 'Mi internet se fue, tengo varias horas sin conexión.']
      );
    }

    // Tickets En Proceso
    for (let i = 0; i < 2; i++) {
      await pool.query(
        `INSERT INTO tickets_soporte (codigo_hash, cliente_id, tecnico_id, categoria_falla, descripcion, estado_ticket, fecha_asignacion, fecha_creacion)
         VALUES ($1,$2,$3,$4,$5,'En Proceso', now(), now() - interval '${i + 3} days')`,
        ['#' + Math.random().toString(36).substring(2, 8).toUpperCase(), clientesIds[(i + 1) % 4], soporte2.rows[0].id, categorias[(i + 1) % 3], 'La señal se corta cada cierto tiempo durante el día.']
      );
    }

    // Tickets Resueltos (con encuesta)
    const resueltosIds = [];
    for (let i = 0; i < 4; i++) {
      const r = await pool.query(
        `INSERT INTO tickets_soporte (codigo_hash, cliente_id, tecnico_id, categoria_falla, descripcion, estado_ticket, diagnostico_tecnico, acciones_realizadas, fecha_asignacion, fecha_creacion, fecha_cierre)
         VALUES ($1,$2,$3,$4,$5,'Resuelto',$6,$7, now(), now() - interval '${(i + 5) * 3} days', now() - interval '${(i + 4) * 3} days')
         RETURNING id`,
        [
          '#' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          clientesIds[i % 4], soporte1.rows[0].id, categorias[i % 3],
          'El servicio presentaba intermitencia.',
          'Se validó nivel de señal óptico y potencia de enlace.',
          'Se reinició el equipo ONU/antena de forma remota y se estabilizó la conexión.'
        ]
      );
      resueltosIds.push(r.rows[0].id);
    }

    // Ticket Escalado
    await pool.query(
      `INSERT INTO tickets_soporte (codigo_hash, cliente_id, tecnico_id, categoria_falla, descripcion, estado_ticket, diagnostico_tecnico, acciones_realizadas, fecha_asignacion, fecha_creacion)
       VALUES ($1,$2,$3,$4,$5,'Escalado',$6,$7, now(), now() - interval '2 days')`,
      [
        '#' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        clientesIds[2], soporte2.rows[0].id, 'Falla de Equipamiento',
        'Antena parece estar dañada físicamente por el clima.',
        'Se detectó desalineación física del equipo.',
        'Requiere reemplazo de antena PoE en sitio.'
      ]
    );

    console.log('Creando encuestas de satisfacción...');

    const calificaciones = [5, 4, 5, 3];
    const comentarios = [
      'Excelente atención, resolvieron rápido.',
      'Buen servicio, aunque tardó un poco.',
      'Muy conforme, el técnico fue muy amable.',
      'La solución funcionó pero tuve que esperar bastante.',
    ];
    for (let i = 0; i < resueltosIds.length; i++) {
      await pool.query(
        `INSERT INTO encuestas_satisfaccion (ticket_id, calificacion, comentario, fecha_creacion)
         VALUES ($1,$2,$3, now() - interval '${i * 2} days')`,
        [resueltosIds[i], calificaciones[i], comentarios[i]]
      );
    }

    console.log(' Seed completado con éxito. Usuarios creados con contraseña: 123456');
    console.log('   Administrador: admin@wisp.com');
    console.log('   Soporte:       soporte@wisp.com / soporte2@wisp.com');
    console.log('   Proveedor:     proveedor@wisp.com');
    console.log('   Clientes:      cliente1@wisp.com ... cliente4@wisp.com');
  } catch (err) {
    console.error('Error en el seed:', err);
  } finally {
    await pool.end();
  }
}

seed();