# Prompt: implementar una historia de usuario

> Uso: en Claude Code `/hu HU-XX`. En otra herramienta, copia este archivo al chat y reemplaza `{HU}`.

Vas a implementar **{HU}** de Abarrotes+. Sigue estos pasos en orden y no te saltes ninguno:

1. **Contexto.** Lee `AGENTS.md`, la sección de {HU} en `docs/02-backlog.md`, `docs/04-arquitectura.md` y `docs/05-modelo-datos.md`. Si no sabes cuál integrante soy, pregúntame y verifica en `docs/03-plan-entrega.md` que {HU} me corresponde. Si no me corresponde, avísame y detente.
2. **Estado del repo.** `git status` (si hay cambios sin commitear, pregúntame qué hacer). Si ya existe mi rama de {HU}, cámbiate a ella y haz `git fetch origin && git rebase origin/develop`. Si no: `git checkout develop && git pull origin develop && git checkout -b hu-XX-descripcion-corta`. Si `develop` aún no tiene el esqueleto (T-00), dímelo y detente. Si llegó una migración nueva, corre `npm run db:migrate`.
3. **Plan.** Muéstrame:
   - Los criterios de aceptación numerados.
   - Endpoints, servicios, componentes y archivos a crear/modificar.
   - Pruebas que escribirás (una o más por CA con lógica).
   - Dudas de alcance (si las hay, pregúntalas ahora).
   Espera mi OK.
4. **Implementa** primero el backend (schemas Zod → service → routes → pruebas), luego el front. Respeta los dueños de módulo; si necesitas algo de otro módulo, usa su contrato público o dímelo.
5. **Verifica.** `npm test` y `npm run lint`. Prueba el flujo con los usuarios del seed. Reporta resultados reales; si algo falla, arréglalo o explícalo.
6. **Sprint backlog.** Marca mis tareas de {HU} en `docs/scrum/sprint-backlog.md` como 🟦.
7. **Commits** pequeños: `tipo(modulo): descripción [{HU}]`.
8. **PR con base `develop`.** Antes, `git fetch origin && git rebase origin/develop` y vuelve a correr pruebas. Prepara título `[{HU}] Nombre` y cuerpo con la plantilla `.github/pull_request_template.md` (CA cubiertos con ✅, cómo probar, dudas). Pregúntame antes de hacer push / abrir el PR. **Reviewer: siempre `notNorthStar` (Sosa)**; con `gh`: `gh pr create --base develop --reviewer notNorthStar --title ... --body-file ...`; si no hay `gh`, dame el link de GitHub para abrirlo. **Nunca hagas merge**: lo integra Sosa. (Si yo soy Sosa, pregúntame si integro directo con `gh pr merge --squash --delete-branch --admin`: la protección de ramas exige aprobación de Code Owner y `--admin` la salta solo para Sosa.)
9. **Explícame** en 5–10 líneas qué hace cada archivo nuevo, para que pueda defenderlo en la demo.
