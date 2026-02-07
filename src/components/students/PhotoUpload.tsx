import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Check, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PhotoUploadProps {
    studentId: string;
    currentAvatar?: string | null;
    studentName: string;
    onAvatarChange?: (newAvatar: string) => void;
    size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
};

export function PhotoUpload({
    studentId,
    currentAvatar,
    studentName,
    onAvatarChange,
    size = 'lg'
}: PhotoUploadProps) {
    const [isHovering, setIsHovering] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Invalid file type', { description: 'Please select an image file' });
            return;
        }

        // Validate file size (500KB max)
        if (file.size > 500 * 1024) {
            toast.error('File too large', { description: 'Maximum file size is 500KB' });
            return;
        }

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setPreview(base64);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!preview) return;

        setIsUploading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/students/${studentId}/avatar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ avatar: preview })
            });

            if (response.ok) {
                toast.success('Photo updated!');
                if (onAvatarChange) {
                    onAvatarChange(preview);
                }
                setPreview(null);
            } else {
                const error = await response.json();
                toast.error('Upload failed', { description: error.message });
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload photo');
        } finally {
            setIsUploading(false);
        }
    };

    const cancelPreview = () => {
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const displayImage = preview || currentAvatar;
    const initials = studentName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    return (
        <div className="relative">
            <motion.div
                className={`
                    ${sizeClasses[size]} rounded-full relative overflow-hidden cursor-pointer
                    bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-border
                `}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={() => !preview && fileInputRef.current?.click()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                {/* Image or Initials */}
                {displayImage ? (
                    <img
                        src={displayImage}
                        alt={studentName}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary/60">{initials}</span>
                    </div>
                )}

                {/* Hover Overlay */}
                <AnimatePresence>
                    {isHovering && !preview && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center"
                        >
                            <Camera className="w-6 h-6 text-white" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Upload Progress Overlay */}
                <AnimatePresence>
                    {isUploading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/70 flex items-center justify-center"
                        >
                            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Preview Actions */}
            <AnimatePresence>
                {preview && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2"
                    >
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelPreview}
                            disabled={isUploading}
                            className="h-8 px-3"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleUpload}
                            disabled={isUploading}
                            className="h-8 px-3"
                        >
                            {isUploading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Upload Button for smaller sizes */}
            {size === 'sm' && !preview && (
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                >
                    <Camera className="w-3 h-3 text-primary-foreground" />
                </button>
            )}
        </div>
    );
}

// Simple Avatar Display component (read-only)
interface AvatarDisplayProps {
    avatar?: string | null;
    name: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    className?: string;
}

const displaySizeClasses = {
    xs: 'w-8 h-8 text-xs',
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg'
};

export function AvatarDisplay({ avatar, name, size = 'md', className = '' }: AvatarDisplayProps) {
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    return (
        <div className={`
            ${displaySizeClasses[size]} rounded-full overflow-hidden
            bg-gradient-to-br from-primary/20 to-primary/5 
            flex items-center justify-center font-semibold text-primary/60
            ${className}
        `}>
            {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
            ) : (
                initials
            )}
        </div>
    );
}
