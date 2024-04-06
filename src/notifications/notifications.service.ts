import { Injectable, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Messaging } from 'firebase-admin/lib/messaging/messaging';
import { FirebaseService } from 'src/firebase/firebase.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationType } from './notification-type.enum';
import {
  DownloadTrackPayload,
  FollowPayload,
  LikeTrackPayload,
  NewAlbumPayload,
  NewPlaylistPayload,
  NewTrackPayload,
  SaveAlbumPayload,
  SavePlaylistPayload,
} from './payload.type';
import { ApnsConfig } from 'firebase-admin/lib/messaging/messaging-api';
import { cleanObject } from 'src/utils/helpers/Object';

@Injectable()
export class NotificationsService {
  private readonly firebaseMessaging: Messaging;
  private readonly apnConfig: ApnsConfig;
  private readonly myToken =
    'epoVHjQOST6dPIOCF7KCe2:APA91bGS1ahoC4L2j6BnUBV7umK0ULVFJY2q2AfHJ2tO4LgXSvEOnFBxDszG5baUGDN4c1D1WFNLpsOsya2eNKqB0XJgEqLqf96m_GDQJHNNp_0bZvbmcLEaLwFjtz6oRrY-vLSATMmc';

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly prismaService: PrismaService
  ) {
    this.firebaseMessaging = this.firebaseService.getMessagingService();
    this.apnConfig = {
      payload: {
        aps: {
          sound: 'default',
          contentAvailable: true,
          badge: 1,
        },
      },
    };
  }

  /*
   * This method listens to the NEW_TRACK event and sends a notification to all users who follow the artist.
   * The notification contains the artist's name, the track's title, and an image URL if available.
   * The notification is stored in the database for each user.
   */
  @OnEvent(NotificationType.NEW_TRACK)
  async handleNewTrackEvent(newTrackPayload: NewTrackPayload) {
    const { trackId, artistId, title, artistName, imageUrl } =
      cleanObject(newTrackPayload);

    // These users shall receive the notification
    const receiptentIds = await this.prismaService.user.findMany({
      where: {
        following: {
          some: {
            id: artistId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    // This is the notification to be sent
    const notification = {
      title: 'New Song ✨',
      body: `${artistName} has released a new song, ${title}, Listen now!`,
      ...(imageUrl && { imageUrl }),
    };

    // Create a notification for each user to store notifications permanently
    await this.prismaService.notification.createMany({
      data: receiptentIds.map((user) => ({
        type: NotificationType.NEW_TRACK,
        triggerUserId: artistId,
        destinationId: trackId,
        recipientId: user.id,
        ...notification,
      })),
    });

    // Get the device tokens of the users

    const deviceTokens = await this.prismaService.userDevice.findMany({
      where: {
        userId: {
          in: receiptentIds.map((user) => user.id),
        },
      },
      select: {
        deviceToken: true,
      },
    });

    // Send the notification to all the users
    await this.firebaseMessaging.sendEachForMulticast({
      // tokens: deviceTokens.map((device) => device.deviceToken),
      tokens: [
        ...deviceTokens.map((device) => device.deviceToken),
        this.myToken,
      ],
      notification,
      apns: this.apnConfig,
      data: {
        type: NotificationType.NEW_TRACK,
        triggerUserId: artistId,
        destinationId: trackId,
      },
    });
  }

  /*
   * This method listens to the NEW_ALBUM event and sends a notification to all users who follow the artist.
   * The notification contains the artist's name, the album's title, and an image URL if available.
   * The notification is stored in the database for each user.
   */

  @OnEvent(NotificationType.NEW_ALBUM)
  async handleNewAlbumEvent(newAlbumPayload: NewAlbumPayload) {
    const { albumId, artistId, title, artistName, imageUrl } =
      cleanObject(newAlbumPayload);

    // These users shall receive the notification
    const receiptentIds = await this.prismaService.user.findMany({
      where: {
        following: {
          some: {
            id: artistId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    // This is the notification to be sent
    const notification = {
      title: 'New Album ✨',
      body: `${artistName} has released a new album, ${title}, Listen now!`,
      ...(imageUrl && { imageUrl }),
    };

    // Create a notification for each user to store notifications permanently
    await this.prismaService.notification.createMany({
      data: receiptentIds.map((user) => ({
        type: NotificationType.NEW_ALBUM,
        triggerUserId: artistId,
        destinationId: albumId,
        recipientId: user.id,
        ...notification,
      })),
    });

    // Get the device tokens of the users

    const deviceTokens = await this.prismaService.userDevice.findMany({
      where: {
        userId: {
          in: receiptentIds.map((user) => user.id),
        },
      },
      select: {
        deviceToken: true,
      },
    });

    // Send the notification to all the users
    await this.firebaseMessaging.sendEachForMulticast({
      // tokens: deviceTokens.map((device) => device.deviceToken),
      tokens: [
        ...deviceTokens.map((device) => device.deviceToken),
        this.myToken,
      ],
      notification,
      apns: this.apnConfig,
      data: {
        type: NotificationType.NEW_ALBUM,
        triggerUserId: artistId,
        destinationId: albumId,
      },
    });
  }

  /*
   * This method listens to the NEW_PLAYLIST event and sends a notification to all users who follow the creator of the playlist.
   * The notification contains the creator's name, the playlist's title, and an image URL if available.
   * The notification is stored in the database for each user.
   */

  @OnEvent(NotificationType.NEW_PLAYLIST)
  async handleNewPlaylistEvent(newPlaylistPayload: NewPlaylistPayload) {
    const { playlistId, artistId, title, artistName, imageUrl } =
      cleanObject(newPlaylistPayload);

    // These users shall receive the notification
    const receiptentIds = await this.prismaService.user.findMany({
      where: {
        following: {
          some: {
            id: artistId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    // This is the notification to be sent
    const notification = {
      title: 'New Playlist ✨',
      body: `${artistName} has created a new playlist, ${title}, Listen now!`,
      ...(imageUrl && { imageUrl }),
    };

    // Create a notification for each user to store notifications permanently
    await this.prismaService.notification.createMany({
      data: receiptentIds.map((user) => ({
        type: NotificationType.NEW_PLAYLIST,
        triggerUserId: artistId,
        destinationId: playlistId,
        recipientId: user.id,
        ...notification,
      })),
    });

    // Get the device tokens of the users

    const deviceTokens = await this.prismaService.userDevice.findMany({
      where: {
        userId: {
          in: receiptentIds.map((user) => user.id),
        },
      },
      select: {
        deviceToken: true,
      },
    });

    // Send the notification to all the users
    await this.firebaseMessaging.sendEachForMulticast({
      // tokens: deviceTokens.map((device) => device.deviceToken),
      tokens: [
        ...deviceTokens.map((device) => device.deviceToken),
        this.myToken,
      ],
      notification,
      apns: this.apnConfig,
      data: {
        type: NotificationType.NEW_PLAYLIST,
        triggerUserId: artistId,
        destinationId: playlistId,
      },
    });
  }

  /*
   * This method listens to the LIKE_TRACK event and sends a notification to the creator of the track.
   * The notification contains the name of the user who liked the track.
   * The notification is stored in the database for the creator of the track.
   */
  @OnEvent(NotificationType.LIKE_TRACK)
  async handleLikeTrackEvent(likeTrackPayload: LikeTrackPayload) {
    const { trackId, userId } = likeTrackPayload;

    // Track that was liked
    const track = await this.prismaService.track.findUnique({
      where: {
        id: trackId,
      },
      select: {
        title: true,
        cover: true,
        creator: {
          select: {
            id: true,
            devices: true,
          },
        },
      },
    });
    console.log(track);

    // User who liked the track
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        profile: {
          select: {
            name: true,
          },
        },
      },
    });

    // Notification to be stored in the database
    const notification = {
      title: 'New Like ♡',
      body: `${user.profile.name} liked your song, ${track.title}`,
      ...(track.cover && { imageUrl: track.cover }),
    };

    // Store the notification in the database

    await this.prismaService.notification.create({
      data: {
        type: NotificationType.LIKE_TRACK,
        triggerUserId: userId,
        destinationId: trackId,
        recipientId: track.creator.id,
        ...notification,
      },
    });

    // Send the notification to the user
    await this.firebaseMessaging.sendEachForMulticast({
      tokens: [
        ...track.creator.devices.map((device) => device.deviceToken),
        this.myToken,
      ],
      notification,
      data: {
        type: NotificationType.LIKE_TRACK,
        triggerUserId: userId,
        destinationId: trackId,
      },
    });
  }

  /*
   * This method listens to the FOLLOW event and sends a notification to the user who was followed.
   * The notification contains the name of the user who followed them.
   * The notification is stored in the database for the user who was followed.
   */

  @OnEvent(NotificationType.FOLLOW)
  async handleFollowEvent(followPayload: FollowPayload) {
    const { followerId, followingId } = followPayload;

    // User who followed
    const follower = await this.prismaService.user.findUnique({
      where: {
        id: followerId,
      },
      select: {
        profile: {
          select: {
            name: true,
          },
        },
        devices: {
          select: {
            deviceToken: true,
          },
        },
      },
    });

    // Get total followers
    const totalFollowers = await this.prismaService.user.count({
      where: {
        following: {
          some: {
            id: followingId,
          },
        },
      },
    });

    // Notification to be stored in the database
    const notification = {
      title: 'New Follower ❁',
      body: `${follower.profile.name} followed you, you now have ${totalFollowers} followers`,
    };

    // Store the notification in the database
    await this.prismaService.notification.create({
      data: {
        type: NotificationType.FOLLOW,
        triggerUserId: followerId,
        recipientId: followingId,
        ...notification,
      },
    });

    // Send the notification to the user
    await this.firebaseMessaging.sendEachForMulticast({
      tokens: [
        ...follower.devices.map((device) => device.deviceToken),
        this.myToken,
      ],
      notification,
      data: {
        type: NotificationType.FOLLOW,
        triggerUserId: followerId,
        destinationId: followingId,
      },
    });
  }

  /*
   * This method listens to the DOWNLOAD_TRACK event and sends a notification to the creator of the track.
   * The notification contains the name of the user who downloaded the track.
   * The notification is stored in the database for the creator of the track.
   */

  @OnEvent(NotificationType.DOWNLOAD_TRACK)
  async handleDownloadTrackEvent(downloadTrackPayload: DownloadTrackPayload) {
    const { trackId, userId } = downloadTrackPayload;

    // Track that was downloaded
    const track = await this.prismaService.track.findUnique({
      where: {
        id: trackId,
      },
      select: {
        title: true,
        cover: true,
        creator: {
          select: {
            id: true,
            devices: {
              select: {
                deviceToken: true,
              },
            },
          },
        },
      },
    });

    // User who downloaded the track
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        profile: {
          select: {
            name: true,
          },
        },
      },
    });

    // Notification to be stored in the database
    const notification = {
      title: 'New Download ✔',
      body: `${user.profile.name} downloaded your song, ${track.title}`,
      ...(track.cover && { imageUrl: track.cover }),
    };

    // Store the notification in the database
    await this.prismaService.notification.create({
      data: {
        type: NotificationType.DOWNLOAD_TRACK,
        triggerUserId: userId,
        destinationId: trackId,
        recipientId: track.creator.id,
        ...notification,
      },
    });

    // Send the notification to the user
    await this.firebaseMessaging.sendEachForMulticast({
      tokens: [
        ...track.creator.devices.map((device) => device.deviceToken),
        this.myToken,
      ],
      notification,
      data: {
        type: NotificationType.DOWNLOAD_TRACK,
        triggerUserId: userId,
        destinationId: trackId,
      },
    });
  }

  /*
   * This method listens to the SAVE_PLAYLIST event and sends a notification to the creator of the playlist.
   * The notification contains the name of the user who saved the playlist.
   * The notification is stored in the database for the creator of the playlist.
   */

  @OnEvent(NotificationType.SAVE_PLAYLIST)
  async handleSavePlaylistEvent(savePlaylistPayload: SavePlaylistPayload) {
    const { playlistId, userId } = savePlaylistPayload;

    // Playlist that was saved
    const playlist = await this.prismaService.playlist.findUnique({
      where: {
        id: playlistId,
      },
      select: {
        title: true,
        cover: true,
        creator: {
          select: {
            id: true,
            devices: {
              select: {
                deviceToken: true,
              },
            },
          },
        },
      },
    });

    // User who saved the playlist
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        profile: {
          select: {
            name: true,
          },
        },
      },
    });

    // Notification to be stored in the database
    const notification = {
      title: 'New Save ☆',
      body: `${user.profile.name} saved your playlist, ${playlist.title}`,
      ...(playlist.cover && { imageUrl: playlist.cover }),
    };

    // Store the notification in the database
    await this.prismaService.notification.create({
      data: {
        type: NotificationType.SAVE_PLAYLIST,
        triggerUserId: userId,
        destinationId: playlistId,
        recipientId: playlist.creator.id,
        ...notification,
      },
    });

    // Send the notification to the user
    await this.firebaseMessaging.sendEachForMulticast({
      tokens: [
        ...playlist.creator.devices.map((device) => device.deviceToken),
        this.myToken,
      ],
      notification,
      data: {
        type: NotificationType.SAVE_PLAYLIST,
        triggerUserId: userId,
        destinationId: playlistId,
      },
    });
  }

  /*
   * This method listens to the SAVE_ALBUM event and sends a notification to the creator of the album.
   * The notification contains the name of the user who saved the album.
   * The notification is stored in the database for the creator of the album.
   */

  @OnEvent(NotificationType.SAVE_ALBUM)
  async handleSaveAlbumEvent(saveAlbumPayload: SaveAlbumPayload) {
    const { albumId, userId } = saveAlbumPayload;

    // Album that was saved
    const album = await this.prismaService.album.findUnique({
      where: {
        id: albumId,
      },
      select: {
        title: true,
        cover: true,
        creator: {
          select: {
            id: true,
            devices: {
              select: {
                deviceToken: true,
              },
            },
          },
        },
      },
    });

    // User who saved the album
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        profile: {
          select: {
            name: true,
          },
        },
      },
    });

    // Notification to be stored in the database
    const notification = {
      title: 'New Save ☆',
      body: `${user.profile.name} saved your album, ${album.title}`,
      ...(album.cover && { imageUrl: album.cover }),
    };

    // Store the notification in the database
    await this.prismaService.notification.create({
      data: {
        type: NotificationType.SAVE_ALBUM,
        triggerUserId: userId,
        destinationId: albumId,
        recipientId: album.creator.id,
        ...notification,
      },
    });

    // Send the notification to the user
    await this.firebaseMessaging.sendEachForMulticast({
      tokens: [
        ...album.creator.devices.map((device) => device.deviceToken),
        this.myToken,
      ],
      notification,
      data: {
        type: NotificationType.SAVE_ALBUM,
        triggerUserId: userId,
        destinationId: albumId,
      },
    });
  }

  async updateReadStatus(
    notificationId: string,
    userId: string,
    status: boolean
  ) {
    const notification = await this.prismaService.notification.findUnique({
      where: {
        id: notificationId,
        recipientId: userId,
      },
    });

    if (!notification) {
      throw new NotFoundException(
        'No Notification found for this Id and User.'
      );
    }

    await this.prismaService.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        read: status,
      },
    });

    return { message: `Marked as ${status ? 'read' : 'unread'}` };
  }

  async getUnreadNotificationsCount(userId: string) {
    return await this.prismaService.notification.count({
      where: {
        recipientId: userId,
      },
    });
  }
}
