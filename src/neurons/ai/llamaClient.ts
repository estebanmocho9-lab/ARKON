export class LlamaNotConfiguredError extends Error {}

export async function requestLlamaAssessment(systemPrompt: string, payload: unknown): Promise<string> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const token = process.env.CLOUDFLARE_API_TOKEN?.trim();
  const model = process.env.CLOUDFLARE_MODEL?.trim() || '@cf/meta/llama-3.2-3b-instruct';
  if (!accountId || !token) throw new LlamaNotConfiguredError('Faltan credenciales de Workers AI en el servidor ARKON.');
  if (/[\r\n]/.test(token)) throw new LlamaNotConfiguredError('El token de Workers AI debe guardarse en una sola línea en el servidor.');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/ai/run/${model}`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: JSON.stringify(payload) },
          ],
          temperature: 0.1,
          max_tokens: 1100,
        }),
        signal: controller.signal,
      },
    );
    const responseBody = await response.json().catch(() => null) as any;
    if (!response.ok) {
      // No incluir headers ni cuerpo completo: no filtrar credenciales ni datos.
      throw new Error(`Workers AI respondió HTTP ${response.status}.`);
    }
    const text = responseBody?.result?.response;
    if (typeof text !== 'string' || !text.trim()) throw new Error('Workers AI devolvió una respuesta vacía.');
    return text.trim();
  } catch (error: any) {
    if (error?.name === 'AbortError') throw new Error('La solicitud a Workers AI superó el límite de 25 segundos.');
    if (error instanceof LlamaNotConfiguredError) throw error;
    if (error instanceof Error && /^Workers AI respondió HTTP/.test(error.message)) throw error;
    throw new Error('No se pudo conectar con Workers AI desde ARKON.');
  } finally {
    clearTimeout(timeout);
  }
}
