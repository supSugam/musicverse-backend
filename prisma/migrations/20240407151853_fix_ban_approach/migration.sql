/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `BannedUser` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BannedUser_userId_key" ON "BannedUser"("userId");
