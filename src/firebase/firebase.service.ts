import { Inject, Injectable } from '@nestjs/common';
import { app } from 'firebase-admin';
import { Readable } from 'stream';
import { IUploadProps } from './firebase.interface';
import { splitStringFromLastDot } from 'src/utils/helpers/string';

@Injectable()
export class FirebaseService {
  private readonly FirebaseApp: app.App;

  constructor(@Inject('FIREBASE_APP') firebaseApp: app.App) {
    this.FirebaseApp = firebaseApp;
  }

  private getBucket() {
    return this.FirebaseApp.storage().bucket();
  }

  private getFileMimeType(extension: string): string | undefined {
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
    };

    return mimeTypes[extension.toLowerCase()];
  }
  private async uploadChunkedFile({
    destinationPath,
    fileBuffer,
    contentType,
    metadata,
  }: {
    destinationPath: string;
    fileBuffer: Buffer | Readable;
    contentType: string;
    metadata: Record<string, any>;
  }): Promise<string> {
    const bucket = this.getBucket();
    const file = bucket.file(destinationPath);

    return new Promise((resolve, reject) => {
      const stream = file.createWriteStream({
        metadata: {
          contentType,
          metadata,
        },
      });

      if (fileBuffer instanceof Buffer) {
        stream.end(fileBuffer);
      } else {
        fileBuffer.pipe(stream);
      }

      stream.on('error', (error) => reject(error));
      stream.on('finish', async () => {
        const [signedUrl] = await file.getSignedUrl({
          action: 'read',
          expires: '03-09-2491',
        });
        resolve(signedUrl);
      });
    });
  }

  async uploadFile({
    directory,
    fileName,
    fileBuffer,
    originalFilename,
    fileType,
  }: IUploadProps): Promise<string> {
    const [baseFileName, extension] = splitStringFromLastDot(originalFilename);

    const contentType = this.getFileMimeType(extension);

    // Delete existing file with the same userId and fileName (ignoring extension)
    await this.deleteFile({ directory, fileName });

    const metadata = { fileName, originalFilename, baseFileName, fileType };

    return await this.uploadChunkedFile({
      destinationPath: `${directory}/${fileName}${extension !== undefined ? `.${extension}` : ''}`,
      fileBuffer,
      contentType: contentType || '',
      metadata,
    });
  }

  async deleteFile({
    directory,
    fileName,
  }: {
    directory: string;
    fileName: string;
  }) {
    const bucket = this.getBucket();
    const [files] = await bucket.getFiles({ prefix: `/${directory}` });
    await Promise.all(
      files
        .filter((file) => file.name.includes(fileName))
        .map((existingFile) => existingFile.delete())
    );
  }

  async deleteDirectory({ directory }: { directory: string }) {
    const bucket = this.getBucket();
    const dir = directory.startsWith('/') ? directory.substring(1) : directory; // Remove leading slash if present
    const prefix = dir.endsWith('/') ? dir : `${dir}/`;
    await bucket.deleteFiles({ prefix });
  }
}
