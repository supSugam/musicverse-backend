/*
  Warnings:

  - You are about to drop the column `isPublic` on the `Playlist` table. All the data in the column will be lost.
  - You are about to drop the column `artistRequestStatus` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Album" ADD COLUMN     "publicStatus" "ReviewStatus" DEFAULT 'NOT_REQUESTED';

-- AlterTable
ALTER TABLE "Playlist" DROP COLUMN "isPublic",
ADD COLUMN     "publicStatus" "ReviewStatus" DEFAULT 'NOT_REQUESTED';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "artistRequestStatus",
ADD COLUMN     "artistStatus" "ReviewStatus" DEFAULT 'NOT_REQUESTED';
