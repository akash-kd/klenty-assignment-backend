import jwt from "jsonwebtoken";
import { ResponseMessages } from "../config/responseMessage.js";
import { statusCode } from "../config/statusCode.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/userModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return res
                .status(statusCode.UNAUTHORIZED_CODE)
                .json(
                    new ApiResponse(
                        statusCode.UNAUTHORIZED_CODE,
                        [],
                        ResponseMessages.UNAUTHORIZED_MESSAGE
                    )
                );
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decoded?._id);

        if (!user) {
            return res
                .status(statusCode.FORBIDDEN_CODE)
                .json(
                    new ApiResponse(
                        statusCode.FORBIDDEN_CODE,
                        [],
                        ResponseMessages.WRONG_CREDENTIALS
                    )
                )
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiResponse(statusCode.FORBIDDEN_CODE,
            error?.message || ResponseMessages.WRONG_CREDENTIALS);
    }
})