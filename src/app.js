import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import routes from './routes/index.js'
import morgan from 'morgan'
import helmet from 'helmet'

import { ApiResponse } from './utils/ApiResponse.js'
import { ResponseMessages } from './config/responseMessage.js'
import { statusCode } from './config/statusCode.js'

const app = express()

if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'))
}
app.use(helmet())
app.use(cors())
app.options('*', cors())



app.use(express.json({ limit: '16kb' }))
app.use(
	express.urlencoded({
		extended: true,
		limit: '16kb',
	}),
)
app.use(cookieParser())

app.get('/status', (req, res) => {
	console.log("DS")
	return res
		.status(statusCode.FETCH_SUCCESS_CODE)
		.json(
			new ApiResponse(
				statusCode.FETCH_SUCCESS_CODE,
				{},
				ResponseMessages.FETCH_SUCCESS,
			),
		)
})

// defining routes
app.use('/api', routes)

export { app }
