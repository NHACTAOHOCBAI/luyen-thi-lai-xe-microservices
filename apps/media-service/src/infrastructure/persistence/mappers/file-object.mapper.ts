import { FileObject } from '../../../domain/aggregates/file-object/file-object.aggregate';

export interface RawFileObjectRow {
  id: string;
  storageKey: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  bucketName: string;
  uploadedById: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const FileObjectMapper = {
  toDomain(raw: RawFileObjectRow): FileObject {
    return FileObject.reconstitute({
      id: raw.id,
      storageKey: raw.storageKey,
      originalName: raw.originalName,
      mimeType: raw.mimeType,
      fileSize: raw.fileSize,
      bucketName: raw.bucketName,
      uploadedById: raw.uploadedById,
      isPublic: raw.isPublic,
      createdAt: raw.createdAt,
    });
  },
};
