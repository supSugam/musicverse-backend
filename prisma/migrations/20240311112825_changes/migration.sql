/*
  Warnings:

  - A unique constraint covering the columns `[userId,albumId]` on the table `SavedAlbum` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,playlistId]` on the table `SavedPlaylist` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SavedAlbum_userId_albumId_key" ON "SavedAlbum"("userId", "albumId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedPlaylist_userId_playlistId_key" ON "SavedPlaylist"("userId", "playlistId");
