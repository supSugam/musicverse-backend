export const IsValidFile = ({
  file,
  maxSize,
  allowedTypes,
  allowedExtensions,
}: {
  file: Express.Multer.File;
  maxSize: number;
  allowedTypes: string[];
  allowedExtensions: string[];
}): void => {
  //   if (file.size > maxSize) {
  //     throw new Error('File is too large');
  //   }
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('File type is not allowed');
  }
  if (!allowedExtensions.includes(file.originalname.split('.').pop())) {
    throw new Error('File extension is not allowed');
  }
};
