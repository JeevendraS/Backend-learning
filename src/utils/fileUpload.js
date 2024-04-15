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
        fs.unlinkSync(localFilePath)  // remove the locally saved temporery 
        console.log("upload fail", error)
                                      //file as the upload operation got failed
    }
}


const deleteFileOnCloudinary = async (url) => {
    try {
        if(!url) return null
        
        // const filePublicId = url.match(/\/([^/]+)\.[a-z]+$/)[1]
        const filePublicId = url.split("/").pop().split(".")[0]

        if(url.includes("video")){
            return await cloudinary.uploader.destroy(filePublicId, {
                resource_type: "video"
            });
        }else{
            return await cloudinary.uploader.destroy(filePublicId);
        }

    } catch (error) {
        console.log("deletion of Image fail", error.message)
    }
}


export { uploadOnCloudinary, deleteFileOnCloudinary}
