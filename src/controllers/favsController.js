import { asyncHandler } from '../utils/asyncHandler.js'
import { ResponseMessages } from '../config/responseMessage.js'
import { statusCode } from '../config/statusCode.js'
import { User } from '../models/userModel.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'
import jwt from 'jsonwebtoken'
import { Favs } from '../models/favouritesModel.js'

export const addFavs = asyncHandler(async (req, res) => {
	try {
		const { imageid, description, urls, createdBy } = req.body
		const test = await Favs.find({ imageid, createdBy })

		if (!imageid || !urls || !createdBy) {
			return res
				.status(statusCode.BAD_REQUEST_CODE)
				.json(
					new ApiResponse(
						statusCode.BAD_REQUEST_CODE,
						{},
						ResponseMessages.BAD_REQUEST,
					),
				)
		}
		console.log(test)
		if (test.length > 0) {
			return res
				.status(statusCode.DUPLICATE_CODE)
				.json(
					new ApiResponse(
						statusCode.DUPLICATE_CODE,
						{},
						ResponseMessages.DUPLICATE_FOUND,
					),
				)
		}

		const fav = await Favs.create({ imageid, description, urls, createdBy })
		return res
			.status(statusCode.FETCH_SUCCESS_CODE)
			.json(
				new ApiResponse(
					statusCode.FETCH_SUCCESS_CODE,
					fav,
					ResponseMessages.FETCH_SUCCESS,
				),
			)
	} catch (err) {
		return res
			.status(statusCode.BAD_REQUEST_CODE)
			.json(
				new ApiResponse(
					statusCode.BAD_REQUEST_CODE,
					{},
					ResponseMessages.BAD_REQUEST,
				),
			)
	}
})

export const getFavs = asyncHandler(async (req, res) => {
	try {
		const { createdBy } = req.params
		if (!createdBy) {
			return res
				.status(statusCode.BAD_REQUEST_CODE)
				.json(
					new ApiResponse(
						statusCode.BAD_REQUEST_CODE,
						{},
						ResponseMessages.BAD_REQUEST,
					),
				)
		}

		const favs = await Favs.find({ createdBy })
		return res
			.status(statusCode.FETCH_SUCCESS_CODE)
			.json(
				new ApiResponse(
					statusCode.FETCH_SUCCESS_CODE,
					favs,
					ResponseMessages.FETCH_SUCCESS,
				),
			)
	} catch (err) {
		return res
			.status(statusCode.BAD_REQUEST_CODE)
			.json(
				new ApiResponse(
					statusCode.BAD_REQUEST_CODE,
					{},
					ResponseMessages.BAD_REQUEST,
				),
			)
	}
})

export const delFavs = asyncHandler(async (req, res) => {
	try {
		const { imageid } = req.params
		if (!imageid) {
			return res
				.status(statusCode.BAD_REQUEST_CODE)
				.json(
					new ApiResponse(
						statusCode.BAD_REQUEST_CODE,
						{},
						ResponseMessages.BAD_REQUEST,
					),
				)
		}

		const fav = await Favs.findOneAndDelete({ imageid })
		return res
			.status(statusCode.FETCH_SUCCESS_CODE)
			.json(
				new ApiResponse(
					statusCode.FETCH_SUCCESS_CODE,
					fav,
					ResponseMessages.FETCH_SUCCESS,
				),
			)
	} catch (err) {
		return res
			.status(statusCode.BAD_REQUEST_CODE)
			.json(
				new ApiResponse(
					statusCode.BAD_REQUEST_CODE,
					{},
					ResponseMessages.BAD_REQUEST,
				),
			)
	}
})
