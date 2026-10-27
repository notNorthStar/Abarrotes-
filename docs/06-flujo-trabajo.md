# 06 · Flujo de trabajo (Git + IA + colaboración)

La maestra evalúa que el trabajo sea **colaborativo**. GitHub es la evidencia: cada quien **commitea desde su propia cuenta** sus propias HU y abre sus PRs.

**Revisión centralizada (acuerdo del 26 oct):** Sosa (Scrum Master) es el único que revisa, aprueba e integra. Gonzalo y Miguel solo implementan y mandan PRs; no revisan. Los PRs de Sosa se integran directamente (ya revisados por él con la IA).

## Ramas

```
main         ← entregas. Solo recibe develop al cierre de cada sprint (tag v0.2.0 el 1 nov)
  └─ develop      ← pre-producción. Aquí se integra todo; siempre debe correr
       ├─ hu-02-escaneo-codigo    (Gonzalo)
       ├─ hu-03-granel            (Miguel)
       └─ hu-06-cobro             (Sosa)
```

| Rama | Para qué | Quién escribe |
|---|---|---|
| `main` | Lo que se entrega a la maestra | Solo PR `develop → main` al cierre de sprint (Sosa, como SM) |
| `develop` | Integración continua / demo | Solo por PR desde ramas `hu-*`, `doc-*`, `fix-*`; integra Sosa |
| `hu-XX-descripcion` | Una historia de usuario | Su responsable |
| `doc-descripcion` | Diagramas, prototipos, documento Scrum | Su responsable |
| `fix-descripcion` | Corrección de algo ya mergeado | Quien lo encuentre |

**No hay ramas por persona.** Las ramas son por HU y viven **1 a 3 días**. Una HU cuenta como hecha (burndown) cuando entra a `develop`.

## Ciclo diario

```bash
# 1. Empezar una HU (desde develop actualizado)
git checkout develop
git pull origin develop
git checkout -b hu-02-escaneo-codigo

# 2. Cada mañana: traer lo que integraron los demás
git fetch origin
git rebase origin/develop        # si hay conflicto: resolver, git add, git rebase --continue

# 3. Commits pequeños mientras trabajas
git commit -m "feat(venta): el escaneo repetido suma cantidad [HU-02]"

# 4. Al cumplir los criterios de aceptación
npm test && npm run lint
git push -u origin hu-02-escaneo-codigo   # (si ya hiciste push antes de un rebase: git push --force-with-lease)
# → abrir PR en GitHub con base: develop
```

## Commits

Conventional Commits en español, con la HU al final:

```
feat(caja): calcula efectivo esperado en el corte [HU-05]
fix(venta): el escaneo repetido suma cantidad [HU-02]
test(productos): valida decimales en peso a granel [HU-03]
docs(scrum): daily 2026-10-23
```

Si la IA generó el código, se permite el trailer `Co-Authored-By:` de la herramienta, pero **el autor es quien lo revisó y lo entiende**.

## Pull Requests

1. **Base: `develop`** (nunca `main`). Título: `[HU-05] Corte y cierre de caja`.
2. Llenar la plantilla: qué CA cubre, cómo probarlo, capturas.
3. **Reviewer: siempre Sosa (`notNorthStar`)**. `.github/CODEOWNERS` lo asigna automáticamente.
4. Sosa revisa con su IA (`/revisar-pr <n>`), prueba localmente y deja **aprobación o cambios solicitados en GitHub**, el mismo día.
5. Si pide cambios: el autor corrige en la misma rama y hace push; el PR se actualiza solo.
6. Sosa integra con **squash** y borra la rama. Avisa en el grupo: "entró HU-XX a develop".
7. **PRs de Sosa:** se abren igual (dejan registro) y Sosa los integra directo, sin esperar aprobación.

## Cierre de sprint

1. Sosa abre PR `develop → main` con el resumen de HU entregadas.
2. Se prueba `develop` con el seed (flujo de la demo).
3. Merge (sin squash, para conservar historial) y tag: `git tag v0.2.0 && git push origin v0.2.0`.

## Protección de ramas (GitHub → Settings → Branches)

- `main` y `develop`: *Require a pull request before merging* + *Require approvals: 1* + *Require review from Code Owners*. **Sin** marcar "Do not allow bypassing the above settings", para que Sosa (admin) pueda integrar sus propios PRs.
- Con `CODEOWNERS = @notNorthStar`, los PRs de Gonzalo y Miguel solo se pueden integrar con la aprobación de Sosa.

## Cómo trabajar con la IA (todos)

1. Abrir el repo en tu herramienta (Claude Code, Cursor, Copilot…). La IA lee `AGENTS.md` automáticamente.
2. Para una HU: `docs/prompts/implementar-hu.md` (en Claude Code: `/hu HU-05`). La IA crea la rama desde `develop`, planea, implementa con pruebas y prepara el PR.
3. **Tú revisas** cada diff antes de commitear. Si no entiendes algo, pídele que lo explique: en la demo la maestra puede preguntarte por tu código.
4. Daily: `docs/prompts/daily.md` (`/daily`).

## Reglas para no pisarnos

- Respetar la tabla de **dueños de módulo** de `03-plan-entrega.md`. Si necesitas tocar el módulo de otro, avísale y hazlo en un PR pequeño aparte.
- `schema.prisma` lo cambia **solo una persona a la vez** (por defecto Sosa). Migraciones con nombre descriptivo: `npx prisma migrate dev --name pago_proveedor`. Después de traer una migración nueva: `npm run db:migrate`.
- `docs/scrum/sprint-backlog.md`: cada quien edita **solo sus renglones**.
- Nada de secretos en el repo: `.env` está en `.gitignore`; se versiona `.env.example`.
