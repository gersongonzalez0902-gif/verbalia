# 08 · La Forja Comunitaria (UGC) y moderación

## 1. Alcance v1 (empezar pequeño y bien moderado)

Tipos UGC en la primera versión — los que ya tienen zod y motor:

| Tipo | Formato reutilizado | Riesgo |
|---|---|---|
| `CLOZE` | `ClozeExercise` (texto con `___` + opciones) | bajo |
| `TRIVIA` | `TriviaExercise` (clasificar palabra en frase) | bajo |
| `HISTORIA` | `StoryNode[]` (historias ramificadas) | medio (narrativa larga) |
| `REFRAN` | refranes/modismos regionales con explicación | bajo |

**Sin voz, sin imágenes, sin audio en v1** (solo texto → moderable con
filtros automáticos + humano).

## 2. Validación (reutilizar el contenido ya tipado)

- El cliente forja con un formulario que produce el **mismo shape** que los
  packs existentes (`src/data/*.ts`).
- El servidor valida con los **esquemas zod derivados de los tipos**
  (`ExerciseBase` + tipo concreto): un nuevo módulo
  `src/server/services/ugc-schema.ts` exporta `ugcPackSchema` por tipo.
- Límites duros: ≤ 20 ejercicios por pack, ≤ 1.400 chars por frase/prompt,
  ≤ 12 KB por pack, 3 packs/día (auto-subida a 10 con historial limpio).
- Filtros automáticos al enviar: emails/teléfonos/URLs → regex rechaza;
  lista de palabrotas es-419+es-ES (embedded) → a revisión humana, no rechazo
  automático (falsos positivos).

## 3. Flujo de publicación

```
DRAFT (borrador del autor, jugable por él)
  → REVIEW (enviar a publicar; entra en cola de moderación)
      Moderador: aprueba → PUBLISHED
                 rechaza → REJECTED + reviewNote (plantillas amables:
                 "Hay dos respuestas válidas en el ejercicio 3")
  → PUBLISHED: aparece en la biblioteca de la comunidad
      Reportes ≥3 → auto-HIDDEN hasta revisión
```

- **Toda** publicación pasa revisión en v1 (sin confianza progresiva al
  principio; la auto-aprobación llega si <1 % de rechazos por autor tras
  10 packs — criterio explícito, no intuición).
- SLA de cola: 48 h. Si la cola supera 100 packs → cerrar envíos un día
  (mejor fila corta que moderación chapucera).

## 4. Calidad y descubrimiento

- Rating implícito: `helpful = correctSum / intentSum` (¿el pack enseña?)
  + estrellas opcionales. Orden por defecto: `helpful` con mínimo de 20
  intentos (evita packs nuevos con 100 % vacío).
- Curaduría semanal: "La reliquia de la semana" (pack destacado por
  moderadores) → notificación a toda la comunidad.
- Los packs del autor se juegan **con las mismas semillas por sesión**
  (repetibles, orden estable) para que las estadísticas agreguen limpio.
- `UGC_ADOPTION`: cada 100 aciertos de otros jugadores en tu pack →
  10 tinta al autor (cap 50/día). Incentivo real de calidad.

## 5. Menores y seguridad

- UGC = solo texto ya filtrado. Sin interacción 1-a-1 (tándem en v2 con
  diseño específico).
- Perfiles: sin foto pública por defecto (la foto propia es opcional y solo
  visible en duelos, nunca en el perfil público v1).
- Sin datos personales en UGC (filtros §2) y en la bio (mismos filtros).
- Modo aula: el docente es OFFICER+ y puede pedir "solo packs verificados"
  para sus alumnos (flag `classroomSafe` en el cliente).
- Reporte en 2 toques desde todo contenido social (perfil, pack, post,
  duelo): `POST /reports` con `targetType/targetId`.
- El pseudónimo + handle hace imposible doxxing accidental: el sistema
  nunca muestra el email a otros jugadores.

## 6. Herramientas de moderación (mínimo viable)

- Pantalla admin (rol `MODERATOR`): cola de REVIEW, cola de reportes OPEN,
  búsqueda de packs, botones aprobar/reject/ocultar, suspensión de usuario
  (`User.status=SUSPENDED`) con motivo.
- Cada acción → `AuditLog` (actor, acción, target, meta).
- Reglas duras documentadas: spam comercial, contenido no relacionado con
  el idioma, datos personales de terceros, imitación de staff.
- Apelación: el autor responde a la `reviewNote`; hilo dentro del propio
  pack (sin mensajería nueva).

## 7. Tándem asíncrono (v2, alta prioridad siguiente)

Diseño anticipado para que la O6 no lo tape:

- Tema semanal global ("Describe tu pueblo sin decir su nombre").
- El aprendiz escribe ≤ 300 chars; un nativo (o C1+) corrige con marcas
  estándar (ortografía/gramática/registro) → ambos ganan tinta.
- Cada escrito y corrección son **objetos moderables** (no chat): cola igual
  que UGC. Matching por MCER y lengua nativa declarada (opcional).
- Riesgo principal: contacto no deseado → sin traslado a off-platform
  (filtros de contactos en correcciones también), bloqueo instantáneo.

## 8. Qué NO haremos (línea roja de producto)

- ❌ Comentarios públicos globales (el tablón de flota basta).
- ❌ Mensajería directa 1-a-1 (quick-phrases y tablón cubren lo social).
- ❌ Imágenes/audio de usuarios en v1.
- ❌ Perfiles indexables (`noindex` + login para ver interacciones).
