import { spawn } from 'child_process';
import * as path from 'path';

export interface ResultadoDeterministaND {
  pages: any[];
  findings: any[];
}

export function ejecutarDeterministaND(buffer: Buffer, inicio = 1, fin = 999999): Promise<ResultadoDeterministaND> {
  return new Promise((resolve, reject) => {
    const script = path.join(process.cwd(), 'src/extraction-neurons/nd-deterministic/deterministic_stream.py');
    const proc = spawn('python3', [script, String(inicio), String(fin)], { stdio: ['pipe', 'pipe', 'pipe'] });
    const out: Buffer[] = [];
    const err: Buffer[] = [];
    proc.stdout.on('data', d => out.push(Buffer.from(d)));
    proc.stderr.on('data', d => err.push(Buffer.from(d)));
    proc.on('error', reject);
    proc.on('close', code => {
      if (code !== 0) return reject(new Error(`Extractor determinista terminó con código ${code}: ${Buffer.concat(err).toString('utf8')}`));
      try { resolve(JSON.parse(Buffer.concat(out).toString('utf8'))); }
      catch (e: any) { reject(new Error(`JSON inválido del extractor determinista: ${e?.message || e}`)); }
    });
    proc.stdin.end(buffer);
  });
}
