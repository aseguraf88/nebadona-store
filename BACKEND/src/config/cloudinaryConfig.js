import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'

dotenv.config()

const hasCloudinaryUrl = Boolean(process.env.CLOUDINARY_URL)
const hasCloudinaryParts = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET,
)

export const isCloudinaryConfigured = hasCloudinaryUrl || hasCloudinaryParts

if (hasCloudinaryUrl) {
    cloudinary.config({
        cloudinary_url: process.env.CLOUDINARY_URL,
    })
} else {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    })
}

export default cloudinary
