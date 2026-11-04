# ARKON AI-neuron agents / Agentes IA de ARKON

## Español

### Qué cambia

La capa es aditiva: conserva `ALL_NEURONS` y el motor numérico actual sin reemplazarlo. `AI_NEURON_PROFILES` crea un perfil de agente para cada una de las 50 neuronas directas (N-001–N-050), tomando nombre de propiedad, definición, unidad de referencia y propiedades relacionadas del registro real. Seis perfiles piloto tienen instrucciones y cables más detallados para humedad (núcleo N-004), dureza (N-018), densidad/peso (N-002), respuesta térmica (N-021), resistencia a flexión (N-013) y flexibilidad (N-014).

En una ejecución normal se llaman esos seis agentes piloto, no los 50. La API permite seleccionar explícitamente hasta 12 perfiles mediante `neuronIds`. Cada agente consulta su fragmento de Turso, recibe solamente las propiedades y reglas pertinentes de Supabase y devuelve una evaluación estructurada. La solicitud también lleva el estado indicado por el operador; si no hay estado o la fuente no lo identifica, el agente debe marcarlo como desconocido y pedir revisión.

### Flujo y privacidad

La ruta de Vercel `/api/analizar` solicita la rama `includeAiNeurons` y reenvía el código de estado. ARKON comprueba `X-ARKON-TOKEN` antes de ejecutar la rama IA en producción. El proceso de ARKON consulta Turso en modo lectura, con SQL estático y parámetros enlazados, sobre `nd_hallazgos_raw` y, si existe, `propiedades_extraidas`. Llama recibe los fragmentos seleccionados y un subconjunto relacionado de fórmulas/reglas; nunca recibe credenciales ni acceso directo a cuentas o bases de datos.

La salida conserva documento, página cuando existe, fragmento, valor, unidad, método y condición de ensayo. El servidor descarta citas que no correspondan a IDs recuperados y descarta un valor numérico de Llama si no coincide exactamente con una fuente citada. La capa no escribe en Supabase ni modifica Google Sheets. Una evaluación documental no certifica un producto ni reemplaza ensayos físicos.

### Variables de entorno

Configurar solamente en los servicios servidor, nunca en el repositorio:

- En Render/ARKON: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN` y `ARKON_BRIDGE_TOKEN`.
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

This is an additive layer: `ALL_NEURONS` and the existing numerical engine remain intact. `AI_NEURON_PROFILES` creates one agent profile for each of the 50 direct neurons (N-001–N-050), using each real registry entry's property name, definition, reference unit, and related properties. Six demo profiles have more specific instructions and cables for moisture (N-004 core), hardness (N-018), density/weight (N-002), thermal response (N-021), flexural strength (N-013), and flexibility (N-014).

A normal analysis runs those six pilot agents, not all 50. The API can explicitly select up to 12 profiles through `neuronIds`. Each agent searches Turso for its evidence fragment, receives only relevant properties and Supabase rules, and returns a structured assessment. The request carries the operator-selected material state; if the state is absent or not identified by the source, the agent must mark it unknown and request review.

### Flow and privacy

Vercel's `/api/analizar` route requests `includeAiNeurons` and forwards the selected state code. In production, ARKON checks `X-ARKON-TOKEN` before running the AI branch. ARKON reads Turso using fixed, parameterized SQL against `nd_hallazgos_raw` and, when present, `propiedades_extraidas`. Llama receives selected evidence fragments and a relevant subset of formulas/rules; it never receives credentials or direct database/account access.

The response preserves document, page when available, excerpt, value, unit, method, and test condition. The server rejects citations not matching retrieved evidence IDs and rejects a numeric value returned by Llama if it does not exactly match a cited source. This layer does not write to Supabase or change Google Sheets. Documentary analysis does not certify a product or replace physical testing.

### Environment variables

Set these only in server-side services, never in the repository:

- Render/ARKON: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, and `ARKON_BRIDGE_TOKEN`.
- Vercel/Impulso Vector: `ARKON_BRIDGE_URL` and the same secret value for `ARKON_BRIDGE_TOKEN`. Existing `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` in Vercel remain in place for the existing fallback synthesis.
- `CLOUDFLARE_MODEL` is optional; the default is `@cf/meta/llama-3.2-3b-instruct`.

The `ARKON_BRIDGE_TOKEN` values must match between Vercel and Render. Keep tokens out of shell history, screenshots, the demo video, and GitHub. `.env.example` contains empty variable names only.

### Test

In the app, choose a product and enter the actual material-state code —for example, `E02` only when it matches the condition being tested— before clicking **Analizar**. The response includes `aiNeurons.availableDirectAgentCount`, `activeAgentIds`, and `agents[]`. The statuses `turso_not_configured`, `llama_not_configured`, `no_evidence`, and `needs_review` distinguish setup/missing-evidence outcomes from a supported assessment.

### First-stage limitation

This branch retrieves and assesses evidence by neuron. It does not yet create or store a residue-based formula. Formulation requires evidence for the residue itself, checking mixing rules and units, and validation by ARKON's scientific engine and physical tests. Do not describe a residue proposal as a tested formula until that work is complete.
