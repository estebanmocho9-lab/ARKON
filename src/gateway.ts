import 'dotenv/config';
import express from 'express';
import { spawn } from 'child_process';
import path from 'path';

const app = express();
const PORT = Number(process.env.PORT || 10000);
const INTERNAL_PORT = 3000;
const CHILD_URL = `http://127.0.0.1:${INTERNAL_PORT}`;

app.use(express.json({ limit: '2mb' }));

const child = spawn(process.execPath, [path.join(__dirname, 'server.js')], {
  env: process.env,
  stdio: ['ignore', 'pipe', 'pipe'],
});

child.stdout.on('data', (chunk) => process.stdout.write(`[ARKON] ${chunk}`));
child.stderr.on('data', (chunk) => process.stderr.write(`[ARKON] ${chunk}`));
child.on('exit', (code) => {
  console.error(`ARKON internal server exited with code ${code ?? 'unknown'}`);
  process.exit(code ?? 1);
});

async function proxyToArkon(req: express.Request, res: express.Response) {
  const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : JSON.stringify(req.body ?? {});

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(`${CHILD_URL}${req.originalUrl}`, {
        method: req.method,
        headers: {
          'content-type': 'application/json',
          ...(req.headers.authorization ? { authorization: req.headers.authorization } : {}),
        },
        body,
      });

      const contentType = response.headers.get('content-type');
      if (contentType) res.setHeader('content-type', contentType);
      res.status(response.status).send(await response.text());
      return;
    } catch (error) {
      if (attempt === 3) {
        res.status(502).json({ success: false, error: 'ARKON interno no está disponible.' });
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
    }
  }
}

app.post('/api/neural-analysis', async (req, res) => {
  const { materialId, contexto = 'general', estado } = req.body ?? {};

  if (typeof materialId !== 'string' || !materialId.trim()) {
    return res.status(400).json({ success: false, error: 'materialId es obligatorio.' });
  }

  if (contexto !== 'general') {
    return res.status(400).json({ success: false, error: 'Este endpoint de Impulso Vector utiliza contexto general.' });
  }

  try {
    const { activarNeuronas } = await import('./core/activationEngine');
    const result = await activarNeuronas(materialId.trim(), 'general', typeof estado === 'string' ? estado : undefined);

    return res.json({
      ok: true,
      motor: 'ARKON activationEngine',
      contexto: 'general',
      ...result,
    });
  } catch (error) {
    console.error('Neural analysis error:', error);
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

app.use(proxyToArkon);

const server = app.listen(PORT, () => {
  console.log(`ARKON public gateway running on port ${PORT}`);
});

function shutdown() {
  child.kill('SIGTERM');
  server.close(() => process.exit(0));
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
