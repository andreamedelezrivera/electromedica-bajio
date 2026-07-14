const nodemailer = require("nodemailer");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }

  const { to, subject, texto } = req.body || {};
  if (!to || !subject || !texto) {
    res.status(400).json({ error: "Faltan datos (to, subject, texto)" });
    return;
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    res.status(500).json({ error: "Faltan las variables de entorno GMAIL_USER / GMAIL_APP_PASSWORD en Vercel" });
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass }
    });
    await transporter.sendMail({
      from: `"Electromédica del Bajío" <${user}>`,
      to,
      subject,
      text: texto
    });
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
