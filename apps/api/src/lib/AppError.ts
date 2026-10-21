// Error de negocio con código HTTP. El middleware lo responde como { error: mensaje }.
export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}
