// utils/fileValidation.js
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export const validateFileSize = (file) => {
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File "${file.name}" is too large. Maximum size is 10MB.`);
    }
    return true;
};

export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};