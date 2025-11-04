import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Email configuration from environment variables
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
};

const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@receiptmanager.com';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Receipt Manager';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Create nodemailer transporter
 */
const createTransporter = () => {
  // In development, if no SMTP credentials are provided, use ethereal email (test account)
  if (process.env.NODE_ENV === 'development' && !EMAIL_CONFIG.auth.user) {
    console.log('⚠️  No SMTP credentials provided. Emails will be logged to console only.');
    console.log('💡 To send real emails, configure SMTP settings in .env file.');
    return null;
  }

  return nodemailer.createTransport(EMAIL_CONFIG);
};

/**
 * Load email template from file
 */
const loadTemplate = (templateName: string): string => {
  const templatePath = path.join(__dirname, '../templates', templateName);
  return fs.readFileSync(templatePath, 'utf-8');
};

/**
 * Replace variables in template
 */
const replaceVariables = (template: string, variables: Record<string, string>): string => {
  let result = template;
  Object.keys(variables).forEach((key) => {
    const placeholder = `{{${key}}}`;
    result = result.split(placeholder).join(variables[key]);
  });
  return result;
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  to: string,
  userName: string,
  resetToken: string
): Promise<boolean> => {
  try {
    const resetLink = `${FRONTEND_URL}/reset-password/${resetToken}`;

    // Load templates
    const htmlTemplate = loadTemplate('reset-password-email.html');
    const textTemplate = loadTemplate('reset-password-email.txt');

    // Replace variables
    const variables = {
      userName,
      resetLink,
    };

    const html = replaceVariables(htmlTemplate, variables);
    const text = replaceVariables(textTemplate, variables);

    // Create transporter
    const transporter = createTransporter();

    // If no transporter (development without SMTP), just log to console
    if (!transporter) {
      console.log('\n📧 ===== EMAIL WOULD BE SENT =====');
      console.log(`To: ${to}`);
      console.log(`Subject: Recuperação de Senha - Receipt Manager`);
      console.log(`Reset Link: ${resetLink}`);
      console.log('=====================================\n');
      return true;
    }

    // Send email
    const info = await transporter.sendMail({
      from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
      to,
      subject: 'Recuperação de Senha - Receipt Manager',
      text,
      html,
    });

    console.log('✅ Password reset email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    return false;
  }
};

/**
 * Send password changed confirmation email (optional feature)
 */
export const sendPasswordChangedEmail = async (
  to: string,
  userName: string
): Promise<boolean> => {
  try {
    const transporter = createTransporter();

    // If no transporter (development without SMTP), just log to console
    if (!transporter) {
      console.log('\n📧 ===== EMAIL WOULD BE SENT =====');
      console.log(`To: ${to}`);
      console.log(`Subject: Senha Alterada - Receipt Manager`);
      console.log('=====================================\n');
      return true;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🧾 Receipt Manager</h1>
          </div>
          <div class="content">
            <h2>Senha Alterada com Sucesso</h2>
            <p>Olá, <strong>${userName}</strong>!</p>
            <p>Sua senha foi alterada com sucesso.</p>
            <p>Se você não realizou esta alteração, entre em contato conosco imediatamente.</p>
          </div>
          <div class="footer">
            <p>Receipt Manager - Sistema de Gerenciamento de Notas Fiscais</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
RECEIPT MANAGER - Senha Alterada

Olá, ${userName}!

Sua senha foi alterada com sucesso.

Se você não realizou esta alteração, entre em contato conosco imediatamente.

---
Receipt Manager
Sistema de Gerenciamento de Notas Fiscais
    `;

    await transporter.sendMail({
      from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
      to,
      subject: 'Senha Alterada - Receipt Manager',
      text,
      html,
    });

    console.log('✅ Password changed confirmation email sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Error sending password changed email:', error);
    return false;
  }
};

/**
 * Test email configuration
 */
export const testEmailConfiguration = async (): Promise<boolean> => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.log('⚠️  Email service running in development mode (no SMTP configured)');
      return true;
    }

    await transporter.verify();
    console.log('✅ Email configuration is valid and ready to send emails');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return false;
  }
};
