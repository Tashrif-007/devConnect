import multer from 'multer';
import { BadRequestError } from '../errors/errors';

const storage = multer.memoryStorage();

const fileFilter = (
    req: unknown,
    file: { mimetype: string },
    cb: multer.FileFilterCallback,
) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new BadRequestError(
                `Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed. Received: ${file.mimetype}`,
            ),
        );
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, 
    },
});

export const uploadSingleImage = upload.single('image');

export const uploadMultipleImages = upload.array('images', 10);
