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
    const userId = req.user?._id
    
    const isCommentValid = isValidObjectId(commentId)

    if(!isCommentValid){
      throw new ApiError(400, "Comment is not valid")
    }

    const likeDocument = await Like.findOne({likedBy: userId})

    try {
      if(!likeDocument){
        const likedComment = await Like.create({
          comment: commentId,
          likedBy: userId
        })

        if(!likedComment){
          throw new ApiError(400, "something went wrong while creating like document")
        }

        return res
        .status(200)
        .json(
          new ApiResponse(200, likedComment, "Comment liked successfully")
        )
      }else{
        if(!likeDocument.comment){
          likeDocument.comment = commentId
        }else{
          likeDocument.comment = null
        }

        await likeDocument.save()

        return res
        .status(200)
        .json(
          new ApiResponse(200, likeDocument, "Comment like toggled successfully")
        )
      }
    } catch (error) {
      console.log(error)
      throw new ApiError(400, "Something went wrong")
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const userId = req.user?._id

    const isTweetValid = isValidObjectId(tweetId)

    if(!isTweetValid){
      throw new ApiError(400, "tweet is not valid")
    }

    const likeDocument = await Like.findOne({ likedBy: userId})

    try {
      if(!likeDocument){
        const likedDocument = Like.create({
          tweet: tweetId,
          likedBy: userId
        })

        if(!likedDocument){
          throw new ApiError(400, "Error while liking the tweet")
        }

        return res
        .status(200)
        .json(
          new ApiResponse(200, likedDocument, "tweet liked successfully")
        )
      }else{
        if(!likeDocument.tweet){
          likeDocument.tweet = tweetId
        }else{
          likeDocument.tweet = null
        }

        await likeDocument.save()

        return res
        .status(200)
        .json(
          new ApiResponse(200, likeDocument, "tweet like toggled successfully")
        )
      }
    } catch (error) {
      console.log(error); 

      throw new ApiError(400, "something went wrong")
    }


  }
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
                                           

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}