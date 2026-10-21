# Prompt: cierre de sprint (review + retro + documento)

> Uso: `/cierre-sprint`. Para el 31 oct / 1 nov.

1. Verifica el incremento: `main` actualizado, `npm test` y `npm run lint` pasan, flujo completo con el seed: login cajero → abrir caja → escanear + granel → cobro mixto con cambio → pago a proveedor → corte con diferencia; login admin → gestión de cajeros → alta de producto. Reporta qué funciona y qué no.
2. Completa `docs/scrum/burndown.md` y genera gráficas Mermaid (`xychart-beta`) de burndown y burnup en `docs/diagramas/graficas.md`.
3. Crea/actualiza `docs/scrum/reuniones.md` con:
   - **Re-planeación (inicio Sprint 2):** S1 no entregado, salida de 2 integrantes, reparto nuevo.
   - **Sprint Review:** HU terminadas vs. comprometidas, demo.
   - **Retrospectiva:** qué salió bien, qué mal, qué mejorar (pregúntale al usuario la opinión del equipo; no la inventes).
4. Revisa `docs/07-scrum-entregables.md` y marca qué secciones ya tienen contenido; lista lo faltante con responsable.
5. Propón el changelog y el tag `v0.2.0`. Pide confirmación antes de crear tag o release.
