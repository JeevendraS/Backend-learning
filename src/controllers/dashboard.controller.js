import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const {channelId} = req.query

    const isChannelExists = isValidObjectId(channelId)

    if(!isChannelExists){
        throw new ApiError(400, "Channel not found")
    }

    const video = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        
    ])

    let videos = video.length
    let likes = 0
    let views = 0

    video.map((v)=>{
        if(v.likes.length){
            likes += v.likes.length
        }
        views += v.views
    })
    console.log(likes, views, videos) 

    const subscribers = await Subscription.find({channel: channelId})


    if(!video && !subscribers){
        throw new ApiError(400, "Something went wrong while fetching channel stats")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {
            totalLikes: likes,
            tatalVideos: videos,
            totalViews: views,
            tatalSubscribers: subscribers.length
        }, "Channel stats fetched successfully")
    )
}) 

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const {channelId} = req.query

    const isChannelIdValid = isValidObjectId(channelId)

    if(!isChannelIdValid){
        throw new ApiError(400, "Channel Id invalid")
    }

    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $project: {
                _id: 0,
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                updatedAt: 1
            }
        }


    ])

    if(!videos){
        throw new ApiError(400, "Something went wrong while fetching vidoes")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, videos, "Channel videos fetched successfully")
    )
})

export {
    getChannelStats, 
    getChannelVideos
    }