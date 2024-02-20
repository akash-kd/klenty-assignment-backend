import { Router } from 'express'
import { addFavs, delFavs, getFavs } from '../controllers/favsController.js'

const favsRoutes = Router()

favsRoutes.post('/add', addFavs)
favsRoutes.get('/get/:createdBy', getFavs)
favsRoutes.delete('/del/:imageid', delFavs)


export default favsRoutes
