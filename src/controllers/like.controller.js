import mongoose, {isValidObjectId} from "mongoose" 
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const userId = req.user?._id  
    //TODO: toggle like on video 

    const isVideoValid = isValidObjectId(videoId)

    if(!isVideoValid){
      throw new ApiError(400, "VideoId is not valid")
    }

    const likeDocument = await Like.findOne({likedBy: userId})

    try {
      if(!likeDocument){
        const likedVideo = await Like.create({
          video: videoId,
          likedBy: userId
        })
  
        if(!likedVideo){
          throw new ApiError(400, "Something went wrong or server error")
        }
  
        return res
        .status(200)
        .json(
          new ApiResponse(200, likedVideo, "Video liked successfully")
        )
      }else{
        if(!likeDocument.video){
          likeDocument.video = videoId
        }else{
        likeDocument.video = null
        }
        await likeDocument.save()
        
        return res
        .status(200)
        .json(
          new ApiResponse(200, likeDocument, "Video liked toggled successfully")
        )
      }
    } catch (error) {
      console.log(error);
      throw new ApiError(400, "something went wront")
    }
})
 
const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment 

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}