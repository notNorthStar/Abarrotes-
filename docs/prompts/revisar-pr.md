# Prompt: revisar el PR de un compañero (solo Sosa)

> Uso: `/revisar-pr <número>`. Requiere `gh` autenticado. **Solo lo usa Sosa**: él revisa e integra todos los PRs. Si quien te habla no es Sosa, dile que la revisión no le toca y detente.

1. Obtén el PR: `gh pr view <n>` y `gh pr diff <n>`. Identifica la HU del título. Verifica que la base sea `develop` (si apunta a `main`, es bloqueante salvo el PR de cierre de sprint).
2. Contra `docs/02-backlog.md`: ¿se cumple **cada** criterio de aceptación? Marca ✅ / ❌ / ⚠️ por CA.
3. Contra `AGENTS.md`: dinero con Decimal, recálculo en servidor, filtro por sucursal, `requireRol`, borrado lógico, transacciones, pruebas por CA, módulos ajenos no tocados, schema sin cambios no acordados.
4. Haz checkout local (`gh pr checkout <n>`), corre `npm test` y `npm run lint` y, si puedes, prueba el flujo con el seed.
5. Redacta la revisión en español, concreta y amable: bloqueantes primero, sugerencias después, con archivo:línea.
6. Muéstramela. **Solo con mi OK** publícala: `gh pr review <n> --comment|--approve|--request-changes -b "..."`. La revisión debe quedar en GitHub con mi cuenta (es evidencia de colaboración).
7. Si la apruebo, pregúntame si integro: `gh pr merge <n> --squash --delete-branch`. Después actualiza `develop` local (`git checkout develop && git pull`) y marca las tareas del autor como ✅ en `docs/scrum/sprint-backlog.md` y el burndown (en una rama `doc-*` propia).
