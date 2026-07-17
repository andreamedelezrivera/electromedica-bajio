module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }

  const { to, texto } = req.body || {};
  if (!to || !texto) {
    res.status(400).json({ error: "Faltan datos (to, texto)" });
    return;
  }

  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    res.status(500).json({ error: "Faltan las variables de entorno WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID en Vercel" });
    return;
  }

  const numeroLimpio = String(to).replace(/\D/g, "");
  const numeroConLada = numeroLimpio.length === 10 ? `52${numeroLimpio}` : numeroLimpio;

  try {
    const resp = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: numeroConLada,
        type: "text",
        text: { body: texto }
      })
    });
    const data = await resp.json();
    if (!resp.ok) {
      res.status(resp.status).json({ error: data?.error?.message || "Error de WhatsApp Cloud API", detalle: data });
      return;
    }
    res.status(200).json({ ok: true, id: data?.messages?.[0]?.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
