import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const userId = req.user?._id
    const {content} = req.body

    const isUserIdValid = isValidObjectId(userId)

    if(!isUserIdValid){
        throw new ApiError(400, "UserId is invalid")
    }

    if(!content){
        throw new ApiError(400, "Content is required")
    }

    const tweet = await Tweet.create({
        content,
        owner: userId
    })

    if(!tweet){
        throw new ApiError(500, "Something went wrong while Posting tweet")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, tweet, "Tweet created successfully")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params

    const isUserIdValid = isValidObjectId(userId)

    if(!isUserIdValid){
        throw new ApiError(400, "User Id is invalid")
    }

    const allTweets = await Tweet.find({owner: userId})

    if(!allTweets){
        throw new ApiError(400, "fetching tweets failed or server error")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, allTweets , "All tweets fetched successfully")
    )
    
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const {content} = req.body

    const isTweetValid = isValidObjectId(tweetId)

    if(!isTweetValid){
        throw new ApiError("Tweet is not valid")
    }

    if(!content){
        throw new ApiError(400, "Tweet is required")
    }

    const tweet = await Tweet.findById(tweetId)

    if(tweet.owner.toString()!==req.user?._id.toString()){
        throw new ApiError(400, "Only owner of the tweet can update his tweet")
    }
    
    // const updatedTweet = await Tweet.findByIdAndUpdate(
    //     tweetId,
    //     {
    //         $set: {
    //             content: content
    //         }
    //     },
    //     {new: true}
    // )

    tweet.content = content

    await tweet.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200, tweet, "tweet updated successfully")
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params

    const deleteTweet = await Tweet.findByIdAndDelete(tweetId)

    return res
    .status(200)
    .json(
        new ApiResponse(200, deleteTweet, "tweet deleted successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
