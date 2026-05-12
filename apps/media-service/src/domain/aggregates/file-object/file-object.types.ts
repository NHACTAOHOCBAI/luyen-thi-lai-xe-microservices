export interface CreateFileObjectProps {
  id: string;
  storageKey: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  bucketName: string;
  uploadedById: string;
  isPublic?: boolean;
}

export interface ReconstituteFileObjectProps {
  id: string;
  storageKey: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  bucketName: string;
  uploadedById: string;
  isPublic: boolean;
  createdAt: Date;
}
