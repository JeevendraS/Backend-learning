import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

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

  //TODO: create playlist
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  const isValidUserId = isValidObjectId(userId);

  if (!isValidUserId) {
    throw ApiError(400, "Invalid UserId or dosen't exists");
  }

  const userPlaylist = await Playlist.findOne({ owner: userId });

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
  //TODO: get playlist by id

  const isPlaylistIdValid = isValidObjectId(playlistId);

  if (!isPlaylistIdValid) {
    throw ApiError(400, "playlist is Invalid");
  }

  const userPlaylist = await Playlist.findOne({ _id: playlistId });

  if (!userPlaylist) {
    throw ApiError(400, "Something went wrong while fetching playlist");
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
    throw ApiError(400, "playlistId or videoId invalid");
  }

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: {
        video: videoId,
      },
    },
    { new: true }
  );

  if (!playlist) {
    throw ApiError(400, "Something went wrong while adding video in playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video added to playlist successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  const isPlaylistIdValid = isValidObjectId(playlistId);
  const isVideoIdValid = isValidObjectId(videoId);

  if (!isPlaylistIdValid) {
    throw ApiError(400, "playlistId invalid");
  }
  if (!isVideoIdValid) {
    throw ApiError(400, "videoId invalid");
  }

  const removedVideo = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        video: {$eq: videoId}
      }
    }
  )

  if(!removedVideo){
    throw ApiError(400, "Something went wrong while deleting video from playlist")
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

  if(!playlistId){
    throw ApiError(400, "Playlist Id is Invalid")
  }

  const deletePlaylist = await Playlist.findByIdAndDelete(playlistId)

  if(!deletePlaylist){
    throw ApiError(400, "Something went wrong while deleting playlist")
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

  const isPlaylistIdValid = isValidObjectId(playlistId)

  if(!isPlaylistIdValid){
    throw ApiError(400, "Playlist Id is Invalid")
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
