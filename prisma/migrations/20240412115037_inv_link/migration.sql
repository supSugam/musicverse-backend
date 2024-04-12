/*
  Warnings:

  - You are about to drop the column `invitedById` on the `PlaylistInvitation` table. All the data in the column will be lost.
  - You are about to drop the column `invitedUserId` on the `PlaylistInvitation` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `PlaylistInvitation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[playlistId]` on the table `PlaylistInvitation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "PlaylistInvitation" DROP CONSTRAINT "PlaylistInvitation_invitedById_fkey";

-- DropForeignKey
ALTER TABLE "PlaylistInvitation" DROP CONSTRAINT "PlaylistInvitation_invitedUserId_fkey";

-- DropIndex
DROP INDEX "PlaylistInvitation_playlistId_invitedUserId_key";

-- AlterTable
ALTER TABLE "PlaylistInvitation" DROP COLUMN "invitedById",
DROP COLUMN "invitedUserId",
DROP COLUMN "status",
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT now() + interval '7 days',
ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- DropEnum
DROP TYPE "InvitationStatus";

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistInvitation_playlistId_key" ON "PlaylistInvitation"("playlistId");
