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
        console.log("type of localpath", typeof localFilePath)
        // file has been uploaded successfully
        console.log("file is uploaded on cloudinary", response.url);
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        console.log("upload fail", error)
        fs.unlinkSync(localFilePath)  // remove the locally saved temporery 
                                      //file as the upload operation got failed
    }
}

export { uploadOnCloudinary}
