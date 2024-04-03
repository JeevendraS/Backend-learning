import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //1  get user details from frontend
  //2  validate - if empty
  //3  check if user is already exists: username, email
  //4  check for coverimage and avatar
  //5  upload them in cloudinary, check if avatar loaded or not in cloudinary
  //6  create user object , create entry in db
  //7  remove password and refresh token from response
  //8  check for user creation
  //9  return response

  //*******************  1  ********************
  const { fullName, email, userName, password } = req.body;
  console.log("email: ", email, "password :", password);

  //*******************  2  ********************
  if (
    [fullName, email, userName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All field are required");
  }

  //*******************  3  ********************
  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  //*******************  4  ********************
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  //*******************  5  ********************
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  console.log(avatar);

  if (!avatar) {
    throw new ApiError(400, "after cloudinary , Avatar image is required");
  }

  //*******************  6  ********************
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase(),
  });

  //*******************  7  ********************
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //*******************  8  ********************
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  //*******************  9  ********************
  console.log("created user ", createdUser);
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // fetch email, password from request body,
  // find the user,
  // password check,
  // access and refresh token generate,
  // send cookie,
  // send response

  const { userName, email, password } = req.body;

  if (!userName && !email) {
    throw new ApiError(400, "userName or email required");
  }

  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }
  console.log("username, email, password", userName, email, password);

  const isPasswordValid = await user.isPasswordCorrect(password);

  console.log(isPasswordValid);

  if (!isPasswordValid) {
    throw new ApiError(401, "password is incorrect");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  console.log("logged in user", loggedInUser);

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedRefreshToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedRefreshToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh Token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(
  async(req, res)=>{
    return res
    .status(200)
    .json(200, req.user, "Current user fetched successfully")
  }
)

const updateAccountDetails = asyncHandler(
  async(req, res)=>{
    const {fullName, email} = req.body

    if(!fullName || !email){
      throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
      $set: {
        fullName: fullName,
        email: email

      }
    }, {new: true}).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
  }
)

const updateUserAvatar = asyncHandler( 
  async(req, res)=>{
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
      throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
      throw new ApiError(400, "Error while uploading avatar on server")
    }

  const user =  await User.findByIdAndUpdate(req.user?._id, {
      $set: {
        avatar: avatar.url
      }
    }, {new: true}).select("-password")

    return res
    .status(200)
    .json(
      new ApiResponse(200, user, "Avatar updated successfully")
    )
  }
)

const updateUserCoverImage = asyncHandler(
  async(req, res)=>{
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
      throw new ApiError(400, "Cover Image file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
      throw new ApiError(400, "Error while uploading Cover Image on server")
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
      $set: {
        coverImage: coverImage.url
      }
    }, {new: true}).select("-password")

    return res
    .status(200)
    .json(
      new ApiResponse(200, user, "Cover image updated successfully")
    )
  }
)

const getUserChannelProfile = asyncHandler(
  async(req, res)=>{
    const {userName} = req.params

    if(!userName?.trim()){
      throw new ApiError(400, "userName is missing")
    }

    const channel = await User.aggregate([
      {
        $match:{
          userName: userName?.toLowerCase()
        }
      },
      {
        $lookup:{
          from: "subscriptions",
          localField: "_id",
          foreignField: "channel",
          as: "subscribers"
        }
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "subscriber",
          as: "subscribedTo"
        }
      },
      {
        $addFields:{
          subscribersCount: {
            $size: "$subscribers"
          },
          channelSubscribedTo: {
            $size: "subscribedTo"
          },
          isSubscribed: {
            $cond: {
              if: {$in: [req.user?._id, "$subscribers.subscriber"] },
              then: true,
              else: false
            }
          }
        }
      },
      {
        $project: {
          fullName: 1,
          userName: 1,
          email: 1,
          avatar: 1,
          coverImage: 1,
          subscribersCount: 1,
          channelSubscribedTo: 1,
          isSubscribed: 1
        }
      }
    ])

    if(!channel?.length()){
      throw new ApiError(400, "Channel does not exists")
    }
    return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
  }
)

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  updateAccountDetails, 
  getCurrentUser,
  updateUserAvatar,
  updateUserCoverImage, 
  getUserChannerProfile
};
