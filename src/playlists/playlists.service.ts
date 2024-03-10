import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreatePlaylistDto,
  CreatePlaylistPayload,
} from './dto/create-playlist.dto';
import {
  UpdatePlaylistDto,
  UpdatePlaylistPayload,
} from './dto/update-playlist.dto';
import { cleanObject } from 'src/utils/helpers/Object';
import { PrismaService } from 'src/prisma/prisma.service';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class PlaylistsService {
  constructor(
    private prisma: PrismaService,
    private firebaseService: FirebaseService
  ) {}

  create(createPlaylistPayload: CreatePlaylistPayload) {
    const { creatorId, title, tags, ...rest } = cleanObject(
      createPlaylistPayload
    );

    const playlistWithSameTitleExists = this.prisma.playlist.findFirst({
      where: {
        title: title,
        creatorId: creatorId,
      },
    });
    if (playlistWithSameTitleExists) {
      throw new BadRequestException(
        'You already have a playlist with same title'
      );
    }

    return this.prisma.playlist.create({
      data: {
        title,
        ...rest,
        creator: {
          connect: {
            id: creatorId,
          },
        },
        tags: {
          connect: tags.map((tagId) => ({ id: tagId })),
        },
      },
    });
  }

  findAll() {
    return `This action returns all playlists`;
  }

  findOne(id: number) {
    return `This action returns a #${id} playlist`;
  }

  update(id: string, updatePlaylistPayload: UpdatePlaylistPayload) {
    const { tags, ...rest } = cleanObject(updatePlaylistPayload);

    try {
      return this.prisma.playlist.update({
        where: {
          id: id,
        },
        data: {
          ...rest,
          ...(tags && {
            tags: {
              set: tags.map((tagId) => ({ id: tagId })),
            },
          }),
        },
      });
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} playlist`;
  }
}
