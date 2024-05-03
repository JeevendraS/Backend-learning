import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription

  const isChannelExists = isValidObjectId(channelId);

  if (!isChannelExists) {
    throw new ApiError(400, "Channel Id dosen't exist or wrong");
  }

  try {
    const isSubscribed = await Subscription.findOne({
      subscriber: req.user?._id,
      channel: channelId,
    });

    if (isSubscribed) {
      await Subscription.findByIdAndDelete(isSubscribed._id);

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { Subscribed: false },
            "Channel unsubscribed successfully"
          )
        );
    }

    const Subscribe = await Subscription.create({
      subscriber: req.user?._id,
      channel: channelId,
    });

    if (!Subscribe) {
      throw new ApiError(400, "Something went wrong while subcribing");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { Subscribed: true },
          "Channel Subscribed Successfully"
        )
      );
  } catch (error) {
    console.log(error);
    throw new ApiError(400, "someting went wrong");
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const isChannelIdValid = isValidObjectId(channelId);

  if (!isChannelIdValid) {
    throw new ApiError(400, "Channel Id is not valid");
  }

  const SubscriberList = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
        pipeline: [
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribedToSubscriber",
            },
          },
          {
            $addFields: {
              subscribedToSubscriber: {
                $cond: {
                  if: {
                    $in: [channelId, "$subscribedToSubscriber.subscriber"],
                  },
                  then: true,
                  else: false,
                },
              },
              subscribersCount: {
                $size: "$subscribedToSubscriber",
              },
            },
          },
        ],
      },
    },
    {
      $unwind: "$subscriber",
    },
    {
      $project: {
        _id: 0,
        subscriber: {
          _id: 1,
          username: 1,
          fullName: 1,
          avatar: 1,
          subscribedToSubscriber: 1,
          subscribersCount: 1,
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        SubscriberList,
        "Subscriber list of a channel fetched successfully"
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  const isSubscriberIdExists = isValidObjectId(subscriberId);

  if (!isSubscriberIdExists) {
    throw new ApiError(400, "Subscriber Id dosen't exists or invalid");
  }

  const ChannelList = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "SubscribedChannel",
        pipeline: [
          {
            $lookup: {
              from: "videos",
              localField: "_id",
              foreignField: "owner",
              as: "videos",
            },
          },
          {
            $addFields: {
              latestVideo: {
                $last: "$videos",
              },
            },
          },
        ],
      },
    },
    {
      $unwind: "$SubscribedChannel"
    },
    {
      $project: {
        _id: 0,
        SubscribedChannel: {
          _id: 1,
          username: 1,
          fullName: 1,
          avatar: 1,
          videos: 1,
          latestVideo: {
            _id: 1,
            videoFile: 1,
            thumbnail: 1,
            owner: 1,
            title: 1,
            description: 1,
            duration: 1,
            createdAt: 1,
            views: 1
          }

        }
      }
    }
  ]);

  if(!ChannelList){
    throw new ApiError(400, "Something went wrong while fetching channels")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        ChannelList,
        "Subscribed channel list fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
