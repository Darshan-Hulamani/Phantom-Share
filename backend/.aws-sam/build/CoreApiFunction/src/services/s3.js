import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({});
const bucketName = process.env.BUCKET_NAME;

/**
 * Generate a pre-signed URL for direct browser upload to S3
 */
export async function getUploadPresignedUrl(key, mimeType, maxSizeBytes = 104857600) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: mimeType,
  });

  // Upload URLs expire in 10 minutes (600 seconds)
  return await getSignedUrl(s3Client, command, { expiresIn: 600 });
}

/**
 * Generate a pre-signed URL for download
 */
export async function getDownloadPresignedUrl(key, filename) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${filename}"`
  });

  // Download URLs expire in 5 minutes (300 seconds)
  return await getSignedUrl(s3Client, command, { expiresIn: 300 });
}

/**
 * Delete object from S3 bucket
 */
export async function deleteFile(key) {
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key
      })
    );
    console.log(`Successfully deleted file from S3: ${key}`);
  } catch (error) {
    console.error(`Error deleting file from S3 (${key}):`, error);
    throw error;
  }
}
