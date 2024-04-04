export type NotificationPayload<T extends object, P extends object> = {
  data: T;
  eventParams: P;
};

export interface NewTrackPayload {
  trackId: string;
  artistId: string;
  title: string;
  artistName: string;
  imageUrl?: string;
}

export interface LikeTrackPayload {
  trackId: string;
  userId: string;
}

export interface FollowPayload {
  followerId: string;
  followingId: string;
}

export interface DownloadTrackPayload {
  trackId: string;
  userId: string;
}

export interface SavePlaylistPayload {
  playlistId: string;
  userId: string;
}

export interface SaveAlbumPayload {
  albumId: string;
  userId: string;
}

export interface CollaboratePlaylistPayload {
  playlistId: string;
  userId: string;
}

export interface NewAlbumPayload {
  albumId: string;
  artistId: string;
  title: string;
  artistName: string;
  imageUrl?: string;
}

export interface NewPlaylistPayload {
  playlistId: string;
  userId: string;
  title: string;
  imageUrl?: string;
}
