// Startet den Produktions-Build zum Ausprobieren auf diesem Rechner, ohne HTTPS.
// Nicht für den Schulbetrieb: Dort läuft `node build` hinter einem HTTPS-Proxy.
import { createServer } from 'node:http';

process.env.PROTOCOL_HEADER = 'x-forwarded-proto';
process.env.BIBERDAMM_INSECURE_COOKIES = '1';

const { handler } = await import('../build/handler.js');
const port = Number(process.env.PORT ?? 3000);

createServer((req, res) => {
  req.headers['x-forwarded-proto'] = 'http';
  handler(req, res);
}).listen(port, '127.0.0.1', () => console.log(`Biberdamm läuft auf http://localhost:${port}`));
