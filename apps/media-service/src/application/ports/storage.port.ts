export abstract class StoragePort {
  abstract upload(key: string, buffer: Buffer, mimeType: string): Promise<void>;
  abstract delete(key: string): Promise<void>;
  abstract getPresignedUrl(key: string, expiresIn?: number): Promise<string>;
}
