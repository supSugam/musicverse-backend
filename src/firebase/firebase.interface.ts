import { Readable } from 'stream';

export interface IUploadProps {
  directory: string;
  fileName: string;
  fileBuffer: Buffer | Readable;
  originalFilename: string;
  fileType: 'image' | 'audio';
}
