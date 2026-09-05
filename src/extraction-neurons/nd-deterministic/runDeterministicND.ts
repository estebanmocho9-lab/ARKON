import { spawn } from 'child_process';
import * as path from 'path';

export interface ResultadoDeterministaND {
  pages: any[];
  findings: any[];
}

export function ejecutarDeterministaND(
  buffer: Buffer,
  inicio = 1,
  fin = 999999
): Promise<ResultadoDeterministaND> {
  return new Promise((resolve, reject) => {
    const script = path.join(process.cwd(), 'src/extraction-neurons/nd-deterministic/deterministic_stream.py');
    const proc = spawn('python3', [script, String(inicio), String(fin)], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const out: Buffer[] = [];
    const err: Buffer[] = [];
    let settled = false;

    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      reject(error);
    };

    proc.stdout.on('data', d => out.push(Buffer.from(d)));
    proc.stderr.on('data', d => err.push(Buffer.from(d)));
    proc.on('error', fail);

    // Si el extractor termina antes de consumir todo el PDF, Node puede emitir
    // EPIPE al cerrar stdin. No dejamos que ese error mate el runner ND: el
    // cierre del proceso es la fuente de verdad y se informa mediante stderr.
    proc.stdin.on('error', () => {});

    proc.on('close', code => {
      if (settled) return;
      const stderr = Buffer.concat(err).toString('utf8').trim();
      const stdout = Buffer.concat(out).toString('utf8').trim();
      if (code !== 0) {
        fail(new Error(`Extractor determinista terminó con código ${code}: ${stderr || stdout.slice(0,1000)}`));
        return;
      }
      try {
        const resultado = JSON.parse(stdout);
        settled = true;
        resolve({ pages: Array.isArray(resultado.pages) ? resultado.pages : [], findings: Array.isArray(resultado.findings) ? resultado.findings : [] });
      } catch (e: any) {
        fail(new Error(`JSON inválido del extractor determinista: ${e?.message || e}\nSTDERR:\n${stderr}\nSTDOUT:\n${stdout.slice(0,1000)}`));
      }
    });

    proc.stdin.end(buffer);
  });
}
