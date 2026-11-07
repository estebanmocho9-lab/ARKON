# ARKON AI-neuron agents / Agentes IA de ARKON

## Español

### Qué cambia

La capa conserva `ALL_NEURONS` y el motor numérico científico. La implementación IA de cada neurona directa está integrada en su archivo físico original `src/neurons/physical/N001...N050`: cada módulo contiene su propio perfil `AINeuronProfile` con núcleo, definición, instrucciones de método, cables, subcables, unidades, términos de búsqueda y metadatos científicos. La clase pública histórica de cada módulo extiende `AgenticNeuron` y entrega ese perfil definido localmente; no es un wrapper vacío que importe otro perfil. `src/neurons/ai/neurons/index.ts` instancia esas 50 clases físicas como registro activo `DIRECT_AI_NEURONS`. `AgenticNeuron.buildSystemInstruction()` construye las instrucciones particulares que recibe Llama.

`src/neurons/ai/motherBrain.ts` es el punto central que recibe la solicitud de ARKON y coordina las neuronas-agente y el cliente Llama. Si la solicitud indica una propiedad, activa esa neurona raíz y recorre recursivamente sus cables directos, propiedades relacionadas y subcables para activar todas las neuronas directas dependientes. Si no se indica una propiedad concreta, ejecuta el análisis integral con las 50 neuronas directas. No hay una lista piloto fija ni un límite artificial de 6 o 12 neuronas; la concurrencia se controla por lotes para no saturar el proveedor. Cada neurona consulta Turso con sus propios términos, unidades y requisitos de evidencia, recibe el contexto científico pertinente de Supabase y devuelve una evaluación estructurada. La solicitud también lleva el estado indicado por el operador; si no hay estado o la fuente no lo identifica, el agente debe marcarlo como desconocido y pedir revisión.

### Flujo y privacidad

La ruta de Vercel `/api/analizar` solicita la rama `includeAiNeurons` y reenvía el código de estado. ARKON comprueba `X-ARKON-TOKEN` antes de ejecutar la rama IA en producción. Esta capa usa un cliente Turso independiente con `ARKON_AI_TURSO_DATABASE_URL` y `ARKON_AI_TURSO_AUTH_TOKEN`; no reutiliza ni cae como respaldo a la cuenta Turso del extractor. En modo solo lectura consulta tablas declaradas por el esquema ND, como `nd_hallazgos_raw` y `nd_datos_entidad`, mediante SQL fijo y parámetros enlazados. El servidor usa el cliente Supabase que ya tiene ARKON y entrega a Llama los fragmentos seleccionados y reglas/fórmulas/cruces/TRIZ pertinentes; nunca entrega credenciales ni acceso directo a cuentas o bases de datos.

La salida conserva documento, página cuando existe, fragmento, valor, unidad, método y condición de ensayo. El servidor descarta citas que no correspondan a IDs recuperados y descarta un valor numérico de Llama si no coincide exactamente con una fuente citada. La capa no escribe en Supabase ni modifica Google Sheets. Una evaluación documental no certifica un producto ni reemplaza ensayos físicos.

### Sincronización de la extracción ND hacia Turso IA

La extracción ND vigente persiste sus hallazgos en la hoja `ND_HALLAZGOS` de Google Sheets; no escribe directamente en Turso. Por eso, crear una cuenta Turso IA vacía no basta para que las neuronas encuentren evidencia.

Después de ejecutar la extracción ND, sincronizar la hoja hacia la cuenta dedicada desde el entorno local que tenga acceso a Google Sheets mediante gcloud y las dos variables `ARKON_AI_TURSO_DATABASE_URL` / `ARKON_AI_TURSO_AUTH_TOKEN`:

```bash
npm run sync:ai-turso
```

El proceso copia/upserta los hallazgos en `nd_hallazgos_raw` de Turso IA y prepara las tablas de consulta relacionadas. No modifica la hoja, el Turso original del extractor ni las filas fuente. Repetirlo después de nuevas extracciones para actualizar la copia. La cuenta IA sigue siendo consultada en modo solo lectura por las neuronas.

### Diagnóstico de conexión

Con el token puente configurado, el servidor expone `GET /api/ai-neurons/health`. Devuelve únicamente presencia de configuración, estado de conexión/esquema y cantidad de hallazgos; nunca devuelve URLs, tokens ni credenciales. Debe consultarse con el encabezado `X-ARKON-TOKEN`. Un estado `schema_missing` o cero hallazgos indica que hay que preparar/sincronizar la cuenta Turso IA antes de probar neuronas.

### Variables de entorno

Configurar solamente en los servicios servidor, nunca en el repositorio:

- En Render/ARKON para la cuenta Turso exclusiva de esta capa: `ARKON_AI_TURSO_DATABASE_URL` y `ARKON_AI_TURSO_AUTH_TOKEN`. Además: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN` y `ARKON_BRIDGE_TOKEN`. `TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN` siguen reservadas al Turso existente del extractor.
- En Vercel/Impulso Vector: `ARKON_BRIDGE_URL` y el mismo valor secreto de `ARKON_BRIDGE_TOKEN`. Las variables `CLOUDFLARE_ACCOUNT_ID` y `CLOUDFLARE_API_TOKEN` en Vercel se conservan para la síntesis de respaldo ya existente.
- `CLOUDFLARE_MODEL` es opcional; por defecto se usa `@cf/meta/llama-3.2-3b-instruct`.

El valor de `ARKON_BRIDGE_TOKEN` debe coincidir entre Vercel y Render. Mantener los tokens fuera del historial del shell, de capturas, del video y de GitHub. La plantilla `.env.example` contiene solo nombres de variables vacíos.

### Prueba

Desde la app, elegir un producto y completar el código real de estado —por ejemplo `E02` solo si corresponde a la condición que se está evaluando— antes de pulsar **Analizar**. La respuesta incluye `aiNeurons.availableDirectAgentCount`, `activeAgentIds` y `agents[]`. Los estados `turso_not_configured`, `llama_not_configured`, `no_evidence` y `needs_review` distinguen problemas de configuración o falta de evidencia de una evaluación respaldada.

### Límite de esta primera etapa

La rama permite buscar y evaluar evidencia por neurona. Aún no crea ni guarda una fórmula con residuo: una formulación necesita recuperar evidencia propia del residuo, comprobar reglas de mezcla y unidades, y validarse con el motor científico y ensayos. No se debe presentar una propuesta de residuo como fórmula probada hasta completar ese paso.

---

## English

### What changes

The AI implementation of each direct neuron is integrated into its original physical file under `src/neurons/physical/N001...N050`. Each module contains its own `AINeuronProfile` with nucleus, definition, method instructions, cables, sub-cables, units, search terms, and scientific metadata. Each historical public class extends `AgenticNeuron` and passes the profile defined locally; it is not an empty wrapper importing a separate profile. `src/neurons/ai/neurons/index.ts` instantiates those 50 physical classes as the active `DIRECT_AI_NEURONS` registry. `AgenticNeuron.buildSystemInstruction()` constructs the neuron-specific instructions sent to Llama. The existing `ALL_NEURONS` registry and scientific numerical engine remain in place.

`src/neurons/ai/motherBrain.ts` is the central entry point that receives the ARKON request and coordinates the agents and Llama client. When a property is requested, it activates that neuron as the root and recursively traverses its direct cables, related properties, and sub-cables to activate every dependent direct neuron. When no specific property is supplied, it performs an integral analysis with all 50 direct neurons. There is no fixed pilot list or artificial 6/12-neuron cap; concurrency is batched to avoid overwhelming the provider. Each neuron queries Turso using its own terms, units, and evidence requirements, receives relevant scientific context from Supabase, and returns a structured assessment. The request carries the operator-selected material state; if the state is absent or not identified by the source, the agent must mark it unknown and request review.

### Flow and privacy

Vercel's `/api/analizar` route requests `includeAiNeurons` and forwards the selected state code. In production, ARKON checks `X-ARKON-TOKEN` before running the AI branch. This layer uses a separate Turso client with `ARKON_AI_TURSO_DATABASE_URL` and `ARKON_AI_TURSO_AUTH_TOKEN`; it neither reuses nor falls back to the extractor's Turso account. It performs read-only, parameterized queries against ND-schema tables such as `nd_hallazgos_raw` and `nd_datos_entidad`. The server reuses ARKON's existing Supabase client and sends Llama selected evidence and relevant rules/formulas/crosses/TRIZ; Llama never receives credentials or direct database/account access.

The response preserves document, page when available, excerpt, value, unit, method, and test condition. The server rejects citations not matching retrieved evidence IDs and rejects a numeric value returned by Llama if it does not exactly match a cited source. This layer does not write to Supabase or change Google Sheets. Documentary analysis does not certify a product or replace physical testing.

### Environment variables

Set these only in server-side services, never in the repository:

- Render/ARKON for this layer's dedicated Turso account: `ARKON_AI_TURSO_DATABASE_URL` and `ARKON_AI_TURSO_AUTH_TOKEN`. Also set `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, and `ARKON_BRIDGE_TOKEN`. `TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN` remain reserved for the extractor's existing Turso account.
- Vercel/Impulso Vector: `ARKON_BRIDGE_URL` and the same secret value for `ARKON_BRIDGE_TOKEN`. Existing `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` in Vercel remain in place for the existing fallback synthesis.
- `CLOUDFLARE_MODEL` is optional; the default is `@cf/meta/llama-3.2-3b-instruct`.

The `ARKON_BRIDGE_TOKEN` values must match between Vercel and Render. Keep tokens out of shell history, screenshots, the demo video, and GitHub. `.env.example` contains empty variable names only.

### Test

In the app, choose a product and enter the actual material-state code —for example, `E02` only when it matches the condition being tested— before clicking **Analizar**. The response includes `aiNeurons.availableDirectAgentCount`, `activeAgentIds`, and `agents[]`. The statuses `turso_not_configured`, `llama_not_configured`, `no_evidence`, and `needs_review` distinguish setup/missing-evidence outcomes from a supported assessment.

### First-stage limitation

This branch retrieves and assesses evidence by neuron. It does not yet create or store a residue-based formula. Formulation requires evidence for the residue itself, checking mixing rules and units, and validation by ARKON's scientific engine and physical tests. Do not describe a residue proposal as a tested formula until that work is complete.
