/*
  Warnings:

  - Added the required column `previewDuration` to the `Track` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trackDuration` to the `Track` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "previewDuration" INTEGER NOT NULL,
ADD COLUMN     "trackDuration" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Play" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "trackId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Play_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Play" ADD CONSTRAINT "Play_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
