import mongoose from 'mongoose'
const favsSchema = new mongoose.Schema(
	{
		imageid: {
			type: String,
			trim: true,
			required: true,
		},
		description: {
			type: String,
			trim: true,
        },
        urls: {
            type: Object,
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'user'
		}
	},
	{
		timestamps: true,
	},
)


const Favs = mongoose.model('favs', favsSchema)

export { Favs, favsSchema }
