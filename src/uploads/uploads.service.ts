import { Storage } from '@google-cloud/storage';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly storage: Storage;
  private readonly bucketName: string;
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    const keyFilename = config.get<string>('GCS_KEY_FILE');
    this.storage = new Storage({ keyFilename });
    this.bucketName = config.getOrThrow<string>('GCS_BUCKET');
    this.baseUrl = `https://storage.googleapis.com/${this.bucketName}`;
  }

  async upload(file: Express.Multer.File): Promise<{ url: string }> {
    const ext = EXTENSION_MAP[file.mimetype] ?? 'jpg';
    const objectPath = `uploads/${uuidv4()}.${ext}`;

    const gcsFile = this.storage.bucket(this.bucketName).file(objectPath);
    await gcsFile.save(file.buffer, {
      metadata: { contentType: file.mimetype },
      resumable: false,
    });
    await gcsFile.makePublic();

    const url = `${this.baseUrl}/${objectPath}`;
    this.logger.log(`Uploaded: ${url}`);
    return { url };
  }

  async delete(url: string): Promise<void> {
    const prefix = `${this.baseUrl}/`;
    if (!url.startsWith(prefix)) {
      throw new NotFoundException('URL does not belong to this bucket');
    }

    const objectPath = url.slice(prefix.length);
    const gcsFile = this.storage.bucket(this.bucketName).file(objectPath);

    const [exists] = await gcsFile.exists();
    if (!exists) throw new NotFoundException('File not found in bucket');

    await gcsFile.delete();
    this.logger.log(`Deleted: ${url}`);
  }

  isAllowedMimeType(mimetype: string): boolean {
    return ALLOWED_MIME_TYPES.includes(mimetype);
  }
}
