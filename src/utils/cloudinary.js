import { v2 as cloudinary } from "cloudinary"
import fs from "fs"


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

const deleteOnCloudinary = async (url) => {
    // Split the URL by '/'
    const parts = url?.split('/');

    // Get the second-to-last part which contains the ID
    const idWithExtension = parts[parts?.length - 1];

    // Remove the file extension '.jpg' to get the ID only
    const id = idWithExtension?.split('.')[0];

    try {
        if (!id) return null;
        const response = await cloudinary.api.delete_resources([id])
        return response
    } catch (error) {
        return null;
    }
}





export { uploadOnCloudinary, deleteOnCloudinary }