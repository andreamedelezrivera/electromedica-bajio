const { google } = require("googleapis");

module.exports = async (req, res) => {
  const { code, error } = req.query || {};

  if (error) {
    res.status(400).send(`<p>Google devolvió un error: ${error}</p>`);
    return;
  }
  if (!code) {
    res.status(400).send("<p>Falta el parámetro code en la URL.</p>");
    return;
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    res.status(500).send("<p>Faltan las variables de entorno GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET en Vercel. Configúralas primero y vuelve a intentar el link de autorización.</p>");
    return;
  }

  const redirectUri = `https://${req.headers.host}/api/oauth-callback`;
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  try {
    const { tokens } = await oauth2Client.getToken(code);
    if (!tokens.refresh_token) {
      res.status(200).send(`<html><body style="font-family:sans-serif;padding:40px;max-width:600px;margin:0 auto">
        <h2>No se recibió un refresh_token</h2>
        <p>Esto pasa si ya habías autorizado esta app antes con esta misma cuenta. Ve a
        <a href="https://myaccount.google.com/permissions" target="_blank">myaccount.google.com/permissions</a>,
        quita el acceso de la app que registraste, y vuelve a abrir el link de autorización desde cero.</p>
      </body></html>`);
      return;
    }
    res.status(200).send(`<html><body style="font-family:sans-serif;padding:40px;max-width:600px;margin:0 auto">
      <h2>Listo — copia este valor</h2>
      <p>Pégalo en Vercel como la variable <b>GOOGLE_OAUTH_REFRESH_TOKEN</b>:</p>
      <textarea readonly style="width:100%;height:100px;font-size:14px;padding:8px">${tokens.refresh_token}</textarea>
      <p style="color:#666;font-size:13px">Este valor no se guarda en ningún servidor propio, solo se te muestra aquí una vez. Después de copiarlo puedes cerrar esta página.</p>
    </body></html>`);
  } catch (e) {
    res.status(500).send(`<p>Error al intercambiar el código: ${e.message}</p>`);
  }
};
