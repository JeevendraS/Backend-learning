import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if(!(name && description)){
    throw new ApiError(400, "All fields are required")
  }

  const playlist = await Playlist.create({
    name: name,
    description: description,
    owner: req.user?._id,
  });

  if (!playlist) {
    throw ApiError(400, "Something went wrong while creating playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist created successfully"));

});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const isValidUserId = isValidObjectId(userId);

  if (!isValidUserId) {
    throw ApiError(400, "Invalid UserId or dosen't exists");
  }

  const userPlaylist = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videos"
      }
    },
    {
      $addFields: {
        totalVideos: {
          $size: "$videos"
        },
        totalViews: {
          $sum: "$videos.views"
        },
        playlistAvatar: {
          $first: "$videos.thumbnail"
        }
      }
    },
    {
      $project:{
        _id: 1,
        name: 1,
        description: 1,
        totalVideos: 1,
        totalViews: 1,
        updatedAt: 1,
        playlistAvatar: 1
      }
    } 
  ])

  if (!userPlaylist) {
    throw ApiError(400, "Something went wrong while fetching userPlaylist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, userPlaylist, "User playlist fetched successfully")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  const isPlaylistIdValid = isValidObjectId(playlistId);

  if (!isPlaylistIdValid) {
    throw new ApiError(400, "playlist is Invalid");
  }

  const userPlaylist = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videos"
      }
    },
    {
      $match: {
        "videos.isPublished" : true
      }
    },
    {
      $lookup: {
        from: "users",  
        localField: "owner",
        foreignField: "_id",
        as: "owner"
      }
    },
    {
      $addFields: {
        totalVideos: {
          $size: "$videos"
        },
        totalViews: {
          $sum: "$videos.views"
        },
        owner: {
          $first: "$owner"
        }
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        totalVideos: 1, 
        totalViews: 1,
        owner: {
          fullName: 1,
          userName: 1,
          email: 1,
          avatar: 1
        },
        videos: {
          _id: 1,
          videoFile: 1,
          thumbnail: 1,
          title: 1,
          description: 1,
          duration: 1,
          views: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    }
  ])

  if (!userPlaylist) {
    throw new ApiError(400, "Something went wrong while fetching playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, userPlaylist, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  const isPlaylistIdValid = isValidObjectId(playlistId);
  const isVideoIdValid = isValidObjectId(videoId);

  if (!isPlaylistIdValid && isVideoIdValid) {
    throw new ApiError(400, "playlistId or videoId invalid");
  }

  const playlist = await Playlist.findById(playlistId)

  if(!playlist){
    throw new ApiError(400, "playlist dosen't exists")
  }

  if(playlist.owner?.toString()!==req.user?._id.toString()){
    throw new ApiError(400, "Only owner of playlist can add video in playlist")
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $addToSet: {
        video: videoId,
      },
    },
    { new: true }
  );

  if (!updatedPlaylist) {
    throw new ApiError(400, "Something went wrong while adding video in playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "Video added to playlist successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  const isPlaylistIdValid = isValidObjectId(playlistId);
  const isVideoIdValid = isValidObjectId(videoId);

  if (!isPlaylistIdValid) {
    throw new ApiError(400, "playlistId invalid");
  }
  if (!isVideoIdValid) {
    throw new ApiError(400, "videoId invalid");
  }
  const playlist = await Playlist.findById(playlistId)

  if(!playlist){
    throw new ApiError(400, "Playlist dose not exists")
  }

  if(playlist.owner?.toString()!==req.user?._id.toString()){
    throw new ApiError(400, "Only playlist owner can remove video from Playlist")
  }

  const removedVideo = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        video: {$eq: videoId}
      }
    },
    {new: true}
  )

  if(!removedVideo){
    throw new  ApiError(400, "Something went wrong while deleting video from playlist")
  }

  return res
  .status(200)
  .json(
    new ApiResponse(200, removedVideo, "Video removed from playlist successfully")
  )
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  const isPlaylistIdValid = isValidObjectId(playlistId)

  if(!isPlaylistIdValid){
    throw new ApiError(400, "Playlist Id is Invalid")
  }

  const playlist = await Playlist.findById(playlistId)

  if(!playlist){
    throw new ApiError(400, "Playlist not found")
  }

  if(playlist.owner?.toString()!==req.user?._id.toString()){
    throw new ApiError(400, "Only owner of playlist can delete The playlist")
  }

  const deletePlaylist = await Playlist.findByIdAndDelete(playlistId)

  if(!deletePlaylist){
    throw new ApiError(400, "Something went wrong while deleting playlist")
  }

  return res
  .status(200)
  .json(
    new ApiResponse(200, deletePlaylist, "Playlist deleted successfully")
  )

});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body; 

  if(!(name && description)){
    throw new ApiError(400, "All field are required")
  }

  const isPlaylistIdValid = isValidObjectId(playlistId)

  if(!isPlaylistIdValid){
    throw new ApiError(400, "Playlist Id is Invalid")
  }

  const playlist = await Playlist.findById(playlistId)

  if(!playlist){
    throw new ApiError(400, "playlist not found")
  }

  if(playlist.owner?.toString()!==req.user?._id.toString()){
    throw new ApiError(400, "Only owner of playlist can update their playlist")
  }

  const updatePlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name: name,
        description: description
      }
    },
    {new: true}
  )

  if(!updatePlaylist){
    throw ApiError(400, "Something went wrong while updating playlist")
  }

  return res
  .status(200)
  .json(
    new ApiResponse(200, updatePlaylist, "Playlist updated successfully")
  )

});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
