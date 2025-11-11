import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"


 cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });


const uploadOnCloudinary = async (localeFilePath) => {
    try {
        if(!localeFilePath) return null;

        const response = await cloudinary.uploader.upload(localeFilePath, {
            resource_type: "auto"
        });
        console.log("file uploaded successfully", response.url);

        return response;
        
    } catch (error) {
        fs.unlinkSync(localeFilePath);
        return null
    }
}

export { uploadOnCloudinary }