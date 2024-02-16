import { FileValidator } from '@nestjs/common';

// TODO: role based file size
export interface CustomUploadFileValidatorOptions {
  [key: string]: {
    fileTypes: string[];
    maxFileSize: number;
  };
}

export class CustomUploadFileValidator extends FileValidator {
  private _allowedMimeTypes: { [field: string]: string[] } = {};
  private _maxFileSize: { [field: string]: number } = {};
  private _fieldNames: string[] = [];
  private _errorMessage: string = '';

  constructor(
    protected readonly validationOptions: CustomUploadFileValidatorOptions
  ) {
    super(validationOptions);
    for (const field in validationOptions) {
      this._allowedMimeTypes[field] = validationOptions[field].fileTypes;
      this._maxFileSize[field] = validationOptions[field].maxFileSize;
      this._fieldNames.push(field);
    }
  }

  private verifyMimeType(fieldName: string, mimeType: string): boolean {
    return this._allowedMimeTypes[fieldName].includes(mimeType);
  }

  private verifyField(fieldName: string): boolean {
    return this._fieldNames.includes(fieldName);
  }

  private verifyFileSize(fieldName: string, fileSize: number): boolean {
    return fileSize <= this._maxFileSize[fieldName];
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
    const allFiles = Object.keys(files)
      .map((key) => files[key])
      .map((f) => (f instanceof Array ? f[0] : f));

    // Initialize error message
    let isValid = true;

    for (const file of allFiles) {
      const { fieldname, mimetype, size } = file;

      // Check fieldname exists
      const isValidField = this.verifyField(fieldname);
      if (!isValidField) {
        this._errorMessage = `Invalid field name ${fieldname}`;
        isValid = false;
        continue; // Move to the next file
      }

      // Check mime type
      const isValidMimeType = this.verifyMimeType(fieldname, mimetype);
      if (!isValidMimeType) {
        this._errorMessage = `Invalid file type for ${fieldname}. Allowed file types are ${this._allowedMimeTypes[fieldname].join(', ')}`;
        isValid = false;
        break;
      }

      // Check file size
      const isValidFileSize = this.verifyFileSize(fieldname, size);
      if (!isValidFileSize) {
        this._errorMessage = `File size too large for ${fieldname}. Max file size is ${this.bytesToSize(this._maxFileSize[fieldname])}`;
        isValid = false;
        break;
      }
    }

    // Return false if there are any error messages
    return isValid;
  }

  public buildErrorMessage(): string {
    return this._errorMessage;
  }
}
