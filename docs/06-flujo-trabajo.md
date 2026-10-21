# 06 · Flujo de trabajo (Git + IA + colaboración)

La maestra evalúa que el trabajo sea **colaborativo**. GitHub es la evidencia: cada quien **commitea desde su propia cuenta** sus propias HU, y cada PR lo **revisa otro integrante**.

## Ramas

- `main` — siempre funciona. Protegida: solo entra por PR.
- `hu-XX-descripcion-corta` — una rama por HU (`hu-02-escaneo-codigo`). Tareas de doc: `doc-casos-de-uso`. Setup: `t00-setup`.
- Ramas cortas: **mergear al menos cada 2 días**. Antes de abrir PR: `git pull --rebase origin main`.

## Commits

Formato (Conventional Commits en español):

```
feat(caja): calcula efectivo esperado en el corte [HU-05]
fix(venta): el escaneo repetido suma cantidad [HU-02]
test(productos): valida decimales en peso a granel [HU-03]
docs(scrum): daily 2026-10-23
```

Commits pequeños y frecuentes. Si la IA generó el código, se permite el trailer `Co-Authored-By:` de la herramienta, pero **el autor es quien lo revisó y lo entiende**.

## Pull Requests

1. Título: `[HU-05] Corte y cierre de caja`.
2. Llenar la plantilla (`.github/pull_request_template.md`): qué CA cubre, cómo probarlo, capturas.
3. Asignar como reviewer a **otro integrante** (rotar: Sosa → Gonzalo → Miguel → Sosa).
4. El reviewer prueba localmente o revisa con `/revisar-pr` y aprueba o pide cambios **con comentarios en GitHub** (también cuenta como evidencia).
5. Merge con **squash**. Borrar la rama.

## Cómo trabajar con la IA (todos)

1. Abrir el repo en tu herramienta (Claude Code, Cursor, Copilot…). La IA lee `AGENTS.md` automáticamente.
2. Para una HU: usar el prompt `docs/prompts/implementar-hu.md` (en Claude Code: `/hu HU-05`).
3. La IA debe **planear primero**, implementar con pruebas, correr `npm test` y `npm run lint`, y dejar el PR listo.
4. **Tú revisas** cada diff antes de commitear. Si no entiendes algo, pídele que lo explique: en la demo la maestra puede preguntarte por tu código.
5. Daily: `docs/prompts/daily.md` (`/daily`) arma tu parte del daily a partir de tus commits.

## Reglas para no pisarnos

- Respetar la tabla de **dueños de módulo** de `03-plan-entrega.md`. Si necesitas tocar el módulo de otro, avísale y hazlo en un PR pequeño aparte.
- `schema.prisma` lo cambia **solo una persona a la vez** (por defecto Sosa). Migraciones con nombre descriptivo: `npx prisma migrate dev --name pago_proveedor`.
- `docs/scrum/sprint-backlog.md`: cada quien edita **solo sus renglones**.
- Nada de secretos en el repo: `.env` está en `.gitignore`; se versiona `.env.example`.
