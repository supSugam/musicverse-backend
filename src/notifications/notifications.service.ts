import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Messaging } from 'firebase-admin/lib/messaging/messaging';
import { FirebaseService } from 'src/firebase/firebase.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationType } from './notification-type.enum';
import { LikeTrackPayload, NewTrackPayload } from './payload.type';
import { ApnsConfig } from 'firebase-admin/lib/messaging/messaging-api';
import { cleanObject } from 'src/utils/helpers/Object';

@Injectable()
export class NotificatonsService {
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
      title: 'New Song 🎵',
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
            devices: {
              select: {
                deviceToken: true,
              },
            },
          },
        },
      },
    });

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
      title: 'New Like ❤️',
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
}
