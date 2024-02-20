import { asyncHandler } from "../utils/asyncHandler.js"
import { ResponseMessages } from "../config/responseMessage.js"
import { statusCode } from '../config/statusCode.js'
import { User } from "../models/userModel.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import jwt from "jsonwebtoken"


// options for cookies, access token will be send as cookie in the frontend which will be secured
const options = {
    httpOnly: true,
    secure: true
}

// function to generate access token & refresh token
const generateAccessAndRefreshTokens = async (userId, isPhoneAuth) => {
    try {

        const user = await User.findById(userId);

        const accessToken = await user.generateAccessToken();
        var refreshToken = ''
        console.log('isPhoneAuth: ' + isPhoneAuth);
        if (!isPhoneAuth) refreshToken = await user.generateRefreshToken();
        else {
            refreshToken = await user.generateAccessTokenForPhoneAuth();
        }
        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }
    }
    catch (e) {
        console.log(e);
        throw new ApiError(statusCode.SERVER_ERROR_CODE, ResponseMessages.SERVER_ERROR, []);
    }
}


// Register endpoint

// ROUTE:       /api/v1/user/signup
// METHOD:      POST
// TASK:        To register user and generate the token
const registerUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    // checking for email & password validation
    if (!password || !email) {
        return res
            .status(statusCode.BAD_REQUEST_CODE)
            .json(
                new ApiResponse(
                    statusCode.BAD_REQUEST_CODE,
                    [],
                    ResponseMessages.BAD_REQUEST
                )
            );
    }

    // checking for duplicate user
    const existedUser = await User.findOne({
        $or: [{ email }],
    });

    if (existedUser) {
        return res
            .status(statusCode.DUPLICATE_CODE)
            .json(
                new ApiResponse(
                    statusCode.DUPLICATE_CODE,
                    [],
                    ResponseMessages.USER_EXIST
                )
            );;
    }

    //creating the user
    const user = await User.create({
        email,
        password,
    });

    //calling the user from db for avoiding any incosistency & removing unwanted field
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(statusCode.SERVER_ERROR_CODE, ResponseMessages.SERVER_ERROR);
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id, false);

    return res
        .status(statusCode.CREATE_SUCCESS_CODE)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                statusCode.FETCH_SUCCESS_CODE,
                { user: createdUser, accessToken, refreshToken },
                ResponseMessages.CREATE_SUCCESS
            )
        );
})

// login endpoint

// ROUTE:       /api/v1/user/login
// METHOD:      POST
// TASK:        To login the user and generate the token
const loginUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    // checking for email & password validation
    if (!password || !email) {
        return res
            .status(statusCode.BAD_REQUEST_CODE)
            .json(
                new ApiResponse(
                    statusCode.BAD_REQUEST_CODE,
                    [],
                    ResponseMessages.BAD_REQUEST
                )
            );
    }

    // checking for duplicate user
    const user = await User.findOne({
        $or: [{ email }]
    });

    if (!user) {
        return res
            .status(statusCode.NOT_FOUND_CODE)
            .json(
                new ApiResponse(
                    statusCode.NOT_FOUND_CODE,
                    [],
                    ResponseMessages.USER_NOT_EXIST
                )
            );
    }

    // checking password is correct or not
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        return res
            .status(statusCode.FORBIDDEN_CODE)
            .json(
                new ApiResponse(
                    statusCode.FORBIDDEN_CODE,
                    [],
                    ResponseMessages.WRONG_CREDENTIALS
                )
            );
    }

    // generating access & refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id, false);

    //calling the user from db for avoiding any incosistency & removing unwanted field
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    return res
        .status(statusCode.FETCH_SUCCESS_CODE)
        .cookie("accessToken", accessToken, options) // set the access token in the cookie
        .cookie("refreshToken", refreshToken, options) // set the refresh token in the cookie
        .json(
            new ApiResponse(
                statusCode.FETCH_SUCCESS_CODE,
                { user: loggedInUser, accessToken, refreshToken }, // send access and refresh token in response if client decides to save them by themselves
                ResponseMessages.FETCH_SUCCESS
            )
        );


})


// logout endpoint

// ROUTE:       /api/v1/user/logout
// METHOD:      POST
// TASK:        To log out the user and clear token & cookies
const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    );


    return res
        .status(statusCode.FETCH_SUCCESS_CODE)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                statusCode.FETCH_SUCCESS_CODE,
                [],
                ResponseMessages.USER_LOG_OUT
            )
        );


})


// refresh Access token endpoint

// ROUTE:       /api/v1/user/refresh-token
// METHOD:      POST
// TASK:        To refresh the access token of the user
const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {

        return res
            .status(statusCode.UNAUTHORIZED_CODE)
            .json(
                new ApiResponse(
                    statusCode.UNAUTHORIZED_CODE,
                    [],
                    ResponseMessages.WRONG_REFRESH_TOKEN
                )
            );
    }

    try {
        const decodeToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)


        const user = await User.findById(decodeToken?._id);

        if (!user) {
            return res
                .status(statusCode.UNAUTHORIZED_CODE)
                .json(
                    new ApiResponse(
                        statusCode.UNAUTHORIZED_CODE,
                        [],
                        ResponseMessages.WRONG_REFRESH_TOKEN
                    )
                );
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            return res
                .status(statusCode.UNAUTHORIZED_CODE)
                .json(
                    new ApiResponse(
                        statusCode.UNAUTHORIZED_CODE,
                        [],
                        ResponseMessages.WRONG_REFRESH_TOKEN
                    )
                );
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

        return res
            .status(statusCode.FETCH_SUCCESS_CODE)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    statusCode.FETCH_SUCCESS_CODE,
                    { accessToken, refreshToken },
                    ResponseMessages.ACCESS_TOKEN_REFRESH
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message, []);
    }
})




export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}