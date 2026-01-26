export interface UploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  public?: boolean;
}

export interface IStorageService {
  upload(
    key: string,
    data: Buffer | string,
    options?: UploadOptions,
  ): Promise<{ url: string; key: string; etag: string }>;

  download(key: string): Promise<Buffer>;
  getUrl(key: string, expiresIn?: number): Promise<string>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;

  // Batch operations
  uploadMultiple(
    files: Array<{ key: string; data: Buffer | string }>,
    options?: UploadOptions,
  ): Promise<Array<{ url: string; key: string; etag: string }>>;
}
