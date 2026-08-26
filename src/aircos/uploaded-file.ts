/** Memory-storage upload; vermijdt Express.Multer (niet globaal onder nodenext). */
export type UploadedFilePayload = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
};
