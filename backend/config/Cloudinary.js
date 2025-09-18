import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
const Uploadoncloudinary = async (filePath) => {
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,        
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    try {
        const uploadResult = await cloudinary.uploader.upload(filePath);
        fs.unlinkSync(filePath);
        return uploadResult.secure_url;
    } catch (error) {
    try { fs.unlinkSync(filePath); } catch(e) { /* ignore */ }
    throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
};
export default Uploadoncloudinary;
