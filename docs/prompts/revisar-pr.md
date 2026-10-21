# Prompt: revisar el PR de un compañero

> Uso: `/revisar-pr <número>`. Requiere `gh` autenticado (o pega el diff).

1. Obtén el PR: `gh pr view <n>` y `gh pr diff <n>`. Identifica la HU del título.
2. Contra `docs/02-backlog.md`: ¿se cumple **cada** criterio de aceptación? Marca ✅ / ❌ / ⚠️ por CA.
3. Contra `AGENTS.md`: dinero con Decimal, recálculo en servidor, filtro por sucursal, `requireRol`, borrado lógico, transacciones, pruebas por CA, módulos ajenos no tocados, schema sin cambios no acordados.
4. Haz checkout local (`gh pr checkout <n>`), corre `npm test` y `npm run lint` y, si puedes, prueba el flujo con el seed.
5. Redacta la revisión en español, concreta y amable: bloqueantes primero, sugerencias después, con archivo:línea.
6. Muéstramela. **Solo con mi OK** publícala: `gh pr review <n> --comment|--approve|--request-changes -b "..."`. La revisión debe quedar en GitHub con mi cuenta (es evidencia de colaboración).
