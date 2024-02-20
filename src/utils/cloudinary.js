import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_APP_SECRET
});

const uploadFileOnCloudinary = async (localFile) => {
    try {

        if (!localFile) {
            return null;
        }

        const response = await cloudinary.uploader.upload(localFile, {
            resource_type: "auto"
        })

        console.log("file is uploaded on cloudinary", response.url);
        fs.unlinkSync(localFile);
        return response;
    }
    catch (e) {
        fs.unlinkSync(localFile);
        return null;
    }
}

export { uploadFileOnCloudinary }