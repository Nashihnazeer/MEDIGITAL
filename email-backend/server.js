// server.js
require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();

const {
  SMTP_USER,        // your Gmail address (from .env)
  SMTP_APP_PASS,    // your Gmail app password (from .env)
  PORT = 5001,      // default port (use 5001 to avoid conflicts)
  HOST = '127.0.0.1', // bind to IPv4 loopback for local dev
  FRONTEND_ORIGIN = 'http://localhost:3000'
} = process.env;

// Basic check
if (!SMTP_USER || !SMTP_APP_PASS) {
  console.error('Missing SMTP_USER or SMTP_APP_PASS in .env. Exiting.');
  process.exit(1);
}

// CORS configuration
const corsOptions = {
  origin: FRONTEND_ORIGIN,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware: parse JSON and enable CORS
app.use(express.json({ limit: '100kb' }));
app.use(cors(corsOptions)); // this handles preflight automatically

// Request logger - prints method, URL, host, origin and small body preview
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.url} - Host: ${req.headers.host || '-'} Origin: ${req.headers.origin || 'no-origin'}`
  );
  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const preview = JSON.stringify(req.body)?.slice(0, 1000);
      console.log('  body:', preview || '(empty)');
    } catch (e) {
      console.log('  body: (unserializable)');
    }
  }
  next();
});

// Create transporter (Gmail SMTP with App Password)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: SMTP_USER,
    pass: SMTP_APP_PASS
  }
});

// Verify transporter at startup
transporter.verify((err, success) => {
  if (err) {
    console.error('SMTP configuration error:', err);
  } else {
    console.log('SMTP ready — can send messages');
  }
});

// debug route (safe — does NOT expose the password)
app.get('/__debug', (req, res) => {
  res.json({
    ok: true,
    host: process.env.HOST || 'unset',
    port: process.env.PORT || 'unset',
    frontend_origin: process.env.FRONTEND_ORIGIN || 'unset',
    listening: !!process.pid
  });
});

/**
 * POST /send-email
 * Expected JSON body:
 * {
 *   name: "Full Name",
 *   mobile: "+91xxxxxxxxxx",
 *   email: "user@example.com",
 *   message: "Message body"
 * }
 */
app.post('/send-email', async (req, res) => {
  try {
    const { name, mobile, email, message } = req.body || {};

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ ok: false, error: 'Missing required fields: name, email, message' });
    }

    // Build plain text + html body
    const plainBody = `
You have a new contact form submission:

Name: ${name}
Mobile: ${mobile || 'N/A'}
Email: ${email}
Message:
${message}

-- Sent from website contact form
`.trim();

    const htmlBody = `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; background: #f9fafb; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
    <div style="background: linear-gradient(90deg, #f97316, #fb923c); padding: 16px 20px;">
      <h2 style="color: white; margin: 0; font-size: 20px;">📩 A person wanted to reach out to you</h2>
    </div>
    <div style="padding: 20px 24px;">
      <table width="100%" cellpadding="6" cellspacing="0" border="0" style="border-collapse: collapse;">
        <tr>
          <td style="width: 120px; font-weight: bold;">Name:</td>
          <td>${escapeHtml(name)}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Email:</td>
          <td>${escapeHtml(email)}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Mobile:</td>
          <td>${escapeHtml(mobile || 'N/A')}</td>
        </tr>
      </table>

      <div style="margin-top: 20px;">
        <h3 style="margin-bottom: 8px; color: #f97316;">Message</h3>
        <div style="background: #fff; border: 1px solid #eee; border-radius: 6px; padding: 12px;">
          ${escapeHtml(message).replace(/\n/g, '<br/>')}
        </div>
      </div>

      <p style="margin-top: 24px; font-size: 13px; color: #777;">
        🔗 Sent from your website contact form<br/>
        <span style="font-size: 12px;">${new Date().toLocaleString()}</span>
      </p>
    </div>
  </div>
`;

    const mailOptions = {
      from: `"Website Contact" <${SMTP_USER}>`,
      to: process.env.RECEIVER_EMAIL || 'nazeernashih@gmail.com',
      subject: `${name} wanted to reach out to you`,
      text: plainBody,
      html: htmlBody
    };

    const info = await transporter.sendMail(mailOptions);
    return res.json({ ok: true, messageId: info.messageId, response: info.response });
  } catch (err) {
    console.error('Send failed:', err);
    return res.status(500).json({ ok: false, error: err?.message || 'Send failed' });
  }
});

// health route
app.get('/', (req, res) => res.send('Email API running'));

// Listen on explicit HOST and PORT to avoid IPv6 collisions (AirPlay)
app.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT} (pid ${process.pid})`);
});

/**
 * Minimal HTML-escape helper
 */
function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}