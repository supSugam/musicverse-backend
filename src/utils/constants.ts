import { Role } from 'src/guards/roles.enum';

export const DATABASE_URL = process.env.DATABASE_URL;

export const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

export const MAIL_HOST = process.env.MAIL_HOST;
export const MAIL_PORT = parseInt(process.env.MAIL_PORT, 10);
export const MAIL_USER = process.env.MAIL_USER;
export const MAIL_PASS = process.env.MAIL_PASS;

export const JWT_SECRET = process.env.JWT_SECRET;
export const SERVER_PORT = parseInt(process.env.SERVER_PORT);

export const FIREBASE_STORAGE_DIRS = {
  USER_AVATAR: (userId: string) => `user/${userId}/avatar`,
  USER_COVER: (userId: string) => `user/${userId}/cover`,
  TRACK_COVER: (trackId: string) => `track/${trackId}/cover`,
  TRACK_SRC: (trackId: string) => `track/${trackId}/src`,
  TRACK_PREVIEW: (trackId: string) => `track/${trackId}/preview`,
  ALBUM_COVER: (albumId: string) => `album/${albumId}/cover`,
  ALBUM_SRC: (albumId: string) => `album/${albumId}/src`,
  ALBUM_PREVIEW: (albumId: string) => `album/${albumId}/preview`,
  PLAYLIST_COVER: (playlistId: string) => `playlist/${playlistId}/cover`,
};

export const ALLOWED_IMAGE_MIMETYPES = ['image/png', 'image/jpg', 'image/jpeg'];
export const ALLOWED_AUDIO_MIMETYPES = [
  'audio/wav',
  'audio/mpeg',
  'audio/mp3',
  'audio/x-wav',
  'audio/wave',
];

export const USER_LIMITS = {
  getMaxTrackSize: (role: Role) =>
    role === Role.ARTIST || role === Role.MEMBER
      ? 200 * 1024 * 1024
      : 20 * 1024 * 1024,
  MAX_TRACKS_PER_ALBUM: 10,
};
