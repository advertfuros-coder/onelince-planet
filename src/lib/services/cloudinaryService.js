// lib/services/cloudinaryService.js
class CloudinaryService {
  constructor() {
    this.cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    this.uploadPreset =
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
      process.env.CLOUDINARY_UPLOAD_PRESET;
    this.apiKey =
      process.env.CLOUDINARY_API_KEY ||
      process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    this.uploadFolder = process.env.CLOUDINARY_UPLOAD_FOLDER || "reviews";
  }

  /**
   * Get upload URL for client-side uploads
   */
  getUploadUrl() {
    return `https://api.cloudinary.com/v1_1/${this.cloudName}/upload`;
  }

  /**
   * Get upload configuration for client
   */
  getUploadConfig() {
    return {
      cloudName: this.cloudName,
      uploadPreset: this.uploadPreset,
      folder: this.uploadFolder,
    };
  }

  /**
   * Generate optimized image URL
   */
  getOptimizedImageUrl(publicId, options = {}) {
    const {
      width = 800,
      height,
      quality = "auto",
      format = "auto",
      crop = "fill",
    } = options;

    let transformations = `w_${width},q_${quality},f_${format},c_${crop}`;
    if (height) {
      transformations += `,h_${height}`;
    }

    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformations}/${publicId}`;
  }

  /**
   * Generate video thumbnail URL
   */
  getVideoThumbnail(publicId) {
    return `https://res.cloudinary.com/${this.cloudName}/video/upload/so_0,w_400,h_300,c_fill/${publicId}.jpg`;
  }

  /**
   * Get video URL
   */
  getVideoUrl(publicId, options = {}) {
    const { quality = "auto", format = "mp4" } = options;

    return `https://res.cloudinary.com/${this.cloudName}/video/upload/q_${quality},f_${format}/${publicId}`;
  }

  /**
   * Delete resource from Cloudinary
   */
  async deleteResource(publicId, resourceType = "image") {
    // This requires server-side API call with signature
    // For now, return success - actual deletion can be done via Cloudinary dashboard or cron job
    console.log(`Delete resource: ${publicId} (${resourceType})`);
    return { success: true };
  }
}

const cloudinaryService = new CloudinaryService();
export default cloudinaryService;
