# ARKON AI-neuron agents / Agentes IA de ARKON

## Español

### Qué cambia

La capa es aditiva: conserva `ALL_NEURONS` y el motor numérico actual sin reemplazarlo. En `src/neurons/ai/neurons/` hay 50 módulos/clases `AgenticNeuronN001`–`AgenticNeuronN050`, uno por cada neurona directa original N-001–N-050. Cada módulo importa su clase directa original y verifica que coincidan ID y propiedad; así no reemplaza ni modifica la neurona científica existente. Cada clon conserva un núcleo propio, cables a propiedades y neuronas relacionadas, subcables a reglas/fórmulas de Supabase, términos de Turso, unidad y metadatos de definición/rango del registro fuente. Seis tienen instrucciones de demo más detalladas para humedad (N-004), dureza (N-018), densidad/peso (N-002), respuesta térmica (N-021), resistencia a flexión (N-013) y flexibilidad (N-014). `AgenticNeuron.buildSystemInstruction()` forma las instrucciones particulares que recibe Llama.

`src/neurons/ai/motherBrain.ts` es el punto central que recibe la solicitud de ARKON y coordina las neuronas-agente y el cliente Llama. Para esta prueba, activa por defecto los seis agentes piloto; los otros 44 módulos están registrados y pueden seleccionarse explícitamente. La API limita cada ejecución a 12 agentes para no llamar 50 veces a Llama sin necesidad. Cada agente consulta Turso a través del servidor, recibe solamente las propiedades y reglas pertinentes de Supabase y devuelve una evaluación estructurada. La solicitud también lleva el estado indicado por el operador; si no hay estado o la fuente no lo identifica, el agente debe marcarlo como desconocido y pedir revisión.

### Flujo y privacidad

La ruta de Vercel `/api/analizar` solicita la rama `includeAiNeurons` y reenvía el código de estado. ARKON comprueba `X-ARKON-TOKEN` antes de ejecutar la rama IA en producción. Esta capa usa un cliente Turso independiente con `ARKON_AI_TURSO_DATABASE_URL` y `ARKON_AI_TURSO_AUTH_TOKEN`; no reutiliza ni cae como respaldo a la cuenta Turso del extractor. En modo solo lectura consulta tablas declaradas por el esquema ND, como `nd_hallazgos_raw` y `nd_datos_entidad`, mediante SQL fijo y parámetros enlazados. El servidor usa el cliente Supabase que ya tiene ARKON y entrega a Llama los fragmentos seleccionados y reglas/fórmulas/cruces/TRIZ pertinentes; nunca entrega credenciales ni acceso directo a cuentas o bases de datos.

La salida conserva documento, página cuando existe, fragmento, valor, unidad, método y condición de ensayo. El servidor descarta citas que no correspondan a IDs recuperados y descarta un valor numérico de Llama si no coincide exactamente con una fuente citada. La capa no escribe en Supabase ni modifica Google Sheets. Una evaluación documental no certifica un producto ni reemplaza ensayos físicos.

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

This is an additive layer: `ALL_NEURONS` and the existing numerical engine remain intact. `src/neurons/ai/neurons/` contains 50 separate `AgenticNeuronN001`–`AgenticNeuronN050` modules, one for each original direct neuron N-001–N-050. Each module imports its original direct class and validates that the neuron ID and property match; it does not replace or edit the scientific neuron. Every clone has its own nucleus, property/related-neuron cables, Supabase rule/formula sub-cables, Turso search terms, reference unit, and definition/range metadata from its source. Six have more detailed demo instructions for moisture (N-004), hardness (N-018), density/weight (N-002), thermal response (N-021), flexural strength (N-013), and flexibility (N-014). `AgenticNeuron.buildSystemInstruction()` constructs the specific instructions sent to Llama.

`src/neurons/ai/motherBrain.ts` is the central entry point that receives the ARKON request and coordinates the agents and Llama client. This pilot runs the six specialized agents by default; the other 44 modules are registered and can be explicitly selected. A request is limited to 12 agents so it does not call Llama 50 times unnecessarily. Each agent retrieves its evidence from Turso through the server, receives only relevant Supabase properties/rules, and returns a structured assessment. The request carries the operator-selected material state; if the state is absent or not identified by the source, the agent must mark it unknown and request review.

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
