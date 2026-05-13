import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const AWS_REGION = process.env.AWS_REGION || 'ap-south-1';
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || '';
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'reelbid-images';

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
    if (!s3Client) {
        s3Client = new S3Client({
            region: AWS_REGION,
            credentials: {
                accessKeyId: AWS_ACCESS_KEY_ID,
                secretAccessKey: AWS_SECRET_ACCESS_KEY,
            },
        });
    }
    return s3Client;
}

/**
 * Upload a buffer to S3.
 * Returns the public URL of the uploaded file.
 */
export async function uploadToS3(
    buffer: Buffer,
    key: string,
    contentType: string = 'image/webp'
): Promise<string> {
    const client = getS3Client();

    const command = new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        // Make the object publicly readable
        ACL: 'public-read',
    });

    await client.send(command);

    // Return the public URL
    return `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;
}

/**
 * Delete an object from S3 by its key.
 */
export async function deleteFromS3(key: string): Promise<void> {
    const client = getS3Client();

    const command = new DeleteObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
    });

    await client.send(command);
}

/**
 * Extract the S3 key from a full S3 URL.
 */
export function getS3KeyFromUrl(url: string): string | null {
    if (!url) return null;
    try {
        const urlObj = new URL(url);
        // Remove leading slash
        return urlObj.pathname.slice(1);
    } catch {
        return null;
    }
}

export { S3_BUCKET_NAME, AWS_REGION };
