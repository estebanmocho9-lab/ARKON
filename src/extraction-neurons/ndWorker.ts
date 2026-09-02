import { spawn } from 'child_process';
import http from 'http';

const PORT = Number(process.env.PORT || 10000);
const INTERVAL_MS = Number(process.env.ND_INTERVAL_MS || 30000);
let running = false;

function ejecutarND() {
  if (running) return;
  running = true;
  console.log('[ND-WORKER] iniciando pasada ND');

  const child = spawn('npm', ['run', 'extraer:nd:01'], {
    stdio: 'inherit',
    env: process.env,
    shell: true,
  });

  child.on('exit', (code, signal) => {
    running = false;
    console.log(`[ND-WORKER] pasada finalizada code=${code ?? 'null'} signal=${signal ?? 'null'}`);
  });
  child.on('error', (err) => {
    running = false;
    console.error('[ND-WORKER] error ejecutando ND:', err.message);
  });
}

const server = http.createServer((_req, res) => {
  res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ service: 'ARKON-ND-EXTRACTION', running, ok: true }));
});

server.listen(PORT, () => {
  console.log(`[ND-WORKER] HTTP activo en ${PORT}`);
  ejecutarND();
  setInterval(ejecutarND, INTERVAL_MS);
});
