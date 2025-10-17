import exifr from 'exifr'

export interface PhotoMetadata {
  takenAt?: Date
  camera?: {
    make?: string
    model?: string
    lensModel?: string
  }
  settings?: {
    iso?: number
    aperture?: string
    shutterSpeed?: string
    focalLength?: string
  }
  location?: {
    latitude?: number
    longitude?: number
    altitude?: number
  }
  dimensions?: {
    width: number
    height: number
  }
}

export async function extractPhotoMetadata(input: File | Buffer): Promise<PhotoMetadata> {
  try {
    let arrayBuffer: ArrayBuffer
    let lastModified: number
    
    if (input instanceof File) {
      arrayBuffer = await input.arrayBuffer()
      lastModified = input.lastModified
    } else {
      // BufferからArrayBufferに変換
      arrayBuffer = new ArrayBuffer(input.length)
      const view = new Uint8Array(arrayBuffer)
      for (let i = 0; i < input.length; i++) {
        view[i] = input[i]
      }
      lastModified = Date.now()
    }
    
    const metadata = await exifr.parse(arrayBuffer, {
      gps: true,
      exif: true,
      iptc: true,
      multiSegment: true,
      mergeOutput: true,
      sanitize: true,
      reviveValues: true,
      translateKeys: true,
      translateValues: true,
    })

    if (!metadata) {
      return {
        takenAt: new Date(lastModified),
        dimensions: { width: 0, height: 0 }
      }
    }

    const result: PhotoMetadata = {
      takenAt: metadata.DateTimeOriginal || metadata.DateTime || new Date(lastModified),
      dimensions: {
        width: metadata.ImageWidth || 0,
        height: metadata.ImageHeight || 0
      }
    }

    // Camera information
    if (metadata.Make || metadata.Model) {
      result.camera = {
        make: metadata.Make,
        model: metadata.Model,
        lensModel: metadata.LensModel
      }
    }

    // Camera settings
    if (metadata.ISO || metadata.FNumber || metadata.ExposureTime || metadata.FocalLength) {
      result.settings = {
        iso: metadata.ISO,
        aperture: metadata.FNumber ? `f/${metadata.FNumber}` : undefined,
        shutterSpeed: metadata.ExposureTime ? `1/${Math.round(1/metadata.ExposureTime)}s` : undefined,
        focalLength: metadata.FocalLength ? `${metadata.FocalLength}mm` : undefined
      }
    }

    // GPS location
    if (metadata.latitude && metadata.longitude) {
      result.location = {
        latitude: metadata.latitude,
        longitude: metadata.longitude,
        altitude: metadata.altitude
      }
    }

    return result
  } catch (error) {
    console.error('Error extracting EXIF data:', error)
    return {
      takenAt: new Date(lastModified),
      dimensions: { width: 0, height: 0 }
    }
  }
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}
