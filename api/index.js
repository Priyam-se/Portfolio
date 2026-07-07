const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Serve static frontend files (index.html, style.css, script.js)
app.use(express.static(path.join(__dirname, '..')));

// Custom package-free .env loader
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        // Join remaining parts to handle values with '=' in them
        const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
        process.env[key] = val;
      }
    });
    console.log('[System] Custom environment variables loaded.');
  } catch (err) {
    console.error('[System Error] Failed to read .env file:', err);
  }
}

// Set up email transporter
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS.replace(/\s+/g, '') // strip spaces from Google App Password UI
    }
  });
  console.log('[Email] Transporter configured successfully for Gmail.');
} else {
  console.log('[Email] No EMAIL_USER and EMAIL_PASS variables found in .env.');
  console.log('[Email] Emails will NOT be forwarded. Running in local JSON-log fallback mode.');
}

const MESSAGES_FILE = path.join(__dirname, '..', 'messages.json');

// POST endpoint to handle form submissions
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const newMessage = {
    id: Date.now(),
    name,
    email,
    message,
    timestamp: new Date().toISOString()
  };

  // 1. Read and backup messages locally to JSON database
  let messages = [];
  if (fs.existsSync(MESSAGES_FILE)) {
    try {
      const fileData = fs.readFileSync(MESSAGES_FILE, 'utf8');
      messages = JSON.parse(fileData);
    } catch (err) {
      console.error('Error reading messages file:', err);
    }
  }

  messages.push(newMessage);

  try {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf8');
    console.log(`[Backend] Message logged locally from: ${name} <${email}>`);
  } catch (err) {
    console.error('Error saving message to disk:', err);
  }

  // 2. Forward the message to Priyam's email if SMTP is configured
  if (transporter) {
    const mailOptions = {
      from: `Portfolio Contact <${process.env.EMAIL_USER}>`,
      to: 'priyampratyushpanda@gmail.com',
      subject: `New Portfolio Message from ${name}`,
      text: `You received a new message on your portfolio contact form:\n\nSender: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\n---\nLogged locally at: ${newMessage.timestamp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('[Email Error] Failed to forward email:', error);
      } else {
        console.log('[Email Success] Message forwarded successfully to priyampratyushpanda@gmail.com:', info.response);
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Transmission successfully logged locally and dispatched to email.'
    });
  }

  // Local-only response
  return res.status(200).json({
    success: true,
    message: 'Transmission logged locally. (Email dispatch inactive: Configure .env to enable email forwarding)'
  });
});

// Fallback to serve index.html for undefined routes
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`  [Express Server] Running on http://localhost:${PORT}`);
    console.log(`  Serving static assets and exposing API routes.`);
    console.log(`==================================================\n`);
  });
}

module.exports = app;
