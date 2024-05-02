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

    const likedVideo = await Like.findOne({
      video: videoId,
      likedBy: userId
    })

    if(!likedVideo){
      const likeVideo = await Like.create({
        video: videoId,
        likedBy: userId
      })

      if(!likeVideo){
        throw new ApiError(400, "Something went wrong")
      }

      return res
      .status(200)
      .json(
        new ApiResponse(200, {videoLike: true}, "video like successfully")
      )
    }

    const deleteLikedVideo = await Like.findByIdAndDelete(likedVideo._id)

    return res
    .status(200)
    .json( 
      new ApiResponse(200, {videoLike: false}, "video dislike successfully")
    )
})
 
const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const userId = req.user?._id
    
    const isCommentValid = isValidObjectId(commentId)

    if(!isCommentValid){
      throw new ApiError(400, "CommentId is not valid")
    }

    const likedComment = await Like.findOne({
      comment: commentId,
      likedBy: userId
    })

    if(!likedComment){
      const likeComment = await Like.create({
        comment: commentId,
        likedBy: userId
      })

      if(!likeComment){
        throw new ApiError(400, "Something went wrong")
      }

      return res
      .status(200)
      .json(
        new ApiResponse(200, {commentLike: true}, "comment like successfully")
      )
    }

    const deleteLikedComment = await Like.findByIdAndDelete(likedComment._id)

    return res
    .status(200)
    .json( 
      new ApiResponse(200, {commentLike: false}, "comment dislike successfully")
    )

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const userId = req.user?._id

    const isTweetValid = isValidObjectId(tweetId)

    if(!isTweetValid){
      throw new ApiError(400, "tweetId is not valid")
    }

    const likedTweet = await Like.findOne({
      tweet: tweetId,
      likedBy: userId
    })

    if(!likedTweet){
      const likeTweet = await Like.create({
        tweet: tweetId,
        likedBy: userId
      })

      if(!likeTweet){
        throw new ApiError(400, "Something went wrong")
      }

      return res
      .status(200)
      .json(
        new ApiResponse(200, {tweetLike: true}, "tweet like successfully")
      )
    }

    const deleteLikedTweet = await Like.findByIdAndDelete(likedTweet._id)

    return res
    .status(200)
    .json( 
      new ApiResponse(200, {tweetLike: false}, "tweet dislike successfully")
    )
  }
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id     

    const allVideos = await Like.aggregate([
      {
        $match: {
          likedBy: userId,
          video: {"$exists": true, "$ne": null , "$ne": ""}
        }
      },
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "video",
        },
      }
    ])                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
    
    if(!allVideos){
      throw new ApiError(400, "Something went wrong while fetching all liked videos")
    }
    
    return res
    .status(200)
    .json(
      new ApiResponse(200, allVideos, "All liked video fetched succussfully")
    )

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}