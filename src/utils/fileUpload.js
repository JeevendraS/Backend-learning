import  {v2 as cloudinary} from "cloudinary";
import fs from "fs";

  
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret:  process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        // upload the file cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        }) 
        // file has been uploaded successfully
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        console.log("upload fail", error)
        fs.unlinkSync(localFilePath)  // remove the locally saved temporery 
                                      //file as the upload operation got failed
    }
}


const deleteFileOnCloudinary = async (url) => {
    try {
        if(!url) return null

        const imagePublicId = url.match(/\/([^/]+)\.[a-z]+$/)[1]

        const response = await cloudinary.uploader.destroy(imagePublicId);

        return response
    } catch (error) {
        console.log("deletion of Image fail", error)
    }
}

export { uploadOnCloudinary, deleteFileOnCloudinary}
