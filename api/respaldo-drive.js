const { google } = require("googleapis");

const SUPABASE_URL = "https://doxahmqcnjpjbvquuzrx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRveGFobXFjbmpwamJ2cXV1enJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMTYwOTUsImV4cCI6MjA5ODU5MjA5NX0.0ex2tu6e5ajf22r_F_uh81ySYaIMm1Y5Bk95t9CK5eU";

const NOMBRES_MES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];

function csvEscape(v) {
  const s = v === null || v === undefined ? "" : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function generarCSV(lista) {
  const filas = [["id","fecha","mensaje","para_rol","para_usuario_id","leida"]];
  lista.forEach(n => {
    filas.push([n.id, n.fecha, String(n.mensaje || "").replace(/\|/g, " "), n.para_rol || "", n.para_usuario_id || "", n.leida ? "si" : "no"]);
  });
  return filas.map(f => f.map(csvEscape).join(",")).join("\r\n");
}

async function obtenerOCrearCarpeta(drive, nombre, parentId) {
  const q = `name='${nombre.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.folder' and trashed=false and '${parentId}' in parents`;
  const listado = await drive.files.list({ q, fields: "files(id,name)" });
  if (listado.data.files && listado.data.files.length > 0) return listado.data.files[0].id;
  const creada = await drive.files.create({
    resource: { name: nombre, mimeType: "application/vnd.google-apps.folder", parents: [parentId] },
    fields: "id"
  });
  return creada.data.id;
}

module.exports = async (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers["authorization"] !== `Bearer ${secret}`) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }

  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!keyJson || !rootFolderId) {
    res.status(500).json({ error: "Faltan las variables de entorno GOOGLE_SERVICE_ACCOUNT_KEY / GOOGLE_DRIVE_FOLDER_ID en Vercel" });
    return;
  }

  let credentials;
  try {
    credentials = JSON.parse(keyJson);
  } catch (e) {
    res.status(500).json({ error: "GOOGLE_SERVICE_ACCOUNT_KEY no es un JSON válido" });
    return;
  }

  try {
    const hoy = new Date();
    const mes = hoy.getMonth() === 0 ? 11 : hoy.getMonth() - 1;
    const anio = hoy.getMonth() === 0 ? hoy.getFullYear() - 1 : hoy.getFullYear();
    const desde = new Date(anio, mes, 1).toISOString();
    const hasta = new Date(anio, mes + 1, 1).toISOString();

    const urlSel = `${SUPABASE_URL}/rest/v1/notificaciones?select=*&fecha=gte.${encodeURIComponent(desde)}&fecha=lt.${encodeURIComponent(hasta)}&order=fecha`;
    const respSel = await fetch(urlSel, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } });
    const data = await respSel.json();

    if (!Array.isArray(data) || data.length === 0) {
      res.status(200).json({ ok: true, mensaje: `Sin notificaciones de ${NOMBRES_MES[mes]} ${anio} para respaldar.` });
      return;
    }

    const csv = generarCSV(data);
    const nombreArchivo = `notificaciones_${NOMBRES_MES[mes]}_${anio}.csv`;

    const auth = new google.auth.GoogleAuth({ credentials, scopes: ["https://www.googleapis.com/auth/drive"] });
    const drive = google.drive({ version: "v3", auth });

    const carpetaAnioId = await obtenerOCrearCarpeta(drive, String(anio), rootFolderId);

    await drive.files.create({
      resource: { name: nombreArchivo, parents: [carpetaAnioId] },
      media: { mimeType: "text/csv", body: csv }
    });

    const ids = data.map(n => n.id).join(",");
    await fetch(`${SUPABASE_URL}/rest/v1/notificaciones?id=in.(${ids})`, {
      method: "DELETE",
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
    });

    res.status(200).json({ ok: true, archivo: nombreArchivo, cantidad: data.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
