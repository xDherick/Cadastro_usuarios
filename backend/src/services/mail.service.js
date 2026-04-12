// src/services/mail.service.js
const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // STARTTLS na porta 587
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
};

const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
  const transporter = createTransporter();

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recuperação de senha</title>
    </head>
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',system-ui,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              <tr>
                <td style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:32px;text-align:center;">
                  <div style="display:inline-block;width:48px;height:48px;background:rgba(255,255,255,0.2);border-radius:12px;line-height:48px;font-size:20px;font-weight:700;color:#fff;">US</div>
                  <h1 style="margin:16px 0 0;color:#ffffff;font-size:20px;font-weight:600;">Recuperação de senha</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:36px 32px;">
                  <p style="margin:0 0 8px;font-size:16px;color:#0f172a;">Olá, <strong>${name}</strong>!</p>
                  <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.6;">
                    Recebemos uma solicitação para redefinir a senha da sua conta.
                    Clique no botão abaixo para criar uma nova senha.
                  </p>
                  <div style="text-align:center;margin-bottom:28px;">
                    <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#ffffff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:600;">
                      Redefinir minha senha
                    </a>
                  </div>
                  <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;text-align:center;">
                    Este link expira em <strong>15 minutos</strong>.
                  </p>
                  <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;">
                    Se você não solicitou a redefinição, ignore este e-mail.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:0 32px 32px;">
                  <div style="background:#f8fafc;border-radius:8px;padding:14px;border:1px solid #e2e8f0;">
                    <p style="margin:0 0 6px;font-size:12px;color:#94a3b8;">Se o botão não funcionar, copie o link abaixo:</p>
                    <p style="margin:0;font-size:12px;color:#2563eb;word-break:break-all;">${resetUrl}</p>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 32px;border-top:1px solid #f1f5f9;text-align:center;">
                  <p style="margin:0;font-size:12px;color:#cbd5e1;">User System &copy; ${new Date().getFullYear()}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.MAIL_FROM || `"User System" <${process.env.MAIL_USER}>`,
    to,
    subject: 'Redefinição de senha — User System',
    html,
  });
};

const verifyMailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Conexão com Gmail estabelecida.');
  } catch (err) {
    console.warn('⚠️  Gmail não configurado:', err.message);
  }
};

module.exports = { sendPasswordResetEmail, verifyMailConnection };
