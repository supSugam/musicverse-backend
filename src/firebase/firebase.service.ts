import { Inject, Injectable } from '@nestjs/common';
import { app } from 'firebase-admin';
import { Readable } from 'stream';
import { IUploadProps } from './firebase.interface';

@Injectable()
export class FirebaseService {
  private readonly FirebaseApp: app.App;

  constructor(@Inject('FIREBASE_APP') firebaseApp: app.App) {
    this.FirebaseApp = firebaseApp;
  }

  private getBucket() {
    return this.FirebaseApp.storage().bucket();
  }

  private async detectMimeType(base64: string): Promise<string | undefined> {
    const signatures: { [key: string]: string } = {
      JVBERi0: 'application/pdf',
      R0lGODdh: 'image/gif',
      R0lGODlh: 'image/gif',
      iVBORw0KGgo: 'image/png',
      '/9j/': 'image/jpeg',
    };

    for (const s in signatures) {
      if (base64.indexOf(s) === 0) {
        return signatures[s];
      }
    }

    return undefined; // Mime type not detected
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
    const extension = originalFilename.split('.')[1];
    const baseFileName = originalFilename.replace(/\.[^/.]+$/, ''); // Remove extension

    const contentType =
      fileType === 'image'
        ? await this.detectMimeType(fileBuffer.toString('base64'))
        : fileType === 'audio'
          ? 'audio/' +
            (extension === 'mp3' || extension === 'wav' ? extension : 'mpeg')
          : undefined;

    // Delete existing file with the same userId and fileName (ignoring extension)
    const bucket = this.getBucket();
    const [files] = await bucket.getFiles({ prefix: `/${directory}` });
    await Promise.all(
      files
        .filter((file) => file.name.includes(fileName))
        .map((existingFile) => existingFile.delete())
    );

    const metadata = { fileName, originalFilename, baseFileName, fileType };

    return this.uploadChunkedFile({
      destinationPath: `${directory}/${fileName}.${extension}`,
      fileBuffer,
      contentType: contentType || '',
      metadata,
    });
  }
}
