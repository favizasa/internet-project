const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function enviarCorreo(destinatario, asunto, html) {
  if (!destinatario) {
    console.error('[mailer] No se puede enviar el correo: falta el destinatario.');
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"WISP Pachacútec" <${process.env.GMAIL_USER}>`,
      to: destinatario,
      subject: asunto,
      html,
    });
    console.log('[mailer] Correo enviado a', destinatario, '->', info.messageId);
  } catch (err) {
    console.error('[mailer] Error al enviar correo:', err);
  }
}

module.exports = { enviarCorreo };