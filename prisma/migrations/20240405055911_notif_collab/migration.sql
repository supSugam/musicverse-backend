-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('ACCEPTED', 'PENDING', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('FOLLOW', 'DOWNLOAD_TRACK', 'LIKE_TRACK', 'SAVE_PLAYLIST', 'SAVE_ALBUM', 'COLLABORATE_PLAYLIST', 'NEW_TRACK', 'NEW_ALBUM', 'NEW_PLAYLIST');

-- CreateTable
CREATE TABLE "PlaylistInvitation" (
    "id" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "invitedUserId" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "status" "InvitationStatus" DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlaylistInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDevice" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "deviceToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "imageUrl" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recipientId" TEXT NOT NULL,
    "triggerUserId" TEXT,
    "destinationId" TEXT,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistInvitation_playlistId_invitedUserId_key" ON "PlaylistInvitation"("playlistId", "invitedUserId");

-- CreateIndex
CREATE UNIQUE INDEX "UserDevice_deviceToken_key" ON "UserDevice"("deviceToken");

-- CreateIndex
CREATE UNIQUE INDEX "UserDevice_userId_deviceToken_key" ON "UserDevice"("userId", "deviceToken");

-- AddForeignKey
ALTER TABLE "PlaylistInvitation" ADD CONSTRAINT "PlaylistInvitation_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistInvitation" ADD CONSTRAINT "PlaylistInvitation_invitedUserId_fkey" FOREIGN KEY ("invitedUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistInvitation" ADD CONSTRAINT "PlaylistInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDevice" ADD CONSTRAINT "UserDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_triggerUserId_fkey" FOREIGN KEY ("triggerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
