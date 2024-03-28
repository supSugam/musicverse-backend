/*
  Warnings:

  - Added the required column `userId` to the `Play` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Play" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Download" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "trackId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Download_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Play" ADD CONSTRAINT "Play_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Download" ADD CONSTRAINT "Download_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Download" ADD CONSTRAINT "Download_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
