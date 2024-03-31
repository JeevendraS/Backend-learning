import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
  console.log("avatar local path", avatarLocalPath);
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  //*******************  5  ********************
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }

  // let coverImageLocalPath;
  // if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
  //   coverImageLocalPath = req.files.coverImage[0].path
  // }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  console.log(avatar)

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

export { registerUser };
