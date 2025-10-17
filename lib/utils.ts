import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function generateThumbnailPath(originalPath: string): string {
  const pathParts = originalPath.split('/')
  const fileName = pathParts[pathParts.length - 1]
  const nameWithoutExt = fileName.split('.')[0]
  const extension = fileName.split('.').pop()
  
  pathParts[pathParts.length - 1] = `${nameWithoutExt}_thumb.${extension}`
  return pathParts.join('/')
}

export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  return validTypes.includes(file.type)
}

export function isValidVideoFile(file: File): boolean {
  const validTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/quicktime']
  return validTypes.includes(file.type)
}

export function isValidMediaFile(file: File): boolean {
  return isValidImageFile(file) || isValidVideoFile(file)
}

export function getFileType(file: File): 'image' | 'video' {
  return isValidImageFile(file) ? 'image' : 'video'
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
