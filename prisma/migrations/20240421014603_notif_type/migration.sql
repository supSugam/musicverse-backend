-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'TRACK_PUBLIC_APPROVED';

-- AlterTable
ALTER TABLE "Membership" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '1 month';

-- AlterTable
ALTER TABLE "PlaylistInvitation" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '7 days';
