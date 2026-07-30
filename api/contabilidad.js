const SUPABASE_URL = "https://doxahmqcnjpjbvquuzrx.supabase.co";
const TABLAS_PERMITIDAS = [
  "contab_movimientos",
  "contab_cuentas_cobrar",
  "contab_cuentas_pagar",
  "contab_nomina",
  "contab_proveedores",
  "contab_recibos"
];
const METODOS_PERMITIDOS = ["GET", "POST", "PATCH", "DELETE"];
const USUARIOS_CON_ACCESO = { 1: "rw", 2: "r" }; // 1=Andrea (lectura+escritura), 2=Guillermo (solo lectura)

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }

  const { usuario_id, pin, tabla, metodo, query, datos } = req.body || {};

  if (!TABLAS_PERMITIDAS.includes(tabla)) {
    res.status(400).json({ error: "Tabla no permitida" });
    return;
  }
  if (!METODOS_PERMITIDOS.includes(metodo)) {
    res.status(400).json({ error: "Método de consulta no permitido" });
    return;
  }

  const nivel = USUARIOS_CON_ACCESO[usuario_id];
  if (!nivel) {
    res.status(403).json({ error: "Sin acceso a Administración" });
    return;
  }
  if (nivel === "r" && metodo !== "GET") {
    res.status(403).json({ error: "Acceso de solo lectura" });
    return;
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    res.status(500).json({ error: "Falta la variable de entorno SUPABASE_SERVICE_ROLE_KEY en Vercel" });
    return;
  }

  try {
    const verifResp = await fetch(
      `${SUPABASE_URL}/rest/v1/usuarios?id=eq.${encodeURIComponent(usuario_id)}&pin=eq.${encodeURIComponent(pin || "")}&select=id`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
    );
    const verifData = await verifResp.json();
    if (!verifResp.ok || !Array.isArray(verifData) || verifData.length === 0) {
      res.status(401).json({ error: "PIN incorrecto" });
      return;
    }

    const url = `${SUPABASE_URL}/rest/v1/${tabla}${query ? `?${query}` : ""}`;
    const headers = {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json"
    };
    if (metodo === "POST" || metodo === "PATCH") headers["Prefer"] = "return=representation";

    const proxyResp = await fetch(url, {
      method: metodo,
      headers,
      body: metodo === "GET" || metodo === "DELETE" ? undefined : JSON.stringify(datos)
    });
    const proxyData = await proxyResp.json().catch(() => null);
    res.status(proxyResp.status).json(proxyData);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
