export async function compressImage(
  file: File,
  maxWidth = 2048,
  maxHeight = 2048,
  quality = 0.85
): Promise<{ file: File; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve({ file, dataUrl: reader.result as string });
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ file, dataUrl: objectUrl });
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const dataUrl = canvas.toDataURL(mimeType, quality);

      canvas.toBlob(
        blob => {
          if (!blob) {
            resolve({ file, dataUrl });
            return;
          }
          const compressedFile = new File([blob], file.name, {
            type: blob.type,
            lastModified: Date.now(),
          });
          resolve({ file: compressedFile, dataUrl });
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onload = () => resolve({ file, dataUrl: reader.result as string });
      reader.onerror = () => reject(new Error('Failed to load image'));
      reader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
}
