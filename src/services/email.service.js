const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  /**
   * Envía email de verificación
   */
  async sendVerificationEmail(email, token) {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Verifica tu email',
      html: `
        <h2>¡Bienvenido!</h2>
        <p>Por favor, verifica tu email haciendo click en el siguiente enlace:</p>
        <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verificar Email
        </a>
        <p>O copia este enlace en tu navegador:</p>
        <p>${verificationLink}</p>
        <p>Este enlace expirará en 24 horas.</p>
        <p>Si no creaste esta cuenta, ignora este email.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email de verificación enviado a ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      return false;
    }
  }

  /**
   * Envía email de password reset
   */
  async sendPasswordResetEmail(email, token) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Recupera tu contraseña',
      html: `
        <h2>Recuperar Contraseña</h2>
        <p>Recibimos una solicitud para recuperar tu contraseña.</p>
        <a href="${resetLink}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Recuperar Contraseña
        </a>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si no solicitaste esto, ignora este email.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      return false;
    }
  }
  /**
 * Envía email de password reset
 */
async sendPasswordResetEmail(email, token) {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Recupera tu contraseña',
    html: `
      <h2>Recuperar Contraseña</h2>
      <p>Recibimos una solicitud para recuperar tu contraseña.</p>
      <p>Haz click en el siguiente enlace para cambiar tu contraseña:</p>
      <a href="${resetLink}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Recuperar Contraseña
      </a>
      <p>O copia este enlace en tu navegador:</p>
      <p>${resetLink}</p>
      <p>Este enlace expirará en 1 hora.</p>
      <p>Si no solicitaste esto, ignora este email.</p>
    `
  };

  try {
    await this.transporter.sendMail(mailOptions);
    console.log(`✅ Email de reset enviado a ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return false;
  }
}
}

module.exports = new EmailService();