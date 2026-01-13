import { CloudinaryService } from '../services/cloudinaryService';
import { BadRequestError } from '../errors/errors';

interface MulterFile {
    buffer: Buffer;
    mimetype: string;
}

export class UploadHelper {
    private static readonly ALLOWED_MIMES = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
    ];

    private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024;

    constructor(private cloudinaryService: CloudinaryService) {}

    validateFile(file: MulterFile | undefined): void {
        if (!file) {
            throw new BadRequestError('No file provided');
        }

        if (!file.buffer || file.buffer.length === 0) {
            throw new BadRequestError('File buffer is empty');
        }

        if (file.buffer.length > UploadHelper.MAX_FILE_SIZE) {
            throw new BadRequestError(
                `File size exceeds maximum limit of ${UploadHelper.MAX_FILE_SIZE / (1024 * 1024)}MB`,
            );
        }

        if (!UploadHelper.ALLOWED_MIMES.includes(file.mimetype)) {
            throw new BadRequestError(
                `Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed. Received: ${file.mimetype}`,
            );
        }
    }

    async uploadProfilePicture(file: MulterFile): Promise<string> {
        this.validateFile(file);
        return this.cloudinaryService.uploadImage(
            file,
            'devconnect/profile-pictures',
        );
    }
}
