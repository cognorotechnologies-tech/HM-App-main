import { useState, useRef } from 'react';
import { Upload, X, User } from 'lucide-react';
import { Button } from './Button';

interface ImageUploadProps {
    currentImageUrl?: string | null;
    onImageSelect: (file: File) => void;
    onImageRemove?: () => void;
    disabled?: boolean;
}

export default function ImageUpload({
    currentImageUrl,
    onImageSelect,
    onImageRemove,
    disabled = false
}: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (file: File | null) => {
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Call parent handler
        onImageSelect(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (disabled) return;

        const file = e.dataTransfer.files[0];
        handleFileChange(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleRemove = () => {
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (onImageRemove) {
            onImageRemove();
        }
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Picture
            </label>

            {/* Preview Area */}
            <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !disabled && fileInputRef.current?.click()}
            >
                {preview ? (
                    <div className="relative inline-block">
                        <img
                            src={preview}
                            alt="Profile preview"
                            className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
                        />
                        {!disabled && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove();
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
                                type="button"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                            <User size={48} className="text-gray-400" />
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Upload className="text-gray-400" size={24} />
                            <p className="text-sm text-gray-600">
                                Drag and drop an image, or click to browse
                            </p>
                            <p className="text-xs text-gray-500">
                                JPG, PNG up to 5MB
                            </p>
                        </div>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    className="hidden"
                    disabled={disabled}
                />
            </div>

            {/* Action Buttons */}
            {preview && !disabled && (
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1"
                    >
                        Change Picture
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleRemove}
                        className="flex-1"
                    >
                        Remove
                    </Button>
                </div>
            )}
        </div>
    );
}
