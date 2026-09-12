require('dotenv').config();
const bcrypt = require('bcrypt');
const { pool } = require('./db');

async function main() {
  const correo = 'admin@wisp.com';
  const passwordAProbar = process.argv[2];

  const result = await pool.query('SELECT correo, contrasenia_hash FROM usuarios WHERE correo = $1', [correo]);
  if (result.rows.length === 0) {
    console.log('No se encontro ese usuario en la base de datos.');
    await pool.end();
    return;
  }

  const usuario = result.rows[0];
  console.log('Hash guardado:', usuario.contrasenia_hash);

  const coincide = await bcrypt.compare(passwordAProbar, usuario.contrasenia_hash);
  console.log('Coincide la contrasena "' + passwordAProbar + '"?', coincide);

  await pool.end();
}

main();
