import 'reflect-metadata';
import { CloudinaryService } from '../services/cloudinaryService';
import { CloudinaryError } from '../errors/errors';

jest.mock('cloudinary', () => ({
    v2: {
        config: jest.fn(),
        uploader: {
            upload_stream: jest.fn(),
            destroy: jest.fn(),
        },
    },
}));

jest.mock('../utils/envParser', () => ({
    envValues: {
        CLOUDINARY_CLOUD_NAME: 'test-cloud',
        CLOUDINARY_API_KEY: 'test-api-key',
        CLOUDINARY_API_SECRET: 'test-api-secret',
    },
}));

jest.mock('stream', () => ({
    ...jest.requireActual('stream'),
    Readable: {
        from: jest.fn(),
    },
}));

import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

describe('CloudinaryService', () => {
    let cloudinaryService: CloudinaryService;
    let mockConfig: jest.Mock;
    let mockUploadStream: jest.Mock;
    let mockDestroy: jest.Mock;
    let mockReadableFrom: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        mockConfig = cloudinary.config as jest.Mock;
        mockUploadStream = cloudinary.uploader.upload_stream as jest.Mock;
        mockDestroy = cloudinary.uploader.destroy as jest.Mock;
        mockReadableFrom = Readable.from as jest.Mock;

        cloudinaryService = new CloudinaryService();
    });

    describe('constructor', () => {
        it('should initialize cloudinary with environment credentials', () => {
            expect(mockConfig).toHaveBeenCalledWith({
                cloud_name: 'test-cloud',
                api_key: 'test-api-key',
                api_secret: 'test-api-secret',
            });
        });
    });

    describe('uploadImage', () => {
        const mockFile = {
            buffer: Buffer.from('test image data'),
            mimetype: 'image/jpeg',
        };

        it('should successfully upload image to cloudinary', async () => {
            const folder = 'devconnect/profile-pictures';
            const expectedUrl =
                'https://res.cloudinary.com/test-cloud/image/upload/v123/profile.jpg';
            const mockStream = {
                pipe: jest.fn(),
                on: jest.fn(),
            } as unknown as NodeJS.WritableStream;

            mockReadableFrom.mockReturnValue(mockStream);

            let capturedCallback: unknown;
            mockUploadStream.mockImplementation(
                (options: unknown, callback: unknown) => {
                    capturedCallback = callback;
                    return mockStream;
                },
            );

            const uploadPromise = cloudinaryService.uploadImage(
                mockFile,
                folder,
            );

            // Simulate successful upload
            if (typeof capturedCallback === 'function') {
                (
                    capturedCallback as (
                        error: Error | null,
                        result: unknown,
                    ) => void
                )(null, {
                    secure_url: expectedUrl,
                    public_id: 'devconnect/profile/test123',
                });
            }

            const result = await uploadPromise;

            expect(mockReadableFrom).toHaveBeenCalledWith(mockFile.buffer);
            expect(mockUploadStream).toHaveBeenCalledWith(
                {
                    folder: folder,
                    resource_type: 'auto',
                    allowed_formats: ['jpeg', 'png', 'gif', 'webp'],
                },
                expect.any(Function),
            );
            expect(result).toBe(expectedUrl);
        });

        it('should use default folder if not provided', async () => {
            const expectedUrl =
                'https://res.cloudinary.com/test-cloud/image/upload/v123/default.jpg';
            const mockStream = {
                pipe: jest.fn(),
                on: jest.fn(),
            } as unknown as NodeJS.WritableStream;

            mockReadableFrom.mockReturnValue(mockStream);

            let capturedCallback: unknown;
            mockUploadStream.mockImplementation(
                (options: unknown, callback: unknown) => {
                    capturedCallback = callback;
                    return mockStream;
                },
            );

            const uploadPromise = cloudinaryService.uploadImage(mockFile);

            if (typeof capturedCallback === 'function') {
                (
                    capturedCallback as (
                        error: Error | null,
                        result: unknown,
                    ) => void
                )(null, {
                    secure_url: expectedUrl,
                    public_id: 'devconnect/uploads/test123',
                });
            }

            await uploadPromise;

            expect(mockUploadStream).toHaveBeenCalledWith(
                expect.objectContaining({
                    folder: 'devconnect/uploads',
                }),
                expect.any(Function),
            );
        });

        it('should throw CloudinaryError if file is not provided', async () => {
            await expect(
                cloudinaryService.uploadImage(
                    null as unknown as { buffer: Buffer; mimetype: string },
                    'test-folder',
                ),
            ).rejects.toThrow(CloudinaryError);
            await expect(
                cloudinaryService.uploadImage(
                    null as unknown as { buffer: Buffer; mimetype: string },
                    'test-folder',
                ),
            ).rejects.toThrow('No file provided for upload');
        });

        it('should throw CloudinaryError if file buffer is missing', async () => {
            const invalidFile = { buffer: undefined, mimetype: 'image/jpeg' };

            await expect(
                cloudinaryService.uploadImage(
                    invalidFile as unknown as {
                        buffer: Buffer;
                        mimetype: string;
                    },
                    'test-folder',
                ),
            ).rejects.toThrow(CloudinaryError);
            await expect(
                cloudinaryService.uploadImage(
                    invalidFile as unknown as {
                        buffer: Buffer;
                        mimetype: string;
                    },
                    'test-folder',
                ),
            ).rejects.toThrow('File buffer is missing');
        });

        it('should throw CloudinaryError on upload failure', async () => {
            const mockStream = {
                pipe: jest.fn(),
                on: jest.fn(),
            } as unknown as NodeJS.WritableStream;
            const uploadError = new Error('Upload failed');

            mockReadableFrom.mockReturnValue(mockStream);

            let capturedCallback: unknown;
            mockUploadStream.mockImplementation(
                (options: unknown, callback: unknown) => {
                    capturedCallback = callback;
                    return mockStream;
                },
            );

            const uploadPromise = cloudinaryService.uploadImage(
                mockFile,
                'test-folder',
            );

            if (typeof capturedCallback === 'function') {
                (
                    capturedCallback as (
                        error: Error | null,
                        result: unknown,
                    ) => void
                )(uploadError, null);
            }

            await expect(uploadPromise).rejects.toThrow(CloudinaryError);
            await expect(uploadPromise).rejects.toThrow(
                /Failed to upload image to Cloudinary/,
            );
        });

        it('should handle non-Error exceptions in upload', async () => {
            const mockStream = {
                pipe: jest.fn(),
                on: jest.fn(),
            } as unknown as NodeJS.WritableStream;

            mockReadableFrom.mockReturnValue(mockStream);

            mockUploadStream.mockImplementation(() => {
                throw new Error('Unexpected error');
            });

            await expect(
                cloudinaryService.uploadImage(mockFile, 'test-folder'),
            ).rejects.toThrow(CloudinaryError);
        });

        it('should handle upload failure with non-Error object', async () => {
            const mockStream = {
                pipe: jest.fn(),
                on: jest.fn(),
            } as unknown as NodeJS.WritableStream;

            mockReadableFrom.mockReturnValue(mockStream);

            let capturedCallback: unknown;
            mockUploadStream.mockImplementation(
                (options: unknown, callback: unknown) => {
                    capturedCallback = callback;
                    return mockStream;
                },
            );

            const uploadPromise = cloudinaryService.uploadImage(
                mockFile,
                'test-folder',
            );

            // Pass non-Error object as error parameter
            if (typeof capturedCallback === 'function') {
                (capturedCallback as (error: unknown, result: unknown) => void)(
                    { message: 'Custom error object' },
                    null,
                );
            }

            await expect(uploadPromise).rejects.toThrow(CloudinaryError);
            await expect(uploadPromise).rejects.toThrow(
                /Unknown error occurred/,
            );
        });
    });

    describe('deleteImage', () => {
        it('should successfully delete image from cloudinary', async () => {
            const publicId = 'devconnect/profile/test123';

            mockDestroy.mockResolvedValue({ result: 'ok' });

            await cloudinaryService.deleteImage(publicId);

            expect(mockDestroy).toHaveBeenCalledWith(publicId);
        });

        it('should throw CloudinaryError if public ID is not provided', async () => {
            mockDestroy.mockResolvedValue({ result: 'ok' });

            await expect(cloudinaryService.deleteImage('')).rejects.toThrow(
                CloudinaryError,
            );
            await expect(cloudinaryService.deleteImage('')).rejects.toThrow(
                'Public ID is required for deletion',
            );
        });

        it('should throw CloudinaryError if public ID is null', async () => {
            mockDestroy.mockResolvedValue({ result: 'ok' });

            await expect(
                cloudinaryService.deleteImage(null as unknown as string),
            ).rejects.toThrow(CloudinaryError);
            await expect(
                cloudinaryService.deleteImage(null as unknown as string),
            ).rejects.toThrow('Public ID is required for deletion');
        });

        it('should throw CloudinaryError on delete failure', async () => {
            const publicId = 'devconnect/profile/test123';
            const deleteError = new Error('Delete failed');

            mockDestroy.mockRejectedValue(deleteError);

            await expect(
                cloudinaryService.deleteImage(publicId),
            ).rejects.toThrow(CloudinaryError);
            await expect(
                cloudinaryService.deleteImage(publicId),
            ).rejects.toThrow(/Failed to delete image from Cloudinary/);
        });

        it('should handle non-Error exceptions in delete', async () => {
            const publicId = 'devconnect/profile/test123';

            mockDestroy.mockRejectedValue('String error');

            await expect(
                cloudinaryService.deleteImage(publicId),
            ).rejects.toThrow(CloudinaryError);
            await expect(
                cloudinaryService.deleteImage(publicId),
            ).rejects.toThrow(/Unknown error occurred/);
        });

        it('should handle non-Error exception in delete with falsy publicId', async () => {
            mockDestroy.mockRejectedValue({ message: 'unknown' });

            await expect(
                cloudinaryService.deleteImage(undefined as unknown as string),
            ).rejects.toThrow(CloudinaryError);
            await expect(
                cloudinaryService.deleteImage(undefined as unknown as string),
            ).rejects.toThrow('Public ID is required for deletion');
        });
    });
});
