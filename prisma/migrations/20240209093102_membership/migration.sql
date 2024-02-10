-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'MEMBER';

-- AlterTable
ALTER TABLE "Playlist" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "saves" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "likes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lyrics" TEXT,
ADD COLUMN     "preview" TEXT;

-- CreateTable
CREATE TABLE "Album" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "cover" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorId" TEXT NOT NULL,
    "saves" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Album_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "type" "UserRole" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_LikedTracks" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_SavedPlaylists" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_PlaylistToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AlbumToTrack" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_SavedAlbums" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AlbumToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_TagToTrack" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_LikedTracks_AB_unique" ON "_LikedTracks"("A", "B");

-- CreateIndex
CREATE INDEX "_LikedTracks_B_index" ON "_LikedTracks"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_SavedPlaylists_AB_unique" ON "_SavedPlaylists"("A", "B");

-- CreateIndex
CREATE INDEX "_SavedPlaylists_B_index" ON "_SavedPlaylists"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PlaylistToTag_AB_unique" ON "_PlaylistToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_PlaylistToTag_B_index" ON "_PlaylistToTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AlbumToTrack_AB_unique" ON "_AlbumToTrack"("A", "B");

-- CreateIndex
CREATE INDEX "_AlbumToTrack_B_index" ON "_AlbumToTrack"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_SavedAlbums_AB_unique" ON "_SavedAlbums"("A", "B");

-- CreateIndex
CREATE INDEX "_SavedAlbums_B_index" ON "_SavedAlbums"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AlbumToTag_AB_unique" ON "_AlbumToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_AlbumToTag_B_index" ON "_AlbumToTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TagToTrack_AB_unique" ON "_TagToTrack"("A", "B");

-- CreateIndex
CREATE INDEX "_TagToTrack_B_index" ON "_TagToTrack"("B");

-- AddForeignKey
ALTER TABLE "Album" ADD CONSTRAINT "Album_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LikedTracks" ADD CONSTRAINT "_LikedTracks_A_fkey" FOREIGN KEY ("A") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LikedTracks" ADD CONSTRAINT "_LikedTracks_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SavedPlaylists" ADD CONSTRAINT "_SavedPlaylists_A_fkey" FOREIGN KEY ("A") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SavedPlaylists" ADD CONSTRAINT "_SavedPlaylists_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlaylistToTag" ADD CONSTRAINT "_PlaylistToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlaylistToTag" ADD CONSTRAINT "_PlaylistToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlbumToTrack" ADD CONSTRAINT "_AlbumToTrack_A_fkey" FOREIGN KEY ("A") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlbumToTrack" ADD CONSTRAINT "_AlbumToTrack_B_fkey" FOREIGN KEY ("B") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SavedAlbums" ADD CONSTRAINT "_SavedAlbums_A_fkey" FOREIGN KEY ("A") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SavedAlbums" ADD CONSTRAINT "_SavedAlbums_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlbumToTag" ADD CONSTRAINT "_AlbumToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlbumToTag" ADD CONSTRAINT "_AlbumToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToTrack" ADD CONSTRAINT "_TagToTrack_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToTrack" ADD CONSTRAINT "_TagToTrack_B_fkey" FOREIGN KEY ("B") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;
