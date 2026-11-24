-- CreateTable
CREATE TABLE "Imagen" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "datos" BYTEA NOT NULL,
    "estado" "Estado" NOT NULL DEFAULT 'ACTIVO',
    "productoId" INTEGER,
    "proveedorId" INTEGER,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Imagen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Imagen_productoId_idx" ON "Imagen"("productoId");

-- CreateIndex
CREATE INDEX "Imagen_proveedorId_idx" ON "Imagen"("proveedorId");

-- AddForeignKey
ALTER TABLE "Imagen" ADD CONSTRAINT "Imagen_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Imagen" ADD CONSTRAINT "Imagen_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
