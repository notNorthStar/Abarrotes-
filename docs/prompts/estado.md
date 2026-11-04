# Prompt: estado del sprint

> Uso: `/estado`.

1. `git fetch` y lee `docs/scrum/sprint-backlog.md`, `docs/scrum/burndown.md` y `docs/03-plan-entrega.md`. Si hay `gh` con permiso de proyectos, consulta el tablero: `gh project item-list 1 --owner notNorthStar --format json`.
2. Si hay `gh`: lista PRs abiertos y mergeados (`gh pr list --state all --limit 30`) y compáralos con el sprint backlog; señala discrepancias.
3. Reporta en una tabla corta: por integrante, tareas ✅/🟦/🟨/⬜ y puntos; puntos restantes vs. ideal de hoy; días para el cierre del sprint.
4. Señala riesgos: tareas atrasadas respecto al calendario, dependencias bloqueadas (p. ej. HU-05 espera HU-06), PRs sin revisar > 1 día. Si vamos tarde, propone qué recortar según el plan de contingencia.
