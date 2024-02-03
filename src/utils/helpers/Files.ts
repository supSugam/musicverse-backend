import { HttpException, HttpStatus } from '@nestjs/common';

export const IsValidFile = async ({
  file,
  maxSize,
  allowedTypes,
  allowedExtensions,
}: {
  file: Express.Multer.File;
  maxSize: number;
  allowedTypes: string[];
  allowedExtensions: string[];
}): Promise<void> => {
  if (file.size > maxSize) {
    throw new HttpException(
      'File is too large',
      HttpStatus.UNPROCESSABLE_ENTITY
    );
  }
  if (!allowedTypes.includes(file.mimetype)) {
    throw new HttpException(
      'File type is not allowed',
      HttpStatus.UNPROCESSABLE_ENTITY
    );
  }
  if (!allowedExtensions.includes(file.originalname.split('.').pop())) {
    throw new HttpException(
      'File extension is not allowed',
      HttpStatus.UNPROCESSABLE_ENTITY
    );
  }
};
