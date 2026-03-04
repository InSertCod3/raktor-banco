import { Storage } from "@google-cloud/storage";

let cachedStorage: Storage | null = null;

export function getGcsBucketName(): string {
  const bucket = process.env.GCS_BUCKET_NAME?.trim();
  if (!bucket) {
    throw new Error("Missing GCS_BUCKET_NAME.");
  }
  return bucket;
}

export function getGcsStorageClient(): Storage {
  if (cachedStorage) return cachedStorage;
  // Application Default Credentials (ADC): local gcloud auth, Workload Identity, or service account on GCP.
  cachedStorage = new Storage();
  return cachedStorage;
}

export function getGcsUploadPrefix(): string {
  const prefix = process.env.GCS_UPLOAD_PREFIX
  if (!prefix){
    throw new Error("Missing GCS_UPLOAD_PREFIX.");
  }
  return prefix.trim();
}
