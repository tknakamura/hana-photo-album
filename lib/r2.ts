import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

export const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: { 
    accessKeyId: process.env.R2_ACCESS_KEY!, 
    secretAccessKey: process.env.R2_SECRET_KEY! 
  }
})

export async function createPresignedPut({ key, mime }: { key: string; mime: string }) {
  const cmd = new PutObjectCommand({ 
    Bucket: process.env.R2_BUCKET!, 
    Key: key, 
    ContentType: mime 
  })
  return getSignedUrl(s3, cmd, { expiresIn: 600 })
}

export async function createPresignedGet({ key }: { key: string }) {
  const cmd = new GetObjectCommand({ 
    Bucket: process.env.R2_BUCKET!, 
    Key: key 
  })
  return getSignedUrl(s3, cmd, { expiresIn: 300 })
}

export async function checkR2ObjectExists(key: string): Promise<boolean> {
  try {
    const cmd = new HeadObjectCommand({ Bucket: process.env.R2_BUCKET!, Key: key })
    await s3.send(cmd)
    return true
  } catch {
    return false
  }
}

