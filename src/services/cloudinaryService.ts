import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { injectable } from 'tsyringe';
import { envValues } from '../utils/envParser';
import { CloudinaryError } from '../errors/errors';

@injectable()
export class CloudinaryService {
    constructor() {
        cloudinary.config({
            cloud_name: envValues.CLOUDINARY_CLOUD_NAME,
            api_key: envValues.CLOUDINARY_API_KEY,
            api_secret: envValues.CLOUDINARY_API_SECRET,
        });
    }

    async uploadImage(
        file: { buffer: Buffer; mimetype: string },
        folder: string = 'devconnect/uploads',
    ): Promise<string> {
        try {
            if (!file) {
                throw new CloudinaryError('No file provided for upload');
            }

            if (!file.buffer) {
                throw new CloudinaryError('File buffer is missing');
            }

            const stream = Readable.from(file.buffer);

            const result = await new Promise<{
                secure_url: string;
                public_id: string;
            }>((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: folder,
                        resource_type: 'auto',
                        allowed_formats: ['jpeg', 'png', 'gif', 'webp'],
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(
                                result as {
                                    secure_url: string;
                                    public_id: string;
                                },
                            );
                        }
                    },
                );

                stream.pipe(uploadStream);
            });

            return result.secure_url;
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Unknown error occurred';
            throw new CloudinaryError(
                `Failed to upload image to Cloudinary: ${errorMessage}`,
            );
        }
    }

    async deleteImage(publicId: string): Promise<void> {
        try {
            if (!publicId) {
                throw new CloudinaryError('Public ID is required for deletion');
            }

            await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Unknown error occurred';
            throw new CloudinaryError(
                `Failed to delete image from Cloudinary: ${errorMessage}`,
            );
        }
    }
}
