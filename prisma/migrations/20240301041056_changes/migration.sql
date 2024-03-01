/*
  Warnings:

  - You are about to drop the `_LikedTracks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SavedAlbums` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SavedPlaylists` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_LikedTracks" DROP CONSTRAINT "_LikedTracks_A_fkey";

-- DropForeignKey
ALTER TABLE "_LikedTracks" DROP CONSTRAINT "_LikedTracks_B_fkey";

-- DropForeignKey
ALTER TABLE "_SavedAlbums" DROP CONSTRAINT "_SavedAlbums_A_fkey";

-- DropForeignKey
ALTER TABLE "_SavedAlbums" DROP CONSTRAINT "_SavedAlbums_B_fkey";

-- DropForeignKey
ALTER TABLE "_SavedPlaylists" DROP CONSTRAINT "_SavedPlaylists_A_fkey";

-- DropForeignKey
ALTER TABLE "_SavedPlaylists" DROP CONSTRAINT "_SavedPlaylists_B_fkey";

-- DropTable
DROP TABLE "_LikedTracks";

-- DropTable
DROP TABLE "_SavedAlbums";

-- DropTable
DROP TABLE "_SavedPlaylists";

-- CreateTable
CREATE TABLE "LikedTrack" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "likedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LikedTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedPlaylist" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedPlaylist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedAlbum" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "albumId" TEXT NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedAlbum_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LikedTrack" ADD CONSTRAINT "LikedTrack_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikedTrack" ADD CONSTRAINT "LikedTrack_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedPlaylist" ADD CONSTRAINT "SavedPlaylist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedPlaylist" ADD CONSTRAINT "SavedPlaylist_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedAlbum" ADD CONSTRAINT "SavedAlbum_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedAlbum" ADD CONSTRAINT "SavedAlbum_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
