const {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
} = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: "us-east-1",
  endpoint: process.env.S3_API_URL, // твой MinIO
  credentials: {
    accessKeyId: process.env.S3_ADMIN_USER,
    secretAccessKey: process.env.S3_ADMIN_PASSWORD,
  },
  forcePathStyle: true,
});

const bucket = "kote-uploads";

const createUploadStream = async (fileName = "") => {
  try {
    const command = new CreateMultipartUploadCommand({
      Bucket: bucket,
      Key: fileName,
    });

    const response = await s3.send(command);

    return response.UploadId;
  } catch (e) {
    console.error("S3Service error :>> ", e);
    return null;
  }
};

const uploadPart = async (
  streamUuid = "",
  filePath = "",
  chunk = new File(),
  partNumber = 0
) => {
  try {
    const command = new UploadPartCommand({
      Bucket: bucket,
      Key: filePath,
      UploadId: streamUuid,
      PartNumber: partNumber,
      Body: chunk,
    });

    const response = await s3.send(command);

    return { ETag: response.ETag, PartNumber: partNumber };
  } catch (e) {
    console.error("S3Service error :>> ", e);
    return null;
  }
};

const completeUpload = async (streamUuid, filePath, chunkMap) => {
  try {
    const command = new CompleteMultipartUploadCommand({
      Bucket: bucket,
      Key: filePath,
      UploadId: streamUuid,
      MultipartUpload: {
        Parts: chunkMap,
      },
    });
    const response = await s3.send(command);

    return { filePath: response.Key };
  } catch (e) {
    console.error("S3Service error :>> ", e);
    return null;
  }
};

module.exports = { createUploadStream, uploadPart, completeUpload };
