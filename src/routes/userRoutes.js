import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser} from "../controllers/userController.js"
import { verifyJWT } from "../middlewares/authMiddleware.js";

const userRoutes = Router();

userRoutes.post("/signup", registerUser);
userRoutes.post("/login", loginUser);
userRoutes.post("/logout", verifyJWT, logoutUser);
userRoutes.post("/refresh-token", refreshAccessToken);

export default userRoutes;