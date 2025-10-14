// lib/utils/cloudinary.js
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function uploadToCloudinary(file, folder = 'products') {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: `online_planet/${folder}`,
      resource_type: 'auto'
    })
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

export async function deleteFromCloudinary(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export default cloudinary
