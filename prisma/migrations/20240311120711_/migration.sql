/*
  Warnings:

  - A unique constraint covering the columns `[userId,trackId]` on the table `LikedTrack` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,playlistId]` on the table `SavedPlaylist` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LikedTrack_userId_trackId_key" ON "LikedTrack"("userId", "trackId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedPlaylist_userId_playlistId_key" ON "SavedPlaylist"("userId", "playlistId");
