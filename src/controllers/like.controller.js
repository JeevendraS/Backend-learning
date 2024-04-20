import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const userId = req.user?._id
    //TODO: toggle like on video

    const likeDoc = await Like.find({likedBy: userId})
  
    if(!likeDoc.length){
         var likedVideo = await Like.create({
            likedBy: userId,
            video: videoId
         })
    }else {
        console.log(likeDoc[0].video)
        if(likeDoc[0].video){
            likeDoc[0].video = undefined
            await likeDoc.save()
        }else{
            likeDoc[0].video = videoId
            await likeDoc.save()
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, likeDoc, "Video like toggled successfully.")
        )
    }

    return res
    .status(200) 
    .json(
        new ApiResponse(200, likedVideo, "Video like toggled successfully")
    )
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