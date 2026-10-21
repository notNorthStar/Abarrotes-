/** Placeholder de pantalla cuya HU aún no se implementa. */
export function Pendiente({ titulo, hu, responsable }: { titulo: string; hu: string; responsable: string }) {
  return (
    <section>
      <h1 className="mb-2 text-2xl font-semibold">{titulo}</h1>
      <p className="text-slate-500">
        Pendiente: {hu} · {responsable}
      </p>
    </section>
  )
}
