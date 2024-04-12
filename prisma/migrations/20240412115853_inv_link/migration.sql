/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `PlaylistInvitation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `token` to the `PlaylistInvitation` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "PlaylistInvitation_playlistId_key";

-- AlterTable
ALTER TABLE "PlaylistInvitation" ADD COLUMN     "token" TEXT NOT NULL,
ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '7 days';

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistInvitation_token_key" ON "PlaylistInvitation"("token");

-- CreateIndex
CREATE INDEX "PlaylistInvitation_playlistId_idx" ON "PlaylistInvitation"("playlistId");
