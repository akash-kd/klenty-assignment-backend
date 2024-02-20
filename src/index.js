import dotenv from 'dotenv'
import connectDB from './db/index.js'
import { app } from './app.js'

dotenv.config({ path: './env' })

const PORT = process.env.PORT
app.listen(PORT || 8000, async () => {
	await connectDB()
	console.log(`Server is running at PORT: http://localhost:${PORT}/`)
})

app.on('error', (error) => {
	console.log('ERROR: ', error)
	process.exit(1)
})
