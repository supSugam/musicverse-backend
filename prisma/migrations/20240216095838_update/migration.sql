/*
  Warnings:

  - You are about to drop the column `popularity` on the `Genre` table. All the data in the column will be lost.
  - You are about to drop the column `likes` on the `Track` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'NOT_REQUESTED');

-- AlterTable
ALTER TABLE "Genre" DROP COLUMN "popularity";

-- AlterTable
ALTER TABLE "Track" DROP COLUMN "likes",
ADD COLUMN     "publicStatus" "ReviewStatus" DEFAULT 'NOT_REQUESTED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "artistRequestStatus" "ReviewStatus" DEFAULT 'NOT_REQUESTED';
