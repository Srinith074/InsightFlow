import fs from "fs";
import mongoose from "mongoose";

export interface StorageResult {
  storageKey: string;
  storageProvider: "gridfs" | "cloudinary" | "s3" | "local";
  storageUrl?: string;
  size: number;
  fileName: string;
  mimeType: string;
}

export interface DatasetStorageReference {
  storageKey?: string;
  storageProvider?: string;
  storageUrl?: string;
  path?: string;
}

const GRIDFS_BUCKET_NAME = "datasets";

async function ensureDbConnection(): Promise<mongoose.mongo.Db> {
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    return mongoose.connection.db;
  }

  if (mongoose.connection.readyState === 2) {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Database connection timeout")), 10000);
      mongoose.connection.once("connected", () => {
        clearTimeout(timeout);
        resolve();
      });
      mongoose.connection.once("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    if (mongoose.connection.db) {
      return mongoose.connection.db;
    }
  }

  throw new Error("Database is not connected. Cannot access durable storage.");
}

/**
 * Upload a file buffer to persistent MongoDB GridFS storage.
 */
export async function uploadToGridFS(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ storageKey: string; size: number }> {
  const db = await ensureDbConnection();

  const bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: GRIDFS_BUCKET_NAME,
  });

  const uploadStream = bucket.openUploadStream(fileName, {
    contentType: mimeType,
    metadata: {
      originalName: fileName,
      uploadedAt: new Date(),
    },
  });

  return new Promise((resolve, reject) => {
    uploadStream.on("finish", () => {
      resolve({
        storageKey: uploadStream.id.toString(),
        size: buffer.length,
      });
    });

    uploadStream.on("error", (err) => {
      console.error("GridFS upload stream error:", err);
      reject(err);
    });

    uploadStream.end(buffer);
  });
}

/**
 * Retrieve a file buffer from MongoDB GridFS.
 */
export async function getFromGridFS(storageKey: string): Promise<Buffer | null> {
  let db: mongoose.mongo.Db;
  try {
    db = await ensureDbConnection();
  } catch (err) {
    console.warn("GridFS get error - DB not connected:", err);
    return null;
  }

  let fileId: mongoose.Types.ObjectId;
  try {
    fileId = new mongoose.Types.ObjectId(storageKey);
  } catch {
    return null;
  }

  const bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: GRIDFS_BUCKET_NAME,
  });

  return new Promise((resolve) => {
    const downloadStream = bucket.openDownloadStream(fileId);
    const chunks: Buffer[] = [];

    downloadStream.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    downloadStream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    downloadStream.on("error", (err) => {
      console.warn(`GridFS file ${storageKey} download error:`, err.message);
      resolve(null);
    });
  });
}

/**
 * Delete a file from MongoDB GridFS.
 */
export async function deleteFromGridFS(storageKey: string): Promise<void> {
  if (!storageKey) return;

  try {
    const db = await ensureDbConnection();
    const fileId = new mongoose.Types.ObjectId(storageKey);
    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: GRIDFS_BUCKET_NAME,
    });
    await bucket.delete(fileId);
  } catch (err) {
    console.warn(`Failed to delete GridFS file ${storageKey}:`, err);
  }
}

/**
 * Upload a file to configured durable storage provider (defaulting to MongoDB GridFS).
 */
export async function uploadFileToStorage(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<StorageResult> {
  const provider = (process.env.STORAGE_PROVIDER || "gridfs").toLowerCase();

  // Cloudinary Raw Storage Option
  if (provider === "cloudinary" && (process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME)) {
    try {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;

      if (cloudName && apiKey && apiSecret) {
        // Upload to Cloudinary raw endpoints
        const timestamp = Math.floor(Date.now() / 1000);
        const publicId = `datasets/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        
        // Base64 Data URI
        const base64Data = `data:${mimeType};base64,${buffer.toString("base64")}`;
        const formData = new URLSearchParams();
        formData.append("file", base64Data);
        formData.append("public_id", publicId);
        formData.append("timestamp", String(timestamp));
        formData.append("api_key", apiKey);

        // Compute signature or upload
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const json = (await response.json()) as { public_id: string; secure_url: string };
          return {
            storageKey: json.public_id,
            storageProvider: "cloudinary",
            storageUrl: json.secure_url,
            size: buffer.length,
            fileName,
            mimeType,
          };
        }
      }
    } catch (err) {
      console.warn("Cloudinary upload failed, falling back to GridFS:", err);
    }
  }

  // Default durable storage: MongoDB GridFS
  const { storageKey, size } = await uploadToGridFS(buffer, fileName, mimeType);

  return {
    storageKey,
    storageProvider: "gridfs",
    size,
    fileName,
    mimeType,
  };
}

/**
 * Retrieve the workbook/dataset binary buffer from durable storage or legacy path.
 */
export async function getFileBufferFromStorage(
  dataset: DatasetStorageReference
): Promise<Buffer> {
  // 1. Check durable storageKey
  if (dataset.storageKey) {
    const provider = (dataset.storageProvider || "gridfs").toLowerCase();

    if (provider === "gridfs") {
      const buffer = await getFromGridFS(dataset.storageKey);
      if (buffer && buffer.length > 0) {
        return buffer;
      }
    } else if (provider === "cloudinary" && dataset.storageUrl) {
      try {
        const res = await fetch(dataset.storageUrl);
        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          return Buffer.from(arrayBuffer);
        }
      } catch (err) {
        console.warn("Failed to download from Cloudinary URL:", err);
      }
    }
  }

  // 2. Backward compatibility: legacy local path
  if (dataset.path && fs.existsSync(dataset.path)) {
    try {
      const buffer = fs.readFileSync(dataset.path);
      if (buffer && buffer.length > 0) {
        return buffer;
      }
    } catch (err) {
      console.warn("Failed to read local legacy file:", err);
    }
  }

  // 3. Clear failure message if file was lost due to ephemeral disk
  throw new Error(
    "Dataset file not found on server storage. This dataset was stored on an ephemeral filesystem that was reset upon redeployment. Please re-upload this dataset to store it permanently."
  );
}

/**
 * Delete a dataset file from storage.
 */
export async function deleteFileFromStorage(
  dataset: DatasetStorageReference
): Promise<void> {
  if (dataset.storageKey && (!dataset.storageProvider || dataset.storageProvider === "gridfs")) {
    await deleteFromGridFS(dataset.storageKey);
  }

  if (dataset.path && fs.existsSync(dataset.path)) {
    try {
      fs.unlinkSync(dataset.path);
    } catch (err) {
      console.warn("Failed to unlink legacy file:", err);
    }
  }
}
