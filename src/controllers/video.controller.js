import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFileOnCloudinary } from "../utils/fileUpload.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 5, query, sortBy="createdAt", sortType="desc", userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

  const skip = (page - 1)* limit

  const pipeline = [
    {$skip: skip},
    {$limit: parseInt(limit)},
  ]

  if(userId){
    pipeline.push(
      {
        $match: {
          _id: mongoose.Types.ObjectId(userId)
        }
      }
    )
  }
  if(sortBy || sortType){
    pipeline.push(
      {
        $sort: {
          [sortBy]: sortType === "asc"? 1: -1
        }
      }
    )
  }
  if(query){
    pipeline.push(
      {
        $match: {
          title: {
            $regex: new RegExp(query, "i")
          }
        }
      }
    )
  }
  

  const videos = await Video.aggregate(pipeline)

  console.log("videos: ", videos);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Account details updated successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user?.id;
  // TODO: get video, upload to cloudinary, create video

  if ([title, description].some((field) => field.trim() === "")) {
    throw new ApiError(400, "All field are required");
  }
  const videoLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Video and thumbnail required");
  }

  const video = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!video || !thumbnail) {
    throw new ApiError(400, "Cloudinary, Video and thumbnail are required");
  }

  const createdVideo = await Video.create({
    videoFile: video.url,
    thumbnail: thumbnail.url,
    title,
    description,
    duration: video.duration,
    owner: userId,
  });

  const finalVideo = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(createdVideo._id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullName: 1,
              userName: 1,
              email: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, finalVideo[0], "video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id

  if(!videoId){
    throw new ApiError(400, "Video id is required")
  }

  const video = await Video.aggregate([
    {
        $match: {
            _id: new mongoose.Types.ObjectId(videoId) 
        }
    },
    {
        $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
            pipeline: [
                {
                    $project: {
                        fullName: 1,
                        userName: 1,
                        email: 1,
                        avatar: 1,
                      },
                }
            ] 
        }
    },
    {
        $addFields: {
            owner: {
                $first: "$owner"
            }
        }
    }
  ])

  console.log(video)

  return res
  .status(200)
  .json(
    new ApiResponse(200, video[0], "Video fetched successfully")
  )

});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const  thumbnail = req.file?.path
  const {title, description} = req.body 

  const video = await Video.findById(videoId)

  if(!video){
    throw new ApiError(400, "something went wrong while fetching video from database")
  }

  const oldThumbnail = video.thumbnail
  const newThumbnail = await uploadOnCloudinary(thumbnail)

  if(!newThumbnail.url){
    throw new ApiError(400, "file upload fail on cloudinary")
  }


  if(thumbnail){
    video.thumbnail = newThumbnail.url
  }
  if(title){
    video.title = title
  }
  if(description){
    video.description = description
  }
  
  await video.save()
  await deleteFileOnCloudinary(oldThumbnail)

  return res
  .status(200)
  .json(
    new ApiResponse(200, video, "Video updated successfully")
  )
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const deletedVideo = await Video.findByIdAndDelete(videoId)
  
  if(!deletedVideo){
    throw new ApiError(500, "Video deletion failed or server error")
  }

  const thumbnail = deletedVideo.thumbnail
  const videofile = deletedVideo.videoFile

  const t = await deleteFileOnCloudinary(thumbnail)
  const v = await deleteFileOnCloudinary(videofile)

  return res
  .status(200)
  .json(
    new ApiResponse(200, deletedVideo, "Video deleted successfully")
  )
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId)
  video.isPublished = !video.isPublished

  await video.save()

  return res
  .status(200)
  .json(
    new ApiResponse(200, video, "Publish status changed successfully")
  )
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
