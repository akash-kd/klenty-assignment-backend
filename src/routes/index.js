import { Router } from "express";
import userRoutes from './userRoutes.js';
import favsRoutes from './favouritesRoutes.js'
import { verifyJWT } from '../middlewares/authMiddleware.js'

const app = Router();
app.use("/user", userRoutes);
app.use('/favs', verifyJWT, favsRoutes)

export default app;