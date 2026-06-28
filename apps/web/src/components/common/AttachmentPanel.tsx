import { useRef, useState } from "react";
import { Paperclip, Upload, X, File, Download, Loader2 } from "lucide-react";
import useAttachments from "../../hooks/useAttachments";
import type { EntityType, Attachment } from "../../services/attachment.service";

type AttachmentPanelProps = {
  entityType: EntityType;
  entityId: string;
};

export default function AttachmentPanel({ entityType, entityId }: AttachmentPanelProps) {
  const { attachments, isLoading, uploadAttachment, deleteAttachment, downloadAttachment, isUploading } = useAttachments(entityType, entityId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadAttachment(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await uploadAttachment(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col">
      <div className="border-b p-4 flex items-center justify-between bg-gray-50/50">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Paperclip size={16} className="text-gray-500" />
          Attachments
        </h3>
        <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
          {attachments.length}
        </span>
      </div>

      <div className="p-4 space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
            dragActive ? "border-indigo-500 bg-indigo-50" : "border-gray-300 hover:bg-gray-50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleChange}
          />
          {isUploading ? (
            <Loader2 size={24} className="text-indigo-600 animate-spin mb-2" />
          ) : (
            <Upload size={24} className="text-gray-400 mb-2" />
          )}
          <p className="text-sm font-medium text-gray-900">
            {isUploading ? "Uploading..." : "Click or drag file to this area"}
          </p>
          <p className="text-xs text-gray-500 mt-1">Supports images, PDFs, and documents up to 10MB</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 size={20} className="animate-spin text-gray-400" />
          </div>
        ) : (
          <ul className="space-y-2">
            {attachments.map((attachment: Attachment) => (
              <li key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg group hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0">
                    <File size={16} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-gray-900 truncate" title={attachment.file_name}>
                      {attachment.file_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(attachment.file_size)} • {new Date(attachment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => downloadAttachment(attachment.storage_path, attachment.file_name)}
                    className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-100 rounded-md transition-colors"
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => deleteAttachment({ id: attachment.id, storagePath: attachment.storage_path })}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete"
                  >
                    <X size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
