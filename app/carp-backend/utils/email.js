const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (options) => {
  const message = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  await transporter.sendMail(message);
};

const sendPasswordResetEmail = async (email, resetUrl) => {
  const subject = 'CARP - Password Reset Request';
  const text = `You requested a password reset. Click this link to reset: ${resetUrl}\n\nThis link expires in 30 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #EA9D63;">CARP Climate & Air Research Platform</h2>
      <p>You requested a password reset.</p>
      <p>Click the button below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #EA9D63, #d48952); color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold;">Reset Password</a>
      <p style="color: #6b6f7a; font-size: 12px; margin-top: 24px;">This link expires in 30 minutes. If you didn't request this, ignore this email.</p>
    </div>
  `;

  await sendEmail({ to: email, subject, text, html });
};

module.exports = { sendEmail, sendPasswordResetEmail };
