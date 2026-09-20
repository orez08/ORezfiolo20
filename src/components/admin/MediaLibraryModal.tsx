import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  Upload,
  Check,
  Image as ImageIcon,
  Copy,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { UploadedMediaFile } from '../../types.ts';
import { api } from '../../services/api.ts';

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage?: (url: string) => void;
  title?: string;
}

export const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  title = 'Uploaded Media & Files',
}) => {
  const [files, setFiles] = useState<UploadedMediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [fileToDelete, setFileToDelete] = useState<UploadedMediaFile | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const data = await api.getUploads();
      setFiles(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFiles();
      setFileToDelete(null);
      setStatusMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setUploading(true);
    setStatusMessage('Optimizing and uploading file...');
    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const optimized = await api.compressImageFile(file, 2000, 0.88);
        await api.uploadImage(optimized, file.name);
      }
      setStatusMessage('Upload complete!');
      await fetchFiles();
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage(`Upload failed: ${err.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;
    try {
      const success = await api.deleteUpload(fileToDelete.name);
      if (success) {
        setFiles((prev) => prev.filter((f) => f.name !== fileToDelete.name));
        setStatusMessage(`Deleted ${fileToDelete.name}`);
        setTimeout(() => setStatusMessage(null), 3000);
      } else {
        setStatusMessage('Failed to delete file from server');
      }
    } catch (err: any) {
      setStatusMessage(`Delete error: ${err.message}`);
    } finally {
      setFileToDelete(null);
    }
  };

  const handleCopyUrl = (url: string) => {
    const fullUrl = window.location.origin + url;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    });
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#181818] border border-white/20 rounded-sm shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#141414]">
          <div className="flex items-center gap-3">
            <ImageIcon className="w-5 h-5 text-[#E8746A]" />
            <div>
              <h3 className="font-display font-medium text-lg text-white">
                {title}
              </h3>
              <p className="text-[11px] font-sans text-white/50 uppercase tracking-wider">
                {files.length} uploaded {files.length === 1 ? 'asset' : 'assets'} in storage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#8B1E1E] hover:bg-[#E8746A] text-white text-xs font-sans uppercase tracking-wider cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? 'Uploading...' : 'Upload New'}</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

            <button
              onClick={fetchFiles}
              disabled={loading}
              title="Refresh files"
              className="p-2 rounded-sm bg-[#222] hover:bg-[#333] text-white/70 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-sm bg-[#222] hover:bg-[#333] text-white/70 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status notification banner */}
        {statusMessage && (
          <div className="px-6 py-2.5 bg-[#8B1E1E]/40 border-b border-[#E8746A]/30 text-xs font-sans text-white flex items-center justify-between">
            <span>{statusMessage}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-white/60 hover:text-white ml-4"
            >
              ×
            </button>
          </div>
        )}

        {/* Delete Confirmation Alert Bar (Modal-style within library) */}
        {fileToDelete && (
          <div className="p-4 bg-red-950/90 border-b border-red-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-white">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>
                Permanently delete <strong className="font-sans text-red-200">{fileToDelete.name}</strong> from server storage?
              </span>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => setFileToDelete(null)}
                className="px-3 py-1 rounded-sm bg-white/10 hover:bg-white/20 text-white text-xs font-sans"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-3 py-1 rounded-sm bg-red-600 hover:bg-red-700 text-white text-xs font-sans font-semibold"
              >
                Yes, Delete File
              </button>
            </div>
          </div>
        )}

        {/* Modal Body: Grid of Files */}
        <div className="flex-1 p-6 overflow-y-auto min-h-[300px]">
          {loading && files.length === 0 ? (
            <div className="py-20 text-center text-white/50 font-sans text-xs flex flex-col items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-[#E8746A]" />
              <span>Loading media storage...</span>
            </div>
          ) : files.length === 0 ? (
            <div className="py-20 text-center text-white/50 font-sans text-xs border border-dashed border-white/15 rounded-sm p-8">
              <ImageIcon className="w-8 h-8 text-white/20 mx-auto mb-3" />
              <p>No uploaded media files found on server.</p>
              <p className="text-[11px] text-white/30 mt-1">
                Upload images above to use them across your portfolio.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {files.map((file) => (
                <div
                  key={file.name}
                  className="group relative rounded-sm bg-[#121212] border border-white/15 hover:border-[#E8746A] transition-all flex flex-col overflow-hidden"
                >
                  {/* Thumbnail */}
                  <div className="aspect-square bg-black/50 relative overflow-hidden flex items-center justify-center">
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Overlay Action Buttons on Hover */}
                    <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                      {onSelectImage && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectImage(file.url);
                            onClose();
                          }}
                          className="w-full py-1.5 px-2 rounded-sm bg-[#E8746A] text-black font-semibold text-[11px] font-sans uppercase tracking-wider hover:bg-white transition-colors"
                        >
                          Use This Image
                        </button>
                      )}

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(file.url)}
                          title="Copy direct URL"
                          className="p-1.5 rounded-sm bg-white/20 hover:bg-white/30 text-white text-xs"
                        >
                          {copiedUrl === file.url ? (
                            <Check className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <a
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          title="Open in new tab"
                          className="p-1.5 rounded-sm bg-white/20 hover:bg-white/30 text-white text-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <button
                          type="button"
                          onClick={() => setFileToDelete(file)}
                          title="Delete file permanently"
                          className="p-1.5 rounded-sm bg-red-600/80 hover:bg-red-600 text-white text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Details Bar */}
                  <div className="p-2.5 bg-[#141414] border-t border-white/10 flex items-center justify-between text-[11px] font-sans text-white/60">
                    <span className="truncate max-w-[90px] sm:max-w-[110px]" title={file.name}>
                      {file.name}
                    </span>
                    <span className="text-[10px] text-white/40 flex-shrink-0">
                      {formatFileSize(file.size)}
                    </span>
                  </div>

                  {/* Permanent mobile delete button in corner */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFileToDelete(file);
                    }}
                    title="Delete file"
                    className="sm:hidden absolute top-1.5 right-1.5 p-1 rounded-sm bg-red-600 text-white text-xs shadow-md"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-white/10 bg-[#141414] text-xs font-sans text-white/60">
          <span>Click any image to select or use the trash icon to delete permanently</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-sm bg-white/10 hover:bg-white/20 text-white text-xs font-sans transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
