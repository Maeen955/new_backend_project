import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
import dotenv from "dotenv"
dotenv.config()



cloudinary.config({ 
    cloud_name:process.env.CLOUDINARY_NAME, 
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});


const uploadOnCloudinary = async (localeFilePath) => {
    try {
        
        if(!localeFilePath) return null;

        const response = await cloudinary.uploader.upload(localeFilePath, {
            resource_type: "auto"
        });
         
        fs.unlinkSync(localeFilePath);
        return response;
        
    } catch (error) {
        console.log(error.message);
        
        fs.unlinkSync(localeFilePath);
        return null
    }
}

export { uploadOnCloudinary }