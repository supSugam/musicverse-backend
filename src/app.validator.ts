import { FileValidator } from '@nestjs/common';
export interface CustomUploadFileValidatorOptions {
  fileTypes: string[];
  maxFileSize: number;
}

export class CustomUploadFileValidator extends FileValidator {
  private _allowedMimeTypes: string[];
  private _maxFileSize: number;
  private _errorMessage: string;

  constructor(
    protected readonly validationOptions: CustomUploadFileValidatorOptions
  ) {
    super(validationOptions);
    this._allowedMimeTypes = this.validationOptions.fileTypes;
    this._maxFileSize = this.validationOptions.maxFileSize;
  }

  private bytesToSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) {
      return '0 Byte';
    }
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
  }

  public isValid(files?: Express.Multer.File): boolean {
    if (!files) {
      return true;
    }
    const allFiles = Object.keys(files).map((key) => files[key]);

    const validMimeType = allFiles.every((f) => {
      const file =
        f instanceof Array
          ? (f[0] as Express.Multer.File)
          : (f as Express.Multer.File);

      return this._allowedMimeTypes.includes(file.mimetype);
    });

    if (!validMimeType) {
      this._errorMessage = `Invalid file type. Allowed file types are ${this._allowedMimeTypes.join(', ')}`;
      return false;
    }
    const validFileSize = allFiles.every((f) => {
      const file =
        f instanceof Array
          ? (f[0] as Express.Multer.File)
          : (f as Express.Multer.File);
      return file.size <= this._maxFileSize;
    });
    if (!validFileSize) {
      this._errorMessage = `File size too large. Max file size is ${this.bytesToSize(this._maxFileSize)}`;
      return false;
    }
    return true;
  }

  public buildErrorMessage(): string {
    return this._errorMessage;
  }
}
