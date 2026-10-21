# Prompt: daily scrum

> Uso: `/daily`. Genera o completa el daily de hoy.

1. Si no sabes quién soy, pregúntame (Sosa, Gonzalo o Miguel).
2. Revisa mi actividad desde el último daily: `git log --author="<mi nombre o usuario>" --since="<fecha del último daily en docs/scrum/dailies/>" --oneline --all`, PRs abiertos/mergeados si tienes `gh`, y mis renglones en `docs/scrum/sprint-backlog.md`.
3. Abre `docs/scrum/dailies/AAAA-MM-DD.md` de hoy; si no existe, créalo desde `_plantilla.md` con el día del sprint (Sprint 2 empezó el 19 oct; día 14 = 1 nov).
4. Llena **solo mi renglón**: qué hice (concreto: HU, tareas, PRs), qué haré hoy (según `docs/03-plan-entrega.md`), impedimentos. Pregúntame por impedimentos si no son evidentes.
5. Recalcula "Puntos restantes" desde el sprint backlog (HU con todas sus tareas ✅) y el estado 🟢/🟡/🔴 comparando con el ideal de `docs/scrum/burndown.md`; actualiza la fila de hoy del burndown.
6. Muéstrame el resultado y commitéalo como `docs(scrum): daily AAAA-MM-DD (<mi nombre>)`. Recuérdame copiarlo al Drive (`DailyScrums/`).
