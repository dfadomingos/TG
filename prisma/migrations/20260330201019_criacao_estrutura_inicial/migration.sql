/*
  Warnings:

  - The values [DRAFT,PUBLISHED,CANCELLED,FINISHED] on the enum `EventStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `_UserFavorites` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `categoria` on the `Evento` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CategoriaEvento" AS ENUM ('Show', 'Gastronomia', 'Esporte', 'Teatro', 'Palestra', 'Workshop', 'Exposicao', 'Outros');

-- AlterEnum
BEGIN;
CREATE TYPE "EventStatus_new" AS ENUM ('Cancelado', 'Rascunho', 'Publicado', 'Finalizado');
ALTER TABLE "Evento" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Evento" ALTER COLUMN "status" TYPE "EventStatus_new" USING ("status"::text::"EventStatus_new");
ALTER TYPE "EventStatus" RENAME TO "EventStatus_old";
ALTER TYPE "EventStatus_new" RENAME TO "EventStatus";
DROP TYPE "EventStatus_old";
ALTER TABLE "Evento" ALTER COLUMN "status" SET DEFAULT 'Publicado';
COMMIT;

-- DropForeignKey
ALTER TABLE "_UserFavorites" DROP CONSTRAINT "_UserFavorites_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserFavorites" DROP CONSTRAINT "_UserFavorites_B_fkey";

-- AlterTable
ALTER TABLE "Evento" ADD COLUMN     "complemento" TEXT,
DROP COLUMN "categoria",
ADD COLUMN     "categoria" "CategoriaEvento" NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'Publicado';

-- DropTable
DROP TABLE "_UserFavorites";

-- CreateTable
CREATE TABLE "Favorito" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorito_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Favorito_usuarioId_eventoId_key" ON "Favorito"("usuarioId", "eventoId");

-- CreateIndex
CREATE INDEX "Evento_data_horario_idx" ON "Evento"("data_horario");

-- CreateIndex
CREATE INDEX "Evento_categoria_idx" ON "Evento"("categoria");

-- AddForeignKey
ALTER TABLE "Favorito" ADD CONSTRAINT "Favorito_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorito" ADD CONSTRAINT "Favorito_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
