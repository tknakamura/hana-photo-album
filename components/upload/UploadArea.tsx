'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Video, X, CheckCircle, AlertCircle } from 'lucide-react'
import { cn, isValidMediaFile, getFileType, formatFileSize } from '@/lib/utils'
import { extractPhotoMetadata, PhotoMetadata } from '@/lib/exif'

interface UploadFile {
  file: File
  id: string
  preview: string
  metadata?: PhotoMetadata
  caption?: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

interface UploadAreaProps {
  onUpload: (files: UploadFile[]) => void
  maxFiles?: number
  maxSize?: number // in bytes
  acceptedTypes?: string[]
  className?: string
}

export default function UploadArea({ 
  onUpload, 
  maxFiles = 10, 
  maxSize = 50 * 1024 * 1024, // 50MB
  acceptedTypes: _acceptedTypes = ['image/*', 'video/*'],
  className 
}: UploadAreaProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsProcessing(true)
    
    const newFiles: UploadFile[] = []
    
    for (const file of acceptedFiles) {
      if (!isValidMediaFile(file)) {
        continue
      }
      
      const fileId = Math.random().toString(36).substr(2, 9)
      const preview = URL.createObjectURL(file)
      
      const uploadFile: UploadFile = {
        file,
        id: fileId,
        preview,
        status: 'pending',
        progress: 0
      }
      
      // EXIF データの抽出（画像の場合）
      if (getFileType(file) === 'image') {
        try {
          const metadata = await extractPhotoMetadata(file)
          uploadFile.metadata = metadata
        } catch (error) {
          console.error('EXIF extraction failed:', error)
        }
      }
      
      newFiles.push(uploadFile)
    }
    
    setUploadFiles(prev => [...prev, ...newFiles])
    onUpload([...uploadFiles, ...newFiles])
    setIsProcessing(false)
  }, [uploadFiles, onUpload])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi', '.quicktime']
    },
    maxFiles,
    maxSize,
    multiple: true
  })

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId)
      onUpload(updated)
      return updated
    })
  }

  // const updateFileStatus = (fileId: string, status: UploadFile['status'], progress?: number, error?: string) => {
  //   setUploadFiles(prev => prev.map(f => 
  //     f.id === fileId 
  //       ? { ...f, status, progress: progress ?? f.progress, error }
  //       : f
  //   ))
  // }

  return (
    <div className={cn('space-y-4', className)}>
      {/* ドロップエリア */}
      <div
        {...getRootProps()}
        className={cn(
          'upload-area p-8 text-center cursor-pointer transition-all duration-300',
          isDragActive && 'dragover',
          isProcessing && 'pointer-events-none opacity-50'
        )}
      >
        <input {...getInputProps()} />
        
        <motion.div
          animate={isDragActive ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="space-y-4"
        >
          <div className="flex justify-center">
            <motion.div
              animate={isDragActive ? { y: -10 } : { y: 0 }}
              transition={{ repeat: isDragActive ? Infinity : 0, repeatType: "reverse", duration: 0.6 }}
              className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <Upload className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {isDragActive ? 'ここにドロップ！' : '写真・動画をアップロード'}
            </h3>
            <p className="text-gray-600 text-sm">
              ドラッグ&ドロップまたはクリックして選択
            </p>
            <p className="text-gray-500 text-xs mt-2">
              対応形式: JPEG, PNG, GIF, WebP, MP4, MOV (最大{formatFileSize(maxSize)})
            </p>
          </div>
        </motion.div>
      </div>

      {/* ファイル拒否エラー */}
      {fileRejections.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-2xl"
        >
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">アップロードできないファイルがあります</span>
          </div>
          <ul className="mt-2 text-sm text-red-500">
            {fileRejections.map(({ file, errors }) => (
              <li key={file.name}>
                {file.name}: {errors.map(e => e.message).join(', ')}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* アップロードファイル一覧 */}
      <AnimatePresence>
        {uploadFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <h4 className="text-lg font-semibold text-gray-800">
              アップロード予定 ({uploadFiles.length}件)
            </h4>
            
            <div className="space-y-2">
              {uploadFiles.map((uploadFile) => (
                <motion.div
                  key={uploadFile.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center space-x-3 p-3 bg-white/80 backdrop-blur-sm rounded-2xl border border-pink-100"
                >
                  {/* プレビュー */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100 flex-shrink-0">
                    {getFileType(uploadFile.file) === 'image' ? (
                      <div
                        style={{ backgroundImage: `url(${uploadFile.preview})` }}
                        className="w-full h-full bg-cover bg-center"
                        role="img"
                        aria-label={uploadFile.file.name}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-6 h-6 text-purple-500" />
                      </div>
                    )}
                  </div>
                  
                  {/* ファイル情報 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {uploadFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(uploadFile.file.size)}
                      {uploadFile.metadata?.takenAt && (
                        <span className="ml-2">
                          📅 {uploadFile.metadata.takenAt.toLocaleDateString('ja-JP')}
                        </span>
                      )}
                    </p>
                    
                    {/* プログレスバー */}
                    {uploadFile.status === 'uploading' && (
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                        <motion.div
                          className="bg-gradient-to-r from-pink-400 to-purple-500 h-1.5 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadFile.progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    )}
                    
                    {/* エラーメッセージ */}
                    {uploadFile.error && (
                      <p className="text-xs text-red-500 mt-1">{uploadFile.error}</p>
                    )}
                  </div>
                  
                  {/* ステータスアイコン */}
                  <div className="flex-shrink-0">
                    {uploadFile.status === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {uploadFile.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    {uploadFile.status === 'pending' && (
                      <motion.button
                        onClick={() => removeFile(uploadFile.id)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// エクスポート用のヘルパー関数
export { type UploadFile }
