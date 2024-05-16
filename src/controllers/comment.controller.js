import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const isValidVideoId = isValidObjectId(videoId)

  if(!isValidVideoId){
    throw new ApiError(400, "Video Id is invalid")
  }

  const skip = (page - 1) * limit;

  const comments = await Comment.find({ video: videoId })
    .skip(skip)
    .limit(limit);

  if (!comments) {
    throw new ApiError(400, "Comments not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "All comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {

  const { videoId } = req.params;
  const { content } = req.body;
  const userId = req.user?.id;

  const isValidVideoId = isValidObjectId(videoId)

  if(!isValidVideoId){
    throw new ApiError(400, "VideoId is invalid")
  }

  if (!content) {
    throw new ApiError(400, "comment is required");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: userId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment added successfylly"));
});

const updateComment = asyncHandler(async (req, res) => {

  const { commentId } = req.params;
  const { updateComment } = req.body;

  const isCommentIdValid = isValidObjectId(commentId)

  if(!isCommentIdValid){
    throw new ApiError(400, "CommentId is invalid")
  }

  if (!updateComment) {
    throw new ApiError(400, "Comment is required");
  }

  const isCommentExists = await Comment.findById(commentId)

  if(!isCommentExists){
    throw new ApiError(400, "comment dose not exists")
  }

  if(isCommentExists.owner.toString()!==req.user?._id.toString()){
    throw new ApiError("Only owner can update the comment")
  }

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: updateComment,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;

  const isValidCommentId = isValidObjectId(commentId)

  if(!isValidCommentId){
    throw new ApiError(400, "comment Id is invalid")
  }

  const comment = await Comment.findById(commentId)

  if(!comment){
    throw new ApiError(500, "Something went wrong while fetching comment")
  }

  if(comment.owner.toString()!== req.user?._id.toString()){
    throw new ApiError(400, "Only owner can delete the comment")
  }

  const deletedComment = await Comment.findByIdAndDelete(commentId);
 
  if (!deletedComment) {
    throw new ApiError(500, "Comment deletion failed or server error");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deleteComment, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
