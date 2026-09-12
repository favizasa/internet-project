const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { enviarCorreo } = require('../utils/mailer');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { nombre, tipoDocumento, numeroDocumento, celular, correo, password } = req.body;

  if (!nombre || !numeroDocumento || !correo || !password) {
    // Flujo Alterno A2
    return res.status(400).json({ error: 'Complete los campos requeridos con el formato correcto.' });
  }

  const correoNormalizado = correo.toLowerCase().trim();
  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoNormalizado);
  if (!correoValido) {
    return res.status(400).json({ error: 'El formato del correo electrónico no es válido.' });
  }

  try {
    const existente = await pool.query(
      'SELECT id FROM usuarios WHERE correo = $1 OR (tipo_documento = $2 AND numero_documento = $3)',
      [correoNormalizado, tipoDocumento || 'DNI', numeroDocumento]
    );

    if (existente.rows.length > 0) {
      // Flujo Alterno A1
      return res.status(409).json({ error: 'El usuario ya se encuentra registrado en el sistema.' });
    }

    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO usuarios (nombre, tipo_documento, numero_documento, celular, correo, contrasenia_hash, rol)
       VALUES ($1, $2, $3, $4, $5, $6, 'Cliente')
       RETURNING id, nombre, correo, rol`,
      [nombre, tipoDocumento || 'DNI', numeroDocumento, celular || null, correoNormalizado, hash]
    );

    return res.status(201).json({ mensaje: 'Cuenta creada con éxito.', usuario: result.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno al registrar el usuario.' });
  }
});

router.post('/login', async (req, res) => {
  const { correo, password } = req.body;
  if (!correo || !password) {
    return res.status(400).json({ error: 'Usuario o contraseña inválidos.' });
  }

  try {
    const result = await pool.query(
      'SELECT id, nombre, correo, contrasenia_hash, rol FROM usuarios WHERE correo = $1',
      [correo.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      // Por seguridad no se especifica cuál campo falló
      return res.status(401).json({ error: 'Usuario o contraseña inválidos.' });
    }

    const usuario = result.rows[0];
    const passwordOk = await bcrypt.compare(password, usuario.contrasenia_hash);
    if (!passwordOk) {
      return res.status(401).json({ error: 'Usuario o contraseña inválidos.' });
    }

    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo, rol: usuario.rol, nombre: usuario.nombre },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno al iniciar sesión.' });
  }
});

router.post('/olvide-clave', async (req, res) => {
  const { correo } = req.body;
  if (!correo) return res.status(400).json({ error: 'Ingrese su correo electrónico.' });

  const correoNormalizado = correo.toLowerCase().trim();

  try {
    const usuario = await pool.query(`SELECT id, nombre FROM usuarios WHERE correo = $1`, [correoNormalizado]);

    if (usuario.rows.length === 0) {
      // Correo no registrado: se lo indicamos directamente al usuario
      return res.status(404).json({ error: 'Este correo electrónico no se encuentra registrado en el sistema.' });
    }

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expira = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    await pool.query(
      `INSERT INTO password_resets (usuario_id, codigo, expira) VALUES ($1, $2, $3)`,
      [usuario.rows[0].id, codigo, expira]
    );

    enviarCorreo(
      correoNormalizado,
      'Código para restablecer tu contraseña',
      `<p>Hola ${usuario.rows[0].nombre},</p>
       <p>Tu código de verificación es:</p>
       <h2 style="letter-spacing:4px;">${codigo}</h2>
       <p>Este código expira en 15 minutos. Si no solicitaste esto, ignora este mensaje.</p>`
    );

    return res.json({ mensaje: 'Se envió un código de recuperación a tu correo electrónico.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al procesar la solicitud.' });
  }
});

router.post('/restablecer-clave', async (req, res) => {
  const { correo, codigo, nuevaPassword } = req.body;
  if (!correo || !codigo || !nuevaPassword) {
    return res.status(400).json({ error: 'Complete todos los campos.' });
  }

  const correoNormalizado = correo.toLowerCase().trim();

  try {
    const usuario = await pool.query(`SELECT id FROM usuarios WHERE correo = $1`, [correoNormalizado]);
    if (usuario.rows.length === 0) {
      return res.status(404).json({ error: 'Este correo electrónico no se encuentra registrado en el sistema.' });
    }

    const reset = await pool.query(
      `SELECT * FROM password_resets
       WHERE usuario_id = $1 AND codigo = $2 AND usado = false AND expira > now()
       ORDER BY fecha_creacion DESC LIMIT 1`,
      [usuario.rows[0].id, codigo]
    );
    if (reset.rows.length === 0) return res.status(400).json({ error: 'Código inválido o expirado.' });

    const nuevoHash = await bcrypt.hash(nuevaPassword, 10);
    await pool.query(`UPDATE usuarios SET contrasenia_hash = $1 WHERE id = $2`, [nuevoHash, usuario.rows[0].id]);
    await pool.query(`UPDATE password_resets SET usado = true WHERE id = $1`, [reset.rows[0].id]);

    return res.json({ mensaje: 'Contraseña actualizada correctamente.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al restablecer la contraseña.' });
  }
});

module.exports = router;