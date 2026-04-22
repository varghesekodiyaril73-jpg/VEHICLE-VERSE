import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, FileText } from 'lucide-react';

const FileUpload = ({
    name,
    label,
    accept = 'image/*',
    onChange,
    value,
    preview = true,
    required = false,
    helpText = null,
    icon: Icon = Upload
}) => {
    const inputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleFile = (file) => {
        if (file) {
            // Create preview for images
            if (file.type.startsWith('image/') && preview) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewUrl(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                setPreviewUrl(null);
            }

            // Call onChange with the file
            onChange({ target: { name, value: file, files: [file] } });
        }
    };

    const handleChange = (e) => {
        const file = e.target.files?.[0];
        handleFile(file);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        handleFile(file);
    };

    const handleClear = () => {
        setPreviewUrl(null);
        onChange({ target: { name, value: null, files: [] } });
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const isImage = value?.type?.startsWith('image/') || previewUrl;

    return (
        <div className="mb-4">
            {label && (
                <label className="block text-sm font-medium text-gray-400 mb-2">
                    {label} {required && <span className="text-red-400">*</span>}
                </label>
            )}

            <div
                className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                    ${dragActive
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-white/20 hover:border-white/40 bg-black/20 hover:bg-black/30'
                    }
                    ${value ? 'border-green-500/50' : ''}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    name={name}
                    accept={accept}
                    onChange={handleChange}
                    className="hidden"
                    required={required && !value}
                />

                {previewUrl && preview ? (
                    <div className="relative inline-block">
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-h-32 max-w-full rounded-lg mx-auto"
                        />
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClear();
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ) : value ? (
                    <div className="flex items-center justify-center gap-2 text-green-400">
                        <FileText size={24} />
                        <span className="text-sm">{value.name}</span>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClear();
                            }}
                            className="ml-2 text-red-400 hover:text-red-300"
                        >
                            <X size={18} />
                        </button>
                    </div>
                ) : (
                    <>
                        <Icon className="mx-auto text-gray-500 mb-2" size={32} />
                        <p className="text-gray-400 text-sm">
                            Drag and drop or <span className="text-blue-400">browse</span>
                        </p>
                        {helpText && (
                            <p className="text-gray-500 text-xs mt-1">{helpText}</p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default FileUpload;
