require('dotenv').config();
const { enviarCorreo } = require('./utils/mailer');

console.log('Enviando correo de prueba...');
console.log('GMAIL_USER:', process.env.GMAIL_USER);
console.log('GMAIL_APP_PASSWORD length:', process.env.GMAIL_APP_PASSWORD?.length);

enviarCorreo(
  process.env.GMAIL_USER,
  'Correo de prueba WISP',
  '<p>Si ves esto, el envío de correos funciona correctamente.</p>'
).then(() => {
  console.log('Terminado (revisa arriba si hubo error).');
});