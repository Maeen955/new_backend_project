import { ApiError } from "../utils/ApiError.js";
import { ApiRespose } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from './../models/user.model.js';
import  jwt  from 'jsonwebtoken';


const generateAccessAndRefreshToken = async (userId) => {
       try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        user.save({validateBeforeSave: false});

        return { accessToken, refreshToken }
       
      } catch (error) {
          throw new ApiError(500, 'something went wrong while genmerating token')
       }
}

const registerUser = asyncHandler( async (req, res) => {
     
  
 
  const { email, username, fullname, password } = req.body;
  
  if (
    [email, username, fullname, password].some((field) => field === "")
  ) {
    
    throw new ApiError(400, "all fields are required")
  };

  
  const existedUser = await User.findOne({
    $or: [ { email }, { username } ]
  });
  
  if (existedUser) {
    throw new ApiError(409, "user are already exist by this username or email")
  };
  
  const avatarLocalepath = req.files?.avatar?.[0]?.path;
  const coverImageLocalepath = req.files?.coverImage?.[0]?.path;
  
  if (!avatarLocalepath) {
    throw new ApiError(400, "Avatar is must required")
  };

  const avatar = await uploadOnCloudinary(avatarLocalepath);
  const coverImage =  await uploadOnCloudinary(coverImageLocalepath);
  // console.log(avatar);

  if (!avatar) {
    throw new ApiError(400, "avatar file is required")
  };

  const user = await User.create({
    username: username.toLowerCase(),
    email,
    fullname,
    avatar: avatar.url,
    password,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(user._id).select("-password -refreshtoken" );

  if (!createdUser) {
    throw new ApiError(500, "server error while registering user")
  };

  return res.status(201).json(
    new ApiRespose(200, createdUser, "User registered successfully")
  )

})



const loginUser = asyncHandler( async (req, res) => {
    //req body -> data
    //username or email
    //find the user
    //password check
    //access token and refresh token
    //send cokkie
     
    const {email, password, username} = req.body;

    if (!email && !username) {
      throw new ApiError(404, "username or email required")
    };

    const user = await User.findOne({
      $or: [{ email }, { username }]
    });
    

    if (!user) {
     return res.status(401).json({ 
                message: "user not found" 
            });
    };

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "password is not valid")
    };

   const {accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .cookie("accesstoken", accessToken, options)
  .cookie("refreshtoken", refreshToken, options)
  .json(
     new ApiRespose(
      200,
      {
        user: loggedInUser, accessToken, refreshToken
      },
      "User loged in succesfully"
    )
  )
   

} )


const logOutUser = asyncHandler( async (req, res) => {
   await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
                refreshToken: "" // or use 1 (both work)
            }
    },
    {
      new: true
    }
   )
     const options = {
      httpOnly: true,
      secure: true
     };

     return res.status(200)
    .clearCookie("accesstoken", options)
    .clearCookie("refreshtoken", options)
    .json(
      new ApiRespose(200, req.user, "user logged out successfully")
    )
} );

const verifyRefreshToken = asyncHandler( async (req, res) => {
    
     const incomingToken = req.cookies?.refreshtoken || req.body.refreshtoken
    
     if (!incomingToken) {
        throw new ApiError(401, "invalid refresh token")
     };

    try {
       const decodedToken =  jwt.verify(incomingToken, process.env.REFREASH_ACCESS_TOKEN);
  
       const user = await User.findById(decodedToken._id);
  
       if (!user) {
           throw new ApiError(401, "invalid refresh token")
       };
       
       if (incomingToken !== user?.refreshToken) {
        throw new ApiError(401, "invalid refresh token or expired")
  
       };
  
  
       const {accessToken, refreshToken: newRefreshToken} = await generateAccessAndRefreshToken(user._id);
  
    const options = {
      httpOnly: true,
      secure: true
    }
  
  res.status(200)
  .cookie("accesstoken", accessToken, options)
  .cookie("refreshtoken", newRefreshToken, options) 
  .json(
     new ApiRespose(
      201,
    {
      refreshToken: newRefreshToken, accessToken
    },
    "token refreshed successfully"
  )
  )    
        
    } catch (error) {
     throw new ApiError(401, error?.message)
      
    }

} )


export {
  registerUser,
  loginUser,
  logOutUser,
  verifyRefreshToken
}